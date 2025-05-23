import React, { useState, useEffect } from 'react';

interface ValueCreatorProps {
  fieldType: string;
  onValueChange: (value: string) => void;
  onBack: () => void;
  existingValue?: string;
}

const ValueCreator: React.FC<ValueCreatorProps> = ({ 
  fieldType, 
  onValueChange, 
  onBack, 
  existingValue 
}) => {
  // Decode string literals when initializing
  const [value, setValue] = useState<string>(() => {
    if (existingValue !== undefined) {
      if (existingValue.startsWith('"') && existingValue.endsWith('"')) {
        try {
          // Remove outer quotes and parse to handle escape sequences
          const stringContent = existingValue.slice(1, -1);
          // Handle common escape sequences
          return stringContent
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\r/g, '\r');
        } catch (e) {
          console.error("Error parsing string literal:", e);
          return existingValue;
        }
      }
      return existingValue;
    }
    return '';
  });
  
  const [escapedValue, setEscapedValue] = useState<string>('');
  const isUpdating = existingValue !== undefined;

  // Update escaped value when input changes
  useEffect(() => {
    if (fieldType === 'string') {
      // Escape special characters for string literals
      const escaped = value
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t')
        .replace(/\r/g, '\\r');
      setEscapedValue(`"${escaped}"`);
    } else if (fieldType === 'int') {
      setEscapedValue(value);
    } else {
      setEscapedValue(value);
    }
  }, [value, fieldType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSubmit = () => {
    onValueChange(escapedValue);
    onBack();
  };

  // Get placeholder and input type based on field type
  const getInputConfig = () => {
    switch (fieldType) {
      case 'int':
        return { 
          placeholder: 'Enter a numeric value',
          type: 'number',
          label: 'Enter a numeric value'
        };
      case 'string':
        return { 
          placeholder: 'Enter a string value',
          type: 'text',
          label: 'Enter a string value'
        };
      default:
        return { 
          placeholder: `Enter a ${fieldType} value`,
          type: 'text',
          label: `Enter a ${fieldType} value`
        };
    }
  };

  const inputConfig = getInputConfig();

  return (
    <div className="value-creator">
      <div className="panel-header">
        <h3>{isUpdating ? 'Update value' : 'Create a new value'}</h3>
        <button className="back-button" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="panel-description">
        Provide simple {fieldType} values. Special characters will be automatically escaped.
      </div>

      <div className="input-group">
        <label htmlFor="value-input">{inputConfig.label}</label>
        <input
          id="value-input"
          type={inputConfig.type}
          value={value}
          onChange={handleInputChange}
          placeholder={inputConfig.placeholder}
          className="value-input"
          autoFocus
        />
      </div>

      <div className="output-preview">
        <div className="output-label">Preview:</div>
        <div className="output-value">{escapedValue}</div>
      </div>

      <div className="action-buttons">
        <button 
          className="submit-button" 
          onClick={handleSubmit}
          // Allow empty strings, only disable if the value is undefined
          disabled={value === undefined}
        >
          {isUpdating ? 'Update Value' : 'Use Value'}
        </button>
      </div>

      <div className="helper-note">
        <p>Note: For multi-line text or values with tab characters, use the String Template or Advanced Expression Editor.</p>
      </div>
    </div>
  );
};

export default ValueCreator;