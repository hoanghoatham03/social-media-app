import jwt from "jsonwebtoken";

//check if the user is authenticated
export const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json("Unauthorized");
  }

  const accessToken = authHeader.split(" ")[1];

  jwt.verify(accessToken, process.env.JWT_SECRET, (err, decode) => {
    if (err) {
      return res.status(403).json("Invalid token");
    }

    req.userId = decode.userId;
    next();
  });
};
