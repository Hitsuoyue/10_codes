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
        body div img {
            width: 100px;
            background-color: #f0f;
        }
        body div #title {
            color: "#ff0";
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div>
        <img src="bg.png" alt="" />
        <span id="title">lalalla</span>
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