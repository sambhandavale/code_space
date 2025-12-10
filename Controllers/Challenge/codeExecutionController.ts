import { Request, Response } from "express";
import { CodeCompilerServices, Verdict } from "../../Services/ChallengeServices/codeCompilerService";

export const proxyPythonTestCaseCompiler = async (req: Request, res: Response) => {
  try {
    const result = await CodeCompilerServices.proxyPythonTestCaseCompiler(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in proxyPythonTestCaseCompiler:", error);
    res.status(500).json({ error: "Failed to proxy request" });
  }
};

export const proxyPythonCompiler = async (req: Request, res: Response) => {
  try {
    const result = await CodeCompilerServices.proxyPythonCompiler(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in proxyPythonCompiler:", error);
    res.status(500).json({ error: "Failed to proxy request" });
  }
};

export const runCodeWithTestCases = async (req: Request, res: Response) => {
  try {
    const results = await CodeCompilerServices.executeBatch(req.body);
    
    // Check if we have a global compilation error
    const compileError = results.find(r => r.status === Verdict.COMPILE_ERROR);
    
    if (compileError) {
      // If code doesn't compile, don't return 10 failures. Return the compile error.
      return res.status(200).json({
        status: "ERROR",
        message: "Compilation Failed",
        details: compileError.compile_output
      });
    }

    res.status(200).json({
      status: "SUCCESS",
      results: results
    });

  } catch (error) {
    console.error("System Error:", error);
    res.status(500).json({ error: "Internal System Error" });
  }
};