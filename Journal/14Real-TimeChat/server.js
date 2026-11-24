
const express = require("express");
const http = require("http");
const socket = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.use(express.static(__dirname));

let users = [];

io.on("connection", function(client) {

    client.on("join", function(name) {

        users.push({
            id: client.id,
            name: name
        });

        io.emit("users", users);
    });

    client.on("sendMessage", function(message) {

        let user = users.find(u => u.id === client.id);

        if (user) {
            io.emit("receiveMessage", {
                name: user.name,
                message: message,
                time: new Date().toLocaleTimeString()
            });
        }
    });

    client.on("typing", function(name) {
        client.broadcast.emit("typing", name);
    });

    client.on("stopTyping", function() {
        client.broadcast.emit("stopTyping");
    });

    client.on("disconnect", function() {

        users = users.filter(u => u.id !== client.id);

        io.emit("users", users);
    });

});

server.listen(3000, function() {
    console.log("Server started at http://localhost:3000");
});
