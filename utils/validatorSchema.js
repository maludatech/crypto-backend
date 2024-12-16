import Joi from "joi";

export const signUpSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(15).required(),
  fullName: Joi.string().required(),
  nationality: Joi.string().required(),
  referralCode: Joi.string().optional(),
});
