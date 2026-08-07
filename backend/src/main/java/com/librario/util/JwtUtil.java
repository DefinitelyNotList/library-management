package com.librario.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.security.core.userdetails.UserDetails;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final long EXPIRATION_TIME = 86400000; // 1 day

    private final Key key;

    /**
     * Constructor will try the following (in order) to obtain the secret:
     * 1) Spring property 'app.jwt.secret'
     * 2) Environment variable 'APP_JWT_SECRET'
     * 3) A built-in development fallback (only for demo/local use)
     */
    public JwtUtil(@Value("${app.jwt.secret:}") String secretFromProp) {
        String secret = secretFromProp;
        if (secret == null || secret.isBlank()) {
            // Try environment variable as a fallback (Render-friendly)
            secret = System.getenv("APP_JWT_SECRET");
        }
        if (secret == null || secret.isBlank()) {
            // Development/demo fallback. NOT for production use.
            secret = "dev-demo-secret-please-change-this-to-production-secret";
        }
        // Ensure secret is at least 32 bytes for HMAC key generation
        while (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            secret = secret + "0"; // pad until long enough
        }

        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token)
                .getBody().getSubject();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            return username.equals(userDetails.getUsername());
        } catch (JwtException e) {
            return false;
        }
    }
}
