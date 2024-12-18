import nodemailer from 'nodemailer';

export const sendForgotPasswordEmail = async ({ user, resetToken }) => {
  // Configure Nodemailer
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: 'CryptFX Plc',
    to: user.email,
    subject: '🔒 Password Reset - CryptFX',
    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
              <div style="text-align: center;">
                  <img src="https://res.cloudinary.com/dlnvweuhv/image/upload/v1727444766/square-pied-piper-brands-solid_hq1w5z.png" alt="CryptFX Logo" style="width: 80px; height: 80px; margin-bottom: 20px;" />
              </div>
              <p style="color: #333; font-size: 18px; font-weight: bold;">Hello ${user.username},</p>
              <p style="color: #555; font-size: 16px;">You recently requested to reset your password for your CryptFX account.</p>
              <p style="color: #333; font-weight: bold; font-size: 22px; background-color: #f8f8f8; padding: 10px 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                  ${resetToken}
              </p>
              <p style="color: #555; font-size: 16px;">Please use the above code to reset your password. This code will expire in 30 minutes.</p>
              <p style="color: #555; font-size: 16px;">If you did not request this, please ignore this email or <a href="https://CryptFX.vercel.app/contact" style="color: #B197FC; text-decoration: none;">contact our support team</a> immediately.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #555; font-size: 14px; text-align: center;">
                  Thank you for using <span style="color: #B197FC; font-weight: bold;">CryptFX</span>.<br>
                  <strong>Best wishes,</strong><br>
                  CryptFX Plc
              </p>
          </div>
      `,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};
