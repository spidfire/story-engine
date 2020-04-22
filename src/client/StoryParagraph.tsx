import * as React from "react";


export interface ParagraphData {
    time: Date;
    author: string;
    text: string;
}

export const StoryParagraph = (props: {paragraph: ParagraphData}) => (
    <div className="row story">
        <div className="col-3">

            <div className="col">{props.paragraph.author}</div>
            <div className="col">{props.paragraph.time.toLocaleTimeString()}</div>
        </div>
        <div className="col-9">{props.paragraph.text}</div>
        <hr />
    </div>
);