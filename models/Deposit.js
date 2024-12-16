import mongoose, { Schema, model, models } from "mongoose";

const depositSchema = new Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    activeDeposit: {
      type: Number,
      required: false,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: false,
      required: false,
    },
    lastDeposit: {
      type: Number,
      required: false,
      default: 0,
    },
    balance: {
      type: Number,
      required: false,
      default: 0,
    },
    dailyReturn: {
      type: Number,
      required: false,
      default: 0,
    },
    totalReturn: {
      type: Number,
      required: false,
      default: 0,
    },
    pendingDeposit: {
      type: Number,
      required: false,
      default: 0,
    },
    plan: {
      type: String,
      required: false,
      default: "none",
    },
    startDate: {
      type: Date,
      required: false,
      default: null,
    },
    endDate: {
      type: Date,
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

const Deposit = models.Deposit || model("Deposit", depositSchema);

export default Deposit;
