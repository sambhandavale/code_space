import Layout from "../../components/Layout/Layout";
import ChallengeSection from "../../components/Challenge/ChallengeSection";
import { useState, useEffect, useRef } from "react";
import { getSocket } from "../../hooks/Sockets";
import { isAuth } from "../../utility/helper";
import { Socket } from "socket.io-client";
import { useLocation, useNavigate } from "react-router";
import { getAction, postAction } from "../../services/generalServices";
import { toast } from "sonner";
import { create } from "domain";

const Home = () => {
    const challengeRef = useRef<HTMLDivElement | null>(null);
    const location = useLocation();

    const [user, setUser] = useState(() => isAuth());
    const [controlsSelected, setControlsSelected] = useState<{ language: string; time: number }>({ language: '', time: 0 });
    const [socket, setSocket] = useState<Socket | null>(null);
    const [socketId, setSocketId] = useState<string | null | undefined>(null);
    const [message, setMessage] = useState<string>('');
    const [roomCode, setRoomCode] = useState("");
    const [userCode, setUserCode] = useState<string>('');
    const navigate = useNavigate();

    const scrollToChallenge = () => {
        challengeRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (location.state?.scrollToChallenge) {
            scrollToChallenge();

            navigate(location.pathname, { replace: true });
        }
    }, [location.state, location.pathname, navigate]);

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

    const joinMatchmaking = async () => {
        if (!socket) return;
        try{
            const data = {userId:isAuth()._id, language:controlsSelected.language, timeControl:controlsSelected.time}
            if(controlsSelected.language === '' || controlsSelected.time === 0 ){
                toast.error('Please Select the Challenge Controlls!!');
                return;
            }
            const res = await postAction('/challenge/joinMatchmaking',data)
            if(res.status === 400){
                navigate(`/challenge/live/${res.data.challengeId}`)
            }
            if(res && res.data){
                setMessage(res.data.message);
            }
        }catch(err){
            console.error(err);
        }
    };

    const stopMatchmaking = async () =>{
        try{
            const res = await postAction('/challenge/stopMatchmaking', {userId:isAuth()._id});
            if(res && res.data){
                setMessage('');

                if(res.status === 200){
                    setControlsSelected({ language: '', time: 0 })
                }
            }
        }catch(err){
            console.error(err);
        }
    }

    const createRoom = async () =>{
        try{
            const data = {
                userId:isAuth()._id, 
                language:controlsSelected.language, 
                timeControl:controlsSelected.time,
            }
            if(controlsSelected.language === '' || controlsSelected.time === 0 ){
                toast.error('Please Select the Challenge Controlls!!');
                return;
            }
            const res = await postAction('/challenge/create-private', data);
            if(res && res.data){
                if(res.status === 200){
                    setUserCode(res.data.roomCode);
                    checkRoomStatus(res.data.roomCode);
                }
            }
        }catch(err){
            console.error(err);
        }
    }

    const joinRoom = async () =>{
        try{
            const data = {
                userId:isAuth()._id, 
                roomCode:roomCode,
            }
            if(roomCode === '' ){
                toast.error('Please enter the code !!');
                return;
            }
            const res = await postAction('/challenge/join-private', data);
            if(res && res.data){
                if(res.status === 200){
                    navigate(`/challenge/live/${res.data.challengeId}`)
                }
            }
        }catch(err){
            console.error(err);
        }
    }

    const checkRoomStatus = async (roomCode: string) => {
        try {
            const res = await getAction(`/challenge/room-status/${roomCode}`);
            if (res && res.data) {
                if (res.data.status === "active") {
                    navigate(`/challenge/live/${res.data.challengeId}`);
                }else if(res.data.status === "stale"){
                    toast.error("Opponent failed to join.")
                    setUserCode('');
                } else {
                    setTimeout(() => checkRoomStatus(roomCode), 5000);
                }
            }
        } catch (err) {
            console.error(err);
            setTimeout(() => checkRoomStatus(roomCode), 5000);
        }
    };


    useEffect(() => {
        if (!socket) return;
    
        socket.on("match_found", (data) => {
          console.log("Match found:", data);
          navigate(`/challenge/live/${data.challengeId}`);
        });
    
        return () => {
          socket.off("matchFound");
        };
    }, [socket, navigate]);

    return (
        <Layout scrollToChallenge={scrollToChallenge}>
            <div className="home">
                <div className="home-content page-top-m page-bottom-m">
                    <div className="ls-headline">
                        <div className="headline">
                            <div className="headline-text">
                                <div className="tp-text">Step into the Arena</div>
                                <div className="btm-text">Let Your Code Speak!</div>
                            </div>
                            <div className="headline-text-minor">Challenge your friends</div>
                        </div>
                        <div className="main-tabs">
                            <div className="tab gls-box glassmorphism-dark pointer" onClick={() => scrollToChallenge()}>Challenge</div>
                            <div className="tab gls-box glassmorphism-dark pointer locked">Write</div>
                        </div>
                    </div>
                    <ChallengeSection 
                        ref={challengeRef}
                        controlsSelected={controlsSelected} 
                        setControlsSelected={setControlsSelected} 
                        joinMatchmaking={joinMatchmaking}
                        stopMatchmaking={stopMatchmaking}
                        message={message}
                        roomCode={roomCode} 
                        setRoomCode={setRoomCode}
                        userCode={userCode}
                        joinRoom={joinRoom}
                        createRoom={createRoom}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default Home;
