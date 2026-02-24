const redis = require("redis");

const client = redis.createClient({url: "redis://localhost:12000"});
function main() {
    client.connect();
    const startSet = process.hrtime.bigint();
    for(let i = 0; i < 10000; i++)
        client.set(i.toString(), "set"+i);
    const endSet = process.hrtime.bigint();
    console.log("TimeSet " + Number(endSet - startSet)/1e6);

    const startGet = process.hrtime.bigint();
    for(let i = 0; i < 10000; i++)
        client.get(i.toString());
    const endGet = process.hrtime.bigint();
    console.log("TimeGet " + Number(endGet - startGet)/1e6);

    const startDel = process.hrtime.bigint();
    for(let i = 0; i < 10000; i++)
        client.del(i.toString());
    const endDel = process.hrtime.bigint();
    console.log("TimeDel " + Number(endDel - startDel)/1e6);
    client.quit();
}
main();