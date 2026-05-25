package com.deopuri.service.service.impl;

import com.deopuri.service.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender sender;

    @Override
    public void sendEmail(String to, String subject, String body) {

        try {

            MimeMessage message = sender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);

            // HTML MODE
            helper.setText(body, true);

            // LOGO (optional)
            ClassPathResource logo =
                    new ClassPathResource("mail/logo.jpg");

            if (logo.exists()) {
                helper.addInline("logoImage", logo);
            }

            sender.send(message);

        } catch (Exception e) {
            throw new RuntimeException(
                    "Email sending failed : "
                            + e.getMessage(),
                    e);
        }
    }
}