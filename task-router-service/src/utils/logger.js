import { sendToTopic } from "../kafka/producer.js";

export async function logRouterEvent({
  traceId,
  spanId,
  service,
  event,
  status,
  channel,
  messageId
}) {
  const log = {
    traceId,
    spanId,
    service,
    event,
    status,
    channel,
    messageId,
    timestamp: new Date().toISOString()
  };

  await sendToTopic("logs-topic", [
    {
      key: "router-log",
      value: JSON.stringify(log),
    },
  ]);

  console.log("ROUTER LOG:", log);
}
