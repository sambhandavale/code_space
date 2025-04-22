import Layout from "../../components/Layout/Layout";
import ChallengeSection from "../../components/Challenge/ChallengeSection";
import { useState, useEffect, useRef } from "react";
import { getSocket } from "../../hooks/Sockets";
import { isAuth } from "../../utility/helper";
import { Socket } from "socket.io-client";
import { useLocation, useNavigate } from "react-router";
import { postAction } from "../../services/generalServices";
import { toast } from "sonner";

const Home = () => {
    const challengeRef = useRef<HTMLDivElement | null>(null);
    const location = useLocation();

    const [user, setUser] = useState(() => isAuth());
    const [controlsSelected, setControlsSelected] = useState<{ language: string; time: number }>({ language: '', time: 0 });
    const [socket, setSocket] = useState<Socket | null>(null);
    const [socketId, setSocketId] = useState<string | null | undefined>(null);
    const [message, setMessage] = useState<string>('');
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
            // console.log(res);
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
                    />
                </div>
            </div>
        </Layout>
    );
};

export default Home;
