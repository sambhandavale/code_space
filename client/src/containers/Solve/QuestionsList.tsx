import { useEffect, useState } from "react";
import { getAction } from "../../services/generalServices";
import QuestionCard from "../../components/Solve/QuestionCard";

export interface IQuestionSummary {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  noOfPings: number;
  noOfSubmits: number;
  tags:string[];
}

function formatLabel(text: string): string {
  return text
    .replace(/[_-]/g, " ")                      // Replace _ and - with space
    .split(" ")                                 // Split into words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each
    .join(" ");                                 // Join back to string
}


const QuestionsList = () => {
    const [questions, setQuestions] = useState<IQuestionSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const questionsPerPage = 9;

    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
    const [tags, setTags] = useState<{ name: string; count: number }[]>([]);
    const [selectedTag, setSelectedTag] = useState<string>("All");
    const [showAllTags, setShowAllTags] = useState(false);

    const filteredQuestions = questions.filter((q) => {
      const difficultyMatch =
        selectedDifficulty === "All" || q.difficulty === selectedDifficulty;

      const tagMatch =
        selectedTag === "All" || q.tags.includes(selectedTag);

      return difficultyMatch && tagMatch;
    });


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
              const questions = res.data.questions;
              const tagCountMap: Record<string, number> = {};

              questions.forEach((q: any) => {
                q.tags.forEach((tag: string) => {
                  tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
                });
              });

              const tagsWithCount = Object.entries(tagCountMap)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);

              setTags(tagsWithCount);
              setQuestions(questions);
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
                <div className="filters">
                  <div className="difficulty__filters">
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
                  {!loading && (
                    <div className="tag__filters-wrapper">
                      <div className={`tag__filters ${showAllTags ? "wrap" : ""}`}>
                        <button
                          className={`filter-btn ff-google-n ${selectedTag === "All" ? "active" : ""}`}
                          onClick={() => {
                            setSelectedTag("All");
                            setCurrentPage(1);
                          }}
                        >
                          All Tags
                        </button>

                        {tags.map((tag) => (
                          <button
                            key={tag.name}
                            className={`filter-btn ff-google-n ${selectedTag === tag.name ? "active" : ""}`}
                            onClick={() => {
                              setSelectedTag(tag.name);
                              setCurrentPage(1);
                            }}
                          >
                            {formatLabel(tag.name)} ({tag.count})
                          </button>
                        ))}
                      </div>

                      <div className="toggle-container">
                        <button
                          className="filter-btn ff-google-n toggle-btn"
                          onClick={() => setShowAllTags(!showAllTags)}
                        >
                          {showAllTags ? "Collapse" : "Expand"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
            </header>
            <div className="questions">
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
