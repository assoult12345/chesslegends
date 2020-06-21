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
            password: this.currentSettings.Password,
            database: this.currentSettings.Database
        });
    }

    Connect(callback){
        let pool = this.pool;
        pool.getConnection((error, connection) => {
            if (error) throw error;
            callback(connection);
        });
    }

    GetSampleData(callback){
        this.Connect(connection => {
            let query = "SELECT * FROM player";

            connection.query(query, (error, results) => {
                connection.release();
                if(error) throw error;
                callback(results);
            });
        });
    }

    GetSampleDataByUsername(username, callback){
        this.Connect(connection => {
            let query = "SELECT * FROM player WHERE username = ?";

            connection.query(query, [username], (error, results) => {
                connection.release();
                if(error) throw error;
                callback(results);
            });
        });
    }

    //ACCCOUNT QUERIES
    CreateAccount(login, username, password, callback){
        //need to check length and perform regex on this
        if(login.length < 3 || login.length > 11){
            callback({
                valid: false,
                reason: "login length does not match the parameters."
            });
            return;
        }

        if(username.length < 3 || username.length > 11){
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

                //MAKE FUNCTION FOR UNIQUE USERNAME HERE LATER
                
                //inset user into database
                query = "INSERT INTO player (login, username, password) VALUES (?, ?, ?)";
                connection.query(query, [login, username, hashedPassword], (error, results) => {
                    connection.release();
                    if(error) {
                        throw error
                    }

                    callback({
                        valid: true,
                        reason: "Registration Successful for user:" + login
                    });
                });
            });
        });
    }

    SignIn(login, password, callback){
        this.Connect(connection => {
            let query = "SELECT password, username, rating FROM player WHERE login = ?";

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
                            rating: results[0].rating
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
}