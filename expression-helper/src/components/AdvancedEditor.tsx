import React, { useState, useEffect } from 'react';

interface AdvancedEditorProps {
  onExpressionChange: (expression: string) => void;
  onBack: () => void;
  existingExpression?: string;
}

const AdvancedEditor: React.FC<AdvancedEditorProps> = ({ 
  onExpressionChange, 
  onBack, 
  existingExpression = '' 
}) => {
  const [expression, setExpression] = useState<string>(existingExpression);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pre-fill editor with existing expression if available
    if (existingExpression) {
      setExpression(existingExpression);
    }
  }, [existingExpression]);

  const handleExpressionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExpression(e.target.value);
    setError(null);
  };

  const validateExpression = (): boolean => {
    if (!expression.trim()) {
      setError('Expression cannot be empty');
      return false;
    }
    
    // Simple syntax checking could be added here
    // For now, just ensure it's not empty
    
    return true;
  };

  const handleApply = () => {
    if (validateExpression()) {
      onExpressionChange(expression);
    }
  };

  return (
    <div className="advanced-editor">
      <div className="panel-header">
        <h3>Expression Editor</h3>
        <button className="back-button" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="panel-description">
        Write a custom Ballerina expression. You can use any valid expression that returns the appropriate type.
      </div>

      <div className="editor-container">
        <textarea
          className={`expression-textarea ${error ? 'error' : ''}`}
          value={expression}
          onChange={handleExpressionChange}
          placeholder="Enter your expression here..."
          autoFocus
        />
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="editor-features">
        <h4>Available Features:</h4>
        <ul>
          <li>Full access to all Ballerina language constructs</li>
          <li>Use any variable or function in the current scope</li>
          <li>Access imported modules and their functions</li>
          <li>Write complex expressions with conditionals and operators</li>
        </ul>
      </div>

      <div className="button-container">
        <button 
          className="apply-button"
          onClick={handleApply}
          disabled={!expression.trim()}
        >
          {existingExpression ? 'Update Expression' : 'Use Expression'}
        </button>
      </div>
    </div>
  );
};

export default AdvancedEditor;