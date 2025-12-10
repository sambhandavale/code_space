import React from 'react';

interface TestCaseCardProps {
  index: number;
  input: string;
  expectedOutput?: string;
  actualOutput?: string;
  status?: string;
  isRunMode?: boolean;
  isLoading?: boolean; // New Prop
}

export const TestCaseCard: React.FC<TestCaseCardProps> = ({ 
  index, input, expectedOutput, actualOutput, status, isLoading 
}) => {
  
  // 1. Loading State Render
  if (isLoading) {
    return (
      <div className="test_case glassmorphism-medium skeleton_card">
        {/* Simulating "Testcase X" */}
        <div className="skeleton_loader skeleton_title"></div>
        
        {/* Simulating Input Lines */}
        <div className="skeleton_loader skeleton_body"></div>
        <div className="skeleton_loader skeleton_body"></div>
      </div>
    );
  }

  // 2. Normal Render Logic
  const getStatusClass = () => {
    if (!status) return "";
    return status === "PASSED" || status === "Accepted" ? "right" : "wrong";
  };

  const getTextClass = () => {
    if (!status) return "white";
    return status === "PASSED" || status === "Accepted" ? "black" : "white";
  };

  return (
    <div className={`test_case glassmorphism-medium ${getStatusClass()}`}>
      {/* Header */}
      <div className={`test_case_text ff-google-b ${getTextClass()}`}>
        Testcase {index + 1}
      </div>

      {/* Input Display */}
      <div className={`test_case_text ff-google-n ${getTextClass()}`}>
        {input.split('\n').map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {/* Results Display */}
      {status && (
        <div className="test_case_results">
           <div className="result_box test_case_text ff-google-n white">
             <span className="result_label">Expected:</span> {expectedOutput}
           </div>
           <div className="result_box test_case_text ff-google-n white">
             <span className="result_label">Actual:</span> {actualOutput}
           </div>
        </div>
      )}
    </div>
  );
};