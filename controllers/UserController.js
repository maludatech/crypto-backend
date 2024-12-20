import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import Withdrawal from '../models/Withdrawal.js';
import { profileUpdateSchema } from '../utils/validatorSchema.js';

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

export const withdrawalController = async (req, res) => {};

export const supportController = async (req, res) => {};
