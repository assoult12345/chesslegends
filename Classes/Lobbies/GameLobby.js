let LobbyBase = require('./LobbyBase');
let GameLobbySettings = require('./GameLobbySettings');
let Connection = require('../Connection');
let LobbyState = require('../Utility/LobbyState');

//CHESS
let Chess = require('chess.js').Chess;
let ChatMessage = require('../ChatMessage');

module.exports = class GameLobby extends LobbyBase {
    constructor(id, settings = GameLobbySettings){
        super(id);
        this.settings = settings;
        this.lobbyState = new LobbyState;
        this.random = 0;

        //CHESS
        this.chess = new Chess;
        this.playerSide = [];
    }

    canEnterLobby(connection = Connection){
        let lobby = this;
        let maxPlayerCount = lobby.settings.maxPlayers;
        let currentPlayerCount = lobby.connections.length;

        if(currentPlayerCount + 1 > maxPlayerCount){
            return false;
        }
        return true;
    }

    onEnterLobby(connection = Connection){
        let lobby = this;
        let socket = connection.socket;
        let player = connection.player;
        
        super.onEnterLobby(connection);

        if(lobby.connections.length == lobby.settings.maxPlayers){
            //console.log('Enough players joined, game in this lobby can be started.');
            lobby.lobbyState.currenState = lobby.lobbyState.GAME;
            lobby.onSpawnAllPlayersIntoGame();
        }

        let returnData = {
            state: lobby.lobbyState.currenState
        }

        socket.emit('loadGame');
        socket.emit('lobbyUpdate', returnData);
        socket.broadcast.to(lobby.id).emit('lobbyUpdate', returnData);

        //Handle spawning server objects
    }

    onLeaveLobby(connection = Connection){
        let lobby = this;
        let playerSide = this.playerSide;
        let random = this.random;

        super.onLeaveLobby(connection);

        lobby.removePlayer(connection);

        //Handle unspawning server objects
        delete playerSide[connection];
        random = 0;
    }

    onSpawnAllPlayersIntoGame(){
        let lobby = this;
        let connections = this.connections;
        let playerSide = this.playerSide;
        let random = this.random;

        connections.forEach(connection => {
            if(random === 0){
                playerSide[connection] = 'White';
                //console.log(connection.player.id + ' got assigned White.');
                random = 1;
            } else {
                playerSide[connection] = 'Black';
                //console.log(connection.player.id + ' got assigned Black.');
            }

            lobby.addPlayer(connection);
        });
    }

    addPlayer(connection = Connection){
        let lobby = this;
        let connections = lobby.connections;
        let socket = connection.socket;

        var returnData = {
            if: connection.player.id
        }

        socket.emit('spawn', returnData);
        //socket.broadcast.to(lobby.id).emit('spawn', returnData);

        connections.forEach(c => {
            if(c.player.id != connection.player.id){
                socket.emit('spawn', {
                    id: c.player.id
                });
            }
        });
        
       lobby.gameSetup(connection);
    }

    gameSetup(connection = Connection){
        let lobby = this;

        //FUTURE
        //send user data to users that display elo rank etc

        //start the game
        lobby.gameStart(connection);
    }

    gameStart(connection){
        let lobby = this;

        //players side they will be playing on
        let playerSide = this.playerSide;
        let side = playerSide[connection];

        //tell both clients that the game can start
        connection.socket.emit('gameStartInit', { side: side });

        //send message to players chats telling them their side
        //Player1
        let chatMessage = new ChatMessage;
        chatMessage.username = 'System';
        chatMessage.message = 'Game Starts - You play as [ ' + side + ' ]';
        chatMessage.messagetype = 1;
        chatMessage.reciever = '';

        connection.socket.emit('broadcastchat', chatMessage);
    }

    GameStarted(connection = Connection){
        //start the actual chess game on the server in this one lobby
        let lobby = this;
        let chess = this.chess;

        //send initial board state
        let boardState = chess.board();
        let row1 = boardState[0];
        let row2 = boardState[1];
        let row3 = boardState[2];
        let row4 = boardState[3];
        let row5 = boardState[4];
        let row6 = boardState[5];
        let row7 = boardState[6];
        let row8 = boardState[7];

        connection.socket.emit('assignInitial', { row1: row1, row2: row2, row3: row3, row4: row4, row5: row5, row6: row6, row7: row7, row8: row8 });
    }

    onDragCheck(connection = Connection, boardPosition){
        let lobby = this;
        let chess = this.chess;
        let movesdictionary = [];
        let i = 0;

        let movesarraycheck = chess.moves({ square: boardPosition.Field , verbose: true});
        
        for(i = 0; i < movesarraycheck.length; i++){
            movesdictionary[i] = movesarraycheck[i]['to'];
        };

        connection.socket.emit('movesData', { moves: movesdictionary });
    }

    onMove(connection = Connection, chessMove, io){
        let lobby = this;
        let chess = this.chess;

        //players side they play on
        let playerSide = this.playerSide;
        let side = playerSide[connection];

        //the actual move on the client
        let fromField = chessMove.fromField;
        let toField = chessMove.toField;

        //VALIDATE FROM WHICH SOCKET THE REQUEST IS COMING FROM AND IF IT MATCHED THE ONE WHOS MOVE IT IS
        //Move and Turn Information
        let turn = chess.turn();
        let moveInfo = chess.move({ from: fromField, to: toField });

        //get board state after move
        let boardState = chess.board();
        let row1 = boardState[0];
        let row2 = boardState[1];
        let row3 = boardState[2];
        let row4 = boardState[3];
        let row5 = boardState[4];
        let row6 = boardState[5];
        let row7 = boardState[6];
        let row8 = boardState[7];

        //console.log(chess.ascii());
        //send new board to both clients
        io.to(lobby.id).emit('onmovefinished', { fromField: fromField, toField: toField, row1: row1, row2: row2, row3: row3, row4: row4, row5: row5, row6: row6, row7: row7, row8: row8 });

        //Message the Players when an important event happened
        //prepare Messages
        let chatMessage = new ChatMessage;
        chatMessage.username = 'Info';
        chatMessage.messagetype = 4;
        chatMessage.reciever = '';

        //IF IS IN CHECK
        if (chess.in_check() === true ){
            //prepare messages
            if(currentTurn == 'b'){
                chatMessage.message = 'Black put White in check.';
            } else {
                chatMessage.message = 'White put Black in check.';
            }
            //chatMessageP2.message = 'Your opponent put you in check.';
            io.to(lobby.id).emit('broadcastchat', chatMessage);
        }

        //IF IS DRAW
        if (chess.in_draw() === true ){
            chatMessage.message = 'Game ended in a draw.';
            io.to(lobby.id).emit('broadcastchat', chatMessage);
        }

        //IF GAME IS OVER
        if (chess.game_over() === true ){
            if(currentTurn === 'b'){ //Black Won
                chatMessage.message = 'Game Over. Black wins!';
            } else { //White Won
                chatMessage.message = 'Game Over. White wins!';
            }
            io.to(lobby.id).emit('broadcastchat', chatMessage);
        }

        //check for stalemate
        //     if (chess.in_stalemate() === true ){
        //         if(currentTurn === 'b'){
        //             console.log('Game Over. Stalemate from black.');
        //         } else {
        //             console.log('Game Over. Stalemate from white.');
        //         }
        //     }
    }

    removePlayer(connection = Connection){
        let lobby = this;
        let playerSide = this.playerSide;
        //let playerSocket = this.playerSocket;
        let chess = this.chess;
        let random = this.random;

        connection.socket.broadcast.to(lobby.id).emit('disconnected', {
            id: connection.player.id
        });
        
        let chatMessage = new ChatMessage;
        chatMessage.username = 'Info';
        chatMessage.message = 'Your opponent disconnected.';
        chatMessage.messagetype = 4;
        chatMessage.reciever = '';
        connection.socket.broadcast.to(lobby.id).emit('broadcastchat', chatMessage);

        delete playerSide[connection];
        //delete playerSocket[lobby.id];
        chess.reset();
        random = 0;
        //console.log(chess.ascii());
        //KICK OTHER PLAYER OUT OF LOBBY AND TELL HIM HE WON TELL THE OTHER PERSON IF STILL CONNECTED THAT HE LOST
    }
}