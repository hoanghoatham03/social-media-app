import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json("Unauthorized");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userId) => {
    if (err) {
      return res.status(403).json("Invalid token");
    }

    req.id = userId;
    next();
  });
};
