package com.librario.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    // Inject JavaMailSender
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Plain text email
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (MailException e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    // email
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML support

            mailSender.send(mimeMessage);
        } catch (MessagingException | MailException e) {
            log.warn("Failed to send HTML email to {}: {}", to, e.getMessage());
        }
    }

    //  Welcome email for normal users (Members/Admins)
    public void sendWelcomeEmailForUser(String to, String name) {
        String loginUrl = "http://localhost:5173";

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #2c3e50;">Welcome to Librario, %s!</h2>
                    <p>We’re excited to have you on board 🎉</p>
                    <p>Your account has been created successfully. You can now login and explore our library services.</p>
                    <a href="%s" style="display: inline-block; padding: 10px 20px;
                        margin-top: 10px; background-color: #4CAF50; color: white;
                        text-decoration: none; border-radius: 5px;">
                        Login Now
                    </a>
                </div>
                """.formatted(name, loginUrl);

        sendHtmlEmail(to, "Welcome to Librario!", htmlContent);
    }

    //  Welcome email for Librarians added by Admin
    public void sendWelcomeEmailForLibrarian(String to, String name) {
        String resetPasswordUrl = "http://localhost:5173/forgot-password";

        String htmlContent = """
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #2c3e50;">Welcome to Librario, %s!</h2>
                    <p>You have been added as a <strong>LIBRARIAN</strong> by the admin.</p>
                    <p>Please reset your password by clicking the button below:</p>
                
                    <a href="%s" style="display: inline-block; padding: 10px 20px;
                        margin-top: 10px; background-color: #4CAF50; color: white;
                        text-decoration: none; border-radius: 5px;">
                        Reset Your Password
                    </a>
                </div>
                """.formatted(name, resetPasswordUrl);

        sendHtmlEmail(to, "Welcome to Librario - Set Your Password", htmlContent);
    }

    //  Overdue reminder email
    public void sendOverdueReminderEmail(String to, String name, String bookTitle, String dueDate) {
        String htmlContent = """
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #c0392b;">Reminder: Book Due Soon!</h2>
                        <p>Dear %s,</p>
                        <p>This is a friendly reminder that your borrowed book <strong>"%s"</strong> is due on <strong>%s</strong>.</p>
                        <p>Please return it on time to avoid any overdue penalties.</p>
                        <p>Thank you,<br/>Librario Team</p>
                    </div>
                """.formatted(name, bookTitle, dueDate);

        sendHtmlEmail(to, "Book Due Reminder", htmlContent);
    }

}
