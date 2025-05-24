import React, { useState } from 'react';

interface EnvVariableProps {
  onChange: (value: string) => void;
  onBack: () => void;
  fieldType?: string;
}

const EnvVariable: React.FC<EnvVariableProps> = ({ onChange, onBack, fieldType = 'string' }) => {
  const [envVarName, setEnvVarName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleEnvVarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnvVarName(e.target.value);
    setError(null);
  };

  const validateEnvVarName = (name: string): boolean => {
    if (!name) {
      setError('Environment variable name is required');
      return false;
    }

    // Common convention for env var names: uppercase letters, numbers, underscores
    if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
      setError('Environment variable names should be uppercase and contain only letters, numbers, and underscores');
      return false;
    }

    return true;
  };

  const handleApply = () => {
    if (validateEnvVarName(envVarName)) {
      // Generate the appropriate expression based on field type
      let expression = `os:getEnv("${envVarName}")`;
      
      // For non-string fields, add necessary type conversion
      if (fieldType !== 'string') {
        if (fieldType === 'int') {
          expression = `check int:fromString(os:getEnv("${envVarName}"))`;
        } else if (fieldType === 'float' || fieldType === 'decimal') {
          expression = `check decimal:fromString(os:getEnv("${envVarName}"))`;
        } else if (fieldType === 'boolean') {
          expression = `check boolean:fromString(os:getEnv("${envVarName}"))`;
        }
      }
      
      onChange(expression);
    }
  };

  // Commonly used environment variables as suggestions
  const commonEnvVars = [
    'PORT', 
    'HOST', 
    'DB_URL', 
    'API_KEY', 
    'USERNAME', 
    'PASSWORD',
    'DEBUG',
    'ENV'
  ];

  return (
    <div className="env-variable-component">
      <div className="panel-header">
        <h3>Select environment variable</h3>
        <button className="back-button" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="panel-description">
        Use the value of an environment variable in your expression.
        {fieldType !== 'string' && 
          ` The value will be converted to ${fieldType} type.`}
      </div>

      <div className="input-section">
        <div className="input-group">
          <label htmlFor="env-var-name">Environment variable name:</label>
          <input
            id="env-var-name"
            type="text"
            value={envVarName}
            onChange={handleEnvVarChange}
            placeholder="Enter environment variable name"
            autoFocus
            className={error ? 'error' : ''}
          />
          {error && <div className="error-message">{error}</div>}
        </div>
        
        <div className="preview-expression">
          Expression: <code>
            {fieldType === 'string' 
              ? `os:getEnv("${envVarName || 'ENV_NAME'}")` 
              : `check ${fieldType}:fromString(os:getEnv("${envVarName || 'ENV_NAME'}"))`}
          </code>
        </div>
        
        <button 
          className="apply-button"
          onClick={handleApply}
          disabled={!envVarName}
        >
          Use Environment Variable
        </button>
      </div>

      <div className="suggestions-section">
        <h4>Common environment variables</h4>
        <div className="suggestion-buttons">
          {commonEnvVars.map(envVar => (
            <button
              key={envVar}
              className="suggestion-button"
              onClick={() => setEnvVarName(envVar)}
            >
              {envVar}
            </button>
          ))}
        </div>
      </div>

      <div className="helper-note">
        <p>Environment variables are read at runtime from the deployment environment.</p>
      </div>
    </div>
  );
};

export default EnvVariable;