import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "logging-service",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

export const consumer = kafka.consumer({ groupId: "logging-group" });
