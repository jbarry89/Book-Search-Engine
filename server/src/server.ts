import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import path from "node:path";
import dotenv from "dotenv";
import db from "./config/connection.js";
import { typeDefs } from "./schemas/typeDefs.js";
import { resolvers } from "./schemas/resolvers.js"
import { authMiddleware } from "./services/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const { user } = authMiddleware({ req }); // Use authMiddleware to get the user
    return { user }; // Make user available in all resolvers
  },
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

const startServer = async () => {
  await server.start();
  app.use("/graphql", expressMiddleware(server));

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(`🌍 GraphQL server now listening on localhost:${PORT}/graphql`);
    });
  });
};

startServer();
