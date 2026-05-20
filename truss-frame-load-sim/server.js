const http = require('http');
const fs = require('fs');
const path = require('path');
const detectPort = require('detect-port');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

async function startServer() {
  const defaultPort = 3000;
  const port = await detectPort(defaultPort);
  
  const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
      filePath = './index.html';
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    filePath = path.join(__dirname, 'dist', filePath);
    
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 - 文件未找到</h1>', 'utf-8');
        } else {
          res.writeHead(500);
          res.end('服务器错误: ' + error.code, 'utf-8');
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
  
  server.listen(port, 'localhost', () => {
    console.log(`\n========================================`);
    console.log(`🚀 桁架结构演示服务器已启动`);
    console.log(`📍 地址: http://localhost:${port}`);
    console.log(`========================================\n`);
  });
}

startServer();
