import {ServerParagraph} from "./ServerParagraph";
import {User} from "./User";
import {PlayerState, TransferBook, VoteParagraph} from "../States";
import * as SocketIO from "socket.io";
import * as fs from "fs";


export class ServerBook {

    users = new Map<string, User>();
    waitingTime = 10 * 1000;
    winnerTime = 5 * 1000;
    title: string;
    timeoutWriting?: Date;
    timeoutVoting?: Date;
    winnerTimeout?: Date;
    lastWinner?: ServerParagraph;
    stories: ServerParagraph[] = [];
    submissions = new Map<User, ServerParagraph>();

    constructor(title: string) {
        this.title = title;
    }

    tick() {
        if(this.winnerTimeout < new Date()){
            console.log("Winner done");
            this.winnerTimeout = undefined;

            this.users.forEach((u) =>{
                this.sendUpdate(u)
            })
        }
        if(this.timeoutWriting < new Date()){
            console.log("Writer done");
            this.timeoutWriting = undefined;
            this.timeoutVoting = new Date(new Date().getTime() + this.waitingTime);
            this.users.forEach((u) =>{
                this.sendUpdate(u)
            })
        }



        if(this.timeoutVoting < new Date()){
            console.log("Voting done");
            this.timeoutVoting = undefined;
            let best: ServerParagraph[] = [];
            let score = -1;


            for(let match of this.submissions){
                let paragraph = match[1];
                let v = paragraph.votes.length;
                console.log("votes", paragraph.author.name, paragraph.text, v);
                if(v > score){
                    score = v;
                    best = [paragraph];
                } else if(v === score) {
                    best.push(paragraph);
                }
            }
            if(best.length === 0){
                console.error("No submissions found Strange");
            }else if(best.length === 1){
                this.addStory(best[0]);
            }else if(best.length > 1){
                let random = Math.floor(Math.random() * best.length);
                this.addStory(best[random]);
            }

            this.submissions = new Map<User, ServerParagraph>();

            this.winnerTimeout = new Date(new Date().getTime() + this.winnerTime);
            this.users.forEach((u) =>{
                this.sendUpdate(u)
            })

        }




    }

    addStory(serverParagraph: ServerParagraph) {
        let alternatives = [];
        for(let match of this.submissions){

            alternatives.push(match[1].toJson());
        }

        this.lastWinner = serverParagraph;
        let store = {
            bookName: this.title,
            paragraph: serverParagraph.toJson(),
            alternatives: alternatives
        };

        fs.appendFile('database.json', JSON.stringify(store) + "\n",() => {});

        this.stories.push(serverParagraph);
    }

    submitStory(user: User, serverParagraph: ServerParagraph) {
        serverParagraph.votes = [];
        this.submissions.set(user, serverParagraph);
        if(this.timeoutWriting === undefined && this.submissions.size > 2){
            this.timeoutWriting = new Date(new Date().getTime() + this.waitingTime);
        }


        if(this.timeoutWriting && this.submissions.size === this.getActiveUsersCount()) {
            this.timeoutWriting = new Date(new Date().getTime() -1);
        }



        this.users.forEach((u) =>{
            this.sendUpdate(u)
        })
    }

    sendUpdate(user: User): void {

        let authors: { [key: string]: number; } = {};
        let totalChars = 0;


        let authorString: string[] = [];
        for (let name in authors) {
            let percentage = Math.round(authors[name] / totalChars);
            authorString.push(
                `${name} (${percentage})`
            )
        }

        let timeout = 0;
        let state: PlayerState;
        let now = new Date();
        if (this.winnerTimeout > now) {
            state = PlayerState.WINNER;
            timeout =  this.winnerTimeout.getTime() - now.getTime()
        } else if (this.timeoutVoting > now) {
            state = PlayerState.VOTE;
            timeout =  this.timeoutVoting.getTime() - now.getTime()
        } else if (this.timeoutWriting > now) {
            state = PlayerState.WRITING;
            timeout =  this.timeoutWriting.getTime() - now.getTime()
        } else if (this.submissions.has(user)) {
            state = PlayerState.WAITING;
        } else {
            state = PlayerState.WRITING;
        }

        let votables: VoteParagraph[] = [];
        this.submissions.forEach(function (user, key){

            votables.push({
                index: user.author.name,
                text: user.text,

            })
        });

        let data: TransferBook = {
            story: this.stories.map((s) => s.toJson()),
            name: this.title,
            lastWinner: this.lastWinner?.toJson(),
            votables: votables,
            timeout: timeout,
            playerState: state,
            authors: authorString.join(", ")
        };

        user?.socket?.emit('update',data);

    }

    getActiveUsersCount():number {
        let count = 0;
        this.users.forEach((user) =>{
            if(user.socket.connected){
                count++;
            }

        } )

        return count;

    }

    makeVote(user: User, msg: VoteParagraph) {
        let votes = 0
        for(let s of this.submissions.entries()){
            let found = s[1].votes.indexOf(user);
            if(found !== -1){
                s[1].votes.splice(found,1)
            }
            if(msg.index === s[1].author.name){
                s[1].votes.push(user)
            }
            votes += s[1].votes.length;
        }
        console.log("votes", votes, this.users.size)
        if(votes === this.getActiveUsersCount()) {
            if (this.timeoutVoting) {
                this.timeoutVoting = new Date(new Date().getTime() - 1000);
            }
        }



    }
}