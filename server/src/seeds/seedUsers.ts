import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User.js"; // Ensure the path is correct
import userData from "./userData.json" with { type: "json" };

dotenv.config();

const seedUsers = async () => {
  try {
    
    await mongoose.connect(process.env.MONGODB_URI as string);

    console.log("Connected to MongoDB");

    // Clear existing users (optional)
    await User.deleteMany();
    console.log("Existing users deleted");

    // Hash passwords before inserting
    const users = await Promise.all(
      userData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10), // Hash password
      }))
    );
    
    // Insert users
    await User.insertMany(users);
    console.log("Users seeded successfully");
    
    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding users:", error);
    mongoose.connection.close();
  }
};

seedUsers();


