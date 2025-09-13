import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";
import dotenv from "dotenv";
dotenv.config();


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ google_id: profile.id });
        if (!user) {
          user = await User.create({
            google_id: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value || "",
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
