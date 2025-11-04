import InputField from "./InputField";

interface IMultiInputSection {
  title: string;
  data: any[];
  setData: React.Dispatch<React.SetStateAction<any[]>>;
  initialTabs?: number;
  fields?: string[];
  allowMultipleOutputs?: boolean;
}

const MultiInputSection = ({
  title,
  data,
  setData,
  initialTabs = 5,
  fields = ["Input", "Output"],
  allowMultipleOutputs = false,
}:IMultiInputSection) => {

  const addTabForItem = (itemIndex: number) => {
    const updated = [...data];
    const item = updated[itemIndex];

    item.tabsCount = (item.tabsCount || 0) + 1;
    fields.forEach((f) => {
      const key = f.toLowerCase() + "s";
      if (allowMultipleOutputs && f === "Output") {
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

  const addOutputForItemTab = (itemIndex: number) => {
    const updated = [...data];
    const item = updated[itemIndex];
    const tab = item.activeIndex || 0;
    item.outputs[tab].push("");
    setData(updated);
  };

  const handleFieldChange = (
    itemIndex: number,
    fieldKey: string,
    value: string,
    outputIndex?: number
  ) => {
    const updated = [...data];
    const item = updated[itemIndex];
    const tab = item.activeIndex || 0;

    if (allowMultipleOutputs && fieldKey === "outputs") {
      if (typeof outputIndex !== "number") return;
      item.outputs[tab][outputIndex] = value;
    } else {
      item[fieldKey][tab] = value;
    }

    setData(updated);
  };

  return (
    <div className="section__block">
      <div
        className="section__header"
      >
        <div>{title}</div>
      </div>

      {data.map((item, idx) => {
        const tabsCount = item.tabsCount || initialTabs;
        const activeTab = item.activeIndex || 0;

        return (
          <div key={idx} className="multi_input">
            <div
              className="input__sublabel"
            >
                <div>
                  {title.slice(0, -1)} {idx + 1}
                </div>
                <div className="input__tabs" style={{ display: "flex", gap: ".4rem" }}>
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
                  <button type="button" className="glassmorphism-medium white pointer" onClick={() => addTabForItem(idx)} style={{borderRadius:"0.25rem"}}>
                    +
                  </button>
                </div>
            </div>

            <div className="input_col">
              {fields.map((field) => {
                const key = field.toLowerCase() + "s";
                if (allowMultipleOutputs && field === "Output") {
                  return (
                    <div key={field} className="multi_output__group">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div className="input__label">{field}s</div>
                        <button
                          type="button"
                          className="add-sub-btn"
                          onClick={() => addOutputForItemTab(idx)}
                        >
                          + Output
                        </button>
                      </div>
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

                return (
                  <InputField
                    key={field}
                    placeholder={field}
                    value={item[key][activeTab]}
                    onChange={(v) => handleFieldChange(idx, key, v)}
                    textarea={field === "Explanation"}
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

export default MultiInputSection;