import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import Withdrawal from '../models/Withdrawal.js';
import {
  depositSchema,
  profileUpdateSchema,
} from '../utils/validatorSchema.js';
import { supportEmailSchema } from '../utils/validatorSchema.js';
import { withdrawalSchema } from '../utils/validatorSchema.js';
import { sendSupportEmail } from '../services/sendSupportEmail.js';
import { sendWithdrawalEmailConfirmation } from '../services/sendWithdrawalConfirmation.js';
import { response } from 'express';
import { sendDepositConfirmationEmail } from '../services/sendDepositConfirmationEmail.js';

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

export const depositController = async (req, res) => {
  const userId = req.params.id;

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  const { error, value } = depositSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const {
    pendingDeposit,
    selectedCoin,
    selectedPlan,
    dailyReturn,
    startDate,
    endDate,
  } = value;

  try {
    // Fetch user details from the database
    const user = await User.findById(userId); // Assuming you have a User model

    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }

    const updatedDeposit = await Deposit.findOneAndUpdate(
      { investor: userId },
      {
        pendingDeposit: pendingDeposit,
        plan: selectedPlan,
        dailyReturn: dailyReturn,
        startDate: startDate,
        endDate: endDate,
      },
      { new: true }
    );

    if (!updatedDeposit) {
      return res.status(404).json({ message: 'Deposit details not found' });
    }

    try {
      await sendDepositConfirmationEmail({
        user,
        pendingDeposit,
        selectedCoin,
        selectedPlan,
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return res.status(500).json({ message: 'Email notification failed' });
    }

    // Return success message with the updated user
    return res.status(200).json({ message: 'Deposit updated successfully!!' });
  } catch (error) {
    console.error('Error updating user deposit details', error);
    return res.status(500).json({ message: 'Error updating deposit details!' });
  }
};

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
      return res.status(404).send({ message: 'User not found' });
    }

    const updatedWithdrawal = await Withdrawal.findOneAndUpdate(
      { investor: userId },
      { pendingWithdrawal: pendingWithdrawal },
      { new: true }
    );

    if (!updatedWithdrawal) {
      return res.status(404).json({ message: 'Withdrawal details not found' });
    }

    // Send email notifications
    try {
      await sendWithdrawalEmailConfirmation({
        user,
        pendingWithdrawal,
        selectedCoin,
        walletAddress,
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return res.status(500).json({ message: 'Email notification failed' });
    }

    // Return success message with the updated withdrawal details
    return res.status(200).json({
      message: 'Withdrawal updated successfully!!',
      updatedWithdrawal: updatedWithdrawal,
    });
  } catch (error) {
    console.error('Error updating user withdrawal details:', error);
    return res
      .status(500)
      .json({ message: 'Error updating user withdrawal details!' });
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

export const getDepositController = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const deposit = await Deposit.findOne({ investor: userId });

    if (!deposit) {
      console.error('User deposit details not found');
      return res.status(404).json({ message: 'Deposits not found' });
    }

    return res.status(200).json(deposit);
  } catch (error) {
    console.error('Error fetching user deposit details', error);
    return res
      .status(500)
      .json({ message: 'Error fetching user deposit details' });
  }
};

export const getWithdrawalController = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const withdrawal = await Withdrawal.findOne({ investor: userId });

    if (!withdrawal) {
      console.error('User withdrawal details not found');
      return res.status(404).json({ message: 'Withdrawals not found' });
    }
    return res.status(200).json(withdrawal);
  } catch (error) {
    console.error('Error fetching user withdrawal details', error);
    return res
      .status(500)
      .json({ message: 'Error fetching user withdrawal details' });
  }
};
