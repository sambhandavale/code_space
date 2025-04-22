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
import Editor from '@monaco-editor/react';
import { languages } from "../../utility/general-utility";
import Popup from "../../components/Challenge/ChallengeRoom/Popup";

interface ITestResult {
    actual: string | null;
    expected: string;
    input: string;
    status: string;
    test_case: number;
    // execution_time?: number; // in milliseconds
    // error_message?: string; // if status is ERROR
    // memory_usage?: number; // in KB
  }

const ChallengeRoom = () => {
    const { challengeId } = useParams<{ challengeId: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState(() => isAuth());
    const [socket, setSocket] = useState<Socket | null>(null);
    const [socketId, setSocketId] = useState<string | null | undefined>(null);
    const [challengeDetails,setChallengeDetails] = useState<IChallenge>()
    const [dividerPosition, setDividerPosition] = useState(50);
    const [timeLeft, setTimeLeft] = useState<number>(10);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const isDragging = useRef(false);

    const [code, setCode] = useState<string>("// Write your code here\n");
    const [language, setLanguage] = useState<string | undefined>("python");
    const [langIcon, setLangIcon] = useState<string>('');

    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [submitResult, setSubmitResult] = useState<ITestResult[]>([]);

    const [selectedTestCaseOption, setSelectedTestCaseOption] = useState<number>(0);

    const [challengeEnded, setChallengeEnded] = useState<boolean>(false);
    const [challengeEndMessage,setChallengeEndMessage] = useState<{msg:string,ratingChange:number}>({msg:'',ratingChange:0});

    const testCaseOptions = [
        {name:'Test Cases',icon:'test_case'},
        {name:'Test Run',icon:'test_run'},
    ]

    useEffect(() => {
        if (challengeDetails?.time) {
            setTimeLeft(challengeDetails.problem_id.time * 60);
        }
    }, [challengeDetails]);
    
    useEffect(() => {
        console.log(timeLeft);
        if (timeLeft <= 0) {
            console.log('timeup!');
            drawChallenge();
            return;
        }
    
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
    
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
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
                    const lang = languages.find((lang)=>lang.name === res.data.language);
                    setLanguage(lang?.monacoLang);
                    setLangIcon(`/icons/languages/${lang?.icon}.svg`);
                    setCode(res.data.problem_id.template.python);
                }
            } catch(err){
                console.error(err);
            }
        }

        getChallengeDetails();
    },[])

    const leaveChallenge = async () =>{
        try{
            let data = {challengeId:challengeId, userId:isAuth()._id,};
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

    const endChallenge = async () =>{
        try{
            const rating = challengeDetails?.problem_id.difficulty === 'Easy' ? 6 : challengeDetails?.problem_id.difficulty === 'Medium' ? 8 : 10;
            let data = {challengeId:challengeId, winnerId:isAuth()._id, ratingChanges : {"user1": rating, "user2": -rating}};
            const res = await postAction('/challenge/endChallenge', data);
            toast.message(res.data.message);
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
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            setChallengeEnded(true);
            toast.message(
                `${data.message} ${
                  data.ratingChange > 0
                    ? `Rating increased by ${data.ratingChange}`
                    : `Rating fell down by ${Math.abs(data.ratingChange)}`
                }`
              );
              if(data.message === 'The match ended in a draw! 🤝'){
                setChallengeEndMessage({msg:`You match is a Draw You Made a Successful Pact\nYou Gain +${data.ratingChange}`,ratingChange:data.ratingChange})   
              } else if(data.ratingChange > 0){
                setChallengeEndMessage({msg:`You got 5 out of 5 testcases right!!\nYou Gained +${data.ratingChange}`,ratingChange:data.ratingChange})   
              } else if(data.ratingChange < 0){
                setChallengeEndMessage({msg:`Opponent Got the Answer Right\nPassed all 5 Test Cases, You lost ${data.ratingChange} Rating`,ratingChange:data.ratingChange})
              } else{
                setChallengeEndMessage({msg:'',ratingChange:0})
              }       
            console.log(data);
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

    const handleSubmit = async () =>{
        try{
            setSubmitLoading(true);
            const data = {
                "user_code":code,
                "test_cases":challengeDetails?.problem_id.test_cases,
            }
            const res = await postAction('/challenge/submit-answer',data);
            if(res && res.data && res.data.results){
                const results = res.data.results
                setSubmitResult(results);
                setSubmitLoading(false);
                const allPassed = results.every((testCase:ITestResult) => testCase.status === "PASSED");
                if(allPassed){
                    endChallenge();
                }
                if(res.data.results[0].status === 'ERROR'){
                    toast.error(res.data.results[0].error);
                }
            }
        } catch(err){
            console.error(err);
        }
    }
    

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
                            <div className="chat pointer disable">
                                <img src="/icons/challenge/chat.svg" alt="" />
                                <div className="control_text ff-google-n">Chat</div>
                            </div>
                        </div>
                    </div>
                    <div className="code_editor">
                        <div className="code_editor__controls glassmorphism-dark">
                            <div className="code_editor__controls_left">
                                <img src={langIcon} alt="" />
                                <div className="editor_text ff-google-n white">Editor</div>
                            </div>
                            <div className="code_editor__controls_right">
                                <div className="editor_run">
                                    <div className="run_text ff-google-n white">Run</div>
                                    <img src="/icons/challenge/run.svg" alt="" />
                                </div>
                                <div className="editor_run pointer" onClick={handleSubmit}>
                                    <div className="run_text ff-google-n yellow">{submitLoading ? 'Loading...' : 'Submit'}</div>
                                </div>
                            </div>
                        </div>
                        <div className="main_editor">
                            <Editor
                                height="400px"
                                language={language}
                                value={code}
                                onChange={(value) => setCode(value || "")}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                }}
                            />
                        </div>
                    </div>
                    <div className="test_cases__section glassmorphism-dark">
                        <div className="test_cases__controls glassmorphism-dark">
                            {testCaseOptions.map((op,index)=>(
                                <div 
                                    className={`test_case_control pointer ${index===selectedTestCaseOption ? 'selected':''}`}
                                    onClick={()=>setSelectedTestCaseOption(index)}
                                >
                                    <img src={`/icons/challenge/${op.icon}.svg`} alt="" />
                                    <div className="control_text ff-google-n white">{op.name}</div>
                                </div>
                            ))}
                        </div>
                        <div className="test_cases">
                        {challengeDetails?.problem_id.test_cases.slice(0, 3).map((testCase, index) => (
                            <div
                                key={index}
                                className={`test_case glassmorphism-medium ${
                                    submitResult?.length > 0 && submitResult[index]?.status === 'FAILED'
                                        ? 'wrong'
                                        : submitResult[index]?.status === 'PASSED'
                                        ? 'right'
                                        : ''
                                }`}
                            >
                                <div 
                                    className={`test_case_text ff-google-b ${
                                        submitResult?.length > 0 && submitResult[index]?.status === 'PASSED'
                                            ? 'black'
                                            : 'white'
                                    }`}
                                >
                                    Testcase {index + 1}
                                </div>
                                <div
                                    className={`test_case_text ff-google-n ${
                                        submitResult?.length > 0 && submitResult[index]?.status === 'PASSED'
                                            ? 'black'
                                            : 'white'
                                    }`}
                                >
                                    {testCase.input.includes('\n') &&
                                        testCase.input.split('\n').map((line, index) => (
                                            <div key={index}>{line}</div>
                                        ))}
                                    {!testCase.input.includes('\n') && <div key={index}>{testCase.input}</div>}
                                </div>
                                {submitResult?.length > 0 && (
                                    <div className="test_case_text ff-google-n white" style={{padding:"0.5rem",borderRadius:'0.5rem',background:"#171717"}}>
                                        Expected: {submitResult[index]?.expected}
                                    </div>
                                )}
                                {submitResult?.length > 0 && (
                                    <div className="test_case_text ff-google-n white" style={{padding:"0.5rem",borderRadius:'0.5rem',background:"#171717"}}>
                                        Your Output: {submitResult[index]?.actual}
                                    </div>
                                )}
                            </div>

                            ))}
                        </div>
                    </div>
                </div>
                {challengeEnded && (
                    <Popup
                        challengeEndMessage={challengeEndMessage}
                    />
                )}
            </div>
        </Layout>
    )
}

export default ChallengeRoom