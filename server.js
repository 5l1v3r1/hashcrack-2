if (process.argv.length !== 4) {
    console.log('Usage: node server.js <port> <password>');
    process.exit(1);
}

var http = require('http');
var express = require('express');
var Pool = require('./pool');

var pool = new Pool();
var app = express();
app.use(express.static(__dirname + '/assets'));
var server = http.createServer(app);
server.listen(parseInt(process.argv[2]));
server.on('listening', function() {
    console.log('Listening on port ' + process.argv[2]);
});

var io = require('socket.io').listen(server, {log: false});
io.sockets.on('connection', function(socket) {
    socket.on('controller', function(information) {
        if (information !== process.argv[3]) return socket.disconnect();
        pool.pushController(socket);
    });
    socket.on('client', function() {
        pool.pushClient(socket);
    });
});
