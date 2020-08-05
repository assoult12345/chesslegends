let Connection = require('./Connection');
let Player = require('./Player');
let ChatMessage = require('./ChatMessage');
let Database = require('./Database');

//Lobbies
let LobbyBase = require('./Lobbies/LobbyBase');
let GameLobby = require('./Lobbies/GameLobby');
let GameLobbySettings = require('./Lobbies/GameLobbySettings');

module.exports = class ServerManager {
    constructor(isLocal = false){
        this.database = new Database(isLocal);
        this.connections = [];
        this.staticConnections = [];
        this.lobbys = [];
        this.onlineplayers = [];
        this.activegames = [];
        this.gamelobbiesmade = new Number(0);

        //Create main Lobby
        this.lobbys[0] = new LobbyBase(0);

        //Chat System
        this.messages = [];

        //Test if connection with Database is Possible and error free
        this.database.ConnectionTest();
    }

    //utility functions
    mapLength(arr) {
        var count = 0;
        for (var k in arr) {
          if (arr.hasOwnProperty(k)) {
            count++;
          }
        }
        return count;
    }

    //Handles All Connections
    onConnected(socket, io){
        let serverManager = this;
        let connection = new Connection();
        connection.io = io;
        connection.socket = socket;
        connection.player = new Player();
        connection.serverManager = serverManager;

        let player = connection.player;
        let lobbys = serverManager.lobbys;
        let messages = serverManager.messages;

        serverManager.connections[player.id] = connection;
        let index = serverManager.mapLength(serverManager.connections) - 1;
        serverManager.staticConnections[index] = connection;

        socket.join(player.lobby);
        connection.lobby = lobbys[player.lobby];
        connection.lobby.onEnterLobby(connection);
        console.log('New user connected to the server as [ ' + player.id + ' ] and on lobby [ ' + connection.lobby.id + ' ] with socket connection [' + serverManager.connections[player.id].socket.id + '] on connections position [' + serverManager.mapLength(serverManager.connections) + ']');

        return connection;
    }

    onLogin(connection = Connection){
        let serverManager = this;
        let onlineplayers = this.onlineplayers;
        let id = connection.player.id;
        let socket = connection.socket.id;

        //Client info
        let username = connection.player.username;
        let rating = connection.player.rating;
        let rank = connection.player.rank;
        let gamesplayed = connection.player.gamesplayed;
        let wins = connection.player.wins;
        let losses = connection.player.losses;
        let badge1 = connection.player.badge1;
        let badge2 = connection.player.badge2;
        let badge3 = connection.player.badge3;
        let premium = connection.player.premium;
        
        let normalcurrency = connection.player.normalcurrency;
        let premiumcurrency = connection.player.premiumcurrency;

        let activepicture = connection.player.activepicture;

        let pictureinventory = connection.player.pictureinventory;
        let friendslist = connection.player.friendslist;

        //put new user into onlineplayers
        onlineplayers[username] = [id, connection.socket, connection, connection.player];
        console.log(username + ' [ ' + rank + ' ] is now logged in with ID: ' + onlineplayers[username][0] + ' and on Socket: ' + onlineplayers[username][1].id);

        //send information to client to build user profile
        connection.socket.emit('playerProfile', { username: username, rank: rank, rating: rating, gamesplayed: gamesplayed, wins: wins, losses: losses, badge1: badge1, badge2: badge2, badge3: badge3, premium: premium, activepicture: activepicture, pictureinventory: pictureinventory, friendslist: friendslist, normalcurrency: normalcurrency, premiumcurrency: premiumcurrency });
    }

    onProfileUpdate(connection = Connection){
        let serverManager = this;
        //Client info
        let username = connection.player.username;
        let rating = connection.player.rating;
        let rank = connection.player.rank;
        let gamesplayed = connection.player.gamesplayed;
        let wins = connection.player.wins;
        let losses = connection.player.losses;
        let badge1 = connection.player.badge1;
        let badge2 = connection.player.badge2;
        let badge3 = connection.player.badge3;
        let premium = connection.player.premium;
        
        let normalcurrency = connection.player.normalcurrency;
        let premiumcurrency = connection.player.premiumcurrency;
        
        let activepicture = connection.player.activepicture;

        let pictureinventory = connection.player.pictureinventory;
        let friendslist = connection.player.friendslist;
        
        //send information to client to build user profile
        connection.socket.emit('updateProfile', { username: username, rank: rank, rating: rating, gamesplayed: gamesplayed, wins: wins, losses: losses, badge1: badge1, badge2: badge2, badge3: badge3, premium: premium, activepicture: activepicture, pictureinventory: pictureinventory, friendslist: friendslist, normalcurrency: normalcurrency, premiumcurrency: premiumcurrency });
    }

    onUserProfileUpdate(connection = Connection, array){
        let serverManager = this;

        //infromation array
        let dataarray = [];
        dataarray = array;
        connection.socket.emit('updateUserProfile', { dataarray: dataarray });
    }

    onDisconnected(connection = Connection){
        let serverManager = this;
        let id = connection.player.id;
        let onlineplayers = this.onlineplayers;
        let activegames = this.activegames;
        
        //console.log('on disconnect' + serverManager.connections[id]);
        delete serverManager.connections[id];
        delete onlineplayers[connection.player.username];
        console.log('User ' + connection.player.displayPlayerInformation() + ' has disconnected from lobby [ ' + connection.player.lobby + ' ]');

        connection.socket.broadcast.to(connection.player.lobby).emit('disconnected', {
            id: id
        });

        //perform lobby cleanup
        let currentLobbyIndex = connection.player.lobby;
        serverManager.lobbys[currentLobbyIndex].onLeaveLobby(connection);

        if(currentLobbyIndex != 0 && serverManager.lobbys[currentLobbyIndex].connections.length == 0){
            console.log('Closing down lobby [ ' + currentLobbyIndex + ' ]');
            //serverManager.lobbys.splice(currentLobbyIndex, 1);
            
            delete serverManager.lobbys[currentLobbyIndex];
            activegames.splice(connection.player.lobby, 1);
        } else if(currentLobbyIndex != 0 && serverManager.lobbys[currentLobbyIndex].connections.length == 1){
            console.log(connection.player.username + ' lost the Game because he disconnected.');

            //serverManager.lobby.onGameOver($reason, $winner);
        }
    }

    instantiateRequests(connection = Connection, resultsarray){
        let serverManager = this;
        let requests = [];
        
        requests = resultsarray;
        //emit that instantiates
        connection.socket.emit('updateFriendRequestsRecieved', { requests: requests });
    }

    instantiateFriendList(connection = Connection, resultsarray){
        let serverManager = this;
        let list = [];

        list = resultsarray;

        //emit that instantiates
        connection.socket.emit('updateFriendsList', { list: list });
    }

    instantiateMatchhistory(connection = Connection, resultsarray){
        let serverManager = this;
        let history = [];

        history = resultsarray;
        // for (let index = 0; index < history.length; index++) {
        //     console.log(history[index]);
        // }

        //emit that instantiates
        connection.socket.emit('updateMatchhistory', { history: history });
    }
    
    instantiateRankings(connection = Connection, resultsarray){
        let serverManager = this;
        let rankings = [];

        rankings = resultsarray;
        // for (let index = 0; index < history.length; index++) {
        //     console.log(history[index]);
        // }

        //emit that instantiates
        connection.socket.emit('updateRankings', { rankings: rankings });
    }

    onFriendRequestSend(connection = Connection, username){
        let serverManager = this;
        let staticConnections = this.staticConnections;

        for (let i = 0; i < staticConnections.length; i++) {
            //console.log('User at Index[ ' + i +' ]: ' + staticConnections[i].player.username);
            if(staticConnections[i].player.username === username){
                staticConnections[i].socket.emit('friendRequestInc');//send him friendrequest from connection.
            }
        }
    }

    onAttemptToJoinGame(connection = Connection, gametype, friendchallengedata){
        //look through lobbies for a gamelobby
        //check if its joinable
        //if not make another Lobby
        let serverManager = this;
        let lobbyFound = false;
        let activegames = this.activegames;
        let database = this.database;
        let friendchallenged = 'empty';

        if(friendchallengedata !== 'empty'){
            friendchallenged = friendchallengedata.friend;
        }

        let gameLobbies = serverManager.lobbys.filter(item => {
            return item instanceof GameLobby;
        });
        console.log('Found [ ' + gameLobbies.length + ' ] game lobbies on the server');

        gameLobbies.forEach(lobby => {
            if(!activegames.includes(lobby)){
                if(!lobbyFound){
                    let canJoin = lobby.canEnterLobby(connection, gametype);

                    if(canJoin){
                        console.log(connection.player.username + ' Joined existing lobby [ ' + lobby.id + ' ] with gametype [ ' + gametype + ' ]');
                        lobbyFound = true;
                        serverManager.onSwitchLobby(connection, lobby.id);
                        activegames.push(lobby);
                    }
                }
            }
        });

        //All game lobbies fail or we have never created one

        if(!lobbyFound){
            //console.log('new game lobby being opened');
            serverManager.gamelobbiesmade++;
            let gamelobby = new GameLobby(serverManager.gamelobbiesmade, new GameLobbySettings('Chess Game', 2), database, gametype, friendchallenged);
            serverManager.lobbys.push(gamelobby);
            serverManager.onSwitchLobby(connection, gamelobby.id);
            console.log(connection.player.username + ' Making a new game lobby [ ' + gamelobby.id + ' ] - Game Lobbies Created during Session: ' + serverManager.gamelobbiesmade);
            //let jabbadu = gameLobbies.length+1;
            //console.log('how many game lobbies: ' + jabbadu + ' - lobby created: ' + serverManager.lobbys[gamelobby.id]);
        }
    }

    onSwitchLobby(connection = Connection, lobbyID){
        let serverManager = this;
        let lobbys = serverManager.lobbys;

        // lobbys.forEach(element => {
        //     console.log('on switch lobby: ' + element['id']);
        // })

        connection.socket.join(lobbyID); // Join the new Lobby's Socket Channel
        connection.lobby = lobbys[lobbyID]; //assign the reference to the new lobby

        lobbys[connection.player.lobby].onLeaveLobby(connection);
        lobbys[lobbyID].onEnterLobby(connection);
        // if(lobbyID == 0){
        //     connection.socket.emit('switchToBaseLobby');
        // }
    }

    onCancelQueue(connection = Connection){
        let serverManager = this;
        let id = connection.player.id;
        let onlineplayers = this.onlineplayers;
        let activegames = this.activegames;
        
        //reference for the created lobby
        let LobbyIndex = connection.player.lobby;

        //set currentlobby for player to 0 (onSwitchLobby)
        serverManager.onSwitchLobby(connection, 0);

        //log disconnected user
        console.log('Player ' + connection.player.displayPlayerInformation() + ' has disconnected from lobby ' + LobbyIndex);

        //perform lobby cleanup
        if(LobbyIndex != 0 && serverManager.lobbys[LobbyIndex].connections.length == 0){
            console.log('Closing down lobby [ ' + LobbyIndex + ' ]');
            //serverManager.lobbys.splice(currentLobbyIndex, 1);
            
            delete serverManager.lobbys[LobbyIndex];
        }
    }

    onSurrender(connection = Connection, io){
        let serverManager = this;
        let lobbys = serverManager.lobbys;

        if(connection.lobby.id != 0 && connection.lobby.gametime > 100){
            lobbys[connection.lobby.id].playerSurrender(connection, io);
        }
    }

    onGameSetup(connection = Connection){
        let serverManager = this;
        let lobbys = serverManager.lobbys;
        lobbys[connection.lobby.id].gameSetup(connection);
    }

    onGameStarted(connection = Connection){
        let serverManager = this;
        let lobbys = serverManager.lobbys;
        //CHECK IF LOBBY ID IS STILL 0 IF YES CANCEL THE GAME
        lobbys[connection.lobby.id].GameStarted(connection);
    }

    onDrag(connection = Connection, boardPosition){
        let serverManager = this;
        let lobbys = serverManager.lobbys;
        lobbys[connection.lobby.id].onDragCheck(connection, boardPosition);
    }

    onMakeMove(connection = Connection, chessMove, io){
        let serverManager = this;
        let lobbys = serverManager.lobbys;
        lobbys[connection.lobby.id].onMove(connection, chessMove, io);
    }

    onChatRecieved(connection = Connection, chatData){
        let serverManager = this;
        let id = connection.player.id;
        let onlineplayers = this.onlineplayers;
        let username = connection.player.username;
        let messages = serverManager.messages;
        let premium = connection.player.premium;

        //delete old entries and create new chatMessage
        delete messages[username];
        let chatMessage = new ChatMessage;

        //assign chatMessage values
        chatMessage.message = chatData.message.text;
        chatMessage.messagetype = chatData.message.messageType;
        chatMessage.username = username;
        chatMessage.reciever = chatData.message.reciever;

        if(chatData.message.reciever === ''){
            chatMessage.reciever = '';
        } else {
            chatMessage.reciever = chatData.message.reciever;
        }

        //put value into sorting array
        messages[username] = chatMessage;

        //console.log('message recieved from ' + messages[username].username + ': [' + messages[username].message + '] message type: ' + messages[username].messagetype + ' reciever: ' + messages[username].reciever);
        if(messages[username].messagetype == 0 && messages[username].message !== '/help'){
            if(premium == 1){
                messages[username].messagetype = 5;
            }
            //send message to every connection
            connection.io.emit('broadcastchat', messages[username]);
            delete messages[username];
        } else if(messages[username].messagetype == 0 && messages[username].message == '/help'){

            //player typed /help
            let chatMessage = new ChatMessage;
            chatMessage.message = 'message - sends a message to all players. /w playername message - sends a personal message to another player. /l message - sends a message to the other player in your current game.';
            delete messages[username];
            chatMessage.messagetype = 1;
            chatMessage.username = 'System';
            chatMessage.reciever = '';

            //send message back to player with /w explanation
            messages[username] = chatMessage;
            connection.socket.emit('broadcastchat', messages[username]);
            delete messages[username];

        } else if(messages[username].messagetype == 2){
            if(typeof onlineplayers[messages[username].reciever] == 'undefined'){

                //player does not exist
                let chatMessage = new ChatMessage;
                chatMessage.message = 'Player ( ' + messages[username].reciever + ' ) is currently offline.';
                delete messages[username];
                chatMessage.messagetype = 1;
                chatMessage.username = 'System';
                chatMessage.reciever = '';

                messages[username] = chatMessage;
                connection.socket.emit('broadcastchat', messages[username]);
                delete messages[username];
            } else {
                //player exists send chatmessage to socket and to the other player
                connection.socket.emit('broadcastchat', messages[username]);
                messages[username].username = 'From ' + username;
                let recieversocket = onlineplayers[serverManager.messages[username].reciever][1];
                recieversocket.emit('broadcastchat', serverManager.messages[username]);
                delete messages[username];
            }
        } else if (serverManager.messages[username].messagetype == 3){
            if(connection.player.lobby != 0){
                //player exists and is in a game lobby send chatmessage to socket and to the other player
                connection.io.to(connection.player.lobby).emit('broadcastchat', serverManager.messages[username]);
                delete serverManager.messages[username];
            } else {
                //player is not in a game lobby
                let chatMessage = new ChatMessage;
                chatMessage.message = 'You aren\'t currently in a game lobby.';
                delete serverManager.messages[username];
                chatMessage.messagetype = 1;
                chatMessage.username = 'System';
                chatMessage.reciever = '';

                serverManager.messages[username] = chatMessage;
                connection.socket.emit('broadcastchat', serverManager.messages[username]);
                delete serverManager.messages[username];
            }
        }
    }
}