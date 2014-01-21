var CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*(){}?+|/=\\`~\'",<.>-_';

var socket = io.connect('http://' + window.location.host);
socket.on('connect', function() {
    console.log('connected');
    socket.emit('client');
});
var count = 0;
socket.on('chunk', function (info) {
    console.log('performing chunk');
    var prefix = '';
    for (var i = 0; i < info.fixed.length; i++) {
        prefix += CHARACTERS[info.fixed[i]];
    }
    var variable = [];
    for (var i = 0; i < info.variable; i++) {
        variable[i] = 0;
    }
    
    var password = null;
    while (true) {
        var test = prefix;
        for (var i = 0; i < variable.length; i++) {
            test += CHARACTERS[variable[i]];
        }
        if (SHA1(test) === info.hash) {
            password = test;
            break;
        }
        
        // increment the thing
        var done = true;
        for (var i = 0; i < variable.length; i++) {
            variable[i]++;
            if (variable[i] < CHARACTERS.length) {
                done = false;
                break;
            } else {
                variable[i] = 0;
            }
        }
        if (done) break;
    }
    
    socket.emit('response#' + info.seq, password);
    count++;
    $('#status').text('done ' + count + ' chunks');
});