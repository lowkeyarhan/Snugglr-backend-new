import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || "21d";

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Congrats, your auth is broken.");
}

export const generateToken = ({ userId, role }) => {
    return jwt.sign(
        { userId, role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
};