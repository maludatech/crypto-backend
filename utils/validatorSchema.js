import Joi from 'joi';

export const signUpSchema = Joi.object({
  username: Joi.string()
    .trim()
    .alphanum()
    .min(3)
    .max(15)
    .required()
    .messages({ 'string.base': 'Username must be a string.' }),
  email: Joi.string().email().required().trim(),
  password: Joi.string().min(8).max(15).required().trim(),
  fullName: Joi.string()
    .trim()
    .regex(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Full name must only contain letters and spaces.',
    }),
  nationality: Joi.string().trim().required(),
  referralCode: Joi.string().optional().allow('').trim(),
});

export const signInSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string()
    .required()
    .min(8)
    .max(15)
    .messages({ 'string.max': 'Password cannot exceed 15 characters.' }),
});

export const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().required().trim(),
});

export const supportEmailSchema = Joi.object({
  subject: Joi.string()
    .trim()
    .max(50)
    .required()
    .messages({ 'string.max': 'Subject cannot exceed 50 characters.' }),
  message: Joi.string()
    .trim()
    .max(1000)
    .required()
    .messages({ 'string.max': 'Message cannot exceed 1000 characters.' }),
});

export const sendEmailSchema = Joi.object({
  heading: Joi.string().trim().required(),
  subject: Joi.string()
    .trim()
    .max(50)
    .required()
    .messages({ 'string.max': 'Subject cannot exceed 50 characters.' }),
  message: Joi.string()
    .trim()
    .max(1000)
    .required()
    .messages({ 'string.max': 'Message cannot exceed 1000 characters.' }),
});

export const depositSchema = Joi.object({
  pendingDeposit: Joi.number().positive().required(),
  investmentPlan: Joi.string().trim().required(),
  dailyReturn: Joi.number().positive().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .required()
    .messages({ 'date.greater': 'End date must be greater than start date.' }),
});

export const withdrawalSchema = Joi.object({
  pendingWithdrawal: Joi.number().positive().required(),
  walletAddress: Joi.string()
    .trim()
    .required()
    .messages({ 'string.base': 'Wallet address must be a valid string.' }),
  coin: Joi.string()
    .trim()
    .valid('BTC', 'ETH', 'USDT')
    .required()
    .messages({ 'any.only': "Coin must be one of 'BTC', 'ETH', or 'USDT'." }),
});
