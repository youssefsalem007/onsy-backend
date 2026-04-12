import { createClient } from "redis"
import { REDIS_URL } from "../../../config/config.service.js";

export const client = createClient({
  url: REDIS_URL
});

export const connectionRedis = async () => {
    await client.connect()
    .then(()=>{
        console.log("connected to redis");
    }).catch((error) => {
        console.log("failed to connectef to redis", error);
    })
}