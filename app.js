'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');

const HOST = 'api.line.me'; 
const PORT = process.env.PORT || 3000;
const CH_ACCESS_TOKEN = process.env.TOKEN || 'rOUF+RwMgI16TO9EAOxm4qa2aPhol/REt0LkV9IvUSlWewd+pSFQ3c9Q/1BLk3fXoJsIhxvHiSn9sDiIeKtesjGiPi02vMx8VhIHtIy0PkoLM5kDdampTyc+WyaHi+hTHk6B4TH/LJL3PtcNV9srmAdB04t89/1O/w1cDnyilFU='; //Channel Access Tokenを指定

/**
 * httpリクエスト部分
 */
const client = (messageId) => {    
    let options = {
        host: HOST,
        port: 443,
        path: `/v2/bot/message/${messageId}/content`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': `Bearer ${CH_ACCESS_TOKEN}`,
        }
    };

    return new Promise((resolve, reject) => {
        let req = https.request(options, (res) => {
                    let buffers = [];
                    res.on('data', (chunk) => {
                        buffers.push(chunk);
                    });
                    res.on('end', () => {
                        resolve(Buffer.concat(buffers));
                    });
        });

        req.on('error', (e) => {
            reject(e);
        });
        req.end();
    });
};

http.createServer((req, res) => {    
    if(req.url !== '/' || req.method !== 'POST'){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('hello');
    }

    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });        
    req.on('end', () => {
        if(body === ''){
          console.log('bodyが空です。');
          return;
        }

        let WebhookEventObject = JSON.parse(body).events[0];        
        //メッセージが送られて来た場合
        if(WebhookEventObject.type === 'message' && WebhookEventObject.message.type === 'image'){
            client(WebhookEventObject.message.id)
            .then((body)=>{
                console.log(body);
                fs.writeFile('public/images/img.jpeg', body, 'utf-8', (err) => {
                    if(err) {
                        console.log(err);
                        return;
                    }
                    console.log('成功');
                });
            },(e)=>{console.log(e)});
        }

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('success');
    });

}).listen(PORT);

console.log(`Server running at ${PORT}`);