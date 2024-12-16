import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      unique: [true, "username already exists"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email already exists"],
    },
    fullName: {
      type: String,
      required: [true, "full name is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    nationality: {
      type: String,
      required: [true, "nationality is required"],
    },
    referralCode: {
      type: String,
      required: [true, "referral code is required"],
    },
    referredByCode: {
      type: String,
      required: false,
    },
    resetToken: {
      type: String,
      required: false,
    },
    resetTokenExpiry: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

const User = models.User || model("User", userSchema);
export default User;
