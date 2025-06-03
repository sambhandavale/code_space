import { IChallenge } from "../../../interfaces/interfaces";

interface IProblem{
    challengeDetails:IChallenge | undefined;
}

const Problem = ({
    challengeDetails
}:IProblem) => {
  return (
    <div className="problem__about">
        <div className="problem__title__level">
            <div className="problem__title ff-google-b">{challengeDetails?.problem_id.title}</div>
            <div className="problem__level ff-google-n">{challengeDetails?.problem_id.difficulty}</div>
        </div>
        <div className="problem_desc_text ff-google-n">Problem Description</div>
        <div className="problem_info">
            <div className="problem_description">
                <div className="problem_description_text ff-google-n">{challengeDetails?.problem_id.description}</div>
                <div className="problem_description_text ff-google-n">{challengeDetails?.problem_id.task}</div>
            </div>
            <div className="problem_in_out">
                <div className="problem_in">
                    <div className="problem_in_top">
                        <img src="/icons/challenge/input-icon.svg" alt="" />
                        <div className="output_text ff-google-b">Input</div>
                    </div>
                    <div className="problem_in_text ff-google-n">{challengeDetails?.problem_id.input_format}</div>
                </div>
                <div className="problem_out">
                    <div className="problem_out_top">
                        <img src="/icons/challenge/output-icon.svg" alt="" />
                        <div className="input_text ff-google-b">Out</div>
                    </div>
                    <div className="problem_out_text ff-google-n">{challengeDetails?.problem_id.output_format}</div>
                </div>
            </div>
            {
                challengeDetails?.problem_id.examples.map((example,index)=>(
                    <div className="problem_example" key={index}>
                        <div className="problem_example_number ff-google-b">Example {index+1}</div>
                        <div className="problem_example_details">
                            <div className="problem_example_detail ff-google-n">Explaination: {example.explanation}</div>
                            <div className="problem_example_detail ff-google-n flex flex-col gap-1">
                                Input:        {example.input.includes('\n') &&
                                                example.input.split('\n').map((line, index) => (
                                                    <div key={index}>{line}</div>
                                                ))}
                            </div>
                            <div className="problem_example_detail ff-google-n flex flex-col gap-1">
                                Output: {example.output.includes('\n') &&
                                                example.output.split('\n').map((line, index) => (
                                                    <div key={index}>{line}</div>
                                                ))}
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    </div>
  )
}

export default Problem;
