import { Request, Response } from "express";
import { CodeCompilerServices } from "../../Services/ChallengeServices/codeCompilerService";

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
    const results = await CodeCompilerServices.runCodeWithTestCases(req.body);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error in runCodeWithTestCases:", error);
    res.status(500).json({ error: "Failed to execute test cases" });
  }
};
