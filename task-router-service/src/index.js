import express from "express";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./schema.js";
import resolvers from "./resolvers.js";
import { initProducer } from "./kafka/producer.js";



const PORT = process.env.PORT || 4000;

async function start() {
  await initProducer();

  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  app.listen(PORT, () => {
    console.log(`Task Router Service running at http://localhost:${PORT}/graphql`);
  });
}

start();
