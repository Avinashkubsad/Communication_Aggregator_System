import { Kafka } from "kafkajs";

const kafka = new Kafka({
clientId: "task-router",
  brokers: ["localhost:9092"],
});

let producer;

export async function initProducer() {
  producer = kafka.producer();
  await producer.connect();
  console.log("Kafka producer connected");
}

export async function sendToTopic(topic, messages) {
  await producer.send({
     topic, messages });
}
