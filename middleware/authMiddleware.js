const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); 

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findOne({ where: { id: decoded.id, token } });
    if (!admin) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.admin = decoded; 
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = authenticateJWT;
