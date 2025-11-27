import express from "express";
import { ApolloServer } from "apollo-server-express";
import dotenv from "dotenv";
import typeDefs from "./schema.js";
import resolvers from "./resolvers.js";
import { startKafkaConsumer } from "./kafka.js";

dotenv.config();

const PORT = process.env.PORT || 5002;

async function start() {
  // Start Kafka consumer
  startKafkaConsumer();

  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers ,
     introspection: true,   // 👈 ADD THIS LINE
    playground: true       
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  app.listen(PORT, () => {
    console.log(`🚀 Delivery GraphQL running at http://localhost:${PORT}/graphql`);
  });
}

start();
