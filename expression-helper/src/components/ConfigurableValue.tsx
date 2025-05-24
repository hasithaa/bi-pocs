import React, { useState, useMemo } from 'react';

interface ConfigurableValueProps {
  existingValues: { name: string; type: string }[];
  onValueCreate: (value: string) => void;
  onBack: () => void;
  fieldType?: string;
}

const ConfigurableValue: React.FC<ConfigurableValueProps> = ({ 
  existingValues, 
  onValueCreate, 
  onBack,
  fieldType = 'string'
}) => {
  const [newName, setNewName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Filter compatible configurable values based on field type
  const compatibleValues = useMemo(() => {
    return existingValues.filter(val => val.type === fieldType);
  }, [existingValues, fieldType]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
    setError(null);
  };

  const validateName = (name: string): boolean => {
    if (!name) {
      setError('Name is required');
      return false;
    }

    // Only allow letters, numbers, and underscores; must start with a letter
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
      setError('Name must start with a letter and contain only letters, numbers, and underscores');
      return false;
    }

    if (existingValues.some(v => v.name === name)) {
      setError('A configurable with this name already exists');
      return false;
    }

    return true;
  };

  const handleCreate = () => {
    if (validateName(newName)) {
      onValueCreate(newName);
    }
  };

  const handleSelectExisting = (name: string) => {
    onValueCreate(name);
  };

  return (
    <div className="configurable-value">
      <div className="panel-header">
        <h3>Create configurable value</h3>
        <button className="back-button" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="panel-description">
        Create a new configurable value or select an existing one to use in this field.
      </div>

      <div className="create-section">
        <h4>Create new configurable</h4>
        <div className="input-group">
          <label htmlFor="configurable-name">Configurable name:</label>
          <input
            id="configurable-name"
            type="text"
            value={newName}
            onChange={handleNameChange}
            placeholder="Enter name"
            autoFocus
            className={error ? 'error' : ''}
          />
          {error && <div className="error-message">{error}</div>}
        </div>
        
        <div className="preview-expression">
          Expression: <code>{newName}</code>
        </div>
        
        <button 
          className="create-button"
          onClick={handleCreate}
          disabled={!newName}
        >
          Create & Use
        </button>
      </div>

      {compatibleValues.length > 0 && (
        <div className="existing-section">
          <h4>Existing configurables</h4>
          <div className="existing-values-list">
            {compatibleValues.map((value) => (
              <button
                key={value.name}
                className="value-item"
                onClick={() => handleSelectExisting(value.name)}
              >
                <span className="value-icon">⚙️</span>
                <span className="value-name">{value.name}</span>
                <span className="value-type">{value.type}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="helper-note">
        <p>Configurable values can be set when deploying your integration.</p>
      </div>
    </div>
  );
};

export default ConfigurableValue;