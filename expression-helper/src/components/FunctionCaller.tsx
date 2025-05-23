import React, { useState } from 'react';
import '../styles.css';

interface FunctionCallerProps {
  onFunctionCall: (expression: string) => void;
  fieldType?: string;
  onBack?: () => void;
}

const FunctionCaller: React.FC<FunctionCallerProps> = ({
  onFunctionCall,
  fieldType,
  onBack,
}) => {
  const [functionName, setFunctionName] = useState<string>('');
  const [parameters, setParameters] = useState<string[]>(['']);

  const handleAddParameter = () => {
    setParameters([...parameters, '']);
  };

  const handleParameterChange = (index: number, value: string) => {
    const updatedParams = [...parameters];
    updatedParams[index] = value;
    setParameters(updatedParams);
  };

  const handleRemoveParameter = (index: number) => {
    const updatedParams = [...parameters];
    updatedParams.splice(index, 1);
    setParameters(updatedParams);
  };

  const handleSubmit = () => {
    const paramString = parameters
      .filter((param) => param.trim() !== '')
      .map((param) => param.trim())
      .join(', ');
    
    const expression = `${functionName}(${paramString})`;
    onFunctionCall(expression);
  };

  return (
    <div className="function-caller">
      <h3>Call a Function</h3>
      
      <div className="function-input-group">
        <label>Function Name:</label>
        <input
          type="text"
          value={functionName}
          onChange={(e) => setFunctionName(e.target.value)}
          placeholder="Enter function name"
          className="function-input"
        />
      </div>
      
      <div className="parameters-container">
        <label>Parameters:</label>
        {parameters.map((param, index) => (
          <div key={index} className="parameter-input-group">
            <input
              type="text"
              value={param}
              onChange={(e) => handleParameterChange(index, e.target.value)}
              placeholder={`Parameter ${index + 1}`}
              className="parameter-input"
            />
            <button
              type="button"
              onClick={() => handleRemoveParameter(index)}
              className="remove-parameter-button"
              disabled={parameters.length === 1}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddParameter}
          className="add-parameter-button"
        >
          + Add Parameter
        </button>
      </div>
      
      <div className="function-buttons">
        {onBack && (
          <button 
            type="button" 
            onClick={onBack} 
            className="back-button"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          className="submit-button"
          disabled={!functionName.trim()}
        >
          Create Expression
        </button>
      </div>
    </div>
  );
};

export default FunctionCaller;