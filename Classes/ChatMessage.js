module.exports = class ChatMessage {
    constructor(username, message, type, reciever) {
        this.username = username;
        this.message = message;
        this.messagetype = type;
        this.reciever = reciever;
    }
}