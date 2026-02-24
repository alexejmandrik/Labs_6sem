const redis = require("redis");

const client = redis.createClient({url: "redis://localhost:12000"});
function main() {
    client.connect();
    client.set("incr", 0);
    const startIncr = process.hrtime.bigint();
    for(let i = 0; i < 10000; i++)
        client.incr("incr");
    const endIncr = process.hrtime.bigint();
    console.log("TimeSet " + Number(endIncr - startIncr)/1e6);

    const startDecr = process.hrtime.bigint();
    for(let i = 0; i < 10000; i++)
        client.decr("incr");
    const endDecr = process.hrtime.bigint();
    console.log("TimeGet " + Number(endDecr - startDecr)/1e6);
    client.quit();
}
main();