package com.librario.service;

import com.librario.model.Transaction;
import com.librario.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class OverdueReminderService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private EmailService emailService;


    // Run every day at 8 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void sendOverdueReminders() {
        LocalDate targetDate = LocalDate.now().plusDays(2); // 2 days before due
        List<Transaction> transactions = transactionRepository.findTransactionsDueOn(targetDate);

        for (Transaction t : transactions) {
            // Access email and name through the User object
            emailService.sendOverdueReminderEmail(
                    t.getMember().getUser().getEmail(),
                    t.getMember().getUser().getName(),
                    t.getBook().getTitle(),
                    t.getDueDate().toString()
            );
        }
    }
}
