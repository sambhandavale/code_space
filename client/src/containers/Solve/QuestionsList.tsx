import { useEffect, useState } from "react";
import { DifficultyBadge } from "../../components/Challenge/ChallengeRoom/Problem";
import { getAction } from "../../services/generalServices";
import { useNavigate } from "react-router";

export interface IQuestionSummary {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  noOfPings: number;
  noOfSubmits: number;
}

const QuestionsList = () => {
    const [questions, setQuestions] = useState<IQuestionSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const questionsPerPage = 9;

    const [selectedDifficulty, setSelectedDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All");

    // Apply filtering before pagination
    const filteredQuestions = selectedDifficulty === "All"
    ? questions
    : questions.filter((q) => q.difficulty === selectedDifficulty);

    const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
    const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
    );

    useEffect(() => {
        const getAllQuestions = async () => {
        try {
            const res = await getAction("/questions/questionList");
            if (res.status === 200) {
            setQuestions(res.data.questions);
            }
        } catch (err) {
            console.error("Error fetching questions:", err);
        } finally {
            setLoading(false);
        }
        };

        getAllQuestions();
    }, []);

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="question__list">
            <header className="question__header">
                <div className="header_text ff-kanit-n">Just Solve Them</div>
                <div className="difficulty__filters flex gap-4 mt-4">
                    {["All", "Easy", "Medium", "Hard"].map((level) => (
                    <button
                        key={level}
                        onClick={() => {
                        setSelectedDifficulty(level as typeof selectedDifficulty);
                        setCurrentPage(1); // reset to page 1 when filtering
                        }}
                        className={`filter-btn ff-google-n ${
                        selectedDifficulty === level ? "active" : ""
                        }`}
                    >
                        {level}
                    </button>
                    ))}
                </div>
            </header>


            <div className="all__list">
                {loading
                ? Array.from({ length: questionsPerPage }).map((_, index) => (
                    <QuestionSkeleton key={index} />
                    ))
                : paginatedQuestions.map((question) => (
                    <QuestionCard key={question.id} question={question} />
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
                <span className="ff-google-n white">
                    {currentPage} of {totalPages}
                </span>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="pagination-btn ff-google-n white"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

interface QuestionCardProps {
  question: IQuestionSummary;
}

const QuestionCard = ({ question }: QuestionCardProps) => {
  const navigate = useNavigate();
  const { title, description, difficulty, noOfPings, noOfSubmits } = question;

  return (
    <div
      className="question glassmorphism-medium pointer"
      onClick={() => navigate(`/solve/${question.id}`)}
    >
      <DifficultyBadge
        difficulty={difficulty}
        padding="0.5rem 0"
        fontcolor="white"
      />
      <div className="question__title ff-google-b">{title}</div>
      <div className="question__desc ff-google-n">
        {description.length > 40
          ? description.slice(0, 40) + "..."
          : description}
      </div>
      <div className="question__actions">
        <div className="question__solves ff-google-n">
          Solves {noOfSubmits}
        </div>
        <div className="question__pings flex gap-1 items-center">
          <img src="/icons/user/ping.svg" alt="" />
          <span style={{ opacity: "0.7" }}>{noOfPings}</span>
        </div>
      </div>
    </div>
  );
};

const QuestionSkeleton = () => {
  return (
    <div className="question glassmorphism-medium skeleton-box" style={{ padding: "1.25rem", borderRadius: "1.25rem" }}>
      <div style={{ height: "20px", width: "80px", marginBottom: "1rem" }} className="skeleton-box"></div>
      <div className="skeleton-box" style={{ height: "25px", width: "70%", marginBottom: "0.5rem" }}></div>
      <div className="skeleton-box" style={{ height: "18px", width: "90%", marginBottom: "1rem" }}></div>
      <div className="question__actions flex justify-between w-full">
        <div className="skeleton-box" style={{ height: "15px", width: "60px" }}></div>
        <div className="skeleton-box" style={{ height: "15px", width: "40px" }}></div>
      </div>
    </div>
  );
};

export default QuestionsList;
