import React, { useState } from 'react';

interface ConfigurableValueProps {
    existingValues: string[];
    onValueCreate: (value: string) => void;
    onBack?: () => void;
}

const ConfigurableValue: React.FC<ConfigurableValueProps> = ({ existingValues, onValueCreate, onBack }) => {
    const [newValue, setNewValue] = useState('');

    const handleCreateValue = () => {
        if (newValue.trim()) {
            onValueCreate(`config:getAsString("${newValue}")`);
            setNewValue('');
        }
    };

    const handleSelectValue = (value: string) => {
        onValueCreate(`config:getAsString("${value}")`);
    };

    return (
        <div className="configurable-value">
            <div className="panel-header">
                {onBack && (
                    <button className="back-button" onClick={onBack}>
                        &larr; Back
                    </button>
                )}
                <h3>Configurable Values</h3>
            </div>

            <div className="input-group">
                <label htmlFor="configurable-value">New Configurable Value:</label>
                <div className="configurable-input-container">
                    <input
                        type="text"
                        id="configurable-value"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="Enter new configurable value name"
                        className="configurable-input"
                    />
                    <button 
                        onClick={handleCreateValue}
                        className="primary-button"
                        disabled={!newValue.trim()}
                    >
                        Create
                    </button>
                </div>
            </div>

            {existingValues.length > 0 && (
                <div className="existing-values">
                    <h4>Existing Configurable Values:</h4>
                    <ul className="value-list">
                        {existingValues.map((value, index) => (
                            <li 
                                key={index} 
                                className="value-list-item"
                                onClick={() => handleSelectValue(value)}
                            >
                                <span className="value-type configurable-icon">CONFIG</span>
                                <span className="value-name">{value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ConfigurableValue;