import { Request, Response } from "express";
import { AuthService } from "../../Services/AuthServices/authServices";

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullname } = req.body;

    if (!username || !email || !password || !fullname) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }

    const result = await AuthService.signup(username, email, password, fullname);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Signup error:", err);
    res.status(400).json({ error: err.message || "Internal server error" });
  }
};

export const confirmEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "Invalid token." });
      return
    }

    const result = await AuthService.confirmEmail(token);
    res.status(201).json(result);
  } catch (err: any) {
    console.error("Email confirmation error:", err);
    res.status(400).json({ error: err.message || "Internal server error" });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const timezone = req.headers["x-user-timezone"] as string;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return
    }

    const result = await AuthService.signin(email, password, timezone, req.secure || req.headers["x-forwarded-proto"] === "https");

    res.cookie(result.cookie.name, result.cookie.value, result.cookie.options);
    res.json({ jwtToken: result.jwtToken, user: result.user, userStats: result.userStats });
  } catch (err: any) {
    console.error("Signin error:", err);
    res.status(400).json({ error: err.message || "Internal server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required." });
      return;
    }

    const result = await AuthService.forgotPassword(email);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Forgot password error:", err);
    res.status(400).json({ error: err.message || "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      res.status(400).json({ error: "Token is required." });
      return;
    }

    const result = await AuthService.resetPassword(token,newPassword);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Reset password error:", err);
    res.status(400).json({ error: err.message || "Internal server error" });
  }
};
