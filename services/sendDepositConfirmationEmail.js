import nodemailer from 'nodemailer';

export const sendDepositConfirmationEmail = async ({
  user,
  pendingDeposit,
  selectedCoin,
  selectedPlan,
}) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL,
      pass: process.env.PASSWORD,
    },
  });

  // Email to the user
  const userDepositMailOptions = {
    from: 'CryptFX Plc',
    to: user.email, // Using the user's email
    subject: '💰 Deposit Confirmation',
    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                          <div style="text-align: center;">
                              <img src="https://res.cloudinary.com/dlnvweuhv/image/upload/v1727444766/square-pied-piper-brands-solid_hq1w5z.png" alt="CryptFX Logo" style="width: 80px; height: 80px; margin-bottom: 20px;" />
                          </div>
                          <p style="color: #333; font-size: 18px; font-weight: bold;">Hello ${user.username},</p>
                          <p style="color: #555; font-size: 16px; font-weight: bold;">Deposit Confirmation</p>
                          <p style="color: #555; font-size: 16px; padding: 12px; border-left: 4px solid #d0d0d0; ">
                              Your deposit of <span style="font-weight: bold;">${pendingDeposit} USD</span> is under confirmation and your dashboard will be updated shortly.
                          </p>
                          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                          <p style="color: #555; font-size: 14px; text-align: center;">
                              Thank you for using <span style="color: #B197FC; font-weight: bold;">CryptFX</span>.<br>
                              <strong>Best wishes,</strong><br>
                              CryptFX Plc
                          </p>
                  </div>
              `,
  };

  // Email to the admin
  const adminDepositMailOptions = {
    from: 'CryptFX Plc',
    to: 'cryptfxinvestmentplc@gmail.com',
    subject: '💰 New Deposit Notification',
    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                          <div style="text-align: center;">
                              <img src="https://res.cloudinary.com/dlnvweuhv/image/upload/v1727444766/square-pied-piper-brands-solid_hq1w5z.png" alt="CryptFX Logo" style="width: 80px; height: 80px; margin-bottom: 20px;" />
                          </div>
                          <p style="color: #333; font-size: 18px; font-weight: bold;">Hello Admin,</p>
                          <p style="color: #555; font-size: 16px; font-weight: bold;">Deposit Confirmation</p>
                          <p style="color: #555; font-size: 16px; padding: 12px; border-left: 4px solid #d0d0d0; ">
                              ${user.username} of ${user.email} has just made a deposit of <span style="font-weight: bold;">${pendingDeposit} USD</span> in ${selectedCoin} under ${selectedPlan} plan.
                              <br/>
                              <br>
                              Please confirm this deposit and process it so that ${user.username} will be notified.
                            </p>
                              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                              <p style="color: #555; font-size: 14px; text-align: center;">
                                  Thank you for using <span style="color: #B197FC; font-weight: bold;">CryptFX</span>.<br>
                                  <strong>Best wishes,</strong><br>
                                  CryptFX Plc
                              </p>
                      </div>
              `,
  };

  // Send emails
  await transporter.sendMail(userDepositMailOptions);
  await transporter.sendMail(adminDepositMailOptions);
};
