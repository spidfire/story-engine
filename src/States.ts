
export interface TransferParagraph {
    time: string;
    author: string;
    text: string;
}

export enum PlayerState {
    WRITING,
    WAITING,
    VOTE,
    WINNER

}


export interface VoteParagraph {
    index: string;
    text: string;
}


export interface TransferBook {
    story: TransferParagraph[],
    lastWinner?: TransferParagraph,
    playerState: PlayerState,
    votables: VoteParagraph[],
    name: string,
    timeout: number,
    authors: string
}

