import * as React from "react";
import {ParagraphData, StoryParagraph} from "./StoryParagraph";
import {createRef, useEffect, useRef} from "react";
import {generateName} from "./RandomBookname";


export interface JoinGame {
    gameName: string,
    playerName: string
}


export interface JoinScreenProps {
    callback: (joinGame: JoinGame) => void
}


export class JoinScreen extends React.Component<JoinScreenProps, JoinGame> {

    constructor(props: JoinScreenProps, context: any) {
        super(props, context);
        let hash = "";
        if(window.location.hash) {
            hash = decodeURI(document.location.hash.substring(1));

        }
        let gameName = sessionStorage.getItem("gameName");
        let playerName = sessionStorage.getItem("playerName");

        this.state = {
            gameName: hash || gameName || generateName(),
            playerName: playerName || ""
        };
        this.updatePlayerName = this.updatePlayerName.bind(this);
        this.updateGameName = this.updateGameName.bind(this);
        this.submit = this.submit.bind(this);

    }


    updatePlayerName(event: React.FormEvent<HTMLInputElement>) {
        this.setState({
            playerName: event.currentTarget.value
        })
    }

    updateGameName(event: React.FormEvent<HTMLInputElement>) {
        this.setState({
            gameName: event.currentTarget.value
        })
    }

    submit() {
        if (this.state.gameName.trim() === "") {
            alert("You must select a game");
            return;
        }

        if (this.state.playerName.trim() === "") {
            alert("You must select your name");
            return;
        }
        this.props.callback(this.state);

    }

    render(): React.ReactElement {
        return <section className="open-book">
            <header>
                <h1>Story Engine</h1>
                <h6>By Djurre</h6>
            </header>
            <article>
                <div className="row">
                    <div className="col-md-6 col-xs-12">
                        <h2 className="chapter-title">Start your Journey</h2>
                        <div>
                            <label>
                                Book name:
                            </label>
                                <input className="form-control" value={this.state.gameName}
                                       onChange={this.updateGameName}/>
                        </div>

                        <div>

                            <label>
                                Author name:
                            </label>
                                <input className="form-control" value={this.state.playerName}
                                       onChange={this.updatePlayerName}/>
                        </div>
                        <button className="btn btn-outline-primary btn-block" onClick={this.submit} >
                            Enter your new World
                        </button>

                    </div>
                    <div className="col-md-6 col-xs-12">

                    </div>

                </div>
            </article>
        </section>


    }
}