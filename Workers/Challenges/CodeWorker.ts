import { Worker } from 'bullmq';
import { CodeCompilerServices } from '../../Services/ChallengeServices/codeCompilerService';
import { io, userSockets } from '../../Config/socket';
import { redisConnection } from '../../Config/redis';

const worker = new Worker('code-execution', async (job) => {
  const { userId, language, version, user_code, test_cases, extension } = job.data;

  const results = await Promise.all(
    test_cases.map((tc: any, i: number) => 
      CodeCompilerServices.runSingleTestCase(i + 1, language, version, user_code, tc, extension)
    )
  );

  // Notify the user via WebSockets
  const sockets = userSockets.get(userId);
  if (!sockets || sockets.size === 0) {
      console.error(`4. [WORKER] FAILED: No active sockets found for User ${userId}. Current userSockets keys:`, Array.from(userSockets.keys()));
  } else {
      console.log(`4. [WORKER] SUCCESS: Sending result to ${sockets.size} sockets for User ${userId}`);
      sockets.forEach(socketId => {
          io.to(socketId).emit("code_result", { jobId: job.id, results });
      });
  }
  
  return results;
}, { connection: redisConnection as any });