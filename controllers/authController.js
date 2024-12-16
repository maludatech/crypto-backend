import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendWelcomeEmail } from "../services/sendWelcomeEmail.js";
import { signUpSchema } from "../utils/validatorSchema.js";

// Function to generate a unique referral code
async function generateUniqueReferralCode(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const generatedCodes = new Set();

  for (let attempts = 0; attempts < 10; attempts++) {
    let code = Array.from({ length }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join("");

    if (!generatedCodes.has(code)) {
      const existingUser = await User.findOne({ referralCode: code });
      if (!existingUser) {
        return code;
      }
      generatedCodes.add(code);
    }
  }
  throw new Error(
    "Failed to generate a unique referral code after 10 attempts"
  );
}

const generateUniqueResetToken = async () => {
  const generateToken = () => crypto.randomBytes(3).toString("hex").slice(0, 6);

  let resetToken;
  let existingUser;

  do {
    resetToken = generateToken();
    existingUser = await User.findOne({ resetToken });
  } while (existingUser);

  return resetToken;
};

export const signUpController = async (req, res) => {
  try {
    const processedData = await req.body;

    if (!processedData || !processedData.email) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Validate the incoming data
    const { error, value } = signUpSchema.validate(processedData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password, fullName, nationality, referralCode } =
      processedData;

    // Convert email, username, and fullName to lowercase
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    // Check for existing users
    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      User.findOne({ username: normalizedUsername }),
    ]);

    if (existingUserByEmail) {
      return res
        .status(400)
        .json({
          message: "User with this email already exists, please sign in",
        });
    }
    if (existingUserByUsername) {
      return res
        .status(400)
        .json({
          message: "Username already exists, please choose a different one",
        });
    }

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate user's own referral code
      const userReferralCode = await generateUniqueReferralCode(6);

      // Generate unique reset token
      const resetToken = await generateUniqueResetToken();
      const resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

      // Create new user
      const newUser = new User({
        email: normalizedEmail,
        username: normalizedUsername,
        password: hashedPassword,
        fullName,
        nationality,
        referralCode: userReferralCode,
        referredByCode: referralCode,
        resetToken,
        resetTokenExpiry,
      });
      await newUser.save();

      await Promise.all([
        new Deposit({ investor: newUser._id }).save(),
        new Withdrawal({ investor: newUser._id }).save(),
        sendWelcomeEmail(newUser),
      ]);

      // Return success response
      return res.status(201).json({
        message: "User created successfully",
      });
    } catch (error) {
      console.error("Error creating user or sending email:", error.message);
      return new Response(
        JSON.stringify({ error: "Failed to create user or send email" }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(
      "Error during signup:",
      error.message || "Internal Server Error"
    );
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const signInController = async () => {};

export const forgotPasswordController = async () => {};

export const restorePasswordController = async () => {};

export const resetPasswordController = async () => {};
