const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "secretkey";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Token required" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const isProfessor = (req, res, next) => {
  if (req.user.role !== "professor")
    return res.status(403).json({ message: "Access denied" });
  next();
};
const isStudent = (req, res, next) => {
  if (req.user.role !== "student")
    return res.status(403).json({ message: "Access denied" });
  next();
};

module.exports = { verifyToken, isProfessor, isStudent };
