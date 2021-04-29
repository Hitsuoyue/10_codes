const http = require('http');

const server = http.createServer((req, res) => {
    let body = [];
    req.on('error', err => {
        console.error(err);
    }).on('data', chunk => {
        console.log('body11:', chunk.toString());

        body.push(chunk);
    }).on('end', () => {
        console.log('body22:', body);

        body = Buffer.concat(body).toString();
        console.log('body:', body);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`
<html lang="en">
<head>
    <title>Document</title>
    <style>
        body #parent {
            width: 400px;
            height: 200px;
            display: flex;
            background-color: rgb(0,0,255);
        }
        body #parent #block1 {
            flex: 1;
            background-color: rgb(0,255,255);
            height: 180px;
        }
        body #parent #block2 {
            width: 100px;
            background-color: rgb(0,255,0);
            height: 100px;
        }
        
    </style>
</head>
<body>
    <div id="parent">
        <div id="block1">block 11111</div>
        <div id="block2">block 22222</div>
    </div>
    <script src="./kmp.js"></script>
</body>
</html>`);
//         res.end(`
// <html lang="en">
// <head>
//     <title>Document</title>
//     <style>
//         body div {
//             width: 100px;
//             background-color: #fff;
//         }
//     </style>
// </head>
// <body>
//     <div>
//         <img src="bg.png" alt="">
//         <span>lalalla</span>
//     </div>
//     <script src="./kmp.js"></script>
// </body>
// </html>`);
    });
});

server.listen(8080);
console.log('server started~')