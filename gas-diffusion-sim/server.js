const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function findAvailablePort(startPort, maxPort, callback) {
    let port = startPort;
    
    function tryNextPort() {
        const server = net.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                port++;
                if (port <= maxPort) {
                    tryNextPort();
                } else {
                    callback(new Error(`No available ports between ${startPort} and ${maxPort}`));
                }
            } else {
                callback(err);
            }
        });
        server.once('listening', () => {
            server.close();
            callback(null, port);
        });
        server.listen(port, '127.0.0.1');
    }
    
    tryNextPort();
}

function createServer() {
    return http.createServer((req, res) => {
        let filePath = '.' + req.url;
        if (filePath === './') {
            filePath = './index.html';
        }

        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = MIME_TYPES[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 - File Not Found</h1>', 'utf-8');
                } else {
                    res.writeHead(500);
                    res.end('Server Error: ' + error.code, 'utf-8');
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });
}

const START_PORT = 8080;
const MAX_PORT = 8180;

console.log('🔍 正在查找可用端口...');

findAvailablePort(START_PORT, MAX_PORT, (err, port) => {
    if (err) {
        console.error('❌ 无法找到可用端口:', err.message);
        process.exit(1);
    }
    
    const server = createServer();
    
    server.listen(port, '127.0.0.1', () => {
        console.log('\n🚀 气体扩散模拟系统已启动!');
        console.log(`📡 服务器地址: http://127.0.0.1:${port}`);
        console.log(`📡 本地访问: http://localhost:${port}`);
        console.log('\n💡 按 Ctrl+C 停止服务器\n');
    });
    
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error('❌ 端口被占用, 正在尝试其他端口...');
        }
    });
});
