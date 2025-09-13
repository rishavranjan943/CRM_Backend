import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function generateToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}
