import nodemailer from 'nodemailer';

export const sendWelcomeEmail = async (newUser) => {
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
    to: newUser.email,
    subject: '🎉 Welcome to CryptFX',
    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
            <div style="text-align: center;">
              <img src="https://res.cloudinary.com/dlnvweuhv/image/upload/v1727444766/square-pied-piper-brands-solid_hq1w5z.png" alt="CryptFX Logo" style="width: 80px; height: 80px; margin-bottom: 20px;" />
            </div>
            <p style="color: #333; font-size: 18px; font-weight: bold;">Hello ${newUser.username},</p>
            <p style="color: #555; font-size: 16px; font-weight: bold;">Welcome to the CryptFX Family</p>
            <p style="color: #555; font-size: 16px; padding: 12px; border-left: 4px solid #d0d0d0;">
              We are thrilled to welcome you to CryptFX! Your new account has been successfully created, and you are now part of our growing community of traders.
            <br/><br/>
              With your CryptFX account, you can now access a wide range of online trading services designed to help you achieve your financial goals. Whether you're a seasoned trader or just starting out, we offer the tools and support you need to succeed.
            <br/><br/>
              Thank you for choosing CryptFX. We're excited to be part of your trading journey!
            </p>
            <p style="color: #555; font-size: 16px;">You can log in by clicking <a href="https://www.cryptfx.vercel.app/sign-in" style="color: #B197FC; text-decoration: none;">here</a>.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #555; font-size: 14px; text-align: center;">
              Thank you for using <span style="color: #B197FC; font-weight: bold;">CryptFX</span>.<br>
              <strong>Best wishes,</strong><br>
              CryptFX Plc
            </p>
          </div>
        `,
  };
  await transporter.sendMail(mailOptions);
};
