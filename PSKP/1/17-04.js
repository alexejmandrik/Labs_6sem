const redis = require("redis");

const client = redis.createClient({url: "redis://localhost:12000"});
function main() {
    client.connect();
    client.set("incr", 0);
    const startSet = process.hrtime.bigint();
    for(let i = 0; i < 10000; i++)
        client.hSet(i.toString(), {id: i.toString(), val: "val-${i}"});
    const endSet = process.hrtime.bigint();
    console.log("TimeSet " + Number(endSet - startSet)/1e6);

    const startGet = process.hrtime.bigint();
    for(let i = 0; i < 10000; i++)
        client.hGet(i.toString(), "val");
    const endGet = process.hrtime.bigint();
    console.log("TimeGet " + Number(endGet - startGet)/1e6);
    client.quit();
}
main();