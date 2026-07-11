package com.deopuri.service.service.impl;

import com.deopuri.service.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log =
            LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired
    private JavaMailSender sender;

    /**
     * Send an HTML email with an optional inline logo. Logs success at INFO
     * (recipient + subject only — the body contains user-facing copy we don't
     * want filling the log file) and the cause at ERROR before rethrowing.
     *
     * <p>The rethrow is preserved so caller behaviour is unchanged; we just
     * record the failure on the way out. Previously the only signal of a
     * failed mail was whatever the caller did with the RuntimeException —
     * several call sites swallow it with {@code log.error("Approve mail
     * failed", e)} which loses the recipient/subject context.
     */
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

            log.info("Email sent to={} subject='{}'", to, subject);

        } catch (Exception e) {
            log.error(
                    "Email send failed to={} subject='{}': {}",
                    to,
                    subject,
                    e.getMessage(),
                    e);
            throw new RuntimeException(
                    "Email sending failed : "
                            + e.getMessage(),
                    e);
        }
    }
}