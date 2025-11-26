import { v4 as uuid } from "uuid";
import { sendToTopic } from "./kafka/producer.js";
import { isDuplicateBody } from "./utils/idempotency.js";

const VALID = ["email", "sms", "whatsapp"];

export default {
  Query: {
    health: () => "OK"
  },

  Mutation: {
    async sendMessage(_, { input }) {
      const { channel, to, body } = input;

      if (!VALID.includes(channel)) {
        throw new Error("Invalid channel. Use email | sms | whatsapp");
      }


    // Duplicate body check
    if (isDuplicateBody(body)) {
      return {
        messageId: "duplicate",
        status: "duplicate_message"
      };
    }


      const messageId = uuid();

      await sendToTopic("task-router-topic", [
        { key: channel, value: JSON.stringify({ messageId, ...input }) }
      ]);

      return { messageId, status: "queued" };
    }
  }
};
