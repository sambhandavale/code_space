import { AiOutlineClose } from "react-icons/ai";

interface IChallengeFriendPopup {
    messageTitle: string;
    messageDescription: string;
    optionFriendPopup: string;
    setOptionFriendPopup: React.Dispatch<React.SetStateAction<string>>;
    roomCode: string;
    setRoomCode: React.Dispatch<React.SetStateAction<string>>;
    userCode:string;
    joinRoom:() => Promise<void>;
    createRoom:() => Promise<void>;
    onClose:()=>void;
}

const ChallengeFriendPopup = ({
    messageTitle,
    messageDescription,
    optionFriendPopup,
    setOptionFriendPopup,
    roomCode,
    setRoomCode,
    userCode,
    joinRoom,
    createRoom,
    onClose,
}: IChallengeFriendPopup) => {
  // const navigate = useNavigate();

  return (
    <div className="result_popup">
      <div className="popup glassmorphism-light">
        <AiOutlineClose
            onClick={onClose}
            size={20}
            style={{
            position: "absolute",
            top: "2rem",
            right: "2rem",
            cursor: "pointer",
            color: "white",
            }}
        />
        <div className="popup_status">
          <img src={`/icons/challenge/draw_match.svg`} alt="" />
          <div className="pop_messages flex flex-col gap-2 items-center">
            <div className="popup_text white ff-kanit-n">{messageTitle}</div>
            <div className="popup_text_below white ff-google-n">
              {messageDescription}
            </div>
          </div>
        </div>

        {optionFriendPopup === "join" ? (
          <div className="code_area flex gap-2 items-center flex-col">
            <input
                name="code"
                type="text"
                placeholder="Enter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="codesection ff-kanit-n white bg-transparent border border-white px-4 py-2 rounded"
            />
            <div className="joinnow ff-kanit-n white pointer" onClick={joinRoom}>JOIN</div>
          </div>
        ) : (
          <div className="code_area flex gap-2">
            <div className="codesection ff-kanit-n white">{userCode}</div>
            <div className={`joinnow ff-kanit-n white pointer ${userCode ? 'locked' :''}`} onClick={userCode ? ()=>{} : createRoom}>GET CODE</div>
          </div>
        )}

        <div className="challenge_options pointer flex">
          <div
            className={`option create pointer white ff-kanit-n ${
              optionFriendPopup === "create" ? "selected" : ""
            }`}
            onClick={() => setOptionFriendPopup("create")}
          >
            CREATE
          </div>
          <div
            className={`option join white ff-kanit-n ${
              optionFriendPopup === "join" ? "selected" : ""
            }`}
            onClick={() => setOptionFriendPopup("join")}
          >
            JOIN
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeFriendPopup;
