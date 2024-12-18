import express from 'express';
import dotenv from 'dotenv';
import { connectToDb } from './utils/database.js';
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
app.use('/api/users', userRoutes);
app.use('/api/auth/admin', adminAuthRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3500;

connectToDb();

app.listen(PORT, (req, res) => {
  console.log(`listening on port ${PORT}`);
});
