util = require('util');
events = require('events');
var Client = require('./client');
var Controller = require('./controller');
var Job = require('./job');

function Pool() {
    events.EventEmitter.call(this);
    this.clients = [];
    this.controllers = [];
    this.jobs = [];
    this.clientId = 0;
    this.clientPool = [];
}

util.inherits(Pool, events.EventEmitter);

Pool.prototype.pushClient = function(socket) {
    for (var i = 0; i < this.clients.length; i++) {
        if (this.clients[i].socket === socket) {
            console.log('attempt to re-add socket');
            return;
        }
    }
    
    var client = new Client(socket, this.clientId++);
    this.clients.push(client);
    for (var i = 0; i < this.controllers.length; i++) {
        this.controllers[i].clientAdded(client);
    }
    
    socket.on('disconnect', function() {
        var index = this.clients.indexOf(client);
        if (index >= 0) this.clients.splice(index, 1);
        for (var i = 0; i < this.controllers.length; i++) {
            this.controllers[i].clientRemoved(client);
        }
    }.bind(this));
    
    // make it take part in our running jobs
    for (var i = 0; i < this.jobs.length; i++) {
        var job = this.jobs[i];
        var chunk = job.nextChunk();
        var callback = this.sendNext.bind(this, client, chunk, job);
        client.runChunk(job.hash, chunk, callback);
    }
};

Pool.prototype.pushController = function(socket) {
    for (var i = 0; i < this.controllers.length; i++) {
        if (this.controllers[i].socket === socket) {
            console.log('attempt to re-add socket');
            return;
        }
    }
    
    var controller = new Controller(socket);
    this.controllers.push(controller);
    socket.on('disconnect', function() {
        controller.active = false;
        var index = this.controllers.indexOf(controller);
        if (index >= 0) this.controllers.splice(index, 1);
        
        // remove all associated jobs
        for (var i = 0; i < this.jobs.length; i++) {
            if (this.jobs[i].controller === controller) {
                this.jobs[i].cancelled = true;
                this.jobs.splice(i, 1);
                i--;
            }
        }
    }.bind(this));
    
    socket.emit('count', this.clients.length);
    
    // allow creation of jobs
    controller.on('job', function(hash) {
        var job = new Job(hash, controller);
        this.jobs.push(job);
        this.beginJob(job);
    }.bind(this));
    
    // and cancellation of jobs
    controller.on('cancel', function(hash) {
        for (var i = 0; i < this.jobs.length; i++) {
            var job = this.jobs[i];
            if (job.controller === controller) {
                if (job.hash === hash) {
                    job.cancelled = true;
                    this.jobs.splice(i, 1);
                    i--;
                }
            }
        }
    }.bind(this));
};

Pool.prototype.beginJob = function(job) {
    for (var i = 0; i < this.clients.length; i++) {
        var client = this.clients[i];
        var chunk = job.nextChunk();
        var callback = this.sendNext.bind(this, client, chunk, job);
        client.runChunk(job.hash, chunk, callback);
    }
};

Pool.prototype.sendNext = function(client, chunk, job, flag, password) {
    if (job.cancelled) return;
    if (flag) {
        if (password === null) {
            var nextChunk = job.nextChunk();
            var callback = this.sendNext.bind(this, client, nextChunk, job);
            client.runChunk(job.hash, nextChunk, callback);
        } else {
            var index = this.jobs.indexOf(job);
            if (index >= 0) this.jobs.splice(index, 1);
            job.cancelled = true;
            job.controller.gotPassword(job.hash, password);
        }
    } else {
        console.log('client presumed dead!');
        job.pushPending(chunk);
    }
}

module.exports = Pool;
