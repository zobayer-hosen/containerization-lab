const jwt = require('jsonwebtoken');
const { cookieSecure } = require('../config');

const COOKIE_NAME = 'token';

const cookieOptions = {
  httpOnly: true, // not readable from browser JavaScript
  secure: cookieSecure, // only sent over HTTPS when enabled
  sameSite: 'lax', // not sent on cross-site POSTs, which blocks CSRF
  path: '/',
};

function setAuthCookie(res, token) {
  // Expire the cookie at the same moment as the JWT inside it.
  const { exp } = jwt.decode(token);
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, expires: new Date(exp * 1000) });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
}

module.exports = { COOKIE_NAME, setAuthCookie, clearAuthCookie };
