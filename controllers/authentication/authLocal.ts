import User from "../../models/Users/Users";
import { Response, Request, NextFunction } from "express";
import { sign, verify } from "jsonwebtoken";
import UserStats from "../../models/Users/UserStats";
import moment from "moment-timezone";
import UserProfile from "../../models/Users/UserProfile";

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

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username is already taken." });
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

    const newUserStats = new UserStats({
      user_id: savedUser._id,
    });

    const newUserProfile = new UserProfile({
      user_id: savedUser._id,
      favorite: [],
      social: [],
    });

    await Promise.all([
      newUserStats.save(),
      newUserProfile.save(),
    ]);

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
            expiresIn: "7h",
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

