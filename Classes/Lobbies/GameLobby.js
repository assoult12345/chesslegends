let LobbyBase = require('./LobbyBase');
let GameLobbySettings = require('./GameLobbySettings');
let Connection = require('../Connection');
let LobbyState = require('../Utility/LobbyState');

//CHESS
let Chess = require('chess.js').Chess;
let ChatMessage = require('../ChatMessage');
let Elo = require('arpad');
let RP = require('../Rankpoints');

module.exports = class GameLobby extends LobbyBase {
    constructor(id, settings = GameLobbySettings, database, gametype, friendchallenged){
        super(id);
        this.settings = settings;
        this.lobbyState = new LobbyState;
        this.database = database;
        this.gametype = gametype;
        this.friendchallenged = friendchallenged;

        //CHESS
        this.chess = new Chess;
        this.playerSide = [];
        this.sideToPlayer = [];
        this.playerRating = [];
        this.playerRank = [];
        this.turn = this.chess.turn();
        this.whitehp = 3000;
        this.blackhp = 3000;
        this.gametime = 0;
        this.updatehp = false;
        this.interval;
        this.random = 0;

        //ELO
        this.elo = new Elo;
        this.playerElo = [];
        this.P1Win =  new Number();
        this.P1Lost = new Number();
        this.P1Tied = new Number();
        this.P2Win = new Number();
        this.P2Lost = new Number();
        this.P2Tied = new Number();

        //RP
        this.rp = new RP;
        this.rpP1Win = new Number();
        this.rpP1Lost = new Number();
        this.rpP1Tied = new Number();
        this.rpP2Win = new Number();
        this.rpP2Lost = new Number();
        this.rpP2Tied = new Number();

        //Rank
        this.rpP1RankWin = new String();
        this.rpP1RankLost = new String();
        this.rpP1RankTied = new String();
        this.rpP2RankWin = new String();
        this.rpP2RankLost = new String();
        this.rpP2RankTied = new String();

        //remain
        this.remainP1Win = new Number();
        this.remainP1Lost = new Number();
        this.remainP1Tied = new Number();
        this.remainP2Win = new Number();
        this.remainP2Lost = new Number();
        this.remainP2Tied = new Number();

        //Visual
        this.newBadge = new Number();
    }

    canEnterLobby(connection = Connection, gametype){
        let lobby = this;
        let maxPlayerCount = lobby.settings.maxPlayers;
        let currentPlayerCount = lobby.connections.length;
        let gametypeactive = this.gametype;

        if(currentPlayerCount + 1 > maxPlayerCount || gametypeactive !== gametype){
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
            lobby.onSpawnAllPlayersIntoGame(connection.io);
            //this.gameactive = true;
        }

        let returnData = {
            state: lobby.lobbyState.currenState
        }

        ///socket.emit('loadGame');
        socket.emit('lobbyUpdate', returnData);
        socket.broadcast.to(lobby.id).emit('lobbyUpdate', returnData);

        //Handle spawning server objects
    }

    onLeaveLobby(connection = Connection){
        let lobby = this;
        let connections = this.connections;

        super.onLeaveLobby(connection);

        lobby.removePlayer(connection);

        //Handle unspawning server objects
    }

    onSpawnAllPlayersIntoGame(io){
        //general variables
        let lobby = this;
        let connections = this.connections;
        let playerSide = this.playerSide;
        let sideToPlayer = this.sideToPlayer;
        let playerRating = this.playerRating;
        let random = this.random;
        let updatehp = this.updatehp;

        //Elo variables
        let elo = this.elo;
        let playerElo = this.playerElo;
        let playerRank = this.playerRank;

        // //RP variables
        let rp = this.rp;

        connections.forEach(connection => {
            if(random === 0){
                playerSide[connection.player.username] = 'White';
                //console.log('assign playerside white: ' + playerSide[connection.player.username] + ' length ' + playerSide.length);
                sideToPlayer['w'] = connection;
                playerRating['w'] = connection.player.rating;
                playerRank['w'] = connection.player.rank;
                playerElo[0] = connection.player.mmr;
                //console.log(connection.player.id + ' got assigned White.');
                random = 1;
            } else {
                playerSide[connection.player.username] = 'Black';
                //console.log('assign playerside black: ' + playerSide[connection.player.username] + ' length ' + playerSide.length);
                sideToPlayer['b'] = connection;
                playerRating['b'] = connection.player.rating
                playerRank['b'] = connection.player.rank;
                playerElo[1] = connection.player.mmr;
                //update per second(1000 milliseconds)
                if(updatehp != true){ 
                    this.interval = setInterval(() => {
                        lobby.onUpdateHP(connection, io);
                    }, 200, 0);

                    updatehp = true;
                }
                //console.log(connection.player.id + ' got assigned Black.');

                //calculate elo gained or lost after game
                lobby.P1Win = elo.newRatingIfWon(playerElo[0], playerElo[1]);
                lobby.rpP1Win = rp.getTranslatedRating(lobby.P1Win);
                lobby.rpP1RankWin = rp.getTranslatedRank(lobby.rpP1Win);
                lobby.remainP1Win = rp.getRemainderRP(lobby.rpP1Win);
                // let log1 = lobby.remainP1Win - playerRating['w'];
                // console.log('p1winremain: ' + log1);

                lobby.P1Lost = elo.newRatingIfLost(playerElo[0], playerElo[1]);
                lobby.rpP1Lost = rp.getTranslatedRating(lobby.P1Lost);
                lobby.rpP1RankLost = rp.getTranslatedRank(lobby.rpP1Lost);
                lobby.remainP1Lost = rp.getRemainderRP(lobby.rpP1Lost);
                // let log2 = lobby.remainP1Lost - playerRating['w'];
                // console.log('p1lostremain: ' + log2);

                lobby.P1Tied = elo.newRatingIfTied(playerElo[0], playerElo[1]);
                lobby.rpP1Tied = rp.getTranslatedRating(lobby.P1Tied);
                lobby.rpP1RankTied = rp.getTranslatedRank(lobby.rpP1Tied);
                lobby.remainP1Tied = rp.getRemainderRP(lobby.rpP1Tied);
                // let log3 = lobby.remainP1Tied - playerRating['w'];
                // console.log('p1tiedremain: ' + log3);

                lobby.P2Win = elo.newRatingIfWon(playerElo[1], playerElo[0]);
                lobby.rpP2Win = rp.getTranslatedRating(lobby.P2Win);
                lobby.rpP2RankWin = rp.getTranslatedRank(lobby.rpP2Win);
                lobby.remainP2Win = rp.getRemainderRP(lobby.rpP2Win);
                // let log4 = lobby.remainP2Win - playerRating['b'];
                // console.log('p2winremain: ' + log4);

                lobby.P2Lost = elo.newRatingIfLost(playerElo[1], playerElo[0]);
                lobby.rpP2Lost = rp.getTranslatedRating(lobby.P2Lost);
                lobby.rpP2RankLost = rp.getTranslatedRank(lobby.rpP2Lost);
                lobby.remainP2Lost = rp.getRemainderRP(lobby.rpP2Lost);
                // let log5 = lobby.remainP2Lost - playerRating['b'];
                // console.log('p2lostremain: ' + log5);

                lobby.P2Tied = elo.newRatingIfTied(playerElo[1], playerElo[0]);
                lobby.rpP2Tied = rp.getTranslatedRating(lobby.P2Tied);
                lobby.rpP2RankTied = rp.getTranslatedRank(lobby.rpP2Tied);
                lobby.remainP2Tied = rp.getRemainderRP(lobby.rpP2Tied);
                // let log6 = lobby.remainP2Tied - playerRating['b'];
                // console.log('p2tiedremain: ' + log6);

                connections.forEach(connection => {
                    lobby.addPlayer(connection);
                });
            }
        });
    }

    addPlayer(connection = Connection){
        let lobby = this;
        let connections = lobby.connections;
        let socket = connection.socket;

        var returnData = {
            id: connection.player.id
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

    removePlayer(connection = Connection){
        let lobby = this;
        let playerSide = this.playerSide;
        //let playerSocket = this.playerSocket;
        let chess = this.chess;
        let random = this.random;
        let interval = this.interval;

        connection.socket.broadcast.to(lobby.id).emit('disconnected', {
            id: connection.player.id
        });
        
        let chatMessage = new ChatMessage;
        chatMessage.username = 'Info';
        chatMessage.message = 'Your opponent left the game.';
        chatMessage.messagetype = 4;
        chatMessage.reciever = '';
        connection.socket.broadcast.to(lobby.id).emit('broadcastchat', chatMessage);

        //delete playerSide[connection];
        //delete playerSocket[lobby.id];
        chess.reset();
        random = 0;
        clearInterval(interval);
        //console.log(chess.ascii());
        //KICK OTHER PLAYER OUT OF LOBBY AND TELL HIM HE WON TELL THE OTHER PERSON IF STILL CONNECTED THAT HE LOST
    }

    //GAME RELATED
    gameSetup(connection = Connection){
        let lobby = this;

        //start the game
        lobby.gameStart(connection);
    }

    gameStart(connection){
        let lobby = this;
        let database = this.database;
        let connections = this.connections;
        let matchdata = [];

        //players side they will be playing on
        let playerSide = this.playerSide;
        let side = playerSide[connection.player.username];

        //tell both clients that the game can start
        //send user data to users that display elo rank etc
        connections.forEach(con => {
            //console.log(con.player.username + ' assigning values. side: ' + playerSide[con.player.username]);
            if(playerSide[con.player.username] === 'White'){
                matchdata.push(con.player.username);
                matchdata.push(con.player.activepicture);
                matchdata.push(con.player.badge1);
                matchdata.push(con.player.badge2);
                matchdata.push(con.player.badge3);
                matchdata.push(con.player.rank);
                matchdata.push(con.player.premium);
            }

            if(playerSide[con.player.username] === 'Black'){
                matchdata.push(con.player.username);
                matchdata.push(con.player.activepicture);
                matchdata.push(con.player.badge1);
                matchdata.push(con.player.badge2);
                matchdata.push(con.player.badge3);
                matchdata.push(con.player.rank);
                matchdata.push(con.player.premium);
            }
        });

        // matchdata.forEach(element => {
        //     console.log(side + ' : ' + element);
        // })

        //send playerdata to client
        //connection.socket.emit('matchData', { matchdata: matchdata });
        connection.socket.emit('gameStartInit', { side: side, matchdata: matchdata });

        //send message to players chats telling them their side
        //Player1
        let chatMessage = new ChatMessage;
        chatMessage.username = 'System';
        chatMessage.message = 'Game Starts - You play as [ ' + side + ' ]';
        chatMessage.messagetype = 1;
        chatMessage.reciever = '';

        connection.socket.emit('broadcastchat', chatMessage);

        //PUT USERS MYSQL DATABASE 'gamesplayed' +1
        let dbid = connection.player.dbid;
        database.IncrementGamesPlayed(dbid, results => {
            if(results.valid){
                //update client profile
                database.ProfileData(dbid, results => {
                    //results will return true or false based on account existing alread or not
                    //console.log(results.valid + ': ' + results.reason);
                    if(results.valid){
                        //assign players username to current connection
                        connection.player.gamesplayed = results.gamesplayed;
                        
                        //console.log(results.username + ' played [ ' + results.gamesplayed + ' ] games');
                    }
                });
            }
        });
    }

    onUpdateHP(connection, io){
        let lobby = this;
        let interval = this.interval;
        let sideToPlayer = this.sideToPlayer;

        //console.log('update w:' + this.whitehp + ' b: ' + this.blackhp);

        let chatMessage = new ChatMessage;
        chatMessage.username = 'Info';
        chatMessage.messagetype = 4;
        chatMessage.reciever = '';

        if(this.turn == "w"){
            this.whitehp--;
        }
        else if(this.turn == "b"){
            this.blackhp--;
        }

        this.gametime++;

        if(this.whitehp < 0){
            //'w' lost on time
            this.whitehp = 0;
            lobby.onGameOver('time', 'b');
            chatMessage.message = sideToPlayer['b'].player.username + ' won on time.';
            io.to(lobby.id).emit('broadcastchat', chatMessage);
            clearInterval(interval);
        }

        if(this.blackhp < 0){
            //'b' lost on time
            this.blackhp = 0;
            lobby.onGameOver('time', 'w');
            chatMessage.message = sideToPlayer['w'].player.username + ' won on time.';
            io.to(lobby.id).emit('broadcastchat', chatMessage);
            clearInterval(interval);
        }
        
        connection.io.to(lobby.id).emit('updateHP', { blackhp: this.blackhp, whitehp: this.whitehp});

        //GAME OVER BECAUSE OF TIME LOGIC
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
        let connections = lobby.connections;
        //let turn = this.turn;

        //players side they play on
        let playerSide = this.playerSide;
        let side = playerSide[connection.player.username];
        let sideToPlayer = this.sideToPlayer;

        //the actual move on the client
        let fromField = chessMove.fromField;
        let toField = chessMove.toField;

        let sidevalue = '';
        console.log(this.turn + ' ' + playerSide[connection.player.username]);
        if(playerSide[connection.player.username] == 'White'){
            sidevalue = 'w';
        } else if (playerSide[connection.player.username] == 'Black'){
            sidevalue = 'b';
        }

        if(this.turn == sidevalue){
            //Move and Turn Information
            //turn = chess.turn();
            let moveInfo = chess.move({ from: fromField, to: toField });
            this.turn = chess.turn();

            //VALIDATE FROM WHICH SOCKET THE REQUEST IS COMING FROM AND IF IT MATCHES THE ONE WHOS MOVE IT IS
            
            //console.log('move ' + this.turn);
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

            let gameEndReason = '';

            //IF TURN IS DRAW
            if (chess.in_draw() === true ){
                // chatMessage.message = 'Game ended in a draw.';
                // io.to(lobby.id).emit('broadcastchat', chatMessage);
                gameEndReason = 'draw';
            }

            //IF TURN IS STALEMATE
            if (chess.in_stalemate() === true ){
                // chatMessage.message = 'Game ended in a stalemate.';
                // io.to(lobby.id).emit('broadcastchat', chatMessage);
                gameEndReason = 'stalemate';
            }

            //IF TURN IS CHECKMATE
            if(chess.in_checkmate() === true){
                // chatMessage.message = 'Checkmate.';
                // io.to(lobby.id).emit('broadcastchat', chatMessage);
                gameEndReason = 'checkmate';
            }

            let winner = '';
            //IF GAME IS OVER
            if (chess.game_over() === true ){
                if(this.turn === 'b'){ //White Won
                    chatMessage.message = 'Game ended in ' + gameEndReason + ' by ' + sideToPlayer['w'].player.username;
                    winner = 'w';
                } else { //Black Won
                    chatMessage.message = 'Game ended in ' + gameEndReason + ' by ' + sideToPlayer['b'].player.username;
                    winner = 'b';
                }
                io.to(lobby.id).emit('broadcastchat', chatMessage);
                
                lobby.onGameOver(gameEndReason, winner);
            }
            
            //IF IS IN CHECK
            if (chess.in_check() === true && chess.game_over() === false){
                //prepare messages
                if(this.turn == 'b'){ //White checked
                    chatMessage.message = sideToPlayer['w'].player.username + ' put ' + sideToPlayer['b'].player.username + ' in check.';
                } else { //black checked
                    chatMessage.message = sideToPlayer['b'].player.username + ' put ' + sideToPlayer['w'].player.username + ' in check.';
                }
                //chatMessageP2.message = 'Your opponent put you in check.';
                io.to(lobby.id).emit('broadcastchat', chatMessage);
            }
        } else {
            console.log('wrong player tried to make a move');
        }
    }

    playerSurrender(connection = Connection, io){
        let lobby = this;
        let playerSide = lobby.playerSide;
        let sideToPlayer = lobby.sideToPlayer;
        let win = new String();

        let chatMessage = new ChatMessage;
        chatMessage.username = 'Info';
        chatMessage.messagetype = 4;
        chatMessage.reciever = '';

        //console.log('playerside: ' + playerSide[connection.player.username]);
        if(playerSide[connection.player.username] === 'White'){
            //black wins
            win = 'b';
            chatMessage.message = sideToPlayer['w'].player.username + ' surrendered.';
        } else if(playerSide[connection.player.username] === 'Black'){
            //white wins
            win = 'w';
            chatMessage.message = sideToPlayer['b'].player.username + ' surrendered.';
        }

        io.to(lobby.id).emit('broadcastchat', chatMessage);
            //console.log('winner from surrender: ' + win + ' surr by ' + connection.player.username);
        lobby.onGameOver('surrender', win);
    }

    onGameOver(gameEndReason, winner){
        //IF gameEndReason = draw then winner is just whoever finished the game
        //console.log('Winner: ' + winner);
        //general variables
        let lobby = this;
        let connections = this.connections;
        let database = this.database;
        let playerSide = this.playerSide;
        let sideToPlayer = this.sideToPlayer;
        let playerRating = this.playerRating;
        let playerRank = this.playerRank;
        let bcurrency = new Number();
        let wcurrency = new Number();
        let draw = 'no';
        let randomwin = Math.floor(Math.random() * 16)+15;
        let randomlose = Math.floor(Math.random() * 3)+5;

        //Timestamp
        let doubleseconds = this.gametime * 2 / 10;
        if(doubleseconds > 6000){
            doubleseconds = 6000;
        }
        let date = new Date(0);
        date.setSeconds(Math.floor(doubleseconds));
        let timestamp = date.toISOString().substr(14, 5);

        //Elo variables
        let playerElo = this.playerElo;
        let P1Win = this.P1Win;
        let P1Lost = this.P1Lost;
        let P1Tied = this.P1Tied;
        let P2Win = this.P2Win;
        let P2Lost = this.P2Lost;
        let P2Tied = this.P2Tied;

        //RP variables
        let rpP1Win = this.rpP1Win;
        let rpP1Lost = this.rpP1Lost;
        let rpP1Tied = this.rpP1Tied;
        let rpP2Win = this.rpP2Win;
        let rpP2Lost = this.rpP2Lost;
        let rpP2Tied = this.rpP2Tied;

        //Rank variables
        let rpP1RankWin = this.rpP1RankWin;
        let rpP1RankLost = this.rpP1RankLost;
        let rpP1RankTied = this.rpP1RankTied;
        let rpP2RankWin = this.rpP2RankWin;
        let rpP2RankLost = this.rpP2RankLost;
        let rpP2RankTied = this.rpP2RankTied;

        //remain
        let remainP1Win = this.remainP1Win;
        let remainP1Lost = this.remainP1Lost;
        let remainP1Tied = this.remainP1Tied;
        let remainP2Win = this.remainP2Win;
        let remainP2Lost =  this.remainP2Lost;
        let remainP2Tied = this.remainP2Tied;

        //values to send
        let whiteRANK = new String();
        let whiteREMAIN = new Number();
        let whiteRPDIFF = new Number();
        let whitePROMO = new String();
        let whiteDEMO = new String();

        let blackRANK = new String;
        let blackREMAIN = new Number();
        let blackRPDIFF = new Number();
        let blackPROMO = new String();
        let blackDEMO = new String();

        let RANK = new String();
        let REMAIN = new Number();
        let RPDIFF = new Number();
        let PROMODEMO = new String();

        //Badges
        let rp = this.rp;
        let whiteBadge = new Number();
        let blackBadge = new Number();

        //match history
        let movehistory = this.chess.history();

        //GAMEOUTCOME IS gameEndReason (draw, stalemate, checkmate)
        if(this.gametype == 0){
        //DETERMINE WHICH VARIABLES TO CHANGE IN DATABASE AND CHANGE THEM
        if(winner === 'w' && draw === 'no'){
            //connection: sideToPlayer['w'] new mmr: P1Win new rank: rpP1RankWin new remain: remainP1Win
            //connection: sideToPlayer['b'] new mmr: P2Lost new rank: rpP2RankLost new remain: remainP2Lost

            //Insert Database Data
            wcurrency = sideToPlayer['w'].player.normalcurrency + randomwin;
            database.GameOverValues(sideToPlayer['w'].player.dbid, P1Win, rpP1RankWin, remainP1Win, wcurrency, results =>{ 
                if(results.valid){
                    // console.log(sideToPlayer['w'].player.username + ' Rating Updated.');
                }
            });

            //PUT USERS MYSQL DATABASE 'wins'' +1
            database.IncrementWins(sideToPlayer['w'].player.dbid, results => {
                if(results.valid){
                    //update client profile
                    database.ProfileData(sideToPlayer['w'].player.dbid, results => {
                        //results will return true or false based on account existing alread or not
                        //console.log(results.valid + ': ' + results.reason);
                        if(results.valid){
                            //assign players username to current connection
                            sideToPlayer['w'].player.wins = results.wins;
                            
                            //console.log(results.username + ' played [ ' + results.gamesplayed + ' ] games');
                        }
                    });
                }
            });
            
            whiteRANK = rpP1RankWin;
            whiteREMAIN = remainP1Win;
            whiteRPDIFF = remainP1Win - playerRating['w'];
            //console.log('whiterpdiff: '+whiteRPDIFF);
            if(whiteRANK !== playerRank['w']){
                //he got promoted
                whitePROMO = 'yes';
                //CHANGE BADGE IF ITS A FULL RANK
            }
            whiteBadge = rp.getNewBadge(whiteRANK);

            bcurrency = sideToPlayer['b'].player.normalcurrency + randomlose;
            database.GameOverValues(sideToPlayer['b'].player.dbid, P2Lost, rpP2RankLost, remainP2Lost, bcurrency, results =>{ 
                if(results.valid){
                    // console.log(sideToPlayer['b'].player.username + ' Rating Updated.');
                }
            });

            //PUT USERS MYSQL DATABASE 'losses' +1
            database.IncrementLosses(sideToPlayer['b'].player.dbid, results => {
                if(results.valid){
                    //update client profile
                    database.ProfileData(sideToPlayer['b'].player.dbid, results => {
                        //results will return true or false based on account existing alread or not
                        //console.log(results.valid + ': ' + results.reason);
                        if(results.valid){
                            //assign players username to current connection
                            sideToPlayer['b'].player.losses = results.losses;
                            
                            //console.log(results.username + ' played [ ' + results.gamesplayed + ' ] games');
                        }
                    });
                }
            });

            blackRANK = rpP2RankLost;
            blackREMAIN = remainP2Lost;
            blackRPDIFF = remainP2Lost - playerRating['b'];
            //console.log('blackrpdiff: '+blackRPDIFF);
            if(blackRANK !== playerRank['b']){
                //he got demoted
                blackDEMO = 'yes';
                //CHANGE BADGE IF ITS A FULL RANK
            }
            blackBadge = rp.getNewBadge(blackRANK);

        } else if(winner === 'b' && draw === 'no'){
            //connection: sideToPlayer['b'] new mmr: P2Win new rank: rpP2RankWin new remain: remainP2Win
            //connection: sideToPlayer['w'] new mmr: P1Lost new rank: rpP1RankLost new remain: remainP1Lost
            //console.log('black won');

            //Insert Database Data
            bcurrency = sideToPlayer['b'].player.normalcurrency + randomwin;
            database.GameOverValues(sideToPlayer['b'].player.dbid, P2Win, rpP2RankWin, remainP2Win, bcurrency, results =>{ 
                if(results.valid){
                    // console.log(sideToPlayer['b'].player.username + ' Rating Updated.');
                }
            });

            //PUT USERS MYSQL DATABASE 'wins'' +1
            database.IncrementWins(sideToPlayer['b'].player.dbid, results => {
                if(results.valid){
                    //update client profile
                    database.ProfileData(sideToPlayer['b'].player.dbid, results => {
                        //results will return true or false based on account existing alread or not
                        //console.log(results.valid + ': ' + results.reason);
                        if(results.valid){
                            //assign players username to current connection
                            sideToPlayer['b'].player.wins = results.wins;
                            
                            //console.log(results.username + ' played [ ' + results.gamesplayed + ' ] games');
                        }
                    });
                }
            });

            blackRANK = rpP2RankWin;
            blackREMAIN = remainP2Win;
            blackRPDIFF = remainP2Win - playerRating['b'];
            if(blackRANK !== playerRank['b']){
                //he got promoted
                blackPROMO = 'yes';
                //CHANGE BADGE IF ITS A FULL RANK
            }
            blackBadge = rp.getNewBadge(blackRANK);

            wcurrency = sideToPlayer['w'].player.normalcurrency + randomlose;
            database.GameOverValues(sideToPlayer['w'].player.dbid, P1Lost, rpP1RankLost, remainP1Lost, wcurrency, results =>{ 
                if(results.valid){
                    //console.log(sideToPlayer['w'].player.username + ' Rating Updated.');
                }
            });

            //PUT USERS MYSQL DATABASE 'losses' +1
            database.IncrementLosses(sideToPlayer['w'].player.dbid, results => {
                if(results.valid){
                    //update client profile
                    database.ProfileData(sideToPlayer['w'].player.dbid, results => {
                        //results will return true or false based on account existing alread or not
                        //console.log(results.valid + ': ' + results.reason);
                        if(results.valid){
                            //assign players username to current connection
                            sideToPlayer['w'].player.losses = results.losses;
                            
                            //console.log(results.username + ' played [ ' + results.gamesplayed + ' ] games');
                        }
                    });
                }
            });
            
            whiteRANK = rpP1RankLost;
            whiteREMAIN = remainP1Lost;
            whiteRPDIFF = remainP1Lost - playerRating['w'];
            if(whiteRANK !== playerRank['w']){
                //he got demoted
                whiteDEMO = 'yes';
                //CHANGE BADGE IF ITS A FULL RANK
            }
            whiteBadge = rp.getNewBadge(whiteRANK);
        }

        //KICK PLAYERS OUT OF LOBBY + CLOSE LOBBY + INITIATE THEIR UNLOAD LEVEL + ENDGAME SCREEN DEPENDING ON GAMEOUTCOME
        if(gameEndReason !== 'checkmate' && gameEndReason !== 'surrender' && gameEndReason !== 'time'){
            draw = 'yes';
            
            //Insert Database Data
            wcurrency = sideToPlayer['w'].player.normalcurrency + randomlose;
            database.GameOverValues(sideToPlayer['w'].player.dbid, P1Tied, rpP1RankTied, remainP1Tied, wcurrency, results =>{ 
                if(results.valid){
                    // console.log(sideToPlayer['w'].player.username + ' Rating Updated.');
                }
            });

            //PUT USERS MYSQL DATABASE 'losses' +1
            database.IncrementLosses(sideToPlayer['w'].player.dbid, results => {
                if(results.valid){
                    //update client profile
                    database.ProfileData(sideToPlayer['w'].player.dbid, results => {
                        //results will return true or false based on account existing alread or not
                        //console.log(results.valid + ': ' + results.reason);
                        if(results.valid){
                            //assign players username to current connection
                            sideToPlayer['w'].player.losses = results.losses;
                            
                            //console.log(results.username + ' played [ ' + results.gamesplayed + ' ] games');
                        }
                    });
                }
            });

            whiteRANK = rpP1RankTied;
            whiteREMAIN = remainP1Tied;
            whiteRPDIFF = remainP1Tied - playerRating['w'];
            if(whiteRANK !== playerRank['w'] && Math.sign(whiteRPDIFF) !== -1){
                //he got promoted
                whitePROMO = 'yes';
                //CHANGE BADGE IF ITS A FULL RANK
            } else if(whiteRANK !== playerRank['w'] && Math.sign(whiteRPDIFF) === -1){
                //he got demoted
                whiteDEMO = 'yes';
                //CHANGE BADGE IF ITS A FULL RANK
            }
            whiteBadge = rp.getNewBadge(whiteRANK);

            bcurrency = sideToPlayer['b'].player.normalcurrency + randomlose;
            database.GameOverValues(sideToPlayer['b'].player.dbid, P2Tied, rpP2RankTied, remainP2Tied, bcurrency, results =>{ 
                if(results.valid){
                    // console.log(sideToPlayer['b'].player.username + ' Rating Updated.');
                }
            });

            //PUT USERS MYSQL DATABASE 'losses' +1
            database.IncrementLosses(sideToPlayer['b'].player.dbid, results => {
                if(results.valid){
                    //update client profile
                    database.ProfileData(sideToPlayer['b'].player.dbid, results => {
                        //results will return true or false based on account existing alread or not
                        //console.log(results.valid + ': ' + results.reason);
                        if(results.valid){
                            //assign players username to current connection
                            sideToPlayer['b'].player.losses = results.losses;
                            
                            //console.log(results.username + ' played [ ' + results.gamesplayed + ' ] games');
                        }
                    });
                }
            });

            blackRANK = rpP2RankTied;
            blackREMAIN = remainP2Tied;
            blackRPDIFF = remainP2Tied - playerRating['b'];
            if(blackRANK !== playerRank['b'] && Math.sign(blackRPDIFF) !== -1){
                //he got promoted
                blackPROMO = 'yes';
            } else if(blackRANK !== playerRank['b'] && Math.sign(blackRPDIFF) === -1){
                //he got demoted
                blackDEMO = 'yes';
            }
            blackBadge = rp.getNewBadge(blackRANK);
        }
        }
        
        
        //console.log('w rpdifference: ' + whiteRPDIFF);
        //console.log('b rpdifference: ' + blackRPDIFF);
        
        connections.forEach(connection => {
            //determine if sideToPlayer[''] === connection and send remain based on that
            if(connection == sideToPlayer['w']){
                if(this.gametype == 0){
                //assign white player values to send
                RANK = whiteRANK;
                REMAIN = whiteREMAIN;
                RPDIFF = whiteRPDIFF;

                //console.log('wrpdiff1: '+RPDIFF);

                //CHECK FOR PROMOTION OR DEMOTION
                if(whitePROMO === 'yes'){
                    PROMODEMO = 'promo';
                } else if(whiteDEMO === 'yes'){
                    PROMODEMO = 'demo';
                } else {
                    PROMODEMO = '';
                }

                if(PROMODEMO === 'promo'){
                    RPDIFF += 100;
                } else if (PROMODEMO === 'demo'){
                    RPDIFF -= 100;
                }
                //console.log('wrpdiff2: '+RPDIFF);

                database.InsertNewBadge(connection.player.dbid, whiteBadge, results => {

                });
                
                database.InsertMatchHistory(sideToPlayer['w'].player.username, sideToPlayer['b'].player.username, whiteRANK, blackRANK, whiteREMAIN, blackREMAIN, sideToPlayer[winner].player.username, winner, movehistory, timestamp, results => {

                });
                }
            } else if(connection == sideToPlayer['b']){
                if(this.gametype == 0){
                //assign black player values to send
                RANK = blackRANK;
                REMAIN = blackREMAIN;
                RPDIFF = blackRPDIFF;
                //console.log('brpdiff1: '+RPDIFF);

                //CHECK FOR PROMOTION OR DEMOTION
                if(blackPROMO === 'yes'){
                    PROMODEMO = 'promo';
                } else if(blackDEMO === 'yes'){
                    PROMODEMO = 'demo';
                } else {
                    PROMODEMO = '';
                }

                if(PROMODEMO === 'promo'){
                    RPDIFF += 100;
                } else if (PROMODEMO === 'demo'){
                    RPDIFF -= 100;
                }
                //console.log('brpdiff2: '+RPDIFF);
                
                database.InsertNewBadge(connection.player.dbid, blackBadge, results => {
                    
                });
                
                database.InsertMatchHistory(sideToPlayer['b'].player.username, sideToPlayer['w'].player.username, blackRANK, whiteRANK, blackREMAIN, whiteREMAIN, sideToPlayer[winner].player.username, winner, movehistory, timestamp, results => {

                });
                }
            }
            //database.ConnectionTest();
            if(this.gametype == 0){
                connection.socket.emit('gameOver', { winner: winner, draw: draw, rank: RANK, remain: REMAIN, rpdiff: RPDIFF, promodemo: PROMODEMO, id: connection.player.id });
            } else {
                connection.socket.emit('normalGameOver', { winner: winner,draw: draw, id: connection.player.id });
            }
        });
    }
}