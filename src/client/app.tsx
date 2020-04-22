import * as React from "react";
import * as ReactDOM from "react-dom";

import {Game, GameState} from "./Game";
import {ParagraphData} from "./StoryParagraph";

import * as io from "socket.io-client"
import {JoinGame, JoinScreen} from "./JoinScreen";
import {TransferParagraph, TransferBook, VoteParagraph} from "../States";


let socket =  io.connect("http://localhost:3000/");
socket.on("update", (data: TransferBook) => {
    console.log("got update", data);
    let update: GameState = {
        title: data.name,
        authors: data.authors,
        votables: data.votables,
        timeout: data.timeout,
        story: data.story.map((s:TransferParagraph) => {
            return {
                time: new Date(s.time),
                text: s.text,
                author: s.author
            }
        }),
        playerState: data.playerState,
        newParagraph: (data: string) => {
            socket.emit("newParagraph", data)
        },
        makeVote: (data: VoteParagraph) => {
            socket.emit("makeVote", data)
        }
    };
    if(data.lastWinner){
        update.lastWinner = {
            time: new Date(data.lastWinner.time),
            text: data.lastWinner.text,
            author: data.lastWinner.author
        }
    }


    ReactDOM.render(
        <Game state={update} />,
        document.getElementById("container")
    );
});


socket.on("disconnect", (data: any) => {
    console.error("connect_error", data);
    ReactDOM.render(
        <div>No connection</div>,
        document.getElementById("container")
    );
});
socket.on("connect_error", (data: any) => {
    console.error("connect_error", data);
});
socket.on("connect_timeout", (data: any) => {
    console.error("connect_timeout", data);
});

socket.on("reconnect_error", (data: any) => {
    console.error("reconnect_error", data);
});


function joinGame(game: JoinGame) {
    document.title = `Book: ${game.gameName}`;
    document.location.hash = game.gameName;
    sessionStorage.setItem("gameName", game.gameName);
    sessionStorage.setItem("playerName", game.playerName);
    socket.emit("join", game)
}

socket.on("connect", (data: any) => {
    ReactDOM.render(
        <JoinScreen callback={joinGame} />,
        document.getElementById("container")
    );
});

