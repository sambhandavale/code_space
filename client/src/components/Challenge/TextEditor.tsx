import Editor from "@monaco-editor/react";
import { useRef } from "react";

const SecureEditor = ({ language, code, setCode }) => {
  const editorRef = useRef<any>(null);

  // Create or reuse a unique ID for this browser tab
  const TAB_ID =
    sessionStorage.getItem("tab_id") ||
    (() => {
      const id = crypto.randomUUID();
      sessionStorage.setItem("tab_id", id);
      return id;
    })();

  const SPECIAL_TOKEN = `__TAB_TOKEN__${TAB_ID}::`;

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    const domNode = editor.getDomNode();

    /** ========== COPY INTERCEPT ========== **/
    domNode?.addEventListener("copy", async (e: ClipboardEvent) => {
      e.preventDefault();
      const selection = editor.getModel().getValueInRange(editor.getSelection());
      const markedText = `${SPECIAL_TOKEN}${selection}`;

      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", markedText);
      } else {
        await navigator.clipboard.writeText(markedText);
      }

      console.log(`[COPY] Token added for ${TAB_ID}`);
    });

    /** ========== PASTE INTERCEPT ========== **/
    domNode?.addEventListener("paste", async (e: ClipboardEvent) => {
      e.preventDefault();
      let clipboardText = "";

      if (e.clipboardData) {
        clipboardText = e.clipboardData.getData("text/plain");
      } else {
        clipboardText = await navigator.clipboard.readText();
      }

      if (!clipboardText.startsWith(SPECIAL_TOKEN)) {
        console.warn("[PASTE BLOCKED] No valid token found.");
        alert("[PASTE BLOCKED] No valid token found.")
        return; // block paste
      }

      const cleanText = clipboardText.replace(SPECIAL_TOKEN, "");
      editor.executeEdits("", [
        {
          range: editor.getSelection(),
          text: cleanText,
          forceMoveMarkers: true,
        },
      ]);
      console.log("[PASTE ALLOWED] Token verified.");
    });

    /** ========== HANDLE Ctrl+V ========== **/
    editor.onKeyDown(async (e: any) => {
      if ((e.metaKey || e.ctrlKey) && e.keyCode === monaco.KeyCode.KeyV) {
        e.preventDefault();
        const clipboardText = await navigator.clipboard.readText();
        if (!clipboardText.startsWith(SPECIAL_TOKEN)) {
          console.warn("[PASTE BLOCKED: keyboard paste]");
          alert("[PASTE BLOCKED] No valid token found.")
          return;
        }
        const cleanText = clipboardText.replace(SPECIAL_TOKEN, "");
        editor.executeEdits("", [
          {
            range: editor.getSelection(),
            text: cleanText,
            forceMoveMarkers: true,
          },
        ]);
        console.log("[PASTE ALLOWED: keyboard]");
      }
    });
  };

  return (
    <Editor
      height="350px"
      language={language}
      value={code}
      onChange={(value) => setCode(value || "")}
      theme="vs-dark"
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
};

export default SecureEditor;
