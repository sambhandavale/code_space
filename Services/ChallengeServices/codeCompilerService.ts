interface TestResult {
  actual: string;
  output: string;
  input: string;
  status: "PASSED" | "FAILED" | string;
  test_case: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class CodeCompilerServices {
  static async proxyPythonTestCaseCompiler(body: any) {
    const response = await fetch("https://python-compiler-mu.vercel.app/api/test-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  static async proxyPythonCompiler(body: any) {
    const response = await fetch("https://python-compiler-mu.vercel.app/api/test-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  static async runCodeWithTestCases(reqBody: any) {
    const { language, version, user_code: userCode, test_cases: testCases, extension: ext } = reqBody;
    const results: TestResult[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const { input, output } = testCases[i];
      const trimmedExpectedOutput = String(output).trim();

      let actualOutput = "";
      let status = "FAILED";
      let success = false;

      for (let attempt = 0; attempt < 2 && !success; attempt++) {
        const body = {
          language,
          version,
          files: [{ name: `main.${ext}`, content: userCode }],
          stdin: input + "\n",
          args: [],
          compile_timeout: 10000,
          run_timeout: 3000,
        };

        try {
          const response = await fetch("https://emkc.org/api/v2/piston/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          const text = await response.text();
          let data: any;

          try {
            data = JSON.parse(text);
          } catch {
            console.warn(`Attempt ${attempt + 1}: Invalid JSON, retrying...`);
            await sleep(250);
            continue;
          }

          actualOutput = data?.run?.output?.trim() ?? "";
          status = actualOutput === trimmedExpectedOutput ? "PASSED" : "FAILED";

          results.push({
            test_case: i + 1,
            input,
            output: trimmedExpectedOutput,
            actual: actualOutput,
            status,
          });

          success = true;
        } catch {
          console.warn(`Attempt ${attempt + 1}: Request failed, retrying...`);
          await sleep(250);
        }

        await sleep(250);
      }

      if (!success) {
        results.push({
          test_case: i + 1,
          input,
          output: trimmedExpectedOutput,
          actual: "",
          status: "FAILED",
        });
      }
    }

    return results;
  }
}
