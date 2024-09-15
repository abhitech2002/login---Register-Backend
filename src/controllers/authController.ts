import { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../services/emailService";
import { error } from "console";

// signup controller
export const signup = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, reEnterPassword, contact } =
    req.body;

  if (password !== reEnterPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      reEnterPassword,
      contact,
      otp,
      isVerified: false,
    });
    await user.save();

    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "User Created. Please verify your OTP.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Error creating user" });
  }
};

// OTP Verification controller
export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = "";
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "", {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Error verifying OTP" });
  }
};

// Login Controller
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({
        error: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Account not verified. Please verify your OTP.",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "", {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
};
