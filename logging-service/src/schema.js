import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type LogEntry {
    traceId: String
    spanId: String
    parentSpanId: String
    service: String
    event: String
    status: String
    channel: String
    messageId: String
    attempts: Int
    timestamp: String
  }

  type Query {
    logs(limit: Int): [LogEntry]
    health: String!
  }
`;
export default typeDefs;
