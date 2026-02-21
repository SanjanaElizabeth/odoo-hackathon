import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Hardcoded credentials for demo
const HARDCODED_CREDENTIALS = {
  manager: {
    email: 'manager@fleetflow.com',
    password: 'manager123',
    name: 'Manager Account',
    role: 'manager',
  },
  dispatcher: {
    email: 'dispatcher@fleetflow.com',
    password: 'dispatcher123',
    name: 'Dispatcher Account',
    role: 'dispatcher',
  },
  safety_officer: {
    email: 'safety@fleetflow.com',
    password: 'safety123',
    name: 'Safety Officer',
    role: 'safety_officer',
  },
  financial_analyst: {
    email: 'finance@fleetflow.com',
    password: 'finance123',
    name: 'Financial Analyst',
    role: 'financial_analyst',
  },
};

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check hardcoded credentials
    let user = null;
    for (const key in HARDCODED_CREDENTIALS) {
      const cred = HARDCODED_CREDENTIALS[key];
      if (cred.email === email && cred.password === password) {
        user = cred;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.email,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.email,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all hardcoded users (for frontend reference)
router.get('/credentials', (req, res) => {
  const credentials = [];
  for (const key in HARDCODED_CREDENTIALS) {
    const cred = HARDCODED_CREDENTIALS[key];
    credentials.push({
      email: cred.email,
      password: cred.password,
      role: cred.role,
      name: cred.name,
    });
  }
  res.json(credentials);
});

export default router;
