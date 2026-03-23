export enum Verdict {
  ACCEPTED = "Accepted",
  WRONG_ANSWER = "Wrong Answer",
  COMPILE_ERROR = "Compilation Error",
  RUNTIME_ERROR = "Runtime Error",
  TIME_LIMIT_EXCEEDED = "Time Limit Exceeded",
}

interface TestCase {
  input: string;
  output: string[];
}

interface ExecutionResult {
  test_case_number: number;
  status: Verdict;
  input: string;
  expected_output: any;
  actual_output: string;
  stderr?: string;
  compile_output?: string;
  execution_time?: number;
  memory_usage?: number;
}


export class CodeCompilerServices {
  static async executeBatch(reqBody: any): Promise<ExecutionResult[]> {
    const { language, version, user_code, test_cases, extension } = reqBody;

    const results: ExecutionResult[] = [];

    for (let i = 0; i < test_cases.length; i++) {
      const res = await this.runSingleTestCase(
        i + 1,
        language,
        version,
        user_code,
        test_cases[i],
        extension
      );
      results.push(res);
    }

    return results;
  }

  static async runSingleTestCase(
    index: number,
    language: string,
    version: string,
    code: string,
    testCase: TestCase,
    ext: string
  ): Promise<ExecutionResult> {
    
    // Prepare payload for Piston
    const payload = {
      language,
      version,
      files: [{ name: `main.${ext}`, content: code }],
      stdin: testCase.input,
      run_timeout: 3000,
      compile_timeout: 10000,
    };

    try {
      const startTime = Date.now();
      
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const endTime = Date.now();

      if (data.message && data.message.includes("whitelist")) {
        return {
            test_case_number: index,
            status: Verdict.RUNTIME_ERROR,
            input: testCase.input,
            expected_output: testCase.output,
            actual_output: "System Error",
            stderr: "Piston API Error: Whitelist required. Please check server logs.",
        };
      }
      // 1. Handle Compilation Errors (Piston returns non-zero compile code)
      if (data.compile && data.compile.code !== 0) {
        return {
          test_case_number: index,
          status: Verdict.COMPILE_ERROR,
          input: testCase.input,
          expected_output: testCase.output,
          actual_output: "",
          compile_output: data.compile.stderr || data.compile.stdout,
        };
      }

      // 2. Handle Runtime Errors (Piston returns non-zero run code)
      if (data.run && data.run.code !== 0) {
        return {
          test_case_number: index,
          status: Verdict.RUNTIME_ERROR,
          input: testCase.input,
          expected_output: testCase.output,
          actual_output: data.run.stderr,
          stderr: data.run.stderr, // Important: Show user the crash reason
        };
      }

      // 3. Logic Check (Compare Outputs)
      const rawOutput = data.run.stdout || "";
      const isCorrect = this.compareOutputs(rawOutput, testCase.output);

      return {
        test_case_number: index,
        status: isCorrect ? Verdict.ACCEPTED : Verdict.WRONG_ANSWER,
        input: testCase.input,
        expected_output: testCase.output,
        actual_output: rawOutput.trim(), // Send back trimmed version for display
        execution_time: endTime - startTime,
      };

    } catch (error) {
      // Handle network failures or API crashes
      return {
        test_case_number: index,
        status: Verdict.RUNTIME_ERROR,
        input: testCase.input,
        expected_output: testCase.output,
        actual_output: 'Code Execution failed',
        stderr: "Execution API Failure",
      };
    }
  }

  private static compareOutputs(actual: string, expected: string[]): boolean {
    const normalize = (str: string) => 
      str
        .replace(/\r\n/g, "\n") // Convert Windows newlines to Unix
        .replace(/\r/g, "\n")   // Handle old Mac style
        .trim();                // Remove start/end whitespace

    let exp = expected.map((e)=>normalize(e))

    return exp.includes(normalize(actual));
  }
}