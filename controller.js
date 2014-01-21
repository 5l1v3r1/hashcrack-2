var events = require('events');
var util = require('util');

function Controller(socket, jobs) {
    this.active = true;
    events.EventEmitter.call(this);
    this.socket = socket;
    this.socket.on('job', function(hash) {
        this.emit('job', hash);
    }.bind(this));
    this.socket.on('cancel', function(hash) {
        this.emit('cancel', hash);
    }.bind(this));
}

util.inherits(Controller, events.EventEmitter);

Controller.prototype.gotPassword = function(hash, password) {
    this.socket.emit('solved', hash, password);
};

Controller.prototype.clientAdded = function() {
    this.socket.emit('add');
}

Controller.prototype.clientRemoved = function() {
    this.socket.emit('remove');
}

module.exports = Controller;

