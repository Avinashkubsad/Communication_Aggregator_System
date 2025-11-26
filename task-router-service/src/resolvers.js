import { v4 as uuid } from "uuid";
import { sendToTopic } from "./kafka/producer.js";
import { isDuplicateBody } from "./utils/idempotency.js";
import { logRouterEvent } from "./utils/logger.js";

const VALID = ["email", "sms", "whatsapp"];

export default {
  Query: {
    health: () => "OK",
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
          status: "duplicate_message",
        };
      }

      const messageId = uuid();
      const spanId = uuid();

      await sendToTopic("task-router-topic", [
        {
          key: channel,
          value: JSON.stringify({ messageId, spanId, channel, to, body }),
        },
      ]);

      await logRouterEvent({
        traceId: messageId,
        spanId,
        service: "task-router",
        event: "router_queued",
        status: "queued",
        channel,
        messageId,
      });

      return { messageId, status: "queued" };
    },
  },
};
