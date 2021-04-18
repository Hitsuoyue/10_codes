const http = require('http');

const server = http.createServer((req, res) => {
    let body = [];
    req.on('error', err => {
        console.error(err);
    }).on('data', chunk => {
        console.log('body11:', chunk.toString());

        body.push(chunk.toString());
    }).on('end', () => {
        console.log('body22:', body);

        body = Buffer.concat([Buffer.from(body)]).toString();
        console.log('body:', body);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('Hello World\n');
    });
});

server.listen(8080);
console.log('server started~')