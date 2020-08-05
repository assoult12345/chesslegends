module.exports = class Connection {
    constructor() {
        this.io;
        this.socket;
        this.player;
        this.serverManager;
        this.lobby;
    }

    //Handles all IO Events
    createEvents(){
        let connection = this;
        let io = connection.io;
        let socket = connection.socket;
        let serverManager = connection.serverManager;
        let player = connection.player;

        socket.on('disconnect', function() {
            serverManager.onDisconnected(connection);
        });

        socket.on('createAccount', function(data) {
            serverManager.database.CreateAccount(data.login, data.username, data.password, results => {
                //results will return true or false based on account existing alread or not
                console.log(results.valid + ': ' + results.reason);
            });
        });

        socket.on('signIn', function(data) {
            serverManager.database.SignIn(data.login, data.password, results => {
                //results will return true or false based on account existing alread or not
                //console.log(results.valid + ': ' + results.reason);
                if(results.valid){
                //check serverManager.onlineplayers[results.username] if !undefined don't let the user login because he is already logged in
                    if(serverManager.onlineplayers[results.username] == undefined){
                        socket.emit('signIn');
                        //assign players username to current connection
                        connection.player.username = results.username;
                        connection.player.rating = results.rating;
                        connection.player.rank = results.rank;
                        connection.player.mmr = results.mmr;
                        connection.player.gamesplayed = results.gamesplayed;
                        connection.player.badge1 = results.badge1;
                        connection.player.badge2 = results.badge2;
                        connection.player.badge3 = results.badge3;
                        connection.player.dbid = results.dbid;
                        connection.player.premium = results.premium;
                        connection.player.activepicture = results.activepicture;
                        connection.player.normalcurrency = results.normalcurrency;
                        connection.player.premiumcurrency = results.premiumcurrency;
                        connection.player.wins = results.wins;
                        connection.player.losses = results.losses;

                        //get picture inventory data
                        serverManager.database.pictureDBData(connection.player.dbid, results => {
                            if(results.valid){
                                connection.player.pictureinventory = results.idarray;
                                //console.log('ja moin');
                                //for (let index = 0; index < connection.player.pictureinventory.length; index++) {
                                //    console.log(connection.player.pictureinventory[index]);
                                //}

                                //get friendslist data
                                serverManager.database.FriendslistDBData(connection.player.username, results => {
                                    if(results.valid){
                                        let resultsarray = results.array;

                                        connection.player.friendslist = results.array;
                                        
                                        //send to client
                                        serverManager.instantiateFriendList(connection, resultsarray);

                                        serverManager.database.MatchhistoryData(connection.player.username, results => {
                                            if(results.valid){
                                                let matchhistoryarray = results.matchhistoryarray;
                                                serverManager.instantiateMatchhistory(connection, matchhistoryarray);
                                            }
                                        });

                                        serverManager.database.RankingsData(results => {
                                            if(results.valid){
                                                let rankingsarray = results.rankingsarray;
                                                serverManager.instantiateRankings(connection, rankingsarray);
                                            }
                                        });

                                        serverManager.onLogin(connection);
                                    } else {
                                        console.log(results.valid + ' : ' + results.reason);
                                    }
                                });
                            }
                        });
                    }
                    else {
                        console.log(results.username + ' is already logged in.');
                    }
                }
            });
        });

        socket.on('updateRankings', function(){
            serverManager.database.RankingsData(results => {
                if(results.valid){
                    let rankingsarray = results.rankingsarray;
                    serverManager.instantiateRankings(connection, rankingsarray);
                }
            });
        });

        socket.on('profileUpdate', function(){
            let dbid = connection.player.dbid;
            serverManager.database.ProfileData(dbid, results => {
                //results will return true or false based on account existing alread or not
                //console.log(results.valid + ': ' + results.reason);
                if(results.valid){
                    //assign players username to current connection
                    connection.player.username = results.username;
                    connection.player.rating = results.rating;
                    connection.player.rank = results.rank;
                    connection.player.mmr = results.mmr;
                    connection.player.gamesplayed = results.gamesplayed;
                    connection.player.badge1 = results.badge1;
                    connection.player.badge2 = results.badge2;
                    connection.player.badge3 = results.badge3;
                    connection.player.premium = results.premium;
                    connection.player.activepicture = results.activepicture;
                    connection.player.normalcurrency = results.normalcurrency;
                    connection.player.premiumcurrency = results.premiumcurrency;
                    connection.player.wins = results.wins;
                    connection.player.losses = results.losses;
                    serverManager.onProfileUpdate(connection);

                    serverManager.database.MatchhistoryData(connection.player.username, results => {
                        if(results.valid){
                            let matchhistoryarray = results.matchhistoryarray;
                            serverManager.instantiateMatchhistory(connection, matchhistoryarray);
                        }
                    });

                    serverManager.database.FriendrequestDBData(connection.player.username, results => {
                        let resultsarray = results.resultsarray;
                        serverManager.instantiateRequests(connection, resultsarray);
                    });

                    serverManager.database.FriendslistDBData(connection.player.username, results => {
                        if(results.valid){
                            let resultsarray = results.array;

                            connection.player.friendslist = results.array;
                            
                            //send to client
                            serverManager.instantiateFriendList(connection, resultsarray);
                        } else {
                            console.log(results.valid + ' : ' + results.reason);
                        }
                    });
                }
            });
        });

        socket.on('GetProfileData', function(data){
            serverManager.database.UserProfileData(data.friend, results => {
                //results will return true or false based on account existing alread or not
                //console.log(results.valid + ': ' + results.reason);
                if(results.valid){
                    let dataarray = [];
                    //assign players username to current connection
                    dataarray[1] = results.username;
                    dataarray[2] = results.rating;
                    dataarray[3] = results.rank;
                    dataarray[4] = results.gamesplayed;
                    dataarray[5] = results.badge3;
                    dataarray[6] = results.activepicture;
                    dataarray[7] = results.premium;
                    dataarray[8] = results.wins;
                    dataarray[9] = results.losses;

                    serverManager.onUserProfileUpdate(connection, dataarray);
                }
            });
        });

        socket.on('setActivePicture', function(data){
            //data.pictureid.length can only be 1
            if(data.id.length != 1){
                data.id = connection.player.activepicture;
            }

            let dbid = connection.player.dbid;
            serverManager.database.InsertNewAvatar(dbid, data.id, results =>  {
                if(results.valid){
                    //console.log(dbid + ' changed their active picture to ' + data.id);

                    //update client profile
                    serverManager.database.ProfileData(dbid, results => {
                        //results will return true or false based on account existing alread or not
                        //console.log(results.valid + ': ' + results.reason);
                        if(results.valid){
                            //assign players username to current connection
                            connection.player.username = results.username;
                            connection.player.rating = results.rating;
                            connection.player.rank = results.rank;
                            connection.player.gamesplayed = results.gamesplayed;
                            connection.player.badge1 = results.badge1;
                            connection.player.badge2 = results.badge2;
                            connection.player.badge3 = results.badge3;
                            connection.player.premium = results.premium;
                            connection.player.activepicture = results.activepicture;
                            connection.player.normalcurrency = results.normalcurrency;
                            connection.player.premiumcurrency = results.premiumcurrency;
                            connection.player.wins = results.wins;
                            connection.player.losses = results.losses;
                            serverManager.onProfileUpdate(connection);
                        }
                    });
                }
            });
        });

        socket.on('sendFriendRequest', function(data) {
            serverManager.database.SendFriendRequest(connection.player.username, data.username, results =>{
                if(results.valid){
                    //console.log('inserting friendrequest valid');
                    serverManager.onFriendRequestSend(connection, data.username); //needs to inform the other player
                }
            });
        });

        socket.on('updateFriendRequests', function() {
            serverManager.database.FriendrequestDBData(connection.player.username, results => {
                let resultsarray = results.resultsarray;
                serverManager.instantiateRequests(connection, resultsarray);
            });
        });

        socket.on('declineFriend', function(data) {
            serverManager.database.DeclineFriendRequest(connection.player.username, data.friend, results => {
                serverManager.database.FriendrequestDBData(connection.player.username, results => {
                    let resultsarray = results.resultsarray;
                    serverManager.instantiateRequests(connection, resultsarray);
                });
            });
        });

        socket.on('deleteFriend', function(data) {
            serverManager.database.DeleteFriend(connection.player.username, data.friend, results => {
                serverManager.database.FriendslistDBData(connection.player.username, results => {
                    if(results.valid){
                        let resultsarray = results.array;

                        connection.player.friendslist = results.array;
                        
                        //send to client
                        serverManager.instantiateFriendList(connection, resultsarray);

                        //send to accepted client somehow? need connection
                        serverManager.database.FriendslistDBData(data.friend, results => {
                            if(results.valid && serverManager.onlineplayers[data.friend] !== undefined){
                                let resultsarray = results.array;
    
                                serverManager.onlineplayers[data.friend][3].friendslist = results.array;
                                serverManager.instantiateFriendList(serverManager.onlineplayers[data.friend][2], resultsarray);
                            }
                        });
                    } else {
                        console.log(results.valid + ' : ' + results.reason);
                    }
                });
            });
        });

        socket.on('acceptFriend', function(data) {
            serverManager.database.AcceptFriendRequest(connection.player.username, data.friend, results => {

                serverManager.database.FriendrequestDBData(connection.player.username, results => {
                    let resultsarray = results.resultsarray;
                    serverManager.instantiateRequests(connection, resultsarray);

                    serverManager.database.FriendslistDBData(connection.player.username, results => {
                        if(results.valid){
                            let resultsarray = results.array;

                            connection.player.friendslist = results.array;
                            
                            //send to client
                            serverManager.instantiateFriendList(connection, resultsarray);

                            //send to accepted client somehow? need connection
                            serverManager.database.FriendslistDBData(data.friend, results => {
                                if(results.valid && serverManager.onlineplayers[data.friend] !== undefined){
                                    let resultsarray = results.array;
        
                                    serverManager.onlineplayers[data.friend][3].friendslist = results.array;
                                    serverManager.instantiateFriendList(serverManager.onlineplayers[data.friend][2], resultsarray);
                                }
                            });

                        } else {
                            console.log(results.valid + ' : ' + results.reason);
                        }
                    });
                });
            });
        });

        socket.on('joinGame', function() {
            serverManager.onAttemptToJoinGame(connection, 0, 'empty');
        });

        socket.on('joinNormalGame', function() {
            serverManager.onAttemptToJoinGame(connection, 1, 'empty');
        });

        socket.on('joinPrivateGame', function(data) {
            serverManager.onAttemptToJoinGame(connection, 2, data);
        });

        socket.on('cancelQueue', function() {
            serverManager.onCancelQueue(connection);
        });

        socket.on('surrender', function() {
            serverManager.onSurrender(connection, io);
        });

        socket.on('recieveChat', function(data) {
            serverManager.onChatRecieved(connection, data);
        });

        socket.on('setupLoaded', function() {
            serverManager.onGameSetup(connection);
        });

        socket.on('gameStarted', function() {
            serverManager.onGameStarted(connection);
        });

        //IN FUTURE need to check if move actually comes from the correct client
        socket.on('makeMove', function(chessMove) {
            serverManager.onMakeMove(connection, chessMove, io);
        });

        socket.on('onDrag', function(boardPosition) {
            serverManager.onDrag(connection, boardPosition);
        });
    }
}