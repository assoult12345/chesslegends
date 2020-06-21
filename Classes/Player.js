let shortID = require('shortid');

module.exports = class Player {
    constructor(){
        this.username = 'Default_Player';
        this.rating = 0;
        this.id = shortID.generate();
        this.lobby = 0;
    }

    displayPlayerInformation(){
        let player = this;
        return '(' + player.username + ':' + player.id + ')';
    }
}