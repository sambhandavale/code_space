import { useParams } from "react-router";
import { useEffect, useState, useRef } from "react";
import { getAction, patchAction, postAction } from "../../services/generalServices";
import { isAuth } from "../../utility/helper";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router";
import { IProblem } from "../../interfaces/interfaces";
import Problem from "../../components/Challenge/ChallengeRoom/Problem";
import { toast } from "sonner";
import Editor from '@monaco-editor/react';
import { languages } from "../../utility/general-utility";
import { useWindowWidth } from "../../utility/screen-utility";
import { AiOutlineClose } from "react-icons/ai";

interface ITestResult {
    actual: string | null;
    output: string;
    input: string;
    status: string;
    test_case: number;
    // execution_time?: number; // in milliseconds
    // error_message?: string; // if status is ERROR
    // memory_usage?: number; // in KB
  }

const SolveProblem = () => {
    const { problemId } = useParams<{ problemId: string }>();
    const navigate = useNavigate();
    const width = useWindowWidth();
    const [loading, setLoading] = useState<boolean>(true);

    const [user, setUser] = useState(() => isAuth());
    const [socket, setSocket] = useState<Socket | null>(null);
    const [socketId, setSocketId] = useState<string | null | undefined>(null);
    const [problemDetails,setProblemDetails] = useState<IProblem>()
    const [dividerPosition, setDividerPosition] = useState(50);

    const [showTimerModal, setShowTimerModal] = useState(false);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [selectedHours, setSelectedHours] = useState(0);
    const [selectedMinutes, setSelectedMinutes] = useState(10);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const prevTimeRef = useRef<number>(timeLeft);

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

    const [languageSelected, setLanguageSelected] = useState<string>('Python')

    const testCaseOptions = [
        {name:'Test Cases',icon:'test_case'},
        {name:'Test Run',icon:'test_run'},
    ]


    useEffect(() => {
        if (!isTimerRunning || timeLeft <= 0) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    timerRef.current = null;
                    setIsTimerRunning(false);
                    toast.info("⏰ Time's up mate!!");  // Show toast here
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current!);
    }, [isTimerRunning]);



    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsTimerRunning(false);
    };

    const startTimer = () => {
        if (timeLeft > 0) {
            setIsTimerRunning(true);
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
                const res = await getAction(`/questions/${problemId}`);
                if(res && res.data){
                    setProblemDetails(res.data[0]);
                    const lang = languages.find((lang)=>lang.name === languageSelected);
                    setLanguage(lang?.monacoLang);
                    setLangIcon(`/icons/languages/${lang?.icon}.svg`);
                    setLangExtension(lang?.extension);
                    if (lang?.monacoLang && res.data[0].template[lang.monacoLang]) {
                        setCode(res.data[0].template[lang.monacoLang]);
                    } else {
                        setCode("");
                    }
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

    useEffect(()=>{
        if(languageSelected !== ''){
            const lang = languages.find((lang)=>lang.name === languageSelected);
            setLanguage(lang?.monacoLang);
            setLangIcon(`/icons/languages/${lang?.icon}.svg`);
            setLangExtension(lang?.extension);
            if (lang?.monacoLang && problemDetails?.template[lang.monacoLang]) {
                setCode(problemDetails.template[lang.monacoLang]);
            } else {
                setCode("");
            }
            setLangVersion(lang?.version);
        }
    },[languageSelected])
    
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
            setSelectedTestCaseOption(0);
            const data = {
                "user_code":code,
                "test_cases":problemDetails?.test_cases,
                'language':language,
                'version':langVersion,
                'extension':langExtension
            }
            const res = await postAction('/challenge/submit-answer-new',data);
            if(res && res.data){
                const results = res.data
                setSubmitResult(results);
                setSubmitLoading(false);
                const allPassed = results.every((testCase:ITestResult) => testCase.status === "PASSED");
                if(allPassed){
                    stopTimer();
                    updateSubmit();
                }
                if(res.data.results[0].status === 'ERROR'){
                    toast.error(res.data.results[0].error);
                }
            }
        } catch(err){
            console.error(err);
        }
    }
    
    const handleRun = async () =>{
        try{
            setRunLoading(true);
            setSelectedTestCaseOption(1);
            const data = {
                "user_code":code,
                "test_cases":problemDetails?.test_cases.slice(-2),
                'language':language,
                'version':langVersion,
                'extension':langExtension
            }
            const res = await postAction('/challenge/submit-answer-new',data);
            if(res && res.data){
                const results = res.data
                setRunResult(results);
                setRunLoading(false);
                console.log(results);
                // const allPassed = results.every((testCase:ITestResult) => testCase.status === "PASSED");
                // if(allPassed){
                //     endChallenge();
                // }
                if(res.data.results[0].status === 'ERROR'){
                    toast.error(res.data.results[0].error);
                }
            }
        } catch(err){
            console.error(err);
        }
    }

    const updateSubmit = async () => {
        try {
            const response = await patchAction(`/questions/${problemId}/submit?userId=${isAuth()._id}`, {language:language});
            console.log(response)
        } catch (error) {
            console.error("Error updating submits:", error);
            throw error;
        }
    };

    return (
        <div 
            className="challenge-room"
            ref={containerRef}
            onMouseMove={handleMouseMove} 
            onMouseUp={handleMouseUp} 
            onMouseLeave={handleMouseUp}
        >
            <div className="challenge-room__left panel scrollbar" style={width > 840 ?{ width: `${dividerPosition}%` }:{}}>
                <Problem
                    problemDetails={problemDetails}
                />
            </div>
            <div className="divider" onMouseDown={handleMouseDown}></div>
            {loading ? (
                <ChallengeRoomSkeleton/>
            ):(
                <div className="challenge-room__right panel scrollbar">
                    <div className="challenge_controls">
                        <div className="challenge_controls__left">
                            <img src="/icons/challenge/time.svg" alt="" />
                            <div className="time ff-google-n">{formatTime(timeLeft)}</div>
                        </div>
                        <div className="challenge_controls__right">
                            <div className="challenge_controls__actions pointer" onClick={() => setShowTimerModal(!showTimerModal)}>
                                <img src="/icons/challenge/time-white.svg" alt="" />
                                <div className="control_text ff-google-n">Set Timer</div>
                                {showTimerModal && (
                                    <div 
                                        className="timer__modal glassmorphism-dark" 
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                            <div 
                                                onClick={() => setShowTimerModal(false)}
                                                style={{
                                                    position: "absolute",
                                                    top: "10px",
                                                    right: "12px",
                                                    cursor: "pointer",
                                                    zIndex: 10,
                                                    color: "white"
                                                }}
                                            >
                                                <AiOutlineClose size={16} />
                                            </div>
                                        <div className="modal__icon">
                                            <img src="/icons/challenge/stop-watch.svg" alt="timer" width="24" />
                                        </div>
                                        <div className="timer__inputs">
                                            <div className="timer__input">
                                                <input
                                                    type="number"
                                                    value={selectedHours}
                                                    className="ff-google-n no-spinner"
                                                    min={0}
                                                    max={23}
                                                    onChange={(e) => setSelectedHours(parseInt(e.target.value))}
                                                />
                                                <div className="timer__label">hr</div>
                                            </div>
                                            <div className="timer__input">
                                                <input
                                                    type="number"
                                                    className="ff-google-n no-spinner"
                                                    value={selectedMinutes}
                                                    min={0}
                                                    max={59}
                                                    onChange={(e) => setSelectedMinutes(parseInt(e.target.value))}
                                                />
                                                <div className="timer__label">min</div>
                                            </div>
                                        </div>
                                        <div className="modal__actions">
                                            <div 
                                                className="ff-google-n action_bt" 
                                                onClick={() => {
                                                    if (isTimerRunning) {
                                                        stopTimer();
                                                    } else {
                                                        startTimer();
                                                        setShowTimerModal(false);
                                                    }
                                                }}
                                                >
                                                {isTimerRunning ? "Stop" : timeLeft > 0 ? "Continue" : "Cancel"}
                                            </div>


                                            <div 
                                                className="ff-google-n action_bt" 
                                                onClick={() => {
                                                    const totalSeconds = selectedHours * 3600 + selectedMinutes * 60;
                                                    setTimeLeft(totalSeconds);
                                                    setIsTimerRunning(true);
                                                    setShowTimerModal(false);
                                                }}

                                            >
                                                Set
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="code_editor">
                        <div className="code_editor__controls glassmorphism-dark">
                            <div className="code_editor__controls_left">
                                <LanguageDropdown 
                                    languageSelected={languageSelected} 
                                    setLanguageSelected={setLanguageSelected} 
                                />
                            </div>
                            {isAuth() ? (
                                <div className="code_editor__controls_right">
                                    <div className="editor_run pointer" onClick={handleRun}>
                                        <div className="run_text ff-google-n white">{runLoading ? 'Running...' : 'Run'}</div>
                                        <img src="/icons/challenge/run.svg" alt="" />
                                    </div>
                                    <div className="editor_run pointer" onClick={handleSubmit}>
                                        <div className="run_text ff-google-n yellow">{submitLoading ? 'Submitting...' : 'Submit'}</div>
                                    </div>
                                </div>
                            ):(
                                <div className="code_editor__controls_right">
                                    <div className="editor_run pointer" onClick={()=>navigate('/login')}>
                                        <div className="run_text ff-google-n yellow">{'Login to Run'}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="main_editor">
                            <Editor
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
                            />
                        </div>
                    </div>
                    <div className="test_cases__section glassmorphism-dark">
                        <div className="test_cases__controls glassmorphism-dark">
                            {testCaseOptions.map((op,index)=>(
                                <div 
                                    key={index}
                                    className={`test_case_control pointer ${index===selectedTestCaseOption ? 'selected':''}`}
                                    onClick={()=>setSelectedTestCaseOption(index)}
                                >
                                    <img src={`/icons/challenge/${op.icon}.svg`} alt="" />
                                    <div className="control_text ff-google-n white">{op.name}</div>
                                </div>
                            ))}
                        </div>
                        {selectedTestCaseOption === 0 ? (
                            <div className="test_cases">
                                {
                                    submitResult.length > 0 && (
                                        <div className="testcase_result_count nn-google-n white">
                                            Test Cases Passed: { submitResult.filter((testCase: ITestResult) => testCase.status === "PASSED").length} / {submitResult.length}
                                        </div>

                                    )
                                }
                                {problemDetails?.test_cases.slice(0, 3).map((testCase, index) => (
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
                                                Expected: {submitResult[index]?.output}
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
                        ):(
                            <div className="test_cases">
                                {problemDetails?.test_cases.slice(-2).map((testCase, index) => (
                                    <div
                                        key={index}
                                        className={`test_case glassmorphism-medium ${
                                                runResult?.length > 0 ? runResult[index]?.status === 'PASSED'
                                                    ? 'right'
                                                    : 'wrong':''
                                            }`}
                                    >
                                        <div 
                                            className={`test_case_text ff-google-b ${
                                                runResult?.length > 0 && runResult[index]?.status === 'PASSED'
                                                    ? 'black'
                                                    : 'white'
                                            }`}
                                        >
                                            Testcase {index + 1}
                                        </div>
                                        <div
                                            className={`test_case_text ff-google-n ${
                                                runResult?.length > 0 && runResult[index]?.status === 'PASSED'
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
                                        {runResult?.length > 0 && (
                                            <div className="test_case_text ff-google-n white" style={{padding:"0.5rem",borderRadius:'0.5rem',background:"#171717"}}>
                                                Expected: {runResult[index]?.output}
                                            </div>
                                        )}
                                        {runResult?.length > 0 && (
                                            <div className="test_case_text ff-google-n white" style={{padding:"0.5rem",borderRadius:'0.5rem',background:"#171717"}}>
                                                Your Output: {runResult[index]?.actual}
                                            </div>
                                        )}
                                    </div>

                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

const LanguageDropdown = ({ languageSelected, setLanguageSelected }:any) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const availableLanguages = languages.filter((lang) => lang.avail === 1);
    const selected = availableLanguages.find((lang) => lang.name === languageSelected);

    useEffect(() => {
        const handleClickOutside = (event:any) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setOpen(false);
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
        <div className="dropdown-selected ff-google-n" onClick={() => setOpen(!open)}>
            <img src={`/icons/languages/${selected?.icon}.svg`} alt={selected?.name} />
            <span>{selected?.name}</span>
            <span className="arrow">&#9662;</span>
        </div>

        {open && (
            <div className="dropdown-options">
            {availableLanguages.map((lang) => (
                <div
                key={lang.name}
                className={`dropdown-option ff-google-n ${lang.name === languageSelected ? 'selected' : ''}`}
                onClick={() => {
                    setLanguageSelected(lang.name);
                    setOpen(false);
                }}
                >
                <img src={`/icons/languages/${lang.icon}.svg`} alt={lang.name} />
                <span>{lang.name}</span>
                </div>
            ))}
            </div>
        )}
        </div>
    );
};

const ChallengeRoomSkeleton = () => {
  return (
    <div className="challenge-room__right panel scrollbar">
      {/* Top bar */}
      <div className="challenge_controls">
        <div className="challenge_controls__left flex items-center gap-2">
          <div className="skeleton-box" style={{ width: "24px", height: "24px" }}></div>
          <div className="skeleton-box" style={{ width: "80px", height: "16px" }}></div>
        </div>
        <div className="challenge_controls__right">
          <div className="skeleton-box" style={{ width: "100px", height: "24px" }}></div>
        </div>
      </div>

      {/* Code editor */}
      <div className="code_editor">
        <div className="code_editor__controls glassmorphism-dark flex justify-between">
          <div className="code_editor__controls_left flex gap-2">
            <div className="skeleton-box" style={{ width: "24px", height: "24px" }}></div>
            <div className="skeleton-box" style={{ width: "60px", height: "16px" }}></div>
          </div>
          <div className="code_editor__controls_right flex gap-4">
            <div className="skeleton-box" style={{ width: "70px", height: "30px" }}></div>
            <div className="skeleton-box" style={{ width: "80px", height: "30px" }}></div>
          </div>
        </div>
        <div className="main_editor">
          <div className="skeleton-box" style={{ height: "350px", width: "100%", borderRadius: "0.5rem" }}></div>
        </div>
      </div>

      {/* Test case panel */}
      <div className="test_cases__section glassmorphism-dark">
        <div className="test_cases__controls flex gap-4 mb-4">
          {[1, 2].map((_, i) => (
            <div className="skeleton-box" style={{ width: "100px", height: "30px" }} key={i}></div>
          ))}
        </div>

        <div className="test_cases flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div className="glassmorphism-medium skeleton-box" style={{ height: "100px", borderRadius: "0.75rem" }} key={i}></div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default SolveProblem;