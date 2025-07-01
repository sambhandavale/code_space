import { useNavigate } from "react-router";
import { IQuestionSummary } from "../../containers/Solve/QuestionsList";
import { DifficultyBadge } from "../Challenge/ChallengeRoom/Problem";

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

export default QuestionCard;