import jwt from "jsonwebtoken";
import { config } from "../../config/env";

export const generateToken = ({
  userId,
  emailId,
  role,
  institution,
}: {
  userId: any;
  emailId: string;
  role: string;
  institution: any;
}) => {
  return jwt.sign({ userId, emailId, role, institution }, config.jwtSecret, {
    expiresIn: config.jwtExpiry,
  } as jwt.SignOptions);
};
