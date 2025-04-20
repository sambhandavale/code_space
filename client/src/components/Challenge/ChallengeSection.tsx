import { languages } from "../../utility/general-utility";
import TimeControlTab from "./TimeControlTab";
import { isAuth } from "../../utility/helper";
import { useNavigate } from "react-router-dom";

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
  ref:React.RefObject<HTMLDivElement | null>;
}

const ChallengeSection = ({
  controlsSelected,
  setControlsSelected,
  joinMatchmaking,
  stopMatchmaking,
  message,
  ref,
}: IChallengeSection) => {

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
      <header>
        <div className="title">Challenge</div>
        <img src="/icons/question.svg" alt="Help" />
      </header>
      <div className="challenge-sec2">
        <div className="challenge-icon glassmorphism-medium">
          <img src="/assets/challenge/challenge-icon.svg" alt="Challenge Icon" />
        </div>
        {isAuth() ? (
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
                {[
                  { name: "Bullet", time: 5 },
                  { name: "Blitz", time: 10 },
                  { name: "Rapid", time: 20 },
                ].map((tcontrol) => (
                  <TimeControlTab
                    key={tcontrol.name}
                    title={tcontrol.name}
                    userrating={800}
                    onClick={() => setTime(tcontrol.time)}
                    isSelected={controlsSelected.time === tcontrol.time}
                  />
                ))}
              </div>
            </div>
          </div>
        ):(
          <div className="controls">
            <div className="controls_login">
              <div className="controls_login__text">Log In To Start <span className="neon-font-color">Challenging</span></div>
              <img src="/icons/multiple-user/multiple-user-yellow.svg" alt="" />
            </div>
            <div 
              className="controls_login__tab glassmorphism-medium gls-box pointer" 
              onClick={()=>navigate('/login')}
            >
              Log In
            </div>
          </div>
        )}
      </div>
      {isAuth() && (
        <div className="challenge__bts">
          <div 
            className="find_challenge glassmorphism-medium gls-box pointer"
            onClick={joinMatchmaking}
          >
            {message !== '' ? message : 'FIND CHALLENGE'}
          </div>
          {message && (
            <div 
              className="find_challenge glassmorphism-medium gls-box pointer"
              onClick={stopMatchmaking}
            >
              {'Cancel'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChallengeSection;
