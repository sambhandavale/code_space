import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownInputProps {
  label?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

const MarkdownInput = ({ label, value, placeholder, onChange }: MarkdownInputProps) => {
  const [isPreview, setIsPreview] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  const insertMarkdown = (syntaxStart: string, syntaxEnd = "", multiLine = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end);

    let newText: string;

    if (multiLine) {
      const lines = selectedText.split("\n");
      newText =
        value.slice(0, start) +
        lines.map((line) => syntaxStart + line).join("\n") +
        value.slice(end);
    } else {
      newText = value.slice(0, start) + syntaxStart + selectedText + syntaxEnd + value.slice(end);
    }

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const cursorPos = end + syntaxStart.length + syntaxEnd.length;
      textarea.selectionStart = textarea.selectionEnd = cursorPos;
    }, 0);
  };

  const handleLinkButtonClick = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end);

    selectionRef.current = { start, end };
    setLinkText(selectedText);
    setLinkUrl("https://");
    setShowLinkInput(true);
  };

  const handleInsertLink = () => {
    const { start, end } = selectionRef.current;
    const text = linkText || "text";
    const markdownLink = `🔗[${text}](${linkUrl})`;

    const newValue = value.slice(0, start) + markdownLink + value.slice(end);
    onChange(newValue);

    setShowLinkInput(false);

    setTimeout(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + markdownLink.length;
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const valueBefore = value.slice(0, start);
    const valueAfter = value.slice(end);
    const lineStart = valueBefore.lastIndexOf("\n") + 1;
    const currentLine = valueBefore.slice(lineStart);

    if (e.key === "Enter") {
      e.preventDefault();

      // Unordered list
      const unorderedMatch = currentLine.match(/^(\s*[-*]\s)/);
      // Ordered list
      const orderedMatch = currentLine.match(/^(\s*\d+\. )/);

      if (unorderedMatch) {
        const bullet = unorderedMatch[1];
        const newText = valueBefore + "\n" + bullet + valueAfter;
        onChange(newText);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + bullet.length;
        }, 0);
      } else if (orderedMatch) {
        const numberStr = orderedMatch[1];
        const num = parseInt(numberStr.trim()) || 1;
        const spacing = numberStr.match(/^\s*/)?.[0] || "";
        const newNumber = num + 1;
        const newLine = `\n${spacing}${newNumber}. `;
        const newText = valueBefore + newLine + valueAfter;
        onChange(newText);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + newLine.length;
        }, 0);
      } else {
        // Normal line break for preview
        const newText = valueBefore + "  \n" + valueAfter;
        onChange(newText);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 3; // move cursor after "  \n"
        }, 0);
      }
    }
  };

  return (
    <div className="markdown-input">
      {label && <label className="markdown-label">{label}</label>}

      <div className="markdown-toolbar">
        <div className="left-controls">
          <button title="Write" onClick={() => setIsPreview(false)} className={`ff-google-n ${!isPreview ? "active" : ""}`}>
            WRITE
          </button>
          <button title="Preview" onClick={() => setIsPreview(true)} className={`ff-google-n ${isPreview ? "active" : ""}`}>
            PREVIEW
          </button>
        </div>

        {!isPreview && (
          <div className="right-controls">
            <button title="Bold" className="ff-google-n" onClick={() => insertMarkdown("**", "**")}>
              <b>B</b>
            </button>
            <button title="Italic" className="ff-google-n" onClick={() => insertMarkdown("*", "*")}>
              <i>I</i>
            </button>
            <button title="Heading H1" className="ff-google-n" onClick={() => insertMarkdown("# ", "", true)}>
              H1
            </button>
            <button title="Unordered List" onClick={() => insertMarkdown("- ", "", true)}>
              •
            </button>
            <button title="Ordered List" onClick={() => insertMarkdown("1. ", "", true)}>
              1.
            </button>
            <button title="Inline Code" onClick={() => insertMarkdown("`", "`")}>
              {"<>"}
            </button>
            <button title="Link" onClick={handleLinkButtonClick}>
              🔗
            </button>
          </div>
        )}
      </div>

      {!isPreview ? (
        <textarea
          ref={textareaRef}
          className="markdown-textarea"
          placeholder={placeholder || "Write using markdown syntax..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div className="markdown-preview glassmorphism-light ff-google-n">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p style={{ marginBottom: "1em", lineHeight: 1.6 }}>{children}</p>,
            }}
          >
            {value || "*Nothing to preview*"}
          </ReactMarkdown>
        </div>
      )}

      <div className="attachment-area">
        {showLinkInput && (
          <div className="link-input-popup">
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Link Text"
            />
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://"
            />
            <button onClick={handleInsertLink}>Insert</button>
            <button onClick={() => setShowLinkInput(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownInput;
