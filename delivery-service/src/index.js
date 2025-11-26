import { Kafka } from "kafkajs";
import { v4 as uuid } from "uuid";

const kafka = new Kafka({
  clientId: "delivery-service",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "delivery-group" });
const producer = kafka.producer();

async function simulateSend(channel, data) {
  console.log(
    `Simulating ${channel.toUpperCase()} send to ${data.to}: "${data.body}"`
  );

  // 20% chance of failure to demo retry logic
  const fail = Math.random() < 0.2;
  if (fail) {
    throw new Error("Simulated delivery failure");
  }
}

async function logToKafka(status, channel, messageId, attempts, parentSpanId) {
  await producer.send({
    topic: "logs-topic",
    messages: [
      {
        key: "delivery-log",
        value: JSON.stringify({
          traceId: messageId,       
          spanId: uuid(),            
          parentSpanId,              
          type: "delivery",
          service: "delivery-service",
          status,
          channel,
          messageId,
          attempts,
        }),
      },
    ],
  });
}
async function start() {
  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({ topic: "task-router-topic", fromBeginning: false });

  console.log("Delivery Service is listening to task-router-topic...");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const data = JSON.parse(message.value.toString());
      const { channel, messageId, spanId: parentSpanId } = data;


      console.log(`Received message ${messageId} for channel ${channel}`);

      const maxAttempts = 3;
      let attempts = 0;
      let delivered = false;

      while (attempts < maxAttempts && !delivered) {
        attempts++;
        try {
          await simulateSend(channel, data);
          delivered = true;

          await logToKafka("delivered", channel, messageId, attempts, parentSpanId);

          console.log(
            `Message ${messageId} delivered after ${attempts} attempt(s)`
          );
        } catch (err) {
          console.warn(
            `Attempt ${attempts} failed for ${messageId}: ${err.message}`
          );

          if (attempts >= maxAttempts) {
            await logToKafka("failed", channel, messageId, attempts, parentSpanId);

            console.error(
              `Message ${messageId} permanently failed after ${attempts} attempts`
            );
          } else {
            // Small delay between retries (500ms)
            await new Promise((res) => setTimeout(res, 500));
          }
        }
      }
    },
  });
}

start().catch((err) => {
  console.error("Delivery Service error:", err);
  process.exit(1);
});
