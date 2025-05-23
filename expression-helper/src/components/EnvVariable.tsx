import React, { useState, useEffect } from 'react';

interface EnvVariableProps {
  onChange: (value: string) => void;
  fieldType?: string;
  onBack?: () => void;
}

const EnvVariable: React.FC<EnvVariableProps> = ({ onChange, fieldType = 'string', onBack }) => {
  const [variableName, setVariableName] = useState('');

  useEffect(() => {
    // Update the expression based on field type and variable name
    if (variableName) {
      let expression = '';
      if (fieldType === 'string') {
        expression = `os:env("${variableName}")`;
      } else if (fieldType === 'int') {
        expression = `check int:fromString(os:env("${variableName}"))`;
      } else {
        expression = `os:env("${variableName}")`;
      }
      onChange(expression);
    }
  }, [variableName, fieldType, onChange]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVariableName(event.target.value);
  };

  return (
    <div className="env-variable">
      <div className="panel-header">
        {onBack && (
          <button className="back-button" onClick={onBack}>
            &larr; Back
          </button>
        )}
        <h3>Environment Variable</h3>
      </div>
      
      <div className="input-group">
        <label htmlFor="env-variable">Variable Name:</label>
        <input
          type="text"
          id="env-variable"
          value={variableName}
          onChange={handleInputChange}
          placeholder="Enter environment variable name"
          className="env-variable-input"
        />
      </div>
      
      {fieldType !== 'string' && (
        <p className="env-note">
          Note: The value will be converted to {fieldType} using the appropriate conversion function.
        </p>
      )}
    </div>
  );
};

export default EnvVariable;