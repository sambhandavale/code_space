import passport_jwt from "passport-jwt";
import { Request, Response } from "express";
import User from "../../Models/Users/Users";

const JwtStrategy = passport_jwt.Strategy;

export const passportInit = (passport: any) => {
  const jwtExtractor = function (req: Request) {
    // Check authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader) {
      // More robust header parsing
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        // Clean the token from any escape characters
        return parts[1].replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"');
      }
    }
    
    // Fallback to cookies if needed
    if (req.cookies?.jwt) {
      return req.cookies.jwt;
    }
    
    return null;
  };

  const options = {
    jwtFromRequest: jwtExtractor,
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    //@ts-ignore
    new JwtStrategy(options, (jwtPayload, done) => {
      //@ts-ignore
      User.findOne({ _id: jwtPayload._id }).then((currUser: any) => {
        if (currUser) {
          done(null, currUser);
        }
      });
    }),
  );
};

export const logout = (req: Request, res: Response) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 2 * 1000),
    maxAge: -1,
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });
  res.status(200).json({ status: "success" });
};