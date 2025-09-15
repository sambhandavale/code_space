import { IProblem } from "../../../interfaces/interfaces";

interface IProblemProp {
  problemDetails: IProblem | undefined;
}

const Problem = ({ problemDetails }: IProblemProp) => {
  const isLoading = !problemDetails?.title;

  if (isLoading) return <ProblemSkeleton />;

  return (
    <div className="problem__about">
      <div className="problem__title__level">
        <div className="problem__title ff-google-b">{problemDetails.title}</div>
        <DifficultyBadge difficulty={problemDetails.difficulty} />
      </div>

      <div className="problem_desc_text ff-google-n">Problem Description</div>

      <div className="problem_info">
        <div className="problem_description">
          <div className="problem_description_text ff-google-n">{problemDetails.description}</div>
          <div className="problem_description_text ff-google-n">{problemDetails.task}</div>
        </div>

        <div className="problem_in_out">
          <div className="problem_in">
            <div className="problem_in_top">
              <img src="/icons/challenge/input-icon.svg" alt="" />
              <div className="output_text ff-google-b">Input</div>
            </div>
            <div className="problem_in_text ff-google-n">{problemDetails.input_format}</div>
          </div>
          <div className="problem_out">
            <div className="problem_out_top">
              <img src="/icons/challenge/output-icon.svg" alt="" />
              <div className="input_text ff-google-b">Out</div>
            </div>
            <div className="problem_out_text ff-google-n">{problemDetails.output_format}</div>
          </div>
        </div>

        {problemDetails.examples.map((example, index) => (
          <div className="problem_example" key={index}>
            <div className="problem_example_number ff-google-b">Example {index + 1}</div>
            <div className="problem_example_details">
              <div className={`problem_example_detail ff-google-n flex ${example.input.includes('\n') ? 'flex-col' : 'flex-row'} gap-1`}>
                <>Input:</>
                {example.input.includes('\n') ? (
                  example.input.split('\n').map((line, i) => <div key={i}>{line}</div>)
                ) : (
                  <div>{example.input}</div>
                )}
              </div>

              <div className={`problem_example_detail ff-google-n flex ${example.output.includes('\n') ? 'flex-col' : 'flex-row'} gap-1`}>
                <>Output:</>
                {example.output.includes('\n') ? (
                  example.output.split('\n').map((line, i) => <div key={i}>{line}</div>)
                ) : (
                  <div>{example.output}</div>
                )}
              </div>
              <div className="problem_example_detail ff-google-n">Explanation: {example.explanation}</div>
            </div>
          </div>
        ))}
        <div className="topics ff-google-n white">
          <span>Topics:</span>
          {problemDetails.tags.map((tag)=>(
            <div className="topic">{tag}</div>
          ))}
        </div>
      </div>
    </div>
  );
};


export const DifficultyBadge = ({ difficulty, padding = "0.5rem", backgroundcolor, fontcolor, }: any) => {
  const getCircles = () => {
    const baseStyle: React.CSSProperties = {
      padding,
      borderRadius:"0.5rem",
      ...(backgroundcolor && { backgroundColor: backgroundcolor }),
      ...(fontcolor && { color: fontcolor }),
    };

    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return (
          <div className="problem__level" style={baseStyle}>
            <div className="circle green"></div>
            <span className="difficulty-text">Easy</span>
          </div>
        );
      case 'medium':
        return (
          <div className="problem__level" style={baseStyle}>
            <div className="circle orange"></div>
            <div className="circle green"></div>
            <span className="difficulty-text">Medium</span>
          </div>
        );
      case 'hard':
        return (
          <div className="problem__level" style={baseStyle}>
            <div className="circle red"></div>
            <div className="circle orange"></div>
            <div className="circle green"></div>
            <span className="difficulty-text">Hard</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="problem__level ff-google-n difficulty-badge">
      {getCircles()}
    </div>
  );
};

const ProblemSkeleton = () => {
  return (
    <div className="problem__about">
      <div className="problem__title__level flex items-center gap-4">
        <div className="skeleton-box" style={{ width: "200px", height: "30px" }}></div>
        <div className="skeleton-box" style={{ width: "100px", height: "24px" }}></div>
      </div>

      <div className="skeleton-box" style={{ width: "150px", height: "20px", margin: "1rem 0" }}></div>

      <div className="problem_info">
        <div className="skeleton-box" style={{ width: "100%", height: "80px", marginBottom: "1rem" }}></div>
        <div className="skeleton-box" style={{ width: "100%", height: "60px", marginBottom: "2rem" }}></div>

        <div className="problem_in_out flex gap-4">
          <div className="skeleton-box" style={{ width: "48%", height: "60px" }}></div>
          <div className="skeleton-box" style={{ width: "48%", height: "60px" }}></div>
        </div>

        {[1, 2].map((i) => (
          <div className="problem_example_details" key={i} style={{ marginTop: "1rem" }}>
            <div className="skeleton-box" style={{ width: "100px", height: "18px", marginBottom: "0.5rem" }}></div>
            <div className="skeleton-box" style={{ width: "90%", height: "20px", marginBottom: "0.5rem" }}></div>
            <div className="skeleton-box" style={{ width: "70%", height: "20px" }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default Problem;
