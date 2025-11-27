** OVERVIEW OF THE  TASK-ROUTER-SERVICE **

  Start Kafka & Zookeeper
/usr/local/kafka/bin/zookeeper-server-start.sh /usr/local/kafka/config/zookeeper.properties
/usr/local/kafka/bin/kafka-server-start.sh /usr/local/kafka/config/server.properties

 1. Receive incoming messages via GraphQL API
 2. Validate user input
 3. Apply routing logic based on channel
 4. Avoid duplicate messages using idempotency
 5. Produce tracing logs for observability
 6. Forward the request to the correct delivery service through Kafka

--> PORT
  The service runs on port 4000


--> Topics 
  1. task-router-topic --> this is used to forward message to delivery-service
  2. logs-topic --> send logs 



--> GraphQL (Task Router API):
  1. This is used for receiving incoming requests because it provides strict validation, structured inputs, and easy testing through Postman or GraphQL.
  2.Chosen for inter-service communication as it is asynchronous, decouples services, supports retries, and allows delivery services to scale independently without blocking the user request.
  3.Ideal for streaming logs, enabling real-time trace + sub-trace tracking. Works perfectly for building an observability pipeline and storing logs for Kibana/Elasticsearch.


--> Packages used 
  1. express --> Server wrapper for Apollo GraphQL
  2. apollo-server-express --> GraphQL API server
  3. kafkajs --> Kafka producer client
  4. uuid --> Generate traceId, spanId, messageId
  5. dotenv	--> Load environment variables
  

--> To start the microservices
    cd task-router-service
    npm install
    npm start
  


### ▶ Startup Output  
Task Router Service running at http://localhost:4000/graphql

