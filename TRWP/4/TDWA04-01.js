const http = require('http');

const nick = process.argv[2];   
const port = process.argv[3];   

if (!nick || !port) {
    console.log("Usage: node server.js <Nick> <Port>");
    process.exit(1);
}

const server = http.createServer((req, res) => {
    if (req.url === '/A') {
        const response = {
            Nick: nick,
            Method: req.method
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(port, () => {
    console.log(`Server ${nick} running on port ${port}`);
});