import {TransferParagraph} from "../States";
import {User} from "./User";

export class ServerParagraph {
    time: Date;
    author: User;
    text: string;
    votes: User[] = [];


    constructor(time: Date, author: User, text: string) {
        this.time = time;
        this.author = author;
        this.text = text;
    }

    toJson(): TransferParagraph {
        return {
            time: this.time.toISOString(),
            author: this.author.name,
            text: this.text
        }
    }
}
