import User from "../../models/Users/Users";
import { Response, Request, NextFunction } from "express";
import { sign, verify } from "jsonwebtoken";
import UserDetails from "../../models/Users/UserDetails";

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
      const { username, email, password, fullname } = req.body;

      if (!username || !email || !password || !fullname) {
          return res.status(400).json({ error: "All fields are required." });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ error: "Email is already taken." });
      }

      const nameParts = fullname.trim().split(/\s+/);
      const first_name = nameParts[0];
      const last_name = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      const newUser = new User({
          username,
          email,
          password,
          first_name,
          last_name,
      });

      const savedUser = await newUser.save();

      const newUserDetails = new UserDetails({
          user_id: savedUser._id,
      });

      await newUserDetails.save();

      return res.status(201).json({
          message: `${username} is enrolled successfully. Welcome to the party!!`,
      });

  } catch (err) {
      console.error("Signup error:", err);
      return res.status(500).json({ error: "Internal server error" });
  }
};


export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          res.status(400).json({ error: "Email and password are required." });
          return;
      }

      const user = await User.findOne({ email });

      if (!user || !user.authenticate(password)) {
          res.status(400).json({ error: "Invalid email or password." });
          return;
      }

      const jwtToken = sign({ _id: user._id }, process.env.JWT_SECRET ?? "", {
          expiresIn: "7h",
      });

      res.cookie("jwt", jwtToken, {
          expires: new Date(Date.now() + 7 * 60 * 60 * 1000),
          httpOnly: true,
          secure: req.secure || req.headers["x-forwarded-proto"] === "https",
          sameSite: 'none',
          domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
      });

      res.json({ jwtToken, user });
  } catch (error) {
      console.error("Error during signin:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};

