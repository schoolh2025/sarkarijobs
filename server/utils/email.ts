import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const emailTemplates = {
  verification: (token: string) => ({
    subject: 'Verify Your Subscription - SarkariJobs',
    html: `
      <h2>Welcome to SarkariJobs!</h2>
      <p>Thank you for subscribing to our notifications. Please click the link below to verify your subscription:</p>
      <p>
        <a href="${process.env.FRONTEND_URL}/verify/${token}" style="
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
          margin: 10px 0;
        ">Verify Subscription</a>
      </p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request this subscription, please ignore this email.</p>
    `
  }),

  unsubscribe: () => ({
    subject: 'Unsubscription Confirmed - SarkariJobs',
    html: `
      <h2>Unsubscription Confirmed</h2>
      <p>You have been successfully unsubscribed from SarkariJobs notifications.</p>
      <p>We're sorry to see you go! If you change your mind, you can always subscribe again.</p>
    `
  }),

  resetPassword: (token: string) => ({
    subject: 'Reset Your Password - SarkariJobs Admin',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Please click the link below to set a new password:</p>
      <p>
        <a href="${process.env.FRONTEND_URL}/reset-password/${token}" style="
          background-color: #2196F3;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
          margin: 10px 0;
        ">Reset Password</a>
      </p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
    `
  }),

  notification: (title: string, content: string, link: string) => ({
    subject: title,
    html: `
      <h2>${title}</h2>
      <div>${content}</div>
      <p>
        <a href="${link}" style="
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
          margin: 10px 0;
        ">View Details</a>
      </p>
      <p style="font-size: 12px; color: #666;">
        You received this email because you subscribed to notifications from SarkariJobs.
        <a href="${process.env.FRONTEND_URL}/preferences">Manage preferences</a> |
        <a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a>
      </p>
    `
  })
};

// Send verification email
export const sendVerificationEmail = async (email: string, token: string) => {
  const { subject, html } = emailTemplates.verification(token);
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'SarkariJobs <noreply@sarkarijobs.schoolhunt.in>',
    to: email,
    subject,
    html
  });
};

// Send unsubscribe confirmation
export const sendUnsubscribeConfirmation = async (email: string) => {
  const { subject, html } = emailTemplates.unsubscribe();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'SarkariJobs <noreply@sarkarijobs.schoolhunt.in>',
    to: email,
    subject,
    html
  });
};

// Send password reset email
export const sendResetPasswordEmail = async (email: string, token: string) => {
  const { subject, html } = emailTemplates.resetPassword(token);
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'SarkariJobs Admin <noreply@sarkarijobs.schoolhunt.in>',
    to: email,
    subject,
    html
  });
};

// Send notification email
export const sendNotificationEmail = async (
  email: string,
  title: string,
  content: string,
  link: string
) => {
  const { subject, html } = emailTemplates.notification(title, content, link);
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'SarkariJobs <noreply@sarkarijobs.schoolhunt.in>',
    to: email,
    subject,
    html
  });
};

// Send batch notifications
export const sendBatchNotifications = async (
  notifications: Array<{
    email: string;
    title: string;
    content: string;
    link: string;
  }>
) => {
  const promises = notifications.map(({ email, title, content, link }) =>
    sendNotificationEmail(email, title, content, link)
  );

  await Promise.all(promises);
};