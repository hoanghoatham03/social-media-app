import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});


//check if redis is connected
redisClient.on("connect", () => {
  console.log("Redis connected");
});

//check if redis is error
redisClient.on("error", (err) => {
  console.log("Redis error", err);
});

export default redisClient;
