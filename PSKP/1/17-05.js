const redis = require("redis");

const subscriber = redis.createClient({url:"redis://localhost:12000"});
const publisher = redis.createClient({url:"redis://localhost:12000"});

function main()
{
    subscriber.connect();
    publisher.connect();
    subscriber.subscribe("news", (message) => {
        console.log("Получено сообщение", message);
    });
    console.log("Подписка выполнена");

    let count = 1;

    const interval = setInterval(async () => {
        publisher.publish("news", "message"+count);
        console.log("Отправлено:", "message"+count);

        count++;

        if (count > 5) {
            clearInterval(interval);
            setTimeout(async () => {
                subscriber.quit();
                publisher.quit();
            }, 1000);
        }
    }, 1000);
}
main();