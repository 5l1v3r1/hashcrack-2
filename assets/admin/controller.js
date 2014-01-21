var socket = io.connect('http://' + window.location.host);
socket.on('solved', function(hash, password) {
    alert('sha1("' + password + '") = "' + hash + '"');
    console.log('sha1("' + password + '") = "' + hash + '"');
});

var socketCount = 0;
socket.on('count', function(count) {
    socketCount = count;
    $('#status').text(socketCount + ' connected clients');
}).on('remove', function() {
    socketCount--;
    $('#status').text(socketCount + ' connected clients');
}).on('add', function () {
    socketCount++;
    $('#status').text(socketCount + ' connected clients');
});

socket.on('disconnect', function() {
    alert('disconnected from server!');
});

function authenticate() {
    socket.emit('controller', $('#password').val());
}

function runHash() {
    var hash = $('#hash').val();
    socket.emit('job', hash);
}

function cancelHash() {
    var hash = $('#hash').val();
    socket.emit('cancel', hash);
}
