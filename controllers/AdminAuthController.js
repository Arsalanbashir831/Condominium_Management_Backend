const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); // Adjust the path as needed

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Replace with your own secret

const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      email,
      password: hashedPassword,
      token: '', 
    });
    res.status(201).json({ message: 'Admin registered successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '90d' });
    admin.token = token;
    await admin.save();

    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const logoutAdmin = async (req, res) => {
  try {
    const { token } = req.body;

    const admin = await Admin.findOne({ where: { token } });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    admin.token = '';
    await admin.save();

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
};
