import { gql } from "apollo-server-express";

export default gql`
  type MessageResponse {
    messageId: String!
    status: String!
  }

  input MessageInput {
    channel: String!
    to: String!
    body: String!
  }

  type Query {
    health: String
  }

  type Mutation {
    sendMessage(input: MessageInput!): MessageResponse!
  }
`;
