const http = require('http');

let storedRequest = null;

function calculate(op, x, y) {
    switch (op) {
        case "add": return x + y;
        case "sub": return x - y;
        case "mul": return x * y;
        case "div": return y !== 0 ? x / y : null;
        default: return null;
    }
}

const server = http.createServer((req, res) => {

    if (req.url === '/NGINX-test' && req.method === 'GET')
    {
        if (!storedRequest) {
            res.writeHead(404);
            return res.end("JSON не найден");
        }

        const result = calculate(storedRequest.op, storedRequest.x, storedRequest.y);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({...storedRequest, result}));
    }

    if (req.url === '/NGINX-test' && req.method === 'POST')
    {
        if (storedRequest) {
            res.writeHead(409);
            return res.end("JSON уже существует");
        }

        let body = "";
        req.on("data", chunk => { body += chunk;});

        req.on("end", () => {
            storedRequest = JSON.parse(body);
            const result = calculate(storedRequest.op, storedRequest.x, storedRequest.y);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({...storedRequest, result}));
        });
        return;
    }

    if (req.url === '/NGINX-test' && req.method === 'PUT') 
    {
        if (!storedRequest) {
            res.writeHead(404);
            return res.end("JSON не найден");
        }

        let body = "";
        req.on("data", chunk => body += chunk);

        req.on("end", () => {
            storedRequest = JSON.parse(body);
            const result = calculate(storedRequest.op, storedRequest.x, storedRequest.y);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ...storedRequest, result }));
        });
        return;
    }

    if (req.url === '/NGINX-test' && req.method === 'DELETE') 
    {
        if (!storedRequest) {
            res.writeHead(404);
            return res.end("JSON не найден");
        }

        storedRequest = null;
        res.writeHead(200);
        return res.end("JSON удалён");
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(40000, () => {
    console.log("http://localhost:40000");
});