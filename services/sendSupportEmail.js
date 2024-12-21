import nodemailer from 'nodemailer';

export const sendSupportEmail = async ({ user, subject, message }) => {
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

  // Email to the admin
  const adminMailOptions = {
    from: user.email,
    to: 'cryptfxinvestmentplc@gmail.com',
    subject: subject,
    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                          <div style="text-align: center;">
                              <img src="https://res.cloudinary.com/dlnvweuhv/image/upload/v1727444766/square-pied-piper-brands-solid_hq1w5z.png" alt="CryptFX Logo" style="width: 80px; height: 80px; margin-bottom: 20px;" />
                          </div>
                          <p style="color: #333; font-size: 18px; font-weight: bold;">Hello Admin,</p>
                          <p style="color: #555; font-size: 16px; font-weight: bold;">${subject}</p>
                          <p>You got a new message from ${user.username}:</p>
                          <p style="padding: 12px; border-left: 4px solid #d0d0d0;">
                              This user by full name: ${user.fullName} sent the message below:
                              <br/>
                              ${message}
                              <br/>
                              <br/>
                              A quick reply to this message via the user's email: ${user.email} will be much appreciated.
                          </p>
                      <p>
                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                      <p style="color: #555; font-size: 14px; text-align: center;">
                          Thank you for using <span style="color: #B197FC; font-weight: bold;">CryptFX</span>.<br>
                          <strong>Best wishes,</strong><br>
                          CryptFX Plc
                      </p>
                  </div>
              `,
  };

  await transporter.sendMail(adminMailOptions);
};
