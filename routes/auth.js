import express from "express";
import passport from "passport";
import { generateToken } from "../utils/jwt.js";

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL;

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));


router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: '/' }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${FRONTEND_URL}?token=${token}`);
  }
);

export default router;
