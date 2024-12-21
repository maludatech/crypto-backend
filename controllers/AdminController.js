import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import Withdrawal from '../models/Withdrawal.js';
import { sendEmailSchema } from '../utils/validatorSchema.js';
import { changePasswordSchema } from '../utils/validatorSchema.js';

export const userDetailsController = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    return res.status(500).json({ message: 'Error fetching user details' });
  }
};

export const getUsersDetailsController = async (req, res) => {
  try {
    const { timestamp } = req.params;
    const users = await User.find();
    const deposits = await Deposit.find();
    const withdrawals = await Withdrawal.find();

    return res.status(200).json({ users, deposits, withdrawals });
  } catch (error) {
    console.log(
      'Error while fetching data',
      error.message || 'Internal Server Error'
    );
    return response.status(500).json({ message: 'Internal Server Error' });
  }
};

export const changePasswordController = async (req, res) => {
  try {
    const formData = req.body;

    const { error, value } = changePasswordSchema.validate(formData);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, oldPassword, newPassword } = value;

    // Retrieve the admin's document from the database
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Compare the provided old password with the stored hashed password
    const isPasswordMatch = await bcrypt.compare(oldPassword, admin.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    // Hash and salt the new password
    admin.password = await bcrypt.hash(newPassword, 10);

    // Save the updated password
    await admin.save();

    // Respond with success message and token
    return res
      .status(200)
      .json({ message: 'Admin profile updated successfully' });
  } catch (error) {
    // Handle errors
    console.error('Error during Admin profile update', error);
    return res.status(500).json({ message: 'Error Updating Admin Profile' });
  }
};

export const sendEmailController = async (req, res) => {
  const data = req.body;

  // Validate request body
  const { error, value } = sendEmailSchema.validate(data);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { subject, heading, Message } = value;

  // Ensure environment variables are set
  if (!process.env.GMAIL || !process.env.PASSWORD) {
    return res
      .status(500)
      .json({ message: 'Email service configuration is missing.' });
  }

  try {
    // Fetch all users from the database
    const users = await User.find({}, 'email username'); // Only fetch email and username fields

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: 'No users found to send emails.' });
    }

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

    // Prepare email sending promises
    const emailPromises = users.map(async (user) => {
      const MailOptions = {
        from: 'CryptFX Plc',
        to: user.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
            <div style="text-align: center;">
              <img 
                src="https://res.cloudinary.com/dlnvweuhv/image/upload/v1727444766/square-pied-piper-brands-solid_hq1w5z.png" 
                alt="CryptFX Logo" 
                style="width: 80px; height: 80px; margin-bottom: 20px;" />
            </div>
            <p style="color: #333; font-size: 18px; font-weight: bold;">Hello ${user.username},</p>
            <p style="color: #555; font-size: 16px; font-weight: bold;">${heading}</p>
            <p style="color: #555; font-size: 16px; padding: 12px; border-left: 4px solid #d0d0d0;">
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

      return transporter.sendMail(MailOptions).catch((err) => {
        console.error(`Failed to send email to ${user.email}:`, err);
      });
    });

    // Wait for all email promises to resolve
    await Promise.all(emailPromises);

    return res.status(200).json({ message: 'Emails sent successfully!' });
  } catch (error) {
    console.error('Error sending emails:', error);
    return res.status(500).json({ message: 'Error sending emails!' });
  }
};

export const deleteUserController = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Delete the user
    const deleteUser = await User.findByIdAndDelete(userId);

    if (!deleteUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userDeposits = await Deposit.find({ investor: userId });
    const userWithdrawals = await Withdrawal.find({ investor: userId });

    if (userDeposits.length > 0) {
      await Deposit.deleteMany({ investor: userId });
    }

    if (userWithdrawals.length > 0) {
      await Withdrawal.deleteMany({ investor: userId });
    }

    return res.status(200).json({
      message: `User ${deleteUser.email} and their related data were deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting user and related data:', error);

    return res
      .status(500)
      .json({ message: 'Error deleting user and related data' });
  }
};
