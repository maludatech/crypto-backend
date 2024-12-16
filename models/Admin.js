import mongoose, { Schema, models, model } from "mongoose";

const adminSchema = new Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    email: {
      type: String,
      required: [true, "Admin Email is required"],
      unique: [true, "Admin Email must be unique"],
    },
    password: {
      type: String,
      required: [true, "Admin Password is required"],
    },
  },
  { timestamps: true }
);

const Admin = models.Admin || model("Admin", adminSchema);

export default Admin;
