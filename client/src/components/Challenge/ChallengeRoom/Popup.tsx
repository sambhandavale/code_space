import React from "react";
// import { useNavigate } from "react-router";

interface IPopup{
    challengeEndMessage: {
        msg: string;
        ratingChange: number;
    }
    challengeEndCode:number;
    onCloseText:string;
    onClose:()=>void;
}

const Popup = ({
    challengeEndMessage,
    challengeEndCode,
    onCloseText,
    onClose,
}:IPopup) => {
    // const navigate = useNavigate();
    return (
        <div className="result_popup">
            <div className="popup glassmorphism-light">
                <div className="popup_status">
                    <img src={`/icons/challenge/${challengeEndCode === 10 || challengeEndCode === 30 ? 'won' : challengeEndCode === 40 ? 'draw_match' : 'lose'}.svg`} alt="" />
                    <div className="popup_text white ff-kanit-n">{challengeEndCode === 10 || challengeEndCode === 30 ? 'You Won!!' : challengeEndCode === 40 ? 'Draw' : 'Oh No!!'}</div>
                </div>
                <div className="popup_msg white ff-google-n">
                    {challengeEndMessage.msg.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                        {line}
                        <br />
                        </React.Fragment>
                    ))}
                </div>

                <div className="back tab gls-box glassmorphism-dark pointer white ff-google-n" onClick={onClose}>{onCloseText}</div>
            </div>
        </div>
    )
}

export default Popup;
