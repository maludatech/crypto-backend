import Admin from '../models/Admin.js';
import { signInSchema } from '../utils/validatorSchema.js';

export const signInController = async (req, res) => {
  try {
    const data = req.body;

    const { error, value } = signInSchema.validate(data, {
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    const normalizedEmail = email.toLowerCase();

    const existingAdmin = await Admin.findOne({ email: normalizedEmail });

    if (!existingAdmin) {
      return res.status(401).json({ message: 'Invalid admin email' });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      existingAdmin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid admin password' });
    }

    const secretKey = process.env.SECRET_KEY;

    // Generate JWT token
    const token = jwt.sign(
      { adminId: existingAdmin._id, email: existingAdmin.email },
      secretKey,
      { expiresIn: '5d' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error during admin sign-in:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
