import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./schema.js";
import resolvers from "./resolvers.js";
import { consumer } from "./kafka.js";
import fs from "fs";
import path from "path";

// Correct log directory inside logging-service
const LOG_DIR = path.join(process.cwd(), "elasticsearch-data");
const LOG_FILE = path.join(LOG_DIR, "service-logs.jsonl");

// Ensure folder exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const PORT = process.env.PORT || 5003;

// In-memory log store
const logsStore = [];

async function start() {
  await consumer.connect();
  await consumer.subscribe({ topic: "logs-topic", fromBeginning: false });

  consumer.run({
    eachMessage: async ({ message }) => {
      const log = JSON.parse(message.value.toString());
      console.log("LOG RECEIVED:", log);

      // Save to memory for GraphQL
      logsStore.push(log);

      // Save to elasticsearch-data/service-logs.jsonl
      fs.appendFileSync(LOG_FILE, JSON.stringify(log) + "\n");

      console.log("LOG SAVED →", LOG_FILE);
    }
  });

  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ logsStore })
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  app.listen(PORT, () => {
    console.log(`📘 Logging GraphQL running at http://localhost:${PORT}/graphql`);
  });
}

start();
