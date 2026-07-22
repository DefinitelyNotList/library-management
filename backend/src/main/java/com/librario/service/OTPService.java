package com.librario.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class OTPService {

    private final Map<String, String> otpStore = new ConcurrentHashMap<>();
    private final int OTP_LENGTH = 6;

    // Generate OTP and store it in memory
    public String generateOTP(String email) {
        String otp = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1000000));
        otpStore.put(email, otp);
        return otp;
    }

    // Validate OTP
    public boolean validateOTP(String email, String otp) {
        if (!otpStore.containsKey(email)) return false;
        boolean isValid = otpStore.get(email).equals(otp);
        if (isValid) otpStore.remove(email); // remove OTP after successful validation
        return isValid;
    }

    // Remove OTP manually if needed
    public void removeOTP(String email) {
        otpStore.remove(email);
    }
}
