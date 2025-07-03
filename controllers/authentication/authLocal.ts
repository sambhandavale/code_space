import User from "../../models/Users/Users";
import { Response, Request, NextFunction } from "express";
import { sign, verify } from "jsonwebtoken";
import UserStats from "../../models/Users/UserStats";
import moment from "moment-timezone";
import UserProfile from "../../models/Users/UserProfile";
import PendingUser from "../../models/Users/PendingUsers";
import { sendConfirmationEmail } from "../../utility/mails/confirmEmail";

// export const signup = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { username, email, password, fullname } = req.body;

//     if (!username || !email || !password || !fullname) {
//       return res.status(400).json({ error: "All fields are required." });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: "Email is already taken." });
//     }

//     const existingUsername = await User.findOne({ username });
//     if (existingUsername) {
//       return res.status(400).json({ error: "Username is already taken." });
//     }

//     const nameParts = fullname.trim().split(/\s+/);
//     const first_name = nameParts[0];
//     const last_name = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

//     const newUser = new User({
//       username,
//       email,
//       password,
//       first_name,
//       last_name,
//     });

//     const savedUser = await newUser.save();

//     const newUserStats = new UserStats({
//       user_id: savedUser._id,
//     });

//     const newUserProfile = new UserProfile({
//       user_id: savedUser._id,
//       favorite: [],
//       social: [],
//     });

//     await Promise.all([
//       newUserStats.save(),
//       newUserProfile.save(),
//     ]);

//     return res.status(201).json({
//       message: `${username} is enrolled successfully. Welcome to the party!!`,
//     });

//   } catch (err) {
//     console.error("Signup error:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, email, password, fullname } = req.body;

    if (!username || !email || !password || !fullname) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    const existingPending = await PendingUser.findOne({ email });

    if (existingUser || existingPending) {
      res.status(400).json({ error: "Email or username already taken or pending verification." });
      return;
    }

    const nameParts = fullname.trim().split(/\s+/);
    const first_name = nameParts[0];
    const last_name = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const salt = User.schema.methods.makeSalt();
    const hashed_password = User.schema.methods.encryptPassword.call({ salt }, password);

    const token = crypto.randomUUID();

    const pendingUser = new PendingUser({
      username,
      email,
      hashed_password,
      salt,
      first_name,
      last_name,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    });

    await pendingUser.save();
    await sendConfirmationEmail(email, token);

    res.status(200).json({ message: "Please confirm your email to activate your account. Check your inbox." });
    return;

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};


export const confirmEmail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "Invalid token." });
      return;
    }

    const pending = await PendingUser.findOne({ token });

    if (!pending || pending.expiresAt < new Date()) {
      res.status(400).json({ error: "Token is invalid or expired." });
      return;
    }

    const existing = await User.findOne({ email: pending.email });
    if (existing) {
      await PendingUser.deleteOne({ _id: pending._id });
      res.status(400).json({ error: "User already exists." });
      return;
    }

    const newUser = new User({
      username: pending.username,
      email: pending.email,
      hashed_password: pending.hashed_password,
      salt: pending.salt,
      first_name: pending.first_name,
      last_name: pending.last_name,
    });

    const savedUser = await newUser.save();

    const newUserStats = new UserStats({ user_id: savedUser._id });
    const newUserProfile = new UserProfile({ user_id: savedUser._id, favorite: [], social: [] });

    await Promise.all([
      newUserStats.save(),
      newUserProfile.save(),
    ]);

    await PendingUser.deleteOne({ _id: pending._id });

    res.status(201).json({ message: "Email confirmed. Account created... welcome to the party!!!" });
    return;

  } catch (err) {
    console.error("Email confirmation error:", err);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};


export const signin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const timezone = req.headers['x-user-timezone'] as string;

        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required." });
            return;
        }

        if (!timezone || !moment.tz.zone(timezone)) {
            res.status(400).json({ error: "Invalid or missing timezone." });
            return;
        }

        const user = await User.findOne({ email });

        if (!user || !user.authenticate(password)) {
            res.status(400).json({ error: "Invalid email or password." });
            return;
        }

        const jwtToken = sign({ _id: user._id }, process.env.JWT_SECRET ?? "", {
            expiresIn: "7d",
        });

        let userStats = await UserStats.findOne({ user_id: user._id });
        const now = moment().tz(timezone);
        const todayString = now.format("YYYY-MM-DD");

        if (userStats) {
            const lastLoginDate = userStats.last_login_date;

            let shouldIncrementStreak = false;

            if (lastLoginDate) {
                const lastLoginLocal = moment(lastLoginDate).tz(timezone).format("YYYY-MM-DD");
                const yesterdayLocal = now.clone().subtract(1, "day").format("YYYY-MM-DD");

                if (lastLoginLocal === yesterdayLocal) {
                    shouldIncrementStreak = true;
                } else if (lastLoginLocal === todayString) {
                    shouldIncrementStreak = false;
                } else {
                    // Missed a day, reset streak
                    userStats.login_streak = 0;
                }

            }else {
                userStats.login_streak = 1;
                userStats.longest_login_streak = 1;
            }

            if (shouldIncrementStreak) {
                userStats.login_streak = (userStats.login_streak || 0) + 1;

                // update longest streak only if current streak surpasses it
                if (!userStats.longest_login_streak || userStats.login_streak > userStats.longest_login_streak) {
                    userStats.longest_login_streak = userStats.login_streak;
                }
            } else if (userStats.login_streak === undefined || userStats.login_streak === null) {
                userStats.login_streak = 1;
                userStats.longest_login_streak = 1; 
            }


            userStats.last_login_date = now.toDate();

            await userStats.save();
        } else {
            userStats = new UserStats({
                user_id: user._id,
                last_login_date: now.toDate(),
                login_streak: 1,
                longest_login_streak: 1
            });

            await userStats.save();
        }

        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("jwt", jwtToken, {
            expires: new Date(Date.now() + 7 * 60 * 60 * 1000),
            httpOnly: true,
            secure: req.secure || req.headers["x-forwarded-proto"] === "https",
        });

        res.json({ jwtToken, user, userStats });
    } catch (error) {
        console.error("Error during signin:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

