import nodemailer from 'nodemailer';

export const sendResetPasswordEmail = async (user) => {
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

  const passwordChangeMailOptions = {
    from: 'CryptFX Plc',
    to: user.email,
    subject: '🔐 Password Change Notification',
    html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                      <div style="text-align: center;">
                          <img src="https://res.cloudinary.com/dlnvweuhv/image/upload/v1727444766/square-pied-piper-brands-solid_hq1w5z.png" alt="CryptFX Logo" style="width: 80px; height: 80px; margin-bottom: 20px;" />
                      </div>
                      <p style="color: #333; font-size: 18px; font-weight: bold;">Hello ${user.username},</p>
                      <p style="color: #555; font-size: 16px; font-weight: bold;">Password Change Notification</p>
                      <p style="color: #333; font-weight: bold; font-size: 22px; background-color: #f8f8f8; padding: 10px 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                          Your password has changed.
                      </p>
                      <p style="color: #555; font-size: 16px;">If you initiated this change, disregard this email. If you did not initiate this change, contact support.</p>
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
  await transporter.sendMail(passwordChangeMailOptions);
};
