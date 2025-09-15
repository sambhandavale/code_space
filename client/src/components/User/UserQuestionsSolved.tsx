import { useState } from "react";
import { IProfileCardInfo, IUserQuestionsSolved } from "../../interfaces/UserInterfaces";
import { languages } from "../../utility/general-utility";
import { isAuth } from "../../utility/helper";
import { useWindowWidth } from "../../utility/screen-utility";
import { useNavigate } from "react-router";
import { DifficultyBadge } from "../Challenge/ChallengeRoom/Problem";

interface IUserQuestionsProps {
    questions: IUserQuestionsSolved[] | undefined;
    userInfo: IProfileCardInfo | undefined;
    loading: boolean;
}

const UserQuestionsSolved = ({ questions, userInfo, loading }: IUserQuestionsProps) => {
    const navigate = useNavigate();
    const itsMe = isAuth() ? userInfo?.username === isAuth().username : false;

    const questionsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = questions ? Math.ceil(questions.length / questionsPerPage) : 1;

    const paginatedQuestions = questions?.slice()
        .reverse()
        .slice((currentPage - 1) * questionsPerPage, currentPage * questionsPerPage);

    const handlePrevious = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

    return (
        <div className="questions-container">
            {!loading && (
                <header>
                    <div className="header-text ff-google-n white">{itsMe ? 'Your' : `${userInfo?.username}'s`} Solves.</div>
                </header>
            )}

            {loading ? (
                <QuestionsSkeleton />
            ) : questions?.length === 0 ? (
                <div className="ff-google-n white no-questions">No Questions Solved yet.</div>
            ) : (
                <>
                    <div className="all-questions scrollbar">
                        {paginatedQuestions?.map((q, index) => (
                            <div className={`question-card pointer`} key={index} onClick={() => navigate(`/solve/${q.question._id}`)}>
                                <div className={`question-details ${index%2==0 ? 'bg':''}`}>
                                    <div className="question-info">
                                        <div className="question-title ff-google-n white">{index+1}. {q.question.title}</div>
                                    </div>
                                    <div className="question-meta difficulty-badge-wrapper"> 
                                        <DifficultyBadge
                                            backgroundcolor={index==0 ? '#222222ff' : '#f3f3f3ff'}
                                            difficulty={q.question.difficulty}
                                            padding="0.5rem 1rem"
                                            fontcolor={index==0? "#f3f3f3ff": '#222222ff'}
                                        />
                                    </div>
                                    <div className="question-meta">
                                        <div className="lang ff-google-n white flex items-center gap-2">
                                            {q.language.slice(0, 3).map((lang, idx) => (
                                                <img key={idx} src={`/icons/languages/${languages.find((l)=>l.pistonLang == lang)?.icon}.svg`} alt={lang} />
                                            ))}
                                            {q.language.length > 3 && <span className="white">...</span>}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pagination-controls flex justify-center gap-4">
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="pagination-btn ff-google-n white"
                        >
                            Previous
                        </button>
                        <span className="ff-google-n white">{currentPage} of {totalPages}</span>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="pagination-btn ff-google-n white"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const QuestionsSkeleton = () => {
    return (
        <div className="all-questions scrollbar">
            {Array.from({ length: 4 }).map((_, index) => (
                <div className="question-card" key={index}>
                    <div className="question-details">
                        <div className="skeleton-box" style={{ width: "80px", height: "15px", marginBottom: "8px" }}></div>
                        <div className="skeleton-box" style={{ width: "80px", height: "15px" }}></div>
                        <div className="skeleton-box" style={{ width: "40px", height: "40px", borderRadius: "5px" }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserQuestionsSolved;
