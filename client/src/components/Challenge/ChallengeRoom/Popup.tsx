import React from "react";
import { useNavigate } from "react-router";

interface IPopup{
    challengeEndMessage: {
        msg: string;
        ratingChange: number;
    }
}

const Popup = ({challengeEndMessage}:IPopup) => {
    const navigate = useNavigate();
  return (
    <div className="result_popup">
        <div className="popup glassmorphism-light">
            <div className="popup_status">
                <img src={`/icons/challenge/${challengeEndMessage.ratingChange > 0 ? 'won' : challengeEndMessage.msg.includes('Draw') ? 'draw_match' : 'lose'}.svg`} alt="" />
                <div className="popup_text white ff-kanit-n">{challengeEndMessage.ratingChange > 0 ? 'You Won!!' : challengeEndMessage.msg.includes('Draw') ? 'Draw' : 'Oh No!!'}</div>
            </div>
            <div className="popup_msg white ff-google-n">
                {challengeEndMessage.msg.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                    {line}
                    <br />
                    </React.Fragment>
                ))}
            </div>

            <div className="back tab gls-box glassmorphism-dark pointer white ff-google-n" onClick={()=>navigate('/')}>Back</div>
        </div>
    </div>
  )
}

export default Popup;
