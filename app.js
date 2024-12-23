import express from 'express';
import dotenv from 'dotenv';
import { connectToDb } from './utils/database.js';
import cron from 'node-cron';
import {
  updateDeposit,
  updateProfit,
  updateWithdrawal,
} from './controllers/userController.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminAuthRoutes from './routes/adminAuth.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth/admin', adminAuthRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3600;

connectToDb();

// Schedule the task to run every day at midnight (server time)
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily profit update task...');
  try {
    const result = await updateProfit();
    console.log(result);
  } catch (error) {
    console.error('Error during daily profit update task:', error.message);
  }
});

// Run the function every 30 minutes using cron
cron.schedule('*/30 * * * *', async () => {
  console.log('Running deposit update task...');
  try {
    await updateDeposit();
    console.log('Deposit update task completed successfully.');
  } catch (error) {
    console.error('Error during deposit update task:', error.message);
  }
});

cron.schedule('*/30 * * * *', async () => {
  console.log('Running withdrawal update task...');
  try {
    await updateWithdrawal();
    console.log('Withdrawal update task completed successfully.');
  } catch (error) {
    console.error('Error during withdrawal update task:', error.message);
  }
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
