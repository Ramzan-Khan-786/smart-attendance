import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  console.log("Headers received:", req.headers);

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log("No token provided!");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Invalid token!", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};
