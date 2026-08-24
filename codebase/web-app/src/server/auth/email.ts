import nodemailer from 'nodemailer';

import serverEnvConfig from '@/config/server.env.config';

type EmailOptions = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

function getTransporter() {
  if (!serverEnvConfig.SMTP_HOST || !serverEnvConfig.SMTP_FROM) {
    return undefined;
  }

  return nodemailer.createTransport({
    host: serverEnvConfig.SMTP_HOST,
    port: serverEnvConfig.SMTP_PORT,
    secure: serverEnvConfig.SMTP_PORT === 465,
    auth:
      serverEnvConfig.SMTP_USER && serverEnvConfig.SMTP_PASSWORD
        ? {
            user: serverEnvConfig.SMTP_USER,
            pass: serverEnvConfig.SMTP_PASSWORD,
          }
        : undefined,
  });
}

async function sendEmail(options: EmailOptions) {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      `SMTP is not configured. Skipped "${options.subject}" email to ${options.to}.`
    );
    return { status: 'skipped' as const };
  }

  await transporter.sendMail({
    from: serverEnvConfig.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  return { status: 'sent' as const };
}

export function sendVerificationEmail(email: string, url: string) {
  return sendEmail({
    to: email,
    subject: 'Verify your Weather Man email',
    text: `Verify your Weather Man account: ${url}`,
    html: `<p>Verify your Weather Man account:</p><p><a href="${url}">Verify email</a></p>`,
  });
}

export function sendPasswordResetEmail(email: string, url: string) {
  return sendEmail({
    to: email,
    subject: 'Reset your Weather Man password',
    text: `Reset your Weather Man password: ${url}`,
    html: `<p>Reset your Weather Man password:</p><p><a href="${url}">Reset password</a></p>`,
  });
}
