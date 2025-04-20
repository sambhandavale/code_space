import Layout from "../../components/Layout/Layout"
import { useParams } from "react-router";
import { useEffect, useState, useRef } from "react";
import { getAction, postAction } from "../../services/generalServices";
import { isAuth } from "../../utility/helper";
import { Socket } from "socket.io-client";
import { getSocket } from "../../hooks/Sockets";
import { useNavigate } from "react-router";
import { IChallenge } from "../../interfaces/interfaces";
import DefaultProfile from "../../components/Layout/DefaultProfile";
import Problem from "../../components/Challenge/ChallengeRoom/Problem";
import { toast } from "sonner";

const ChallengeRoom = () => {
    const { challengeId } = useParams<{ challengeId: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState(() => isAuth());
    const [socket, setSocket] = useState<Socket | null>(null);
    const [socketId, setSocketId] = useState<string | null | undefined>(null);
    const [challengeDetails,setChallengeDetails] = useState<IChallenge>()
    const [dividerPosition, setDividerPosition] = useState(50);
    const [timeLeft, setTimeLeft] = useState<number>(1);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const isDragging = useRef(false);

    useEffect(() => {
        if (challengeDetails?.time) {
            setTimeLeft(200 * 60);
        }
    }, [challengeDetails]);
    
    useEffect(() => {
        if (timeLeft <= 0){
            drawChallenge();
            return
        };
    
        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
    
        return () => clearInterval(interval);
    }, [timeLeft]);

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    

    useEffect(()=>{
        const getChallengeDetails = async () =>{
            try{
                const res = await getAction(`/challenge/${challengeId}`);
                if(res && res.data){
                    setChallengeDetails(res.data);
                }
            } catch(err){
                console.error(err);
            }
        }

        getChallengeDetails();
    },[])

    const leaveChallenge = async () =>{
        try{
            let data = {challengeId:challengeId, userId:isAuth()._id};
            const res = await postAction('/challenge/leaveChallenge', data);
            toast.success(res.data.message);
        }catch(err){
            console.error(err);
        }
    }

    const drawChallenge = async () =>{
        try{
            let data = {challengeId:challengeId, userId:isAuth()._id};
            const res = await postAction('/challenge/drawChallenge', data);
            toast.success(res.data.message);
        }catch(err){
            console.error(err);
        }
    }

    useEffect(() => {
        if (user) {
            const newSocket = getSocket();
            setSocket(newSocket);

            newSocket.on("connect", () => {
                setSocketId(newSocket.id);
            });

            if (!newSocket.connected) {
                newSocket.connect();
            }
        }
    }, [user]);

    useEffect(() => {
        if (!socket) return;
    
        socket.on("match_result", (data) => {
          console.log("Match found:", data);
          navigate(`/`);
        });
    
        return () => {
          socket.off("matchResult");
        };
      }, [socket, navigate]);
    
    const handleMouseDown = () => {
        isDragging.current = true;
    };

    const handleMouseMove = (e:any) => {
        if (!isDragging.current || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        let newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        if (newPosition < 30) newPosition = 30;
        if (newPosition > 70) newPosition = 70;

        setDividerPosition(newPosition);
    };

    const handleMouseUp = () => {
    isDragging.current = false;
    };

    return (
        <Layout>
            <div 
                className="challenge-room"
                ref={containerRef}
                onMouseMove={handleMouseMove} 
                onMouseUp={handleMouseUp} 
                onMouseLeave={handleMouseUp}
            >
                <div className="challenge-room__left panel" style={{ width: `${dividerPosition}%` }}>
                    <div className="players__details">
                        <div className="player">
                            <DefaultProfile firstName={challengeDetails?.players[0].first_name}/>
                            <div className="playername">{`${challengeDetails?.players[0].first_name} ${challengeDetails?.players[0].last_name} (${challengeDetails?.playerDetails[0].rating})`}</div>
                        </div>
                        <div className="player">
                            <div className="playername">{`(${challengeDetails?.playerDetails[1].rating}) ${challengeDetails?.players[1].first_name} ${challengeDetails?.players[1].last_name}`}</div>
                            <DefaultProfile firstName={challengeDetails?.players[1].first_name}/>
                        </div>
                    </div>
                    <Problem
                        challengeDetails={challengeDetails}
                    />
                </div>
                <div className="divider" onMouseDown={handleMouseDown}></div>
                <div className="challenge-room__right panel">
                    <div className="challenge_controls">
                        <div className="challenge_controls__left">
                            <img src="/icons/challenge/time.svg" alt="" />
                            <div className="time ff-google-n">{formatTime(timeLeft)}</div>
                        </div>
                        <div className="challenge_controls__right">
                            <div className="leave pointer" onClick={leaveChallenge}>
                                <div className="control_text ff-google-n">Leave</div>
                            </div>
                            <div className="draw pointer" onClick={drawChallenge}>
                                <img src="/icons/challenge/draw.svg" alt="" />
                                <div className="control_text ff-google-n">Draw</div>
                            </div>
                            <div className="chat pointer">
                                <img src="/icons/challenge/chat.svg" alt="" />
                                <div className="control_text ff-google-n">Chat</div>
                            </div>
                        </div>
                    </div>
                    <div className="code_editor"></div>
                    <div className="test_cases"></div>
                </div>
            </div>
        </Layout>
    )
}

export default ChallengeRoom