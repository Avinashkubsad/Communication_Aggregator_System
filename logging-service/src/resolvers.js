export default {
  Query: {
    health: () => "Logging OK",
    logs: (_, { limit }, { logsStore }) => {
      // Return latest logs
      return logsStore.slice(-limit).reverse();
    }
  }
};
