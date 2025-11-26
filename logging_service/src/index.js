import { Kafka } from "kafkajs";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";

dotenv.config();

// Simulated Elasticsearch directory
const ES_DIR = "./elasticsearch-data";
if (!fs.existsSync(ES_DIR)) fs.mkdirSync(ES_DIR);

const kafka = new Kafka({
  clientId: "logging-service",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "logging-group" });

function saveToElasticsearch(index, doc) {
  const file = path.join(ES_DIR, `${index}.jsonl`);
  fs.appendFileSync(file, JSON.stringify(doc) + "\n");
}

async function start() {
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.LOGS_TOPIC || "logs-topic" });

  console.log("Logging service running and listening to logs-topic…");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const incoming = JSON.parse(message.value.toString());

      // Build trace + subtrace structure
      const logDoc = {
        traceId: incoming.traceId || uuid(),         // main trace id
        spanId: uuid(),                              // event id
        parentSpanId: incoming.spanId || null,       // link to previous service
        service: incoming.service || "unknown",      // from task-router / delivery-service
        event: incoming.type,                        // event type
        status: incoming.status,
        channel: incoming.channel,
        messageId: incoming.messageId,
        attempts: incoming.attempts || null,
        timestamp: new Date().toISOString(),
      };

      console.log("LOG INDEXED →", logDoc);

      // Save to simulated Elasticsearch index
      saveToElasticsearch("service-logs", logDoc);
    },
  });
}

start().catch((err) => console.error("Logging Service error:", err));
