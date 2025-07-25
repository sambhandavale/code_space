import { languages, timeControls } from "../../utility/general-utility";
import TimeControlTab from "./TimeControlTab";
import { isAuth } from "../../utility/helper";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import DescriptionPopup from "../Shared/DescriptionPopup";
import ChallengeFriendPopup from "./ChallengeFriendPopup";
import { AiOutlineClose } from "react-icons/ai";

interface IChallengeSection {
  controlsSelected: {
    language: string;
    time: number;
  };
  setControlsSelected: React.Dispatch< 
    React.SetStateAction<{
      language: string;
      time: number;
    }>
  >;
  joinMatchmaking:() => void;
  stopMatchmaking:() => void;
  message:string;
  roomCode: string;
  setRoomCode: React.Dispatch<React.SetStateAction<string>>;
  userCode:string;
  joinRoom:() => Promise<void>;
  createRoom:() => Promise<void>;
  ref:React.RefObject<HTMLDivElement | null>;
}

const ChallengeSection = ({
  controlsSelected,
  setControlsSelected,
  joinMatchmaking,
  stopMatchmaking,
  message,
  roomCode,
  setRoomCode,
  userCode,
  joinRoom,
  createRoom,
  ref,
}: IChallengeSection) => {
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showFriendPopup, setShowFriendPopup] = useState<boolean>(false);
  const [optionFriendPopup, setOptionFriendPopup] = useState<string>('create');

  const setLanguage = (language: string) => {
    setControlsSelected((prev) => ({
      ...prev,
      language,
    }));
  };

  const setTime = (time: number) => {
    setControlsSelected((prev) => ({
      ...prev,
      time,
    }));
  };

  const navigate = useNavigate()

  return (
    <div className="challenge-section" ref={ref}>
      <header style={{position:"relative"}}>
        <div className="title">Challenge</div>
        <img src="/icons/question.svg" alt="Help" className="pointer" onClick={() => setShowHelp(true)}/>
      </header>
      <DescriptionPopup
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          title="How Challenge Works"
        >
          <div style={{ lineHeight: "normal" }} className="ff-google-n">
            Choose your preferred programming language and time format to initiate a challenge.<br /><br />
            <span className="ff-google-b">Online Challenge:</span> You'll be matched with a random opponent for a live timed coding battle. Winning increases your rating.<br /><br />
            <span className="ff-google-b">Friend Challenge:</span> Create a challenge with your selected controls and share the challenge code. Your friend can join using the code without selecting controls.<br /><br />
            Click <span className="ff-google-b">"FIND CHALLENGE"</span> to get started!
          </div>
      </DescriptionPopup>
      {showFriendPopup && (
        <ChallengeFriendPopup
          messageTitle={'CHALLENGE A FRIEND'}
          messageDescription={'Share this code with your friend to start the challenge'}
          optionFriendPopup={optionFriendPopup}
          setOptionFriendPopup={setOptionFriendPopup}
          roomCode={roomCode} 
          setRoomCode={setRoomCode}
          userCode={userCode}
          joinRoom={joinRoom}
          createRoom={createRoom}
          onClose={()=>setShowFriendPopup(false)}
        />
      )}
      <div className="challenge-sec2">
        <div className="challenge-icon glassmorphism-medium">
          <img src="/assets/challenge/challenge-icon.svg" alt="Challenge Icon" />
        </div>
        <div className="controls">
          <div className="time_lang__controls">
            <div className="top">
              <div className="title">Select Language</div>
            </div>
            <div className="languages">
              {languages.map((lang) => (
                <div
                  className={`language glassmorphism-medium ${!lang.avail && 'locked'} gls-box pointer ${
                    lang.name === controlsSelected.language ? "selected" : ""
                  }`}
                  key={lang.name}
                  onClick={() => setLanguage(lang.name)}
                >
                  <img
                    src={`/icons/languages/${lang.icon}.svg`}
                    alt={lang.name}
                  />
                  <div className="name">{lang.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="time_lang__controls">
            <div className="top">
              <div className="title">Select Time</div>
              {/* <div className="to_leaderboard glassmorphism-medium">Leaderboard</div> */}
            </div>
            <div className="times">
              {timeControls.map((tcontrol) => (
                <TimeControlTab
                  key={tcontrol.name}
                  title={tcontrol.name}
                  userrating={tcontrol.time === 5 ? 'Easy' : tcontrol.time === 10 ? 'Medium' : 'Hard'}
                  onClick={() => setTime(tcontrol.time)}
                  isSelected={controlsSelected.time === tcontrol.time}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {isAuth() ? (
        <div className="challenge_buttons flex gap-4 items-center justify-center">
          <div className="challenge__bts ff-google-n">
              <div className="find_challenge glassmorphism-medium gls-box pointer" onClick={joinMatchmaking}>
                {message !== '' ? message : 'CHALLENGE ONLINE'}
                {
                  message !== '' && (
                    <button
                      className="cancel-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        stopMatchmaking();
                      }}
                      title="Cancel"
                    >
                      <AiOutlineClose size={14} />
                    </button>
                  )
                }
              </div>
          </div>
          <div className="challenge__bts ff-google-n">
            <div 
              className="find_challenge glassmorphism-medium gls-box pointer"
              onClick={()=>setShowFriendPopup(true)}
            >
              {'CHALLENGE FRIEND'}
            </div>
          </div>
        </div>
      ):(
        <div className="challenge_buttons flex gap-4 items-center justify-center">
          <div className="challenge__bts ff-google-n">
            <div 
              className="find_challenge glassmorphism-medium gls-box pointer"
              onClick={()=>navigate('/login')}
            >
              {'LOGIN TO CHALLENGE'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeSection;
