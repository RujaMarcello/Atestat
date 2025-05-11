const jwt = require("jsonwebtoken");
const config = process.env;
const { auth } = require('../firebase');

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["token"];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

const authRole = (requiredRole = []) => {
  if (typeof requiredRole === "string") {
    requiredRole = [requiredRole];
  }
  return (req, res, next) => {
    if (requiredRole.length && !requiredRole.includes(req.user.role)) {
      return res.status(401).send("Not allowed");
    }
    return next();
  };
};

module.exports = { verifyToken, authRole };
