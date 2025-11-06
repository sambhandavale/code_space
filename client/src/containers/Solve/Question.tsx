import { useState } from "react";
import { postAction } from "../../services/generalServices";
import { toast } from "sonner";
import InputField from "../../components/Question/InputField";
import MultiInputSection from "../../components/Question/MultiInputField";

const Question = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "",
    task: "",
    inputFormat: "",
    constraints: "",
    outputFormat: "",
    time: 1,
  });

  const [testcases, setTestcases] = useState([
    {
      inputs: [""],
      outputs: [[""]],
      activeIndex: 0,
      tabsCount: 1,
    },
  ]);

  const [examples, setExamples] = useState([
    {
      inputs: [""],
      outputs: [""],
      explanations: [""],
      activeIndex: 0,
      tabsCount: 1,
    },
  ]);

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDifficulty = (level: string) => {
    const levelMap: Record<string, string> = {
      "Bullet (Easy)": "Easy",
      "Blitz (Medium)": "Medium",
      "Rapid (Hard)": "Hard",
    };
    setFormData({ ...formData, difficulty: levelMap[level] });
  };

  console.log(formData);
  console.log(testcases)

  /* ---------- Submit Function ---------- */
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // 🔹 Transform examples
      const examplesTransformed = examples.flatMap((ex) => {
        const res = [];
        for (let i = 0; i < ex.tabsCount; i++) {
          if (ex.inputs[i] || ex.outputs[i] || ex.explanations[i]) {
            res.push({
              input: ex.inputs[i],
              output: ex.outputs[i],
              explanation: ex.explanations[i],
            });
          }
        }
        return res;
      });

      // 🔹 Transform test cases
      const testcasesTransformed = testcases.flatMap((tc) => {
        const res = [];
        for (let i = 0; i < tc.tabsCount; i++) {
          if (tc.inputs[i] || tc.outputs[i].some((o: string) => o)) {
            res.push({
              input: tc.inputs[i],
              output: tc.outputs[i].filter((o: string) => o),
            });
          }
        }
        return res;
      });

      // 🔹 Construct final payload
      const payload = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        task: formData.task,
        input_format: formData.inputFormat,
        constraints: formData.constraints,
        output_format: formData.outputFormat,
        time: formData.time,
        examples: examplesTransformed,
        test_cases: testcasesTransformed,
        template: { python: "def solve():\n    pass" },
        tags: [],
      };

      const res = await postAction('/questions/add',payload);
      if(res.status === 201){
        toast.success("✅ Question added successfully!")
      } else{
        toast.error("Something went wrong");
      }
      console.log(res.data);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="question_screen__container">
      <div className="question_screen page-top-m">
        <header className="ff-arp-150 white title-header">QUESTION</header>

        <div className="question_form disable-scrollbar">
          <InputField
            label="Title"
            placeholder="eg. Count the Vowels"
            value={formData.title}
            onChange={(v) => handleChange("title", v)}
          />

          <InputField
            label="Description"
            placeholder="Describe the problem..."
            value={formData.description}
            onChange={(v) => handleChange("description", v)}
            textarea
          />

          <div className="input__field">
            <div className="input__label">Difficulty Level</div>
            <div className="input_row">
              {["Bullet (Easy)", "Blitz (Medium)", "Rapid (Hard)"].map((level) => {
                // Extract text inside parentheses
                const difficultyInBrackets = level.match(/\((.*?)\)/)?.[1];
                return (
                  <button
                    key={level}
                    className={`difficulty__btn white pointer glassmorphism-medium ${
                      formData.difficulty === difficultyInBrackets ? "active" : ""
                    }`}
                    onClick={() => handleDifficulty(level)}
                    type="button"
                  >
                    {level}
                  </button>
                );
              })}

            </div>
          </div>

          <InputField
            label="Task"
            placeholder="Describe the task..."
            value={formData.task}
            onChange={(v) => handleChange("task", v)}
            textarea
          />

          <InputField
            label="Input Format"
            placeholder="Describe the input..."
            value={formData.inputFormat}
            onChange={(v) => handleChange("inputFormat", v)}
            textarea
          />

          <InputField
            label="Constraints"
            placeholder="1 <= n <= 10^5 ..."
            value={formData.constraints}
            onChange={(v) => handleChange("constraints", v)}
            textarea
          />

          <InputField
            label="Output Format"
            placeholder="Describe the output..."
            value={formData.outputFormat}
            onChange={(v) => handleChange("outputFormat", v)}
            textarea
          />

          {/* Testcases */}
          <MultiInputSection
            title="Testcases"
            data={testcases}
            setData={setTestcases}
            initialTabs={5}
            fields={["Input", "Output"]}
            allowMultipleOutputs
          />

          {/* Examples */}
          <MultiInputSection
            title="Examples"
            data={examples}
            setData={setExamples}
            initialTabs={5}
            fields={["Input", "Output", "Explanation"]}
          />

          <div className="form__actions" style={{ marginTop: "2rem" }}>
            <button
              className="common_button pointer ff-google-n"
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Question"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Question;
