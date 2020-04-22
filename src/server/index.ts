import * as express from "express";

import * as SocketIO from "socket.io";
import {Socket} from "socket.io";
import {JoinGame} from "../client/JoinScreen";
import {PlayerState, TransferBook, TransferParagraph, VoteParagraph} from "../States";
import * as fs from "fs";
import * as readline from "readline";
import {ParagraphData} from "../client/StoryParagraph";
import {ServerBook} from "./ServerBook";
import {ServerParagraph} from "./ServerParagraph";
import {User} from "./User";

let port = process.env.PORT || 3000;
const index = express();
index.set("port", port);

let http = require("http").Server(index);


let games = new Map<string, ServerBook>();


try {
    const readInterface = readline.createInterface({
        input: fs.createReadStream('database.json')
    });
    readInterface.on('line', function(line: string) {
        let json:any = JSON.parse(line);
        let gameName = json['bookName'];
        if(!games.has(gameName)){
            let book = new ServerBook(gameName);

            games.set(gameName, book);
        }

        let book = games.get(gameName);

        let serverParagraph = new ServerParagraph(
            new Date(json['paragraph']['time']),
            new User(json['paragraph']['author'], gameName),
            json['paragraph']['text']
        );

        book.stories.push(serverParagraph);

        console.log(json);

    });

} catch (err) {
    console.error(err);
}



function gameLoop(){
    for(let book of games.entries()){
        book[1].tick();
    }

    setTimeout(gameLoop, 1000);
}

gameLoop();


let io = require("socket.io")(http);

function sendUpdate(user: User) {
    if(!games.has(user.gameName)){
        let book = new ServerBook(user.gameName);

        games.set(user.gameName, book);
    }

    let book = games.get(user.gameName);
    book.users.set(user.name, user);
    book.sendUpdate(user)

}

io.on('connection', function (socket: Socket) {
    console.log("connected");
    socket.on('join', function (join: JoinGame) {
        let user = new User(join.playerName, join.gameName);

        user.socket = socket;
        sendUpdate(user);


        socket.on('newParagraph', function (msg: any) {

            let serverParagraph = new ServerParagraph(
                new Date(), user, msg
            );

            games.get(join.gameName).submitStory(user, serverParagraph);
            sendUpdate(user);
        });

        socket.on('makeVote', function (vote: VoteParagraph) {


            games.get(join.gameName).makeVote(user, vote);
            sendUpdate(user);
        });

    });
});


http.listen(port, function () {
    console.log('listening on *:' + port);
});