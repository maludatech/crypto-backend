import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import Withdrawal from '../models/Withdrawal.js';
import {
  depositSchema,
  patchDepositSchema,
  patchWithdrawalSchema,
  profileUpdateSchema,
  supportEmailSchema,
  withdrawalSchema,
} from '../utils/validatorSchema.js';
import { sendSupportEmail } from '../services/sendSupportEmail.js';
import { sendWithdrawalEmailConfirmation } from '../services/sendWithdrawalConfirmation.js';
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
      return res.status(404).json({ message: 'User not found' });
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

//Admin Update Deposit and withdrawal
export const patchDepositController = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const { error, value } = patchDepositSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { activeDeposit, lastDeposit, balance, pendingDeposit } = value;

    // Update deposit details
    const updatedDeposit = await Deposit.findOneAndUpdate(
      { investor: userId },
      { pendingDeposit, activeDeposit, lastDeposit, balance, isActive: true },
      { new: true }
    );

    if (!updatedDeposit) {
      return res
        .status(404)
        .json({ message: 'Deposit details or User not found' });
    }

    // Return success message with the updated deposit
    return res
      .status(200)
      .json({ message: 'Deposit updated successfully!!', updatedDeposit });
  } catch (error) {
    console.error('Error updating user deposit details', error);
    return res
      .status(500)
      .json({ message: 'Error updating user deposit details!' });
  }
};

export const patchWithdrawalController = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const { error, value } = patchWithdrawalSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { withdrawalAmount, pendingWithdrawal, lastWithdrawal } = value;

    const updatedWithdrawal = await Withdrawal.findOneAndUpdate(
      { investor: userId },
      { pendingWithdrawal, withdrawalAmount, lastWithdrawal },
      { new: true }
    );

    if (!updatedWithdrawal) {
      return res
        .status(404)
        .json({ message: 'Withdrawal details or User not found' });
    }

    // Return success message with the updated withdrawal
    return res.status(200).json({
      message: 'Withdrawal updated successfully!!',
      updatedWithdrawal,
    });
  } catch (error) {
    console.error('Error updating user withdrawal details:', error);
    return res
      .status(500)
      .json({ message: 'Error updating user withdrawal details!' });
  }
};

//Cron Functions
export const updateProfit = async () => {
  try {
    const today = new Date();

    const activeDeposits = await Deposit.find({
      $or: [
        { endDate: { $gt: today }, isActive: true }, // Active deposits
        { endDate: { $lte: today }, isActive: true }, // Completed but not updated
      ],
    });

    if (!activeDeposits.length) {
      console.log('No deposits to update.');
      return 'No deposits to update.';
    }

    const updatePromises = activeDeposits.map(async (deposit) => {
      if (new Date(deposit.endDate).getTime() <= today.getTime()) {
        const updatedBalance = deposit.balance + (deposit.totalReturn || 0);

        await Deposit.findByIdAndUpdate(deposit._id, {
          balance: updatedBalance,
          activeDeposit: 0,
          isActive: false,
          startDate: null,
          endDate: null,
          plan: 'none',
          totalReturn: 0,
        });

        console.log(`Deposit ${deposit._id} has been marked as completed.`);
      } else {
        const dailyReturn = deposit.dailyReturn;
        const updatedReturn = (deposit.totalReturn || 0) + dailyReturn;

        await Deposit.findByIdAndUpdate(deposit._id, {
          totalReturn: updatedReturn,
        });

        console.log(`Profit updated for active deposit ${deposit._id}.`);
      }
    });

    await Promise.all(updatePromises);

    console.log('Deposits processed successfully!');
    return 'Deposits processed successfully!';
  } catch (error) {
    console.error('Error updating deposits:', error);
    throw new Error('Error updating deposits!');
  }
};

export const updateDeposit = async (req, res) => {
  try {
    // Fetch all deposits with pendingDeposit > 0
    const deposits = await Deposit.find({ pendingDeposit: { $gt: 0 } });

    if (!deposits.length) {
      console.log('No deposits with pendingDeposit found.');
      return;
    }

    const updatePromises = deposits.map(async (deposit) => {
      const { investor, pendingDeposit, balance } = deposit;

      // Calculate new balance and other fields
      const updatedBalance = balance + pendingDeposit;

      // Update the deposit record
      const updatedDeposit = await Deposit.findByIdAndUpdate(
        deposit._id,
        {
          pendingDeposit: 0,
          balance: updatedBalance,
          lastDeposit: pendingDeposit,
          isActive: true,
        },
        { new: true } // Return the updated document
      );

      if (!updatedDeposit) {
        console.log(`Failed to update deposit for user ${investor}`);
        return;
      }

      // Fetch the user details for email
      const user = await User.findById(investor);
      if (!user) {
        console.log(`User not found for deposit ${deposit._id}`);
        return;
      }

      // Configure Nodemailer for email sending
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.GMAIL,
          pass: process.env.PASSWORD,
        },
      });

      // Email to the user about deposit update
      const userDepositMailOptions = {
        from: 'CryptFx Plc',
        to: user.email,
        subject: '💰 Deposit Approval',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
              <div style="text-align: center;">
                  <img src="https://res.cloudinary.com/dlnvweuhv/image/upload/v1727444766/square-pied-piper-brands-solid_hq1w5z.png" alt="CryptFX Logo" style="width: 80px; height: 80px; margin-bottom: 20px;" />
              </div>
              <p style="color: #333; font-size: 18px; font-weight: bold;"> Hello ${user.username}, </p>
              <p style="color: #555; font-size: 16px; font-weight: bold;"> Deposit Approval </p>
              <p style="color: #555; font-size: 16px; padding: 12px; border-left: 4px solid #d0d0d0;">
                  Your deposit of <span style="font-weight: bold;">${pendingDeposit} USD</span> has been approved and your dashboard has been updated successfully.
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

      await transporter.sendMail(userDepositMailOptions);
      console.log(`Deposit for user ${user.username} updated and email sent.`);
    });

    // Wait for all update operations to complete
    await Promise.all(updatePromises);

    console.log('All pending deposits processed successfully!');
  } catch (error) {
    console.error('Error updating pending deposits:', error);
  }
};

export const updateWithdrawal = async (req, res) => {
  try {
    // Fetch all withdrawals with pendingWithdrawal > 0
    const pendingWithdrawals = await Withdrawal.find({
      pendingWithdrawal: { $gt: 0 },
    });

    if (pendingWithdrawals.length === 0) {
      console.log('No pending withdrawals to process.');
      return;
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

    for (const withdrawal of pendingWithdrawals) {
      const { investor, pendingWithdrawal } = withdrawal;

      // Fetch user details
      const user = await User.findById(investor);
      if (!user) {
        console.error(`User with ID ${investor} not found.`);
        continue;
      }

      // Update withdrawal details
      const updatedWithdrawal = await Withdrawal.findOneAndUpdate(
        { investor },
        {
          $set: {
            lastWithdrawal: pendingWithdrawal,
            withdrawalAmount: withdrawal.withdrawalAmount + pendingWithdrawal,
            pendingWithdrawal: 0,
          },
        },
        { new: true }
      );

      if (!updatedWithdrawal) {
        console.error(`Failed to update withdrawal for user ${user.username}`);
        continue;
      }

      // Email to the user
      const userWithdrawalMailOptions = {
        from: 'CryptFX Plc',
        to: user.email,
        subject: '💸 Withdrawal Approval',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
              <div style="text-align: center;">
                  <img src="https://res.cloudinary.com/dlnvweuhv/image/upload/v1727444766/square-pied-piper-brands-solid_hq1w5z.png" alt="CryptFX Logo" style="width: 80px; height: 80px; margin-bottom: 20px;" />
              </div>
              <p style="color: #333; font-size: 18px; font-weight: bold;"> Hello ${user.username}, </p>
              <p style="color: #555; font-size: 16px; font-weight: bold;"> Withdrawal Approval </p>
              <p style="color: #555; font-size: 16px; padding: 12px; border-left: 4px solid #d0d0d0;">
                  Your withdrawal of ${pendingWithdrawal} USD has been approved and your dashboard has been updated successfully. Your wallet will be credited in 30 minutes.
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

      await transporter.sendMail(userWithdrawalMailOptions);
      console.log(`Email sent to ${user.email} for approved withdrawal.`);
    }

    console.log('Pending withdrawals processed successfully.');
  } catch (error) {
    console.error('Error processing pending withdrawals:', error);
  }
};
