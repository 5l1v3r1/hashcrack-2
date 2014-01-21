var Chunk = require('./chunk');

CHUNK_SIZE = 3

function Job(hash, controller) {
    this.cancelled = false;
    this.hash = hash;
    this.controller = controller;
    this.length = 0;
    this.currentStep = [];
    this.pending = [];
}

Job.CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*(){}?+|/=\\`~\'",<.>-_';

Job.prototype.pushPending = function(chunk) {
    this.pending.push(chunk);
}

Job.prototype.nextChunk = function() {
    if (this.pending.length > 0) return this.pending.pop();
    
    if (this.length <= CHUNK_SIZE) {
        result = new Chunk([], this.length++);
        if (this.length > CHUNK_SIZE) {
            this.currentStep = [-1];
        }
        return result;
    } else {
        // increment this.currentStep & send
        for (var i = 0; i < this.currentStep.length; i++) {
            this.currentStep[i]++;
            if (this.currentStep[i] >= Job.CHARACTERS.length) {
                this.currentStep[i] = 0;
            } else {
                return new Chunk(this.currentStep.slice(0), CHUNK_SIZE);
            }
        }
        
        // increment the length and restore to 0 if we're done this length
        this.length++;
        for (var i = 0; i < this.length - CHUNK_SIZE; i++) {
            this.currentStep[i] = 0;
        }
        return new Chunk(this.currentStep.slice(0), CHUNK_SIZE);
    }
};

module.exports = Job;
