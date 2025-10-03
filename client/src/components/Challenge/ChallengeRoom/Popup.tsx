import React from "react";
// import { useNavigate } from "react-router";

interface IPopup{
    message: string
    messageCode?:number;
    button1Text:string;
    onButton1Submit:()=>void;
    button2Text?:string;
    onButton2Submit?:()=>void;
}

const Popup = ({
    message,
    messageCode,
    button1Text,
    onButton1Submit,
    button2Text,
    onButton2Submit,
}:IPopup) => {
    // const navigate = useNavigate();
    return (
        <div className="result_popup">
            <div className="popup glassmorphism-light">
                {messageCode && (
                    <div className="popup_status">
                        <img src={`/icons/challenge/${messageCode === 10 || messageCode === 30 ? 'won' : messageCode === 40 ? 'draw_match' : 'lose'}.svg`} alt="" />
                        <div className="popup_text white ff-kanit-n">{messageCode === 10 || messageCode === 30 ? 'You Won!!' : messageCode === 40 ? 'Draw' : 'Oh No!!'}</div>
                    </div>
                )}
                <div className="popup_msg white ff-google-n">
                    {message.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                        {line}
                        <br />
                        </React.Fragment>
                    ))}
                </div>
                
                <div className="popup_buttons flex gap-2">
                    <div className="back tab gls-box glassmorphism-dark pointer white ff-google-n" onClick={onButton1Submit}>{button1Text}</div>
                    {button2Text && (
                        <div className="back tab gls-box glassmorphism-dark pointer white ff-google-n" onClick={onButton2Submit}>{button2Text}</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Popup;
