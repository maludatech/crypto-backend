import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import Withdrawal from '../models/Withdrawal.js';
import { profileUpdateSchema } from '../utils/validatorSchema.js';
import { supportEmailSchema } from '../utils/validatorSchema.js';
import { withdrawalSchema } from '../utils/validatorSchema.js';
import { sendSupportEmail } from '../services/sendSupportEmail.js';

export const profileController = async (req, res) => {
  try {
    const data = req.body;

    const { error, value } = profileUpdateSchema.validate(data);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: 'Old password cannot be used. Please choose a new password.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's document in the database with the new password
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    const secretKey = process.env.SECRET_KEY;

    // Generate a new JWT token with updated user information
    const token = jwt.sign(
      {
        userId: updatedUser._id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        nationality: updatedUser.nationality,
      },
      secretKey,
      { expiresIn: '3d' }
    );

    return res
      .status(200)
      .json({ message: 'Profile updated successfully!', token });
  } catch (error) {
    console.error('Error during profile update', error);
    return res.status(500).json({ message: 'Error Updating Profile' });
  }
};

export const referralController = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Step 1: Find the user by userId to get the referralCode
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const referralCode = user.referralCode;

    if (!referralCode) {
      return res.status(400).json({ message: 'Referral code is missing' });
    }

    // Step 2: Find all users who have this referralCode in their referredByCode
    const referrals = await User.find({ referredByCode: referralCode });

    // Step 3: Return the total number of referrals
    return res.status(200).json({ totalReferral: referrals.length });
  } catch (error) {
    console.error('Error fetching referral details', error);
    return res.status(500).json({ message: 'Error fetching referral details' });
  }
};

export const depositController = async (req, res) => {};

export const withdrawalController = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const { error, value } = withdrawalSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { pendingWithdrawal, selectedCoin, walletAddress } = value;

    // Fetch user details from the database
    const user = await User.findById(userId);

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
      });
    }

    const updatedWithdrawal = await Withdrawal.findOneAndUpdate(
      { investor: userId },
      { pendingWithdrawal: pendingWithdrawal },
      { new: true }
    );

    if (!updatedWithdrawal) {
      return new Response(
        JSON.stringify({ message: 'Withdrawal details not found' }),
        { status: 404 }
      );
    }

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

    // Return success message with the updated withdrawal details
    return new Response(
      JSON.stringify({
        message: 'Withdrawal updated successfully!!',
        updatedWithdrawal: updatedWithdrawal,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user withdrawal details:', error);
    return new Response(
      JSON.stringify({ message: 'Error updating user withdrawal details!' }),
      { status: 500 }
    );
  }
};

export const supportController = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const { error, value } = supportEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { subject, message } = value;

    // Fetch user details from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await sendSupportEmail({ user, subject, message });

    // Return success message
    return res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Error sending email!' });
  }
};
