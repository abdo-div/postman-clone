import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "./user.model.js";
import { env } from "../../config/env.config.js";
import { ConflictError, UnauthorizedError } from "../../errors/app-error.js";

const signToken = (user: { _id: unknown; email: string }) =>
  jwt.sign({ userId: user._id, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new ConflictError("Email is already registered", "EMAIL_ALREADY_REGISTERED");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ name, email, passwordHash });

    res.status(201).json({
      success: true,
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");
    }

    res.status(200).json({
      success: true,
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError("Authentication required", "UNAUTHORIZED");
    }

    const user = await UserModel.findById(req.user.id).select("-passwordHash");
    if (!user) {
      res.status(200).json({
        success: true,
        user: { id: req.user.id, name: req.user.email?.split("@")[0] || "User", email: req.user.email },
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};