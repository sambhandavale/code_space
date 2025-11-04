import React, { useState } from "react";

/* ---------- InputField (unchanged) ---------- */
interface InputFieldProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  textarea = false,
  className = "",
}) => (
  <div className="input__field">
    {label && <div className="input__label">{label}</div>}
    {textarea ? (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input__textarea glassmorphism-light ${className}`}
      />
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input__box glassmorphism-light ${className}`}
      />
    )}
  </div>
);

/* ---------- MultiInputSection (reusable) ---------- */
interface MultiInputSectionProps {
  title: string; // "Testcases" or "Examples"
  data: any[]; // items state
  setData: React.Dispatch<React.SetStateAction<any[]>>;
  initialTabs?: number;
  fields?: string[]; // e.g. ["Input","Output"] or ["Input","Output","Explanation"]
  allowMultipleOutputs?: boolean;
}

const MultiInputSection: React.FC<MultiInputSectionProps> = ({
  title,
  data,
  setData,
  initialTabs = 5,
  fields = ["Input", "Output"],
  allowMultipleOutputs = false,
}) => {
  // Add a new item (testcase/example) — used by header + button
  const addItem = () => {
    const newItem: any = {
      activeIndex: 0,
      tabsCount: initialTabs,
    };
    // for each field create an array sized tabsCount. For Outputs we may need nested arrays.
    fields.forEach((f) => {
      const key = f.toLowerCase() + "s";
      if (allowMultipleOutputs && f === "Output") {
        // outputs: array of length tabsCount where each item is an array of outputs for that tab
        newItem[key] = Array(initialTabs).fill(null).map(() => [""]);
      } else {
        newItem[key] = Array(initialTabs).fill("");
      }
    });
    setData([...data, newItem]);
  };

  // Add a tab/slot for a specific item (per-item dynamic tabs)
  const addTabForItem = (itemIndex: number) => {
    const updated = [...data];
    const item = updated[itemIndex];
    const newIndex = item.tabsCount; // push at end

    // increase tabsCount
    item.tabsCount = (item.tabsCount || 0) + 1;

    // append default values for each field for the new tab index
    fields.forEach((f) => {
      const key = f.toLowerCase() + "s";
      if (allowMultipleOutputs && f === "Output") {
        // outputs is array of arrays
        item[key].push([""]);
      } else {
        item[key].push("");
      }
    });

    setData(updated);
  };

  const handleTabChange = (index: number, tabIndex: number) => {
    const updated = [...data];
    updated[index].activeIndex = tabIndex;
    setData(updated);
  };

  // Add a new output (multiple valid outputs) for the current tab of an item
  const addOutputForItemTab = (itemIndex: number) => {
    const updated = [...data];
    const item = updated[itemIndex];
    const tab = item.activeIndex || 0;
    item.outputs[tab].push("");
    setData(updated);
  };

  // Generic field change, supports outputs with optional outputIndex when multiple outputs allowed
  const handleFieldChange = (
    itemIndex: number,
    fieldKey: string, // e.g. "inputs", "outputs", "explanations"
    value: string,
    outputIndex?: number
  ) => {
    const updated = [...data];
    const item = updated[itemIndex];
    const tab = item.activeIndex || 0;

    if (allowMultipleOutputs && fieldKey === "outputs") {
      // outputs[tab] is an array, update at outputIndex
      if (typeof outputIndex !== "number") return;
      item.outputs[tab][outputIndex] = value;
    } else {
      item[fieldKey][tab] = value;
    }

    setData(updated);
  };

  // Render
  return (
    <div className="section__block">
      <div className="section__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>{title}</div>
      </div>

      {data.map((item, idx) => {
        const tabsCount = item.tabsCount || initialTabs;
        const activeTab = item.activeIndex || 0;

        return (
          <div key={idx} className="multi_input">
            <div className="input__sublabel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div>{title.slice(0, -1)} {idx + 1}</div>

                {/* Tab buttons */}
                <div className="input__tabs" style={{ display: "flex", gap: ".4rem", alignItems: "center" }}>
                  {Array.from({ length: tabsCount }, (_, i) => (
                    <button
                      key={i}
                      className={`tab__btn ${activeTab === i ? "active" : ""}`}
                      onClick={() => handleTabChange(idx, i)}
                      type="button"
                    >
                      {i + 1}
                    </button>
                  ))}

                  {/* plus next to tabs to add a new tab/slot for this item */}
                  <button
                    type="button"
                    className="tab-add-btn"
                    onClick={() => addTabForItem(idx)}
                    title="Add slot"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* small actions area per-item (optional placeholder) */}
              <div className="item-actions">{/* you can add delete/duplicate later */}</div>
            </div>

            <div className="input_col">
              {fields.map((field) => {
                const key = field.toLowerCase() + "s";

                // if multiple outputs allowed, render outputs list for current tab with + next to label
                if (allowMultipleOutputs && field === "Output") {
                  return (
                    <div key={field} className="multi_output__group">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="input__label">{field}s</div>
                        {/* Add Output button next to Outputs label for current tab */}
                        <button
                          type="button"
                          className="add-sub-btn"
                          onClick={() => addOutputForItemTab(idx)}
                          title="Add output for this slot"
                        >
                          + Output
                        </button>
                      </div>

                      {/* list all outputs for the active tab */}
                      {item.outputs[activeTab].map((out: string, outIdx: number) => (
                        <InputField
                          key={outIdx}
                          placeholder={`${field} ${outIdx + 1}`}
                          value={out}
                          onChange={(v) => handleFieldChange(idx, key, v, outIdx)}
                        />
                      ))}
                    </div>
                  );
                }

                // normal single-value fields per tab
                return (
                  <InputField
                    key={field}
                    placeholder={field}
                    value={item[key][activeTab]}
                    onChange={(v) => handleFieldChange(idx, key, v)}
                    textarea={field !== "Input" && field !== "Output" ? true : false} // e.g., Explanation textarea
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ---------- Question component (uses MultiInputSection) ---------- */
const Question: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "",
    task: "",
    inputFormat: "",
    outputFormat: "",
  });

  // Each testcase item:
  // - inputs: string[] per tab
  // - outputs: string[][] per tab (array of outputs for each tab)
  // - tabsCount: number
  // - activeIndex: number
  const [testcases, setTestcases] = useState([
    {
      inputs: ["", "", "", "", ""],
      outputs: [[""], [""], [""], [""], [""]],
      activeIndex: 0,
      tabsCount: 5,
    },
  ]);

  const [examples, setExamples] = useState([
    {
      inputs: ["", "", "", "", ""],
      outputs: ["", "", "", "", ""],
      explanations: ["", "", "", "", ""],
      activeIndex: 0,
      tabsCount: 5,
    },
  ]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDifficulty = (level: string) => {
    setFormData({ ...formData, difficulty: level });
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
            placeholder="eg. Given a lowercase English string, count the vowels..."
            value={formData.description}
            onChange={(v) => handleChange("description", v)}
            textarea
          />

          <div className="input__field">
            <div className="input__label">Difficulty Level</div>
            <div className="input_row">
              {["Bullet (Easy)", "Blitz (Medium)", "Rapid (Hard)"].map((level) => (
                <button
                  key={level}
                  className={`difficulty__btn white pointer glassmorphism-medium ${
                    formData.difficulty === level ? "active" : ""
                  }`}
                  onClick={() => handleDifficulty(level)}
                  type="button"
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <InputField
            label="Task"
            placeholder="eg. Return the number of vowels (a, e, i, o, u)..."
            value={formData.task}
            onChange={(v) => handleChange("task", v)}
            textarea
          />

          <InputField
            label="Input Format"
            placeholder="eg. A single string s containing lowercase English letters..."
            value={formData.inputFormat}
            onChange={(v) => handleChange("inputFormat", v)}
            textarea
          />

          <InputField
            label="Output Format"
            placeholder="eg. An integer representing the count of vowels..."
            value={formData.outputFormat}
            onChange={(v) => handleChange("outputFormat", v)}
            textarea
          />

          {/* Testcases: multiple outputs allowed */}
          <MultiInputSection
            title="Testcases"
            data={testcases}
            setData={setTestcases}
            initialTabs={5}
            fields={["Input", "Output"]}
            allowMultipleOutputs
          />

          {/* Examples: single output per tab */}
          <MultiInputSection
            title="Examples"
            data={examples}
            setData={setExamples}
            initialTabs={5}
            fields={["Input", "Output", "Explanation"]}
            allowMultipleOutputs={false}
          />

          <div className="form__actions">
            <button className="save-btn" type="button">
              Save Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Question;
