import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeBlockEditorProps {
  value: string;
  language: string;
  onChange: (newValue: string) => void;
  theme: string;
  editing: boolean; // You could also consider making this a boolean
}

const CodeBlockEditor: React.FC<CodeBlockEditorProps> = ({
  value,
  language,
  onChange,
  theme,
  editing,
}) => {
  const isReadOnly = editing !== true;

  return (
    <div className="monaco-code-block">
      <Editor
        height="250px"
        language={language || 'plaintext'}
        value={value}
        onChange={(newValue) => {
          if (!isReadOnly) onChange(newValue || '');
        }}
        theme={theme}
        options={{
          readOnly: isReadOnly,
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          lineNumbers: 'on',
          wordWrap: 'on',
        }}
      />
    </div>
  );
};

export default CodeBlockEditor;
