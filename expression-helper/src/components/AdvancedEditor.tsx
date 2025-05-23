import React, { useState } from 'react';

interface AdvancedEditorProps {
  onExpressionChange?: (expression: string) => void;
  initialValue?: string;
  onBack?: () => void;
}

const AdvancedEditor: React.FC<AdvancedEditorProps> = ({ 
  onExpressionChange,
  initialValue = '',
  onBack
}) => {
  const [expression, setExpression] = useState<string>(initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newExpression = event.target.value;
    setExpression(newExpression);
    if (onExpressionChange) {
      onExpressionChange(newExpression);
    }
  };

  return (
    <div className="advanced-editor">
      <div className="panel-header">
        {onBack && (
          <button className="back-button" onClick={onBack}>
            &larr; Back
          </button>
        )}
        <h3>Advanced Expression Editor</h3>
      </div>
      
      <textarea
        value={expression}
        onChange={handleChange}
        placeholder="Enter your expression here..."
        rows={8}
        className="advanced-editor-textarea"
      />
      
      <div className="editor-info">
        <p>Use full expression syntax with code completion and highlighting.</p>
      </div>
    </div>
  );
};

export default AdvancedEditor;