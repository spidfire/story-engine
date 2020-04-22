import * as React from "react";
import {ParagraphData, StoryParagraph} from "./StoryParagraph";
import {createRef, ReactNode, useEffect, useRef} from "react";
import {PlayerState, VoteParagraph} from "../States";

export interface GameState {
    title: string;
    authors: string;
    timeout: number;
    lastWinner?: ParagraphData;
    votables: VoteParagraph[];
    story: ParagraphData[];
    playerState: PlayerState;
    newParagraph: (data: string) => void;
    makeVote: (data: VoteParagraph) => void;
}

export class Game extends React.Component<{state: GameState}, {myText: string, myVote: string | undefined, timeout: number}> {
    private messagesEndRef = createRef<HTMLDivElement>();


    constructor(props: { state: GameState }, context: any) {
        super(props, context);
        this.state = {
            myText: "",
            timeout:0,
            myVote: undefined
        };
        this.updateText = this.updateText.bind(this);
        this.submit = this.submit.bind(this);
        this.makeVote = this.makeVote.bind(this);
        // this.scrollToBottom = this.scrollToBottom.bind(this);

    }

    componentDidMount(): void {
        this.scrollToBottom();
    }

    componentDidUpdate(prevProps: Readonly<{ state: GameState }>, prevState: Readonly<{ myText: string }>, snapshot?: any): void {
        this.scrollToBottom();
    }

    scrollToBottom = () => {
        this.messagesEndRef.current.scrollTop = this.messagesEndRef.current.scrollHeight;
    }


    updateText(event: React.FormEvent<HTMLTextAreaElement>){
        this.setState({
            myText: event.currentTarget.value
        })

    }
    submit(){
        if(this.state.myText.trim() === ""){
            alert("You must write something");
            return;
        }

        this.props.state.newParagraph(this.state.myText);
        this.setState({
            myText: "",
            myVote: undefined
        });

    }
    makeVote(vote: VoteParagraph){
        this.props.state.makeVote(vote);
        this.setState({
            myVote: vote.index
        });
    }

    render(): React.ReactElement {

        let currentInterface: ReactNode
        switch (this.props.state.playerState) {
            case PlayerState.WRITING:
                currentInterface = <><h2 className="chapter-title">Write next paragraph</h2>
                    Write your next part of the story.
                    <textarea className="form-control"
                              onKeyDown={(e) => e.keyCode === 13 ? this.submit() : ''}
                              onChange={this.updateText} value={this.state.myText}>
                                </textarea>
                    <button className="btn btn-outline-primary btn-block" onClick={this.submit}>
                        Submit for review
                    </button>
                </>;
                break;
            case PlayerState.VOTE:
                console.log(this.props.state.votables);
                currentInterface = <>
                    <h2 className="chapter-title">Vote</h2>
                    Vote for the best submission
                    {this.props.state.votables.map((vote, i) => {
                        if(this.state.myVote !== undefined){
                            if(this.state.myVote === vote.index){

                                return <button  className="btn btn-primary btn-block" disabled={true} key={i}>{vote.text}</button>
                            } else {

                                return <button  className="btn btn-outline-dark btn-block" disabled={true} key={i}>{vote.text}</button>
                            }
                        } else {
                            return <button onClick={() => this.makeVote(vote)} className="btn btn-primary btn-block" key={i}>{vote.text}</button>
                        }

                    })}
                </>;
                break;
            case PlayerState.WAITING:
                currentInterface = <>
                    <h2 className="chapter-title">Waiting</h2>
                    Waiting, we need atleast three people playing!

                </>;
                break;
            case PlayerState.WINNER:
                currentInterface = <><h2 className="chapter-title">Winner</h2>
                    And the winner is {this.props.state.lastWinner?.author || "dunno"}
                    <p>{this.props.state.lastWinner?.text || "dunno"}</p>
                </>;
                break;
            default:
                currentInterface = <>
                    Unknown state ??? WTF
                </>;

        }

        let timeout = <span></span>
        if(this.props.state.timeout > 0){
            timeout = <div>TIMEOUT : {this.props.state.timeout}</div>
        }


        return <section className="open-book">
            <header>
                <h1>{this.props.state.title}</h1>
                <h6>{this.props.state.authors}</h6>
            </header>
            <article>
                <div className="row">
                    <div className="col-md-6 col-xs-12 pastStory" ref={this.messagesEndRef}>

                        {timeout}
                        {this.props.state.story.map((s, i) =>
                            <StoryParagraph key={i} paragraph={s}/>)}
                    </div>
                    <div className="col-md-6 col-xs-12">
                        {currentInterface}
                    </div>
                </div>
            </article>
            <footer>
                <ol id="page-numbers">
                    <li>1</li>
                    <li>2</li>
                </ol>
            </footer>
        </section>



    }
}