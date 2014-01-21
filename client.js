CLIENT_TIMEOUT = 60000

function Client(socket, identifier) {
    this.socket = socket;
    this.identifier = identifier;
    this.seqNum = 0;
}

/**
 * Callback takes two arguments: (flag, password)
 * If flag is false, the operation timed out somehow.
 * If flag is true, password === null means no password
 * was found, otherwise the password hashes to the hash.
 */
Client.prototype.runChunk = function(hash, chunk, cb) {
    console.log('running chunk', chunk);
    var sequence = this.seqNum++;
    var object = chunk.toJSON();
    object.hash = hash;
    object.seq = sequence;
    this.socket.emit('chunk', object);
    
    var valid = true;
    var timeout = null;
    // apply a timeout
    this.socket.on('response#' + sequence, function(password) {
        if (!valid) return;
        clearTimeout(timeout);
        cb(true, password);
    });
    timeout = setTimeout(function() {
        valid = false;
        cb(false, null);
    }, CLIENT_TIMEOUT);
};

module.exports = Client;
