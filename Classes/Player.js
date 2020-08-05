let shortID = require('shortid');

module.exports = class Player {
    constructor(){
        //Client Info
        this.username = 'Unlogged_Player';
        this.rank = 'Unlogged_Rank';
        this.rating = 0;
        this.mmr = 0;
        this.badge1 = -1;
        this.badge2 = -1;
        this.badge3 = -1;
        this.gamesplayed = 0;
        this.premium = 0;
        this.normalcurrency = 0;
        this.premiumcurrency = 0;
        this.wins = 0;
        this.losses = 0;

        //design stuff
        this.activepicture = 0;
        this.pictureinventory = [];
        this.friendslist = [];

        //Server Info
        this.id = shortID.generate();
        this.lobby = 0;
        this.dbid = 0;
    }

    displayPlayerInformation(){
        let player = this;
        return '[ Username: ' + player.username + ' - ShortID: ' + player.id + ' ]';
    }
}