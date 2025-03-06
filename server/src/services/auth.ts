// import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string,
}

export const authMiddleware = ({ req }: { req: Request }) => {
  const authHeader = req.headers.authorization || "";
  let user = null;

  // Check if token exist
  if (authHeader.starstWith("Bearer")) {
    const token = authHeader.split(" ")[1];  // Get (extract) the token part after 'Bearer'

    try {
      // Decode the token to get user data
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || "") as JwtPayload;
      user = decoded; // Attach the decoded user to context
    } catch (error) {
      console.error("Invalid token or expired token");
    }

    return {user}; // return user data or null (if token is invalid)
  }
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });  // token expires in 1 hour
};
