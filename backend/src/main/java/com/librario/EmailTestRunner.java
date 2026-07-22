package com.librario;

import com.librario.service.EmailService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class EmailTestRunner implements CommandLineRunner {

    private final EmailService emailService;

    public EmailTestRunner(EmailService emailService) {
        this.emailService = emailService;
    }

    @Override
    public void run(String... args) throws Exception {
        emailService.sendEmail(
                "shivubagaloor12@gmail.com",
                "This  Email from Librario",
                "Hello! This email from your library ."
        );
        System.out.println("Test email sent!");
    }

}

