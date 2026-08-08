package com.librario.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSourceProperties dataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String url = properties.getUrl();
        if (url != null && !url.startsWith("jdbc:")) {
            url = normalizeJdbcUrl(url);
            properties.setUrl(url);
        }

        return properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    private String normalizeJdbcUrl(String rawUrl) {
        String normalized = rawUrl.trim();
        if (normalized.startsWith("jdbc:")) {
            return normalized;
        }

        Map<String, String> values = parseNameValuePairs(normalized);
        String server = getValue(values, "server");
        if (server.isEmpty()) {
            server = getValue(values, "host");
        }
        String database = getValue(values, "database");
        if (database.isEmpty()) {
            database = getValue(values, "databaseName");
        }

        if (server.isEmpty() || database.isEmpty()) {
            throw new IllegalArgumentException("Invalid datasource URL: missing server/host or database.");
        }

        String hostPort = server;
        if (!hostPort.contains(":")) {
            hostPort = hostPort + ":3306";
        }

        return "jdbc:mysql://" + hostPort + "/" + database +
                "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8";
    }

    private Map<String, String> parseNameValuePairs(String raw) {
        Map<String, String> values = new LinkedHashMap<>();
        Arrays.stream(raw.split(";"))
                .map(String::trim)
                .filter(pair -> !pair.isEmpty() && pair.contains("="))
                .forEach(pair -> {
                    String[] parts = pair.split("=", 2);
                    values.put(parts[0].trim(), parts[1].trim());
                });
        return values;
    }

    private String getValue(Map<String, String> values, String key) {
        for (Map.Entry<String, String> entry : values.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(key)) {
                return entry.getValue();
            }
        }
        return "";
    }
}
