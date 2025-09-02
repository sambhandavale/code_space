import User from "../../Models/Users/Users";
import UserStats from "../../Models/Users/UserStats";
import UserProfile from "../../Models/Users/UserProfile";
import PendingUser from "../../Models/Users/PendingUsers";
import { sendConfirmationEmail } from "../../Utility/Mails/confirmEmail";
import moment from "moment-timezone";
import { sign } from "jsonwebtoken";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendForgotPasswordEmail } from "../../Utility/Mails/forgotPassword";

export class AuthService {
    // Signup → creates pending user & sends email
    static async signup(username: string, email: string, password: string, fullname: string) {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        const existingPending = await PendingUser.findOne({ email });

        if (existingUser || existingPending) {
        throw new Error("Email or username already taken or pending verification.");
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

        return { message: "Please confirm your email to activate your account. Check your inbox." };
    }

    // Confirm email → moves PendingUser → User, UserStats, UserProfile
    static async confirmEmail(token: string) {
        const pending = await PendingUser.findOne({ token });

        if (!pending || pending.expiresAt < new Date()) {
        throw new Error("Token is invalid or expired.");
        }

        const existing = await User.findOne({ email: pending.email });
        if (existing) {
        await PendingUser.deleteOne({ _id: pending._id });
        throw new Error("User already exists.");
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

        await Promise.all([newUserStats.save(), newUserProfile.save()]);
        await PendingUser.deleteOne({ _id: pending._id });

        return { message: "Email confirmed. Account created successfully." };
    }

    // Signin → verify user + password + update streak
    static async signin(email: string, password: string, timezone: string, secure: boolean) {
        if (!moment.tz.zone(timezone)) {
        throw new Error("Invalid or missing timezone.");
        }

        const user = await User.findOne({ email });
        if (!user || !user.authenticate(password)) {
        throw new Error("Invalid email or password.");
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
            // Missed a day → reset streak
            userStats.login_streak = 0;
            }
        } else {
            userStats.login_streak = 1;
            userStats.longest_login_streak = 1;
        }

        if (shouldIncrementStreak) {
            userStats.login_streak = (userStats.login_streak || 0) + 1;

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
            longest_login_streak: 1,
        });
        await userStats.save();
        }

        return {
        jwtToken,
        user,
        userStats,
        cookie: {
            name: "jwt",
            value: jwtToken,
            options: {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure,
            },
        },
        };
    }

    static async forgotPassword(email: string) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("No account found with this email.");
        }

        // Create JWT with embedded expiry (15 minutes)
        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "15m" }
        );

        const resetUrl = `${process.env.REACT_APP_BASE_URL}/reset-password/${resetToken}`;

        await sendForgotPasswordEmail(email, resetUrl);

        return { message: "Password reset link sent. Check your email." };
    }

    static async resetPassword(token: string, newPassword: string) {
        try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

        const user = await User.findById(decoded.id);
        if (!user) {
            throw new Error("User not found.");
        }

        const salt = User.schema.methods.makeSalt();
        const hashed_password = User.schema.methods.encryptPassword.call({ salt }, newPassword);

        user.salt = salt;
        user.hashed_password = hashed_password;
        await user.save();

        return { message: "Password reset successful." };
        } catch (err: any) {
        if (err.name === "TokenExpiredError") {
            throw new Error("Reset link expired.");
        }
        throw new Error("Invalid reset link.");
        }
    }
}
