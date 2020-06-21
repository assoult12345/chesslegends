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
                //console.log(results.valid + ': ' + results.reason);
            });
        });

        socket.on('signIn', function(data) {
            serverManager.database.SignIn(data.login, data.password, results => {
                //results will return true or false based on account existing alread or not
                //console.log(results.valid + ': ' + results.reason);
                if(results.valid){
                    socket.emit('signIn');
                    //assign players username to current connection
                    connection.player.username = results.username;
                    connection.player.rating = results.rating;
                    serverManager.onLogin(connection);
                }
            });
        });

        socket.on('joinGame', function() {
            serverManager.onAttemptToJoinGame(connection);
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