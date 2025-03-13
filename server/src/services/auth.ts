import type { Request} from 'express';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
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
      user = jwt.verify(token, secretKey) as JwtPayload;
    } catch (error) {
      console.error("Invalid token or expired token");
    }

  }
  return {user}; // Would return null if token does not exist
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  // const secretKey: any = process.env.JWT_SECRET_KEY; // Get the secret key from environment variables
  return jwt.sign({data: payload}, secretKey, { expiresIn: '1h' });  // token expires in 1 hour
};


export const authenticateToken = ({ req }: any) => {
  // Allows token to be sent via req.body, req.query, or headers
  let token = req.body.token || req.query.token || req.headers.authorization;

  // If the token is sent in the authorization header, extract the token from the header
  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }

  // If no token is provided, return the request object as is
  if (!token) {
    return req;
  }

  // Try to verify the token
  try {
    const { data }: any = jwt.verify(token, process.env.JWT_SECRET_KEY || '', { maxAge: '2hr' });
    // If the token is valid, attach the user data to the request object
    req.user = data;
  } catch (err) {
    // If the token is invalid, log an error message
    console.log('Invalid token');
  }

  // Return the request object
  return req;
};

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, undefined, undefined, undefined, ['UNAUTHENTICATED']);
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
};

