import fs from 'fs';
import https from 'https';
import express from 'express';  // если ты используешь Express

const app = express();

const httpsOptions = {
    key: fs.readFileSync('./localhost-key.pem'),
    cert: fs.readFileSync('./localhost.pem')
};

https.createServer(httpsOptions, app).listen(8888, () => {
    console.log('Server is running on https://localhost:8888');
});
