const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { jwtSecret, jwtExpiresIn } = require('../config');
const { setAuthCookie, clearAuthCookie } = require('../utils/authCookie');

const SALT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Compared against when the email is unknown, so login takes the same time
// whether or not the account exists.
const DUMMY_HASH = bcrypt.hashSync('dummy-password', SALT_ROUNDS);

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function signToken(user) {
  return jwt.sign({ sub: String(user.id), email: user.email }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
}

function validateRegistration({ name, email, password }) {
  const errors = {};

  if (typeof name !== 'string' || !name.trim()) {
    errors.name = 'Name is required';
  } else if (name.trim().length > 100) {
    errors.name = 'Name must be at most 100 characters';
  }

  if (!EMAIL_RE.test(email) || email.length > 255) {
    errors.email = 'A valid email is required';
  }

  if (typeof password !== 'string' || password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (Buffer.byteLength(password) > 72) {
    // bcrypt ignores everything past 72 bytes
    errors.password = 'Password must be at most 72 bytes';
  }

  return errors;
}

async function register(req, res) {
  const { name, password } = req.body ?? {};
  const email = normalizeEmail(req.body?.email);

  const errors = validateRegistration({ name, email, password });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name.trim(), email, passwordHash]
    );
    const user = rows[0];
    setAuthCookie(res, signToken(user));
    return res.status(201).json({ user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email is already registered' });
    }
    throw err;
  }
}

async function login(req, res) {
  const { password } = req.body ?? {};
  const email = normalizeEmail(req.body?.email);

  if (!email || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { rows } = await pool.query(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
    [email]
  );
  const found = rows[0];

  const passwordMatches = await bcrypt.compare(password, found?.password_hash ?? DUMMY_HASH);
  if (!found || !passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { password_hash: _, ...user } = found;
  setAuthCookie(res, signToken(user));
  return res.json({ user });
}

function logout(req, res) {
  clearAuthCookie(res);
  return res.json({ message: 'Logged out' });
}

async function me(req, res) {
  const { rows } = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  if (!rows[0]) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user: rows[0] });
}

module.exports = { register, login, logout, me };
