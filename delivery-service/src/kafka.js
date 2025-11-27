import { Kafka } from "kafkajs";
import { v4 as uuid } from "uuid";
import { simulateSend } from "./simulate.js";

const kafka = new Kafka({
  clientId: "delivery-service",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

export const consumer = kafka.consumer({ groupId: "delivery-group" });
export const producer = kafka.producer();

export async function startKafkaConsumer() {
  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({ topic: "task-router-topic", fromBeginning: false });

  console.log("🚀 Kafka Delivery Consumer Running…");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      const { channel, messageId, spanId: parentSpanId } = data;

      console.log(`📩 Received message ${messageId} for ${channel}`);

      const maxAttempts = 3;
      let attempts = 0;
      let delivered = false;

      while (attempts < maxAttempts && !delivered) {
        attempts++;
        try {
          await simulateSend(channel, data);

          delivered = true;

          // Log to logs-topic
          await producer.send({
            topic: "logs-topic",
            messages: [
              {
                value: JSON.stringify({
                  traceId: messageId,
                  spanId: uuid(),
                  parentSpanId,
                  service: "delivery-service",
                  event: "delivery",
                  status: "delivered",
                  channel,
                  messageId,
                  attempts,
                }),
              },
            ],
          });

          console.log(`✅ Delivered in ${attempts} attempt(s)`);
        } catch (err) {
          console.warn(`❌ Attempt ${attempts} failed`);

          if (attempts >= maxAttempts) {
            await producer.send({
              topic: "logs-topic",
              messages: [
                {
                  value: JSON.stringify({
                    traceId: messageId,
                    spanId: uuid(),
                    parentSpanId,
                    service: "delivery-service",
                    event: "delivery",
                    status: "failed",
                    channel,
                    messageId,
                    attempts,
                  }),
                },
              ],
            });

            console.error(`💀 Permanently failed after ${attempts} attempts`);
          } else {
            await new Promise((r) => setTimeout(r, 500));
          }
        }
      }
    },
  });
}
