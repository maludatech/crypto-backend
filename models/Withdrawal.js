import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const withdrawalSchema = new Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    withdrawalAmount: {
      type: Number,
      required: false,
      default: 0,
    },
    pendingWithdrawal: {
      type: Number,
      required: false,
      default: 0,
    },
    lastWithdrawal: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true }
);

const Withdrawal = models.Withdrawal || model("Withdrawal", withdrawalSchema);

export default Withdrawal;
