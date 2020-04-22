import * as SocketIO from "socket.io";

export class User {
    name: string;
    gameName: string;
    socket?: SocketIO.Socket;

    constructor(name: string, gameName: string) {
        this.name = name;
        this.gameName = gameName;
    }
}
