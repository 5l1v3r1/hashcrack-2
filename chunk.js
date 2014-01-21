/**
 * Represents a chunk of work.
 * @parameter fixed The array [x,y,z,...] of indices that are fixed
 * @parameter variable The length of the variable suffix
 */
function Chunk(fixed, variable) {
    this.fixed = fixed;
    this.variable = variable;
}

Chunk.prototype.toJSON = function() {
    return {fixed: this.fixed, variable: this.variable};
};

module.exports = Chunk;
