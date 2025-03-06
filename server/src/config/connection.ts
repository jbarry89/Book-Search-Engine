import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () =>{
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks');
    console.log('MongoDB connected successfully!');
} catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process
  }

};
connectDB();

export default mongoose.connection;
