import { simulateSend } from "./simulate.js";

export default {
  Query: {
    health: () => "Delivery OK",
  },

  Mutation: {
    async testDelivery(_, { input }) {
      const { channel, to, body } = input;

      let attempts = 0;
      let delivered = false;

      while (attempts < 3 && !delivered) {
        attempts++;

        try {
          await simulateSend(channel, { to, body });
          delivered = true;
        } catch (err) {
          if (attempts >= 3) {
            return { status: "failed", attempts };
          }
        }
      }

      return { status: "delivered", attempts };
    },
  },
};
