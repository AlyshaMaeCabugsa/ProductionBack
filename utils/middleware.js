const jwt = require('jsonwebtoken');

// Middleware to validate JWT and set user in request
exports.validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Authorization: Bearer TOKEN

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.sendStatus(403); // Invalid token
      }
      req.user = decoded; // This is the payload you signed earlier
      next();
    });
  } else {
    res.sendStatus(401); // No token provided
  }
};
