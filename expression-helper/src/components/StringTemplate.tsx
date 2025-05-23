import React, { useState, useEffect } from 'react';

interface StringTemplateProps {
  onTemplateChange: (template: string) => void;
  onBack: () => void;
  existingTemplate?: string;
}

const StringTemplate: React.FC<StringTemplateProps> = ({ 
  onTemplateChange, 
  onBack,
  existingTemplate 
}) => {
  // Extract template content from existing template if available
  const [template, setTemplate] = useState<string>(() => {
    if (existingTemplate && existingTemplate.startsWith('string `') && existingTemplate.endsWith('`')) {
      // Extract content between backticks
      return existingTemplate.substring(8, existingTemplate.length - 1);
    }
    return '';
  });
  
  const [generatedTemplate, setGeneratedTemplate] = useState<string>('');
  const isUpdating = !!existingTemplate;

  useEffect(() => {
    // Generate the full template expression
    setGeneratedTemplate(`string \`${template}\``);
  }, [template]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplate(e.target.value);
  };

  const handleSubmit = () => {
    onTemplateChange(generatedTemplate);
    onBack();
  };

  return (
    <div className="string-template">
      <div className="panel-header">
        <h3>{isUpdating ? 'Update string template' : 'Create new string template'}</h3>
        <button className="back-button" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="panel-description">
        Create multi-line string values with string templates. Use <code>${'{}'}</code> syntax to refer to existing variables.
      </div>

      <div className="input-group">
        <label htmlFor="template-input">Enter template content:</label>
        <textarea
          id="template-input"
          value={template}
          onChange={handleTemplateChange}
          placeholder="Enter template text here..."
          className="template-textarea"
          rows={6}
          autoFocus
          wrap="soft"
          spellCheck="false"
        />
      </div>

      <div className="output-preview">
        <div className="output-label">Preview:</div>
        <div className="output-value">{generatedTemplate}</div>
      </div>

      <div className="action-buttons">
        <button 
          className="submit-button" 
          onClick={handleSubmit}
        >
          {isUpdating ? 'Update Template' : 'Use Template'}
        </button>
      </div>

      <div className="helper-note">
        <p>Tip: Press Enter to create new lines. String templates preserve all whitespace and line breaks.</p>
      </div>
    </div>
  );
};

export default StringTemplate;