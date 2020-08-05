let Mysql = require('mysql')
let DatabaseSettings = require('../Files/DatabaseSettings.json')
let DatabaseSettingsLocal = require('../Files/DatabaseSettingsLocal.json')
let PasswordHash = require('password-hash')
let Crypto = require('crypto')

module.exports = class Database {
    constructor(isLocal = false){
        this.currentSettings = (isLocal) ? DatabaseSettingsLocal : DatabaseSettings;
        this.pool = Mysql.createPool({
            host: this.currentSettings.Host,
            user: this.currentSettings.User,
            //port: this.currentSettings.Port,
            password: this.currentSettings.Password,
            database: this.currentSettings.Database
        });
    }

    Connect(callback){
        let pool = this.pool;
        //console.log('Connect gets called.');
        pool.getConnection((error, connection) => {
            if (error) throw error;
            
            //console.log('getConnection works.');
            callback(connection);
        });
    }

    ConnectionTest(callback){
        //console.log('ConnectionTest gets called.');
        this.Connect(connection => {
            let query = "SELECT * FROM player";
            
            //console.log('ConnectionTest query gets setup.');

            connection.query(query, (error, results) => {
                connection.release();
                if(error) throw error;
                console.log('Connection with Database established.');
            });
        });
    }

    //ACCCOUNT QUERIES
    CreateAccount(login, username, password, callback){
        //need to check length and perform regex on this
        if(login.length < 3 || login.length > 15){
            callback({
                valid: false,
                reason: "login length does not match the parameters."
            });
            return;
        }

        if(username.length < 3 || username.length > 15){
            callback({
                valid: false,
                reason: "username length does not match the parameters."
            });
            return;
        }

        if(password.length < 6){
            callback({
                valid: false,
                reason: "password length does not match the parameters."
            });
            return;
        }

        //create salt
        var salt = Crypto.createHmac('sha256', 'okimmakeepitatthat').update('pussystilldrippin').digest('hex');
        //create password with hashes and shit
        var hashedPassword = login + '$pussy$' + Crypto.createHmac('sha256', password).update('pussydrippin').digest('hex') + '6' + salt; //PasswordHash.generate(password, ['saltandshit', 'sha256']);

        //check if login is taken
        this.Connect(connection => {
            let query = "SELECT login FROM player WHERE login = ?";

            connection.query(query, [login], (error, results) => {
                if(error) {
                    connection.release();
                    throw error;
                }

                if(results[0] != undefined){
                    callback({
                        valid: false,
                        reason: "login already exists."
                    });
                    connection.release();
                    return;
                }

                //Check if username is taken
                let query = "SELECT username FROM player WHERE username = ?";

                connection.query(query, [username], (error, results) => {
                    if(error) {
                        connection.release();
                        throw error;
                    }

                    if(results[0] != undefined){
                        callback({
                            valid: false,
                            reason: "username already exists."
                        });
                        connection.release();
                        return;
                    }

                    //inset user into database
                    query = "INSERT INTO player (login, username, password) VALUES (?, ?, ?)";
                    connection.query(query, [login, username, hashedPassword], (error, results) => {
                        if(error) {
                            throw error
                        }
                            //get the id from the new user
                            let query = "SELECT id FROM player WHERE login = ?";
                            connection.query(query, [login], (error, results) => {
                            if(error) {
                                throw error;
                            }
                                let id = results[0].id

                                //create starter items in the different inventorydbs
                                query = "INSERT INTO badgeinventory (playerid, badge) VALUES (?, ?)";
                                connection.query(query, [id, 2], (error, results) => {
                                if(error) {
                                    throw error
                                }

                                //white queen
                                query = "INSERT INTO pictureinventory (playerid, pictureid) VALUES (?, ?)";
                                connection.query(query, [id, 0], (error, results) => {
                                if(error) {
                                    throw error
                                }

                                //black queen
                                query = "INSERT INTO pictureinventory (playerid, pictureid) VALUES (?, ?)";
                                connection.query(query, [id, 1], (error, results) => {
                                connection.release();
                                if(error) {
                                    throw error
                                }

                                callback({
                                    valid: true,
                                    reason: "Registration Successful for user:" + login
                                }); }); });
                            });
                        });
                    });
                });
            });
        });
    }

    SignIn(login, password, callback){
        this.Connect(connection => {
            let query = "SELECT id, password, username, rating, translatedrank, translatedrating, badge1, badge2, badge3, gamesplayed, wins, losses, unitskin, premium, activepicture, normalcurrency, premiumcurrency FROM player WHERE login = ?";

            connection.query(query, [login], (error, results) => {
                connection.release();
                if(error) {
                    throw error;
                }

                if(results[0] != undefined){
                    //create salt
                    var salt = Crypto.createHmac('sha256', 'okimmakeepitatthat').update('pussystilldrippin').digest('hex');
                    var hashedPassword = login + '$pussy$' + Crypto.createHmac('sha256', password).update('pussydrippin').digest('hex') + '6' + salt;
                    if(hashedPassword === results[0].password) //PasswordHash.verify(password, results[0].password))
                    {
                        callback({
                            valid: true,
                            reason: "Login Successfull for user: " + login,
                            username: results[0].username,
                            rank: results[0].translatedrank,
                            rating: results[0].translatedrating,
                            mmr: results[0].rating,
                            dbid: results[0].id,
                            badge1: results[0].badge1,
                            badge2: results[0].badge2,
                            badge3: results[0].badge3,
                            gamesplayed: results[0].gamesplayed,
                            premium: results[0].premium,
                            activepicture: results[0].activepicture,
                            normalcurrency: results[0].normalcurrency,
                            premiumcurrency: results[0].premiumcurrency,
                            wins: results[0].wins,
                            losses: results[0].losses
                        });
                    } else {
                        callback({
                            valid: false,
                            reason: "Password does not match."
                        });
                    }
                } else {
                    callback({
                        valid: false,
                        reason: "User does not exist in the Database."
                    });
                }
            });
        });
    }

    pictureDBData(id, callback){
        this.Connect(connection => {
            let query = "SELECT pictureid FROM pictureinventory WHERE playerid = ?";

            connection.query(query, [id], (error, results) => {
                connection.release();
                if(error) {
                    throw error;
                }

                if(results[0] != undefined){
                    let resultsarray = [];
                    for (let index = 0; index < results.length; index++) {
                        resultsarray[index] = results[index].pictureid;
                    }

                    callback({
                        valid: true,
                        reason: "Datarequest successfull for: " + id,
                        idarray: resultsarray
                        //assign data here
                    });
                } else {
                    callback({
                        valid: false,
                        reason: "User does not have a picture inventory in the Database."
                    });
                }
            });
        });
    }

    FriendslistDBData(playername, callback){
        this.Connect(connection => {
            let query = "SELECT playername1, playername2 FROM friendlistdb WHERE playername1 = ? OR playername2 = ?";

            connection.query(query, [playername, playername], (error, results) => {
                connection.release();
                if(error) {
                    throw error;
                }

                let resultsarray = [];
                for (let index = 0; index < results.length; index++) {
                    if(results[index].playername1 === playername){
                        resultsarray[index] = results[index].playername2;
                    } else {
                        resultsarray[index] = results[index].playername1;
                    }
                }

                callback({
                    valid: true,
                    reason: "Datarequest successfull for: " + playername,
                    array: resultsarray
                    //assign data here
                });
            });
        });
    }

    SendFriendRequest(playername, friendname, callback){
        if(friendname.length < 16 && !friendname.includes(" ") && playername !== friendname){
            this.Connect(connection => {
                let query = "SELECT id FROM player WHERE username = ?";

                connection.query(query, [friendname], (error, results) => {
                    if(error) {
                        throw error;
                    }

                    if(results[0] != undefined){
                        let query = "SELECT * FROM friendrequestdb WHERE playername = ? AND friendname = ?";

                        connection.query(query, [playername, friendname], (error, results) => {
                        if(error) {
                            throw error;
                        }

                        if(results[0] == undefined){
                                let query = "SELECT * FROM friendrequestdb WHERE playername = ? AND friendname = ?";

                                connection.query(query, [playername, friendname], (error, results) => {
                                    if(error) {
                                        throw error;
                                    }
            
                                    if(results.length < 20){
                                        let query = "INSERT INTO friendrequestdb (playername, friendname) VALUE (?, ?)";

                                        connection.query(query, [playername, friendname], (error, results) => {
                                            connection.release();
                                            if(error) {
                                                throw error;
                                            }

                                            callback({
                                                valid: true,
                                                reason: "Insert successfull for: " + playername
                                            });
                                        });
                                    }
                                });
                            } else {
                                callback({
                                    valid: false,
                                    reason: "Username does not exist: " + friendname
                                });
                            }
                        });
                    }
                });
            });
        }
    }

    DeclineFriendRequest(playername, friendname, callback){
        if(friendname.length < 16 && !friendname.includes(" ") && playername !== friendname){
            this.Connect(connection => {
                let query = "SELECT id FROM player WHERE username = ?";

                connection.query(query, [friendname], (error, results) => {
                    if(error) {
                        throw error;
                    }

                    if(results[0] != undefined){
                        let query = "DELETE FROM friendrequestdb WHERE playername = ? AND friendname = ?";

                        connection.query(query, [friendname, playername], (error, results) => {
                            connection.release();
                            if(error) {
                                throw error;
                            }

                            callback({
                                valid: true,
                                reason: "Decline successfull for: " + playername
                            });
                        });
                    } else {
                        callback({
                            valid: false,
                            reason: "Username does not exist: " + friendname
                        });
                    }
                });
            });
        }
    }

    DeleteFriend(playername, friendname, callback){
        if(friendname.length < 16 && !friendname.includes(" ") && playername !== friendname){
            this.Connect(connection => {
                let query = "SELECT id FROM player WHERE username = ?";

                connection.query(query, [friendname], (error, results) => {
                    if(error) {
                        throw error;
                    }

                    if(results[0] != undefined){
                        let query = "DELETE FROM friendlistdb WHERE playername1 = ? AND playername2 = ? OR playername2 = ? AND playername1 = ?";

                        connection.query(query, [friendname, playername, friendname, playername], (error, results) => {
                            connection.release();
                            if(error) {
                                throw error;
                            }

                            callback({
                                valid: true,
                                reason: "Decline successfull for: " + playername
                            });
                        });
                    } else {
                        callback({
                            valid: false,
                            reason: "Username does not exist: " + friendname
                        });
                    }
                });
            });
        }
    }

    AcceptFriendRequest(playername, friendname, callback){
        if(friendname.length < 16 && !friendname.includes(" ") && playername !== friendname){
            this.Connect(connection => {
                let query = "SELECT id FROM player WHERE username = ?";

                connection.query(query, [friendname], (error, results) => {
                    if(error) {
                        throw error;
                    }

                    if(results[0] != undefined){
                        let query = "DELETE FROM friendrequestdb WHERE playername = ? AND friendname = ?";

                        connection.query(query, [friendname, playername], (error, results) => {
                            if(error) {
                                throw error;
                            }

                            let friendQuery = "INSERT INTO friendlistdb (playername1, playername2) VALUE (?, ?)";
                            connection.query(friendQuery, [friendname, playername], (error, results) => {
                                connection.release();
                                if(error) {
                                    throw error;
                                }

                                callback({
                                    valid: true,
                                    reason: "Accept successfull for: " + playername
                                });
                            });
                            
                            callback({
                                valid: true,
                                reason: "Accept freindrequest deletion successfull for: " + playername
                            });
                        });
                    } else {
                        callback({
                            valid: false,
                            reason: "Username does not exist: " + friendname
                        });
                    }
                });
            });
        }
    }

    FriendrequestDBData(playername, callback){
        this.Connect(connection => {
            let query = "SELECT playername FROM friendrequestdb WHERE friendname = ?";

            connection.query(query, [playername], (error, results) => {
                connection.release();
                if(error) {
                    throw error;
                }

                let resultsarray = [];
                for (let index = 0; index < results.length; index++) {
                    resultsarray[index] = results[index].playername;
                    //console.log(resultsarray[index]);
                }

                callback({
                    valid: true,
                    reason: "Datarequest successfull friendrequests for: " + playername,
                    resultsarray: resultsarray //assign data here
                });
            });
        });
    }

    ProfileData(dbid, callback){
        this.Connect(connection => {
            let query = "SELECT username, rating, translatedrank, translatedrating, badge1, badge2, badge3, gamesplayed, wins, losses, unitskin, premium, activepicture, normalcurrency, premiumcurrency FROM player WHERE id = ?";

            connection.query(query, [dbid], (error, results) => {
                connection.release();
                if(error) {
                    throw error;
                }

                if(results[0] != undefined){
                    callback({
                        valid: true,
                        reason: "Datarequest successfull for: " + dbid,
                        rank: results[0].translatedrank,
                        rating: results[0].translatedrating,
                        mmr: results[0].rating,
                        username: results[0].username,
                        badge1: results[0].badge1,
                        badge2: results[0].badge2,
                        badge3: results[0].badge3,
                        gamesplayed: results[0].gamesplayed,
                        premium: results[0].premium,
                        activepicture: results[0].activepicture,
                        normalcurrency: results[0].normalcurrency,
                        premiumcurrency: results[0].premiumcurrency,
                        wins: results[0].wins,
                        losses: results[0].losses
                    });
                } else {
                    callback({
                        valid: false,
                        reason: "User does not exist in the Database."
                    });
                }
            });
        });
    }

    UserProfileData(username, callback){
        this.Connect(connection => {
            let query = "SELECT username, rating, translatedrank, translatedrating, badge1, badge2, badge3, gamesplayed, wins, losses, unitskin, premium, activepicture, normalcurrency, premiumcurrency FROM player WHERE username = ?";

            connection.query(query, [username], (error, results) => {
                connection.release();
                if(error) {
                    throw error;
                }

                if(results[0] != undefined){
                    callback({
                        valid: true,
                        reason: "Datarequest successfull for: " + username,
                        rank: results[0].translatedrank,
                        rating: results[0].translatedrating,
                        mmr: results[0].rating,
                        username: results[0].username,
                        badge3: results[0].badge3,
                        gamesplayed: results[0].gamesplayed,
                        activepicture: results[0].activepicture,
                        wins: results[0].wins,
                        losses: results[0].losses,
                        premium: results[0].premium
                    });
                } else {
                    callback({
                        valid: false,
                        reason: "User does not exist in the Database."
                    });
                }
            });
        });
    }

    InsertMatchHistory(playerwname, playerbname, playerwrank, playerbrank, playerwrp, playerbrp, winner, winnercolor, movehistory, timestamp, callback){
        this.Connect(connection => {
            let newmoves = '???' + movehistory + '???';

            let query = "INSERT INTO matchhistorydb (playerwname, playerbname, playerwrank, playerbrank, playerwrp, playerbrp, winner, winnercolor, movehistory, timestamp) VALUE (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            connection.query(query, [playerwname, playerbname, playerwrank, playerbrank, playerwrp, playerbrp, winner, winnercolor, newmoves, timestamp], (error, results) => {
                connection.release();
                if(error) {
                    throw error;
                }
                
                callback({
                    valid: true,
                    reason: "Matchhistory Datainsert successfull"
                });
            });
        });
    }

    MatchhistoryData(username, callback){
        this.Connect(connection => {
            let query = "SELECT playerwname, playerbname, playerwrank, playerbrank, playerwrp, playerbrp, winner, winnercolor, timestamp FROM matchhistorydb WHERE playerwname = ? ORDER BY entryid DESC LIMIT 20";

            connection.query(query, [username], (error, results) => {
                connection.release();
                if(error) {
                    throw error;
                }

                if(results[0] != undefined){
                    let matchhistoryarray = [];

                    for (let index = 0; index < results.length; index++) {
                        matchhistoryarray[index] = results[index].playerwname + '#' + results[index].playerbname + '#' + results[index].playerwrank + '#' + results[index].playerbrank + '#' + results[index].playerwrp + '#' + results[index].playerbrp + '#' + results[index].winner + '#' + results[index].winnercolor + '#' + results[index].timestamp; 
                    }

                    callback({
                        valid: true,
                        reason: "Datarequest successfull for: " + username,
                        matchhistoryarray: matchhistoryarray
                    });
                } else {
                    callback({
                        valid: false,
                        reason: "User does not have any matches played."
                    });
                }
            });
        });
    }

    RankingsData(callback){
        this.Connect(connection => {
            let query = "SELECT username, translatedrank, translatedrating, wins, losses FROM player ORDER BY rating DESC LIMIT 20";

            connection.query(query, (error, results) => {
                connection.release();
                if(error) {
                    throw error;
                }

                if(results[0] != undefined){
                    let rankingsarray = [];

                    for (let index = 0; index < results.length; index++) {
                        rankingsarray[index] = results[index].username + '#' + results[index].translatedrank + '#' + results[index].translatedrating + '#' + results[index].wins + '#' + results[index].losses; 
                    }

                    callback({
                        valid: true,
                        reason: "Ranking Datarequest successfull",
                        rankingsarray: rankingsarray
                    });
                } else {
                    callback({
                        valid: false,
                        reason: "No users exist for some reason wtf."
                    });
                }
            });
        });
    }

    InsertNewAvatar(playerid, pictureid, callback){
        this.Connect(connection => {
            let query = "SELECT playerid FROM pictureinventory WHERE pictureid = ? AND playerid = ?";

            connection.query(query, [pictureid, playerid], (error, results) => {
                if(error) {
                    throw error;
                }

                if(results[0] != undefined){
                    //put new pictureid in player db on activepicture
                    query = "UPDATE player SET activepicture = ? WHERE id = ?";

                    connection.query(query, [pictureid, playerid], (error, results) => {
                        connection.release();
                        if(error) {
                            throw error;
                        }
                        
                        callback({
                            valid: true,
                            reason: "Datainsert successfull for: " + playerid
                        });
                    });
                } else {
                    callback({
                        valid: false,
                        reason: "ERROR: User does not have this item."
                    });
                }
            });
        });
    }

    InsertNewBadge(playerid, badgeid, callback){
        this.Connect(connection => {
            let query = "UPDATE player SET badge3 = ? WHERE id = ?";

            connection.query(query, [badgeid, playerid], (error, results) => {
                connection.release();
                if(error) {
                    throw error;
                }
                
                callback({
                    valid: true,
                    reason: "Datainsert successfull for: " + playerid
                });
            });
        });
    }

    InsertNewHeader(playerid, headerid, callback){
        this.Connect(connection => {
            let query = "SELECT playerid FROM headerinventory WHERE headerid = ? AND playerid = ?";

            connection.query(query, [headerid, playerid], (error, results) => {
                if(error) {
                    throw error;
                }

                if(results[0] != undefined){
                    //put new pictureid in player db on activepicture
                    query = "UPDATE player SET activeheader = ? WHERE id = ?";

                    connection.query(query, [headerid, playerid], (error) => {
                        connection.release();
                        if(error) {
                            throw error;
                        }
                        //check with select if datas match in the future ?
                        callback({
                            valid: true,
                            reason: "Datainsert successfull for: " + playerid
                        });
                    });
                } else {
                    callback({
                        valid: false,
                        reason: "ERROR: User does not have this item."
                    });
                }
            });
        });
    }

    IncrementGamesPlayed(playerid, callback){
        this.Connect(connection => {
            let query = "SELECT gamesplayed FROM player WHERE id = ?";

            connection.query(query, [playerid], (error, results) => {
                if(error) {
                    throw error;
                }

                if(results[0] != undefined){
                    let newgamesplayed = results[0].gamesplayed + 1;
                    //put new pictureid in player db on activepicture
                    query = "UPDATE player SET gamesplayed = ? WHERE id = ?";

                    connection.query(query, [newgamesplayed, playerid], (error) => {
                        connection.release();
                        if(error) {
                            throw error;
                        }
                        //check with select if datas match in the future ?
                        callback({
                            valid: true,
                            reason: "Datainsert successfull for: " + playerid
                        });
                    });
                } else {
                    callback({
                        valid: false,
                        reason: "ERROR: User does not exist."
                    });
                }
            });
        });
    }

    IncrementWins(playerid, callback){
        this.Connect(connection => {
            let query = "SELECT wins FROM player WHERE id = ?";

            connection.query(query, [playerid], (error, results) => {
                if(error) {
                    throw error;
                }

                if(results[0] != undefined){
                    let newwins = results[0].wins + 1;
                    //put new pictureid in player db on activepicture
                    query = "UPDATE player SET wins = ? WHERE id = ?";

                    connection.query(query, [newwins, playerid], (error) => {
                        connection.release();
                        if(error) {
                            throw error;
                        }
                        //check with select if datas match in the future ?
                        callback({
                            valid: true,
                            reason: "Datainsert successfull for: " + playerid
                        });
                    });
                } else {
                    callback({
                        valid: false,
                        reason: "ERROR: User does not exist."
                    });
                }
            });
        });
    }

    IncrementLosses(playerid, callback){
        this.Connect(connection => {
            let query = "SELECT losses FROM player WHERE id = ?";

            connection.query(query, [playerid], (error, results) => {
                if(error) {
                    throw error;
                }

                if(results[0] != undefined){
                    let newlosses = results[0].losses + 1;
                    //put new pictureid in player db on activepicture
                    query = "UPDATE player SET losses = ? WHERE id = ?";

                    connection.query(query, [newlosses, playerid], (error) => {
                        connection.release();
                        if(error) {
                            throw error;
                        }
                        //check with select if datas match in the future ?
                        callback({
                            valid: true,
                            reason: "Datainsert successfull for: " + playerid
                        });
                    });
                } else {
                    callback({
                        valid: false,
                        reason: "ERROR: User does not exist."
                    });
                }
            });
        });
    }

    GameOverValues(dbid, rating, translatedrank, translatedrating, currency, callback){
        this.Connect(connection => {
            let query = "SELECT id FROM player WHERE id = ?";

            connection.query(query, [dbid], (error, results) => {
                if(error) {
                    throw error;
                }

                if(results[0] != undefined){
                    query = "UPDATE player SET rating = ?, translatedrank = ?, translatedrating = ?, normalcurrency = ? WHERE id = ?";

                    connection.query(query, [rating, translatedrank, translatedrating, currency, dbid], (error, results) => {
                        connection.release();
                        if(error) {
                            throw error;
                        }
                        
                        callback({
                            valid: true,
                            reason: "Datainsert successfull for: " + dbid
                        });
                    });
                } else {
                    callback({
                        valid: false,
                        reason: "ERROR: User does not exist."
                    });
                }
            });
        });
    }
}