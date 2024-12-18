import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { sendEmailSchema } from '../utils/validatorSchema.js';

export const sendEmailController = async (req, res) => {
  const data = req.body;

  const { error, value } = sendEmailSchema.validate(data);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { subject, heading, Message } = value;

  try {
    // Fetch all users from the database
    const users = await User.find({}, 'email username'); // Only fetch the email and username fields

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

    // Loop through all users and send emails
    for (const user of users) {
      const MailOptions = {
        from: 'CryptFX Plc',
        to: user.email,
        subject: subject,
        html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                        <div style="text-align: center;">
                            <img src="https://res.cloudinary.com/dlnvweuhv/image/upload/v1727444766/square-pied-piper-brands-solid_hq1w5z.png" alt="CryptFX Logo" style="width: 80px; height: 80px; margin-bottom: 20px;" />
                        </div>
                        <p style="color: #333; font-size: 18px; font-weight: bold;">Hello ${user.username},</p>
                        <p style="color: #555; font-size: 16px; font-weight: bold;">${heading}</p>
                        <p style="color: #555; font-size: 16px; padding: 12px; border-left: 4px solid #d0d0d0; ">
                            ${Message}
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

      // Send the email
      await transporter.sendMail(MailOptions);
    }

    // Return success response
    return res.status(200).json({ message: 'Emails sent successfully!' });
  } catch (error) {
    console.error('Error sending email', error);
    return res.status(500).json({ message: 'Error sending emails!' });
  }
};
