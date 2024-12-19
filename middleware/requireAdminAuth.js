import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const requireAdminAuth = async (req, res, next) => {
  // verify authentication
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Authorization token required' });
  }
  const token = authorization.split(' ')[1];

  try {
    const { _id } = jwt.verify(token, process.env.SECRET_KEY);

    req.user = await Admin.findOne({ _id }).select('_id');

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: 'Request is not authorised' });
  }
};

export default requireAdminAuth;
