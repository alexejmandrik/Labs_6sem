const http = require('http');

const nick = process.argv[2];
const port = process.argv[3];
const delay = parseInt(process.argv[4]);

if (!nick || !port || !delay) {
    console.log("Usage: node server.js <Nick> <Port> <Delay>");
    process.exit(1);
}

function getDelay(method) {
    switch (method) {
        case 'GET': return delay / 3;
        case 'POST': return 2 * delay / 3;
        case 'PUT': return delay;
        case 'DELETE': return delay / 4;
        default: return 0;
    }
}

const server = http.createServer((req, res) => {
    if (req.url === '/A') {
        const d = getDelay(req.method);

        setTimeout(() => {
            const response = {
                Nick: nick,
                Method: req.method,
                Delay: d
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        }, d);

        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(port, () => {
    console.log(`Server ${nick} running on port ${port} with delay ${delay}`);
});


// RoundRobin
// CookieStickySessions
// CustomBalancer


// $methods = @("GET", "POST", "PUT", "DELETE")

// foreach ($method in $methods) {
//     for ($i = 0; $i -lt 10; $i++) {
//         $response = Invoke-RestMethod -Uri "http://localhost:5185/lb" -Method $method
//         "$method -> $($response.Nick)" | Out-File -Append results.txt
//     }
// }


// Get-Content results.txt | Group-Object | Sort-Object Count -Descending

// Get-Content results.txt |
// ForEach-Object {
//     ($_ -split '->')[1].Trim()
// } |
// Group-Object |
// Sort-Object Count -Descending |
// ForEach-Object {
//     "$($_.Name) = $($_.Count)"
// }



// $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

// $methods = @("GET", "POST", "PUT", "DELETE")

// foreach ($method in $methods) {
//     for ($i = 0; $i -lt 5; $i++) {
//         $response = Invoke-RestMethod `
//             -Uri "http://localhost:5185/lb" `
//             -Method $method `
//             -WebSession $session

//         "$method -> $($response.Nick)" | Out-File -Append results.txt
//     }
// }