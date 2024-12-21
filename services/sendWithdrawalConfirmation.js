import nodemailer from 'nodemailer';

export const sendWithdrawalEmailConfirmation = async ({
  user,
  pendingWithdrawal,
  selectedCoin,
  walletAddress,
}) => {
  // Configure Nodemailer
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL,
      pass: process.env.PASSWORD,
    },
  });

  // Email to the user
  const userWithdrawalMailOptions = {
    from: 'CryptFX Plc',
    to: user.email, // Using the user's email
    subject: '💸 Withdrawal Confirmation',
    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                            <div style="text-align: center;">
                                <img src="https://res.cloudinary.com/dlnvweuhv/image/upload/v1727444766/square-pied-piper-brands-solid_hq1w5z.png" alt="CryptFX Logo" style="width: 80px; height: 80px; margin-bottom: 20px;" />
                            </div>
                            <p style="color: #333; font-size: 18px; font-weight: bold;">Hello ${user.username},</p>
                            <p style="color: #555; font-size: 16px; font-weight: bold;">Withdrawal Confirmation</p>
                            <p style="color: #555; font-size: 16px; padding: 12px; border-left: 4px solid #d0d0d0";>
                                Your withdrawal request of <span style="font-weight: bold;">${pendingWithdrawal} USD</span> is under confirmation and will be processed shortly.
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
  const adminWithdrawalMailOptions = {
    from: 'CryptFX Plc',
    to: 'cryptfxinvestmentplc@gmail.com',
    subject: '💸 New Withdrawal Notification',
    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                            <div style="text-align: center;">
                                <img src="https://res.cloudinary.com/dlnvweuhv/image/upload/v1727444766/square-pied-piper-brands-solid_hq1w5z.png" alt="CryptFX Logo" style="width: 80px; height: 80px; margin-bottom: 20px;" />
                            </div>
                            <p style="color: #333; font-size: 18px; font-weight: bold;">Hello Admin,</p>
                            <p style="color: #555; font-size: 16px; font-weight: bold;">Withdrawal Confirmation</p>
                            <p style="color: #555; font-size: 16px; padding: 12px; border-left: 4px solid #d0d0d0";>
                                ${user.username} of ${user.email} has just requested a withdrawal of <span style="font-weight: bold;">${pendingWithdrawal} USD</span> in ${selectedCoin} to this address: ${walletAddress}.
                                <br/>
                                <br>
                                Please confirm this withdrawal and process it so that ${user.username} will be notified.
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
  await transporter.sendMail(userWithdrawalMailOptions);
  await transporter.sendMail(adminWithdrawalMailOptions);
};
