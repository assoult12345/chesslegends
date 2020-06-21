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
        this.lobbys = [];
        this.onlineplayers = [];

        //Create main Lobby
        this.lobbys[0] = new LobbyBase(0);

        //Chat System
        this.messages = [];
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

        console.log('New player connected to the server(' + player.id + ')');
        serverManager.connections[player.id] = connection;

        socket.join(player.lobby);
        connection.lobby = lobbys[player.lobby];
        connection.lobby.onEnterLobby(connection);

        return connection;
    }

    onLogin(connection = Connection){
        let serverManager = this;
        let onlineplayers = this.onlineplayers;
        let username = connection.player.username;
        let id = connection.player.id;
        let socket = connection.socket.id;
        let rating = connection.player.rating;

        //put new user into onlineplayers
        onlineplayers[username] = [id, socket];
        console.log(username + ' [ ' + rating + ' ] is now logged in with ID: ' + onlineplayers[username][0] + ' and on Socket: ' + onlineplayers[username][1]);
    }

    onDisconnected(connection = Connection){
        let serverManager = this;
        let id = connection.player.id;
        let onlineplayers = this.onlineplayers;

        delete serverManager.connections[id];
        delete onlineplayers[connection.player.username];
        console.log('Player ' + connection.player.displayPlayerInformation() + ' has disconnected');

        connection.socket.broadcast.to(connection.player.lobby).emit('disconnected', {
            id: id
        });

        //perform lobby cleanup
        let currentLobbyIndex = connection.player.lobby;
        serverManager.lobbys[currentLobbyIndex].onLeaveLobby(connection);

        if(currentLobbyIndex != 0 && serverManager.lobbys[currentLobbyIndex].connections.length == 0){
            console.log('Closing down lobby ( ' + currentLobbyIndex + ' )');
            serverManager.lobbys.splice(currentLobbyIndex, 1);
        }
    }

    onAttemptToJoinGame(connection = Connection){
        //look through lobbies for a gamelobby
        //check if its joinable
        //if not make another Lobby
        let serverManager = this;
        let lobbyFound = false;

        let gameLobbies = serverManager.lobbys.filter(item => {
            return item instanceof GameLobby;
        });
        //console.log('Found (' + gameLobbies.length + ') lobbies on the server');

        gameLobbies.forEach(lobby => {
            if(!lobbyFound){
                let canJoin = lobby.canEnterLobby(connection);

                if(canJoin){
                    lobbyFound = true;
                    serverManager.onSwitchLobby(connection, lobby.id);
                }
            }
        });

        //All game lobbies fail or we have never created one

        if(!lobbyFound){
            //console.log('Making a new game lobby');
            let gamelobby = new GameLobby(gameLobbies.length + 1, new GameLobbySettings('Chess Game', 2));
            serverManager.lobbys.push(gamelobby);
            serverManager.onSwitchLobby(connection, gamelobby.id);
        }
    }

    onSwitchLobby(connection = Connection, lobbyID){
        let serverManager = this;
        let lobbys = serverManager.lobbys;

        connection.socket.join(lobbyID); // Join the new Lobby's Socket Channel
        connection.lobby = lobbys[lobbyID]; //assign the reference to the new lobby

        lobbys[connection.player.lobby].onLeaveLobby(connection);
        lobbys[lobbyID].onEnterLobby(connection);
    }

    onGameSetup(connection = Connection){
        let serverManager = this;
        let lobbys = serverManager.lobbys;
        lobbys[connection.lobby.id].gameSetup(connection);
    }

    onGameStarted(connection = Connection){
        let serverManager = this;
        let lobbys = serverManager.lobbys;
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
                chatMessage.message = 'Player [ ' + messages[username].reciever + ' ] does not exist.';
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
                onlineplayers[serverManager.messages[username].reciever][1].emit('broadcastchat', serverManager.messages[username]);
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
                chatMessage.message = 'In order to user the /l command you need to be in a game lobby.';
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