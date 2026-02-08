import User from "../user/models/User";
import AllowedCollege from "../admin/models/AllowedCollege";
import bcrypt from "bcrypt";
import { generateToken } from "../../core/utils/jwt";
import { generateUniqueAnonymousUsername } from "../../core/utils/usernameGenerator";
import { AppError } from "../../core/errors/AppError";

export class AuthService {
  async registerUser(email: string, password: string) {
    if (!email || !password) {
      throw new AppError("Please provide email and password", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingEmail = await User.exists({ email: normalizedEmail });
    if (existingEmail) {
      throw new AppError("Email already in use", 409);
    }

    const domain = normalizedEmail.split("@")[1];
    const allowedCollege = await AllowedCollege.findOne({ domain });

    if (!allowedCollege || !allowedCollege.isActive) {
      throw new AppError("Email domain not authorized", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const username = await generateUniqueAnonymousUsername(User);

    const newUser = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      collegeName: allowedCollege.institutionName,
      institution: allowedCollege._id,
    });

    const token = generateToken({
      userId: newUser._id,
      emailId: normalizedEmail,
      role: "user",
      institution: allowedCollege._id,
    });

    return {
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: normalizedEmail,
        collegeName: allowedCollege.institutionName,
        institution: allowedCollege._id,
        role: "user",
      },
      token,
    };
  }

  async loginUser(email?: string, phoneNumber?: string, password?: string) {
    if ((!email && !phoneNumber) || !password) {
      throw new AppError(
        "Please provide email or phone number and password",
        400,
      );
    }

    const orConditions: any[] = [];
    if (email?.trim()) orConditions.push({ email: email.toLowerCase().trim() });
    if (phoneNumber?.trim())
      orConditions.push({ phoneNumber: phoneNumber.trim() });

    if (orConditions.length === 0) {
      throw new AppError("Invalid login credentials", 400);
    }

    const user = await User.findOne({
      $or: orConditions,
      isActive: true,
    }).select("+password");

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = generateToken({
      userId: user._id,
      emailId: user.email,
      role: user.role,
      institution: user.institution,
    });

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        collegeName: user.collegeName,
        institution: user.institution,
        role: user.role,
      },
      token,
    };
  }
}
