import User from "../user/models/User";
import AllowedCollege from "../admin/models/AllowedCollege";
import bcrypt from "bcrypt";
import { generateToken } from "../../core/utils/jwt";
import { generateUniqueAnonymousUsername } from "../../core/utils/usernameGenerator";
import { AppError } from "../../core/errors/AppError";

export class AuthService {
  // Register a new user
  async registerUser(email: string, password: string) {
    if (!email || !password) {
      throw new AppError("Please provide email and password", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingEmail = await User.exists({ email: normalizedEmail });
    if (existingEmail) {
      throw new AppError("Email already in use", 409);
    }

    // Check if email domain is authorized
    const domain = normalizedEmail.split("@")[1];
    const allowedCollege = await AllowedCollege.findOne({ domain });

    if (!allowedCollege || !allowedCollege.isActive) {
      throw new AppError("Email domain not authorized", 400);
    }

    // Generate unique username
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const username = await generateUniqueAnonymousUsername(User);

    // Create new user
    const newUser = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      collegeName: allowedCollege.institutionName,
      institution: allowedCollege._id,
    });

    // Generate token
    const token = generateToken({
      userId: newUser._id,
      emailId: normalizedEmail,
      role: "user",
      institution: allowedCollege._id,
    });

    // Return user and token
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

  // Login a user
  async loginUser(email?: string, phoneNumber?: string, password?: string) {
    if ((!email && !phoneNumber) || !password) {
      throw new AppError(
        "Please provide email or phone number and password",
        400,
      );
    }

    // Check if email or phone number is provided
    const orConditions: any[] = [];
    if (email?.trim()) orConditions.push({ email: email.toLowerCase().trim() });
    if (phoneNumber?.trim())
      orConditions.push({ phoneNumber: phoneNumber.trim() });

    // Check if email or phone number is valid
    if (orConditions.length === 0) {
      throw new AppError("Invalid login credentials", 400);
    }

    // Find user by email or phone number
    const user = await User.findOne({
      $or: orConditions,
      isActive: true,
    }).select("+password");

    // Check if user exists
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    // Generate token
    const token = generateToken({
      userId: user._id,
      emailId: user.email,
      role: user.role,
      institution: user.institution,
    });

    // Return user and token
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
