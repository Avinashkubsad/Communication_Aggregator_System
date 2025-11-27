export async function simulateSend(channel, data) {
  console.log(
    `Simulating ${channel.toUpperCase()} send to ${data.to}: "${data.body}"`
  );

  const fail = Math.random() < 0.2;

  if (fail) {
    throw new Error("Simulated delivery failure");
  }
}
