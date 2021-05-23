const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    var url = req.url; 
    // var documentRoot = '/Users/yuesuo/Desktop/study/10期/homework/week_05'
    var documentRoot = 'C:\\Users\\sylvia\\Desktop\\10_codes\\week_05'
    var file = documentRoot + url;
    console.log('url', url);
    const type = url.split('.')[url.split('.').length - 1];
    fs.readFile( file , function(err,data){
        console.log('err', err, data)
        if(err){
            res.writeHeader(404,{
                'content-type' : 'text/html;charset="utf-8"'
            });
            res.write('<h1>404错误</h1><p>你要找的页面不存在</p>');
            res.end();
        }else{
            //HTTP 状态码 200 ： OK  
            if(type === 'js') {
                res.writeHeader(200,{
                    'content-type' : 'text/javascript'
                });
            } else {
                res.writeHeader(200,{
                    'content-type' : 'text/html;charset="utf-8"'
                });
            }
            
            res.write(data);//将index.html显示在客户端
            res.end();
 
        }
 
    });
});

server.listen(8080);
console.log('server started~')