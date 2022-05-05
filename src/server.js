import http from "http";
import { WebSocketServer } from 'ws';
import express from "express";
import path from 'path';
const __dirname = path.resolve();

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");
app.use("/public", express.static(__dirname + "/src/public"));
app.get("/", (req,res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/"));
 

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const sockets = [];

 wss.on("connection", (socket) => {
   sockets.push(socket);
    console.log("Connected to Browser ✅");
    socket.on("close", () => console.log("Disconnected from the Browser ❌"));
    socket.on("message", (message) => {
      const messageString = message.toString('utf8');
      sockets.forEach(aSocket => aSocket.send(messageString));
      });
  }); 
 
server.listen(3000, handleListen);

