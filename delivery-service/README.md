** OVERVIEW OF THE  DELIVERY-SERVICE-SERVICE **

  1. Listens to Kafka task-router-topic for incoming messages.
  2. Simulates sending messages via:
            --> Email
            --> SMS
            --> WhatsApp
  3. Implements retry logic (max 3 attempts)
  4. Sends structured logs to logs-topic for observability
  5. Generates trace + sub-trace (spanId, parentSpanId) for end-to-end tracking
  6. Provides GraphQL test endpoint for manual testing without Kafka

--> PORT
  The service runs on port 5002


--> Topics— consumed
  1. task-router-topic --> this is used to forward message to delivery-service
  2. logs-topic --> send logs 


--> Packages used 
  1. express --> Server wrapper for Apollo GraphQL
  2. apollo-server-express --> GraphQL API server
  3. kafkajs --> Kafka producer client
  4. uuid --> Generate traceId, spanId, messageId
  5. dotenv	--> Load environment variables
  

--> To start the microservices
    cd delivery-service
    npm install
    npm start  

### ▶ Startup Output
🚀 Delivery GraphQL running at http://localhost:5002/graphql
🚀 Kafka Delivery Consumer Running…