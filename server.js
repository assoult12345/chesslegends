//ws://127.0.0.1:52300/socket.io/?EIO=4&transport=websocket
//ws://chessservermaster.herokuapp.com:80/socket.io/?EIO=4&transport=websocket
//https://chessservermaster.herokuapp.com/

let io = require('socket.io')(process.env.PORT || 52300);
let ServerManager = require('./Classes/ServerManager');

//On Server Started
console.log('Server has started');

if(process.env.PORT == undefined){
    console.log('Local Server');
} else {
    console.log('Hosted Server');
}

let serverManager = new ServerManager(process.env.PORT == undefined);

io.on('connection', function(socket){
    let connection = serverManager.onConnected(socket, io);
    connection.createEvents();
    connection.socket.emit('register', {'id': connection.player.id});
});