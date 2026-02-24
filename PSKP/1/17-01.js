const redis = require("redis");

const client = redis.createClient({url: "redis://localhost:12000"});
async function main() {
    await client.connect();
    let pong =  await client.ping();
    console.log(pong);
    client.quit();
}
main();