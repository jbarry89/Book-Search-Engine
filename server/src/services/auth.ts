import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string,
}

const secretKey = process.env.JWT_SECRET_KEY || '';

export const authMiddleware = ({ req }: { req: Request }) => {
  const authHeader = req.headers.authorization || "";
  let user = null;

  // Check if token exist
  if (authHeader.startsWith("Bearer")) {
    const token = authHeader.split(" ")[1];  // Get (extract) the token part after 'Bearer'

    try {
      // Decode the token to get user data
      const decoded = jwt.verify(token, secretKey) as JwtPayload;
      user = decoded; // Attach the decoded user to context
    } catch (error) {
      console.error("Invalid token or expired token");
    }

    return {user}; // return user data or null (if token is invalid)
  }
  return {user}; // Would return null if token does not exist
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });  // token expires in 1 hour
};

// Middleware function to authenticate the token
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader){
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1]; // Token is expected to be in the format 'Bearer token'

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    req.user = decoded; // Attach decoded user to the request object
    next(); // Proceed to the next middleware/route
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  return;
};


