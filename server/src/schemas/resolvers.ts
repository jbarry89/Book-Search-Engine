import { AuthenticationError } from 'apollo-server-express';
import User from '../models/User';
import { signToken } from '../services/auth';

export const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      if (context.user) {
        return User.findById(context.user._id);
      }
      throw new AuthenticationError('Not logged in');
    },
  },
  Mutation: {
    login: async (_parent: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });

      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },
    addUser: async (
      _parent: any,
      { username, email, password }: { username: string; email: string; password: string }
    ) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (
      _parent: any,
      { bookId, title, authors, description, image, link }: any,
      context: any
    ) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      return User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: { bookId, title, authors, description, image, link } } },
        { new: true }
      );
    },
    removeBook: async (_parent: any, { bookId }: { bookId: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      return User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
    },
  },
};
