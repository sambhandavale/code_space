import { Request, Response } from "express";
import { CodeCompilerServices, Verdict } from "../../Services/ChallengeServices/codeCompilerService";
import { IBaseRequest } from "../../Interfaces/core_interfaces";
import { Queue } from 'bullmq';

const redisConfig = {
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null, 
};

const codeQueue = new Queue('code-execution', { connection: redisConfig });

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

export const submitCode = async (req: IBaseRequest, res: Response) => {
  try {
    const { language, version, user_code, test_cases, extension, contestId } = req.body;
    const userId = req.user._id;

    console.log("2. [API] Adding job to BullMQ for User:", userId);

    // Push the job to the queue
    const job = await codeQueue.add('execute-batch', {
      userId,
      language,
      version,
      user_code,
      test_cases,
      extension,
    });

    console.log("2. [API] Job created in Redis with ID:", job.id);

    // Return the jobId so the frontend can listen for the specific result
    res.status(202).json({ 
      status: "QUEUED",
      jobId: job.id,
      message: "Code submitted for evaluation" 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to queue job" });
  }
};

export const getJobResult = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId as string;

    // 1. Fetch the job from Redis
    const job = await codeQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ 
        status: "NOT_FOUND", 
        message: "Job ID does not exist" 
      });
    }

    // 2. Get the current status (waiting, active, completed, failed, delayed)
    const state = await job.getState();

    // 3. Return the status and result
    res.status(200).json({
      jobId,
      state,
      // If completed, return the results array; if failed, return the reason
      result: state === 'completed' ? job.returnvalue : null,
      error: state === 'failed' ? job.failedReason : null
    });

  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ error: "Internal System Error" });
  }
};
