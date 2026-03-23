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
import { getInitials, languages } from "../../utility/general-utility";
import Popup from "../../components/Challenge/ChallengeRoom/Popup";
import { useWindowWidth } from "../../utility/screen-utility";
import { useUser } from "../../context/UserContext";
import SecureEditor from "../../components/Challenge/TextEditor";
import NotFound from "../../components/Shared/NotFound";
import { TestCaseCard } from "../../components/Solve/TestCaseCard";
 
/*
Note: Message code meaning -
10: Got all right u---won,
11: Opponent got all answers right---lost,
30: Opponent left---won,
31: You left---lost,
40: Draw
*/

interface ITestResult {
    actual_output: string | null;
    output: string;
    input: string;
    status: string;
    test_case: number;
    // execution_time?: number; // in milliseconds
    // error_message?: string; // if status is ERROR
    // memory_usage?: number; // in KB
}

const pointsDifficulty:any = {
    "Easy":6,
    "Medium":8,
    "Hard":10
}

const ChallengeRoom = () => {
    const { challengeId } = useParams<{ challengeId: string }>();
    const navigate = useNavigate();
    const width = useWindowWidth();
    const isLiveRoute = location.pathname.includes("/challenge/live/");

    const [loading, setLoading] = useState<boolean>(true);
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
    const [langVersion, setLangVersion] = useState<string | undefined>('');
    const [langExtension, setLangExtension] = useState<string | undefined>('');

    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [submitResult, setSubmitResult] = useState<ITestResult[]>([]);

    const [runLoading, setRunLoading] = useState<boolean>(false);
    const [runResult, setRunResult] = useState<ITestResult[]>([]);

    const [selectedTestCaseOption, setSelectedTestCaseOption] = useState<number>(0);

    const [challengeEnded, setChallengeEnded] = useState<boolean>(false);
    const [challengeEndMessage,setChallengeEndMessage] = useState<{msg:string,ratingChange:number}>({msg:'',ratingChange:0});
    const [challengeEndCode, setChallengeEndCode] = useState<number>(0);

    const [resultPopup, setResultPopup] = useState<boolean>(false);
    const [drawPopup, setDrawPopup] = useState<boolean>(false);
    const [fullscreenEnabled, setFullscreenEnabled] = useState(false);

    const [userAllowed, setUserAllowed] = useState<boolean>(false);

    const [isWinner, setIsWinner] = useState<boolean>(false);
    const [userPoints, setUserPoints] = useState<Record<string, number>>({});

    const [correctLink, setCorrectLink] = useState<boolean>(false);

    const testCaseOptions = [
        {name:'Test Cases',icon:'test_case'},
        {name:'Test Run',icon:'test_run'},
    ]

    const escAttempts = useRef(0);

    const handleEnterFullscreen = () => {
        const elem = document.documentElement;

        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else if ((elem as any).webkitRequestFullscreen) {
            (elem as any).webkitRequestFullscreen();
        }

        setFullscreenEnabled(true); // mark that fullscreen has been enabled
        toast.message("Do not leave fullscreen or your points may be reduced!");
    };

    useEffect(() => {
        if (!isLiveRoute || challengeEnded) return;

        const elem = document.documentElement;

        // Function to enter fullscreen
        const enterFullscreen = () => {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if ((elem as any).webkitRequestFullscreen) {
                (elem as any).webkitRequestFullscreen();
            }
        };

        // Enter fullscreen initially
        enterFullscreen();

        // Handle user exiting fullscreen
        const onFullscreenChange = () => {
            if (!document.fullscreenElement) {
                escAttempts.current += 1;

                if (escAttempts.current < 2) {
                    alert(
                        `⚠️ You exited fullscreen! Attempt ${escAttempts.current} of 2. Screen will be restored.`
                    );
                    // Attempt to restore fullscreen (may fail if not user gesture)
                    setTimeout(() => {
                        enterFullscreen();
                    }, 0);
                } else {
                    alert("⚠️ You exited fullscreen multiple times! You will be redirected.");
                    leaveChallenge();
                    navigate("/");
                }

                // TODO: Make an API request to log cheating
            }
        };

        // Handle tab visibility changes
        const onVisibilityChange = () => {
            if (document.hidden && !challengeEnded) {
                alert("⚠️ You switched tabs! This attempt will be flagged.");
                // TODO: Make an API request to log cheating
            }
        };

        // Add event listeners
        document.addEventListener("fullscreenchange", onFullscreenChange);
        document.addEventListener("visibilitychange", onVisibilityChange);

        // Cleanup event listeners on unmount
        return () => {
            document.removeEventListener("fullscreenchange", onFullscreenChange);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [isLiveRoute, navigate, challengeEnded]);


    const { setUserRating } = useUser();

    const refreshRating = async (userId:string) => {
        try {
            const res = await getAction(`/users/rating/${userId}`);
            if (res && res.data) {
            setUserRating(res.data.rating);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchRemainingTime = async () => {
            try {
                const res = await getAction(`/challenge/status/${challengeId}`);
                if (res?.data?.data.remainingTime != null) {
                    setTimeLeft(Math.floor(res.data.data.remainingTime)); // seconds
                } else if (challengeDetails?.problem_id?.time) {
                    // Fallback in case API doesn't return remaining time
                    setTimeLeft(challengeDetails.problem_id.time * 60);
                }
            } catch (err) {
                console.error("Error fetching challenge status:", err);
                if (challengeDetails?.problem_id?.time) {
                    setTimeLeft(challengeDetails.problem_id.time * 60);
                }
            }
        };

        fetchRemainingTime();
    }, [challengeId, challengeDetails]);

    useEffect(() => {
        if (timeLeft <= 0) {
            console.log('timeup!');
            acceptDrawChallenge(true);
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    timerRef.current = null;
                    acceptDrawChallenge();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(()=>{
        const getChallengeDetails = async () =>{
            try{
                const res = await getAction(`/challenge/${challengeId}`);
                if(res && res.data && res.status===200){
                    if (res.data.players) {
                        const userId = isAuth()._id;
                        const isAllowed = res.data.active ? res.data.players.some((player: any) => player.user_id === userId) : true;
                        if(isLiveRoute){
                            setUserAllowed(isAllowed);
                        } else{
                            setUserAllowed(true);
                        }
                        if(!isAllowed && isLiveRoute){
                            setLoading(false);
                            return;
                        }
                    }
                    if(!res.data.active){
                        stopTimer();
                        setChallengeEnded(true);
                        navigate(`/challenge/${challengeId}`)
                    }
                    setChallengeDetails(res.data);
                    const lang = languages.find((lang)=>lang.name === res.data.language);
                    setLanguage(lang?.monacoLang);
                    setLangIcon(`/icons/languages/${lang?.icon}.svg`);
                    setLangExtension(lang?.extension);
                    if (res.data.status !== 'completed' || res.data.winner === null) {
                        if (lang?.monacoLang && res.data.problem_id.template[lang.monacoLang]) {
                            setCode(res.data.problem_id.template[lang.monacoLang]);
                        } else {
                            setCode("");
                        }
                    } else {
                        // Challenge is completed and has a winner
                        if (res.data.codes.length > 0) {
                            const winnerCode = res.data.codes.find((code:any) => code.user_id === res.data.winner)?.code;
                            if (winnerCode) {
                                setCode(winnerCode);
                            } else if (lang?.monacoLang && res.data.problem_id.template[lang.monacoLang]) {
                                // Fallback if winner's code not found
                                setCode(res.data.problem_id.template[lang.monacoLang]);
                            } else {
                                setCode("");
                            }
                        } else {
                            // No codes submitted, fallback to problem template
                            if (lang?.monacoLang && res.data.problem_id.template[lang.monacoLang]) {
                                setCode(res.data.problem_id.template[lang.monacoLang]);
                            } else {
                                setCode("");
                            }
                        }
                    }


                    setCorrectLink(true)
                    setLangVersion(lang?.version);
                    setLoading(false);
                }
            } catch(err){
                console.error(err);
            } finally{
                setLoading(false);
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

    const acceptDrawChallenge = async (timeup = false) => {
        try {
            setDrawPopup(false);
            let data = { challengeId: challengeId, userId: isAuth()._id };
            const url = timeup ? '/challenge/acceptDrawChallenge?timeup=true' : '/challenge/acceptDrawChallenge';

            const res = await postAction(url, data);
            toast.success(res.data.message);
        } catch (err) {
            console.error(err);
        }
    };

    const rejectDrawChallenge = async () =>{
        try{
            setDrawPopup(false);
            let data = {challengeId:challengeId, userId:isAuth()._id};
            const res = await postAction('/challenge/rejectDrawChallenge', data);
            toast.success(res.data.message);
        }catch(err){
            console.error(err);
        }
    }

    const askDrawChallenge = async () =>{
        try{
            let data = {challengeId:challengeId, userId:isAuth()._id};
            const res = await postAction('/challenge/askDrawChallenge', data);
            toast.success(res.data.message);
        }catch(err){
            console.error(err);
        }
    }

    const endChallenge = async (testcases:number) =>{
        try{
            const rating = challengeDetails?.problem_id.difficulty === 'Easy' ? 6 : challengeDetails?.problem_id.difficulty === 'Medium' ? 8 : 10;
            let data = {
                challengeId:challengeId, 
                winnerId:isAuth()._id, 
                ratingChanges : {"user1": rating, "user2": -rating},
                winnerCode : code,
                testcases: testcases,
            };
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

            if (document.fullscreenElement) {
                document.exitFullscreen?.().catch((err) =>
                    console.error("Error exiting fullscreen:", err)
                );
            }

            setChallengeEnded(true);
            setResultPopup(true);

            toast.message(
                `${data.message} ${
                    data.ratingChange > 0
                    ? `Rating increased by ${data.ratingChange}`
                    : `Rating fell down by ${Math.abs(data.ratingChange)}`
                }`
            );
            stopTimer();
            setChallengeEndCode(data.code);

            if(data.code === 40){
                setChallengeEndMessage({msg:`You match is a Draw\nYou Gain +${data.ratingChange}`,ratingChange:data.ratingChange})   
            } else if(data.code === 30){
                setChallengeEndMessage({msg:`Your opponent left the match! You win! 🎉\nYou Gained +${data.ratingChange}`,ratingChange:data.ratingChange})
            } else if(data.code === 31){
                setChallengeEndMessage({msg:`You left the match. Your opponent wins by default. \nYou Lost ${data.ratingChange}`,ratingChange:data.ratingChange})
            } else if(data.code === 10){
                setChallengeEndMessage({msg:`You got 5 out of 5 testcases right!!\nYou Gained +${data.ratingChange}`,ratingChange:data.ratingChange})   
            } else if(data.code === 11){
                setChallengeEndMessage({msg:`Opponent Got the Answer Right\nPassed all 5 Test Cases, You lost ${data.ratingChange} Rating`,ratingChange:data.ratingChange})
            } else{
                setChallengeEndMessage({msg:'',ratingChange:0})
            }
        });

        refreshRating(isAuth()._id)

        return () => {
            socket.off("match_result");
        };
    }, [socket, navigate]);

    useEffect(()=>{
        if(!socket) return;

        socket.on("ask_draw",(_)=>{
            setDrawPopup(true);
        })

        return () => {
          socket.off("ask_draw");
        };
    },[socket, navigate])

    useEffect(()=>{
        if(!socket) return;

        socket.on("reject_draw",(data)=>{
            toast.error(data.message);
        })

        return () => {
          socket.off("reject_draw");
        };
    },[socket, navigate])
    
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

    const handleSubmit = async () => {
        try {
            setSubmitLoading(true);
            setSelectedTestCaseOption(0);

            if (!challengeDetails?.problem_id?.test_cases) {
                toast.error("No test cases found.");
                setSubmitLoading(false);
                return;
            }

            const body = {
                user_code: code,
                test_cases: challengeDetails.problem_id.test_cases,
                language,
                version: langVersion,
                extension: langExtension,
            };

            const res = await postAction("/challenge/submit-code", body);

            if (!res || !res.data) {
                toast.error("No response from server.");
                setSubmitLoading(false);
                return;
            }

            const response = res.data;

            // Handle server-side compilation/runtime error from your backend
            if (response.status === "ERROR") {
                toast.error(response.message || "Submission failed.");
                setSubmitLoading(false);
                return;
            }

            // SUCCESS CASE
            const results = response.results;
            setSubmitResult(results);
            setSubmitLoading(false);

            const allPassed = results.every(
                (tc: ITestResult) => tc.status === "Accepted"
            );

            if (allPassed) {
                endChallenge(results.length);
            }

        } catch (err) {
            console.error(err);
            toast.error("Unexpected system error.");
            setSubmitLoading(false);
        }
    };

    
    const handleRun = async () => {
        try {
            setRunLoading(true);
            setSelectedTestCaseOption(1);

            if (!challengeDetails?.problem_id?.test_cases) {
                toast.error("No test cases found.");
                setRunLoading(false);
                return;
            }

            const lastTwo = challengeDetails.problem_id.test_cases.slice(-2);

            const body = {
                language,
                version: langVersion,
                extension: langExtension,
                user_code: code,
                test_cases: lastTwo,
            };

            const res = await postAction("/challenge/submit-code", body);

            if (!res || !res.data) {
                toast.error("No response from server.");
                setRunLoading(false);
                return;
            }

            const response = res.data;

            if (response.status === "ERROR") {
                toast.error(response.message || "Run failed.");
                setRunLoading(false);
                return;
            }

            const results = response.results;
            setRunResult(results);
            setRunLoading(false);

        } catch (err) {
            console.error(err);
            toast.error("Unexpected system error.");
            setRunLoading(false);
        }
    };


    if(!loading && !correctLink) return <NotFound/>

    return (
        <>
            {userAllowed ? (
                <div 
                    className="challenge-room"
                    ref={containerRef}
                    onMouseMove={handleMouseMove} 
                    onMouseUp={handleMouseUp} 
                    onMouseLeave={handleMouseUp}
                >
                    <div className="challenge-room__left panel scrollbar" style={width > 840 ?{ width: `${dividerPosition}%` }:{}}>
                        <div className="players__details">
                        {/* Player 0 */}
                        <div
                            className="player pointer"
                            onClick={() =>
                            navigate(`/profile/${challengeDetails?.playerDetails[0].user_id.username}`)
                            }
                        >
                            <DefaultProfile
                            initals={getInitials(
                                `${challengeDetails?.playerDetails[0].user_id.full_name}`
                            )}
                            />
                            <div className="playername left">
                            {`${challengeDetails?.playerDetails[0].user_id.username} ${
                                !challengeDetails?.active
                                ? challengeDetails?.winner
                                    ? challengeDetails?.winner ===
                                    challengeDetails?.playerDetails[0].user_id._id
                                    ? "(Winner)"
                                    : ""
                                    : "(Draw)"
                                : ""
                            }`}

                            <div className="playerrating">
                                Rating {challengeDetails?.playerDetails[0].rating}
                            </div>
                            </div>
                        </div>

                        {/* Player 1 */}
                        <div
                            className="player pointer"
                            onClick={() =>
                            navigate(`/profile/${challengeDetails?.playerDetails[1].user_id.username}`)
                            }
                        >
                            <div className="playername right">
                            {`${challengeDetails?.playerDetails[1].user_id.username} ${
                                !challengeDetails?.active
                                ? challengeDetails?.winner
                                    ? challengeDetails?.winner ===
                                    challengeDetails?.playerDetails[1].user_id._id
                                    ? "(Winner)"
                                    : ""
                                    : "(Draw)"
                                : ""
                            }`}

                            <div className="playerrating">
                                Rating {challengeDetails?.playerDetails[1].rating}
                            </div>
                            </div>
                            <DefaultProfile
                                initals={getInitials(
                                    `${challengeDetails?.playerDetails[1].user_id.full_name}`
                                )}
                            />
                        </div>
                        </div>
                        <Problem
                            problemDetails={challengeDetails?.problem_id}
                        />
                    </div>
                    <div className="divider" onMouseDown={handleMouseDown}></div>
                    <div className="challenge-room__right panel scrollbar">
                        <div className="challenge_controls">
                            <div className="challenge_controls__left">
                                <img className="clock" src="/icons/challenge/time.svg" alt="" />
                                <div className="time ff-google-n">{formatTime(timeLeft)}</div>
                            </div>
                            <div className="challenge_controls__right">
                                <div className="leave challenge_controls__actions pointer" onClick={leaveChallenge} style={challengeEnded || timeLeft === 0 ? {pointerEvents:"none"}:{}}>
                                    <div className="control_text ff-google-n">Leave</div>
                                </div>
                                <div className="draw challenge_controls__actions pointer" onClick={askDrawChallenge} style={challengeEnded || timeLeft === 0 ? {pointerEvents:"none"}:{}}>
                                    <img src="/icons/challenge/draw.svg" alt="" />
                                    <div className="control_text ff-google-n">Draw</div>
                                </div>
                                <div className="chat challenge_controls__actions pointer disable">
                                    <img src="/icons/challenge/chat.svg" alt="" />
                                    <div className="control_text ff-google-n">Chat</div>
                                </div>
                            </div>
                        </div>
                        <div className="code_editor">
                            <div className="code_editor__controls glassmorphism-dark">
                                <div className="code_editor__controls_left">
                                    <img src={langIcon} alt="" />
                                    <div className="editor_text ff-google-n white">Editor {challengeDetails?.codes && challengeDetails?.codes.length > 0 && challengeDetails?.winner !== null ? `(Winners Code)` :''}</div>
                                </div>
                                <div className="code_editor__controls_right">
                                    <div className="editor_run pointer" onClick={handleRun} style={challengeEnded || timeLeft === 0 ? {pointerEvents:"none"}:{}}>
                                        <div className="run_text ff-google-n white">{runLoading ? 'Running...' : 'Run'}</div>
                                        <img src="/icons/challenge/run.svg" alt="" />
                                    </div>
                                    <div className="editor_run pointer" onClick={handleSubmit} style={challengeEnded || timeLeft === 0 ? {pointerEvents:"none"}:{}}>
                                        <div className="run_text ff-google-n yellow">{submitLoading ? 'Submitting...' : 'Submit'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="main_editor">
                                {/* <Editor
                                    height="350px"
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
                                /> */}
                                <SecureEditor 
                                    language={language}
                                    code={code}
                                    setCode={setCode}
                                />
                            </div>
                        </div>
                        <div className="test_cases__section glassmorphism-dark">
                            {/* Controls Header */}
                            <div className="test_cases__controls glassmorphism-dark">
                                {testCaseOptions.map((op, index) => (
                                <div
                                    key={index}
                                    className={`test_case_control pointer ${index === selectedTestCaseOption ? 'selected' : ''}`}
                                    onClick={() => setSelectedTestCaseOption(index)}
                                >
                                    <img src={`/icons/challenge/${op.icon}.svg`} alt="" />
                                    <div className="control_text ff-google-n white">{op.name}</div>
                                </div>
                                ))}
                            </div>

                            <div className="test_cases">
                                {/* PASS COUNT HEADER (Only for Submit mode) */}
                                {selectedTestCaseOption === 0 && submitResult.length > 0 && (
                                <div className="testcase_result_count nn-google-n white mb-4">
                                    Passed: {submitResult.filter((t: any) => t.status === "Accepted").length} / {submitResult.length}
                                </div>
                                )}

                                {(() => {
                                    const isSubmitTab = selectedTestCaseOption === 0;
                                    
                                    // 1. Determine Global Loading State for this section
                                    const isSectionLoading = isSubmitTab ? submitLoading : runLoading;

                                    // 2. Select Cases
                                    const casesToRender = isSubmitTab 
                                        ? challengeDetails.problem_id?.test_cases.slice(0, 3) 
                                        : challengeDetails.problem_id?.test_cases.slice(-2);

                                    const currentResults = isSubmitTab ? submitResult : runResult;

                                    return casesToRender?.map((testCase: any, index: number) => {
                                        const res = currentResults?.[index]; 
                                        
                                        return (
                                            <TestCaseCard
                                                key={index}
                                                index={index}
                                                input={testCase.input}
                                                // Pass the loading state here
                                                isLoading={isSectionLoading} 
                                                
                                                status={res?.status} 
                                                expectedOutput={res?.output || testCase.output}
                                                actualOutput={res?.actual_output} 
                                            />
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>
                    {resultPopup && (
                        <Popup
                            message={challengeEndMessage.msg}
                            messageCode={challengeEndCode}
                            button1Text={'Back'}
                            onButton1Submit={() => setResultPopup(false)}
                        />
                    )}
                    {drawPopup && (
                        <Popup
                            message={'User Asking for a Draw'}
                            messageCode={40}
                            button1Text={'Accept'}
                            onButton1Submit={() => acceptDrawChallenge()}
                            button2Text={'Reject'}
                            onButton2Submit={() => rejectDrawChallenge()}
                        />
                    )}
                    {!fullscreenEnabled && userAllowed && !challengeEnded && escAttempts.current > 0 && (
                        <Popup
                            message={'Enter Fullscreen to Start Challenge'}
                            button1Text={'Full Screen'}
                            onButton1Submit={() => handleEnterFullscreen()}
                        />
                    )}

                </div>
            ):(
                !loading &&
                <Popup
                    message={'You are not allowed in this challenge!!'}
                    messageCode={11}
                    button1Text={'Exit'}
                    onButton1Submit={() => navigate('/')}
                />
            )}
        </>
    )
}

export default ChallengeRoom