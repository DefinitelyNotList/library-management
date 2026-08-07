package com.librario.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/**
 * Demo-safe Mail configuration.
 *
 * Provides a no-op / local JavaMailSender implementation so the application can start during demos
 * when no external SMTP server is configured. For production, configure SMTP settings via
 * Spring properties (spring.mail.*) or replace this bean with a proper JavaMailSenderImpl
 * configured with real credentials.
 */
@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        // Demo/local fallback: point to localhost and disable auth/STARTTLS so no outbound SMTP is attempted.
        mailSender.setHost("localhost");
        mailSender.setPort(25);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "false");
        props.put("mail.smtp.starttls.enable", "false");
        props.put("mail.debug", "false");

        return mailSender;
    }
}
