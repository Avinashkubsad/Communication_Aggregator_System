import { gql } from "apollo-server-express";

const typeDefs = gql`
  type DeliveryResult {
    status: String!
    attempts: Int
  }

  input DeliveryInput {
    channel: String!
    to: String!
    body: String!
  }

  type Query {
    health: String!
  }

  type Mutation {
    testDelivery(input: DeliveryInput!): DeliveryResult!
  }
`;

export default typeDefs;
