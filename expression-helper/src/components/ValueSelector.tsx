import React from 'react';

interface Value {
  name: string;
  type: string;
  isRecord?: boolean;
  nestedFields?: Value[];
  isConstant?: boolean;
  isConfigurable?: boolean;
}

interface ValueSelectorProps {
  values: Value[];
  onSelect: (value: string) => void;
  fieldType?: string;
  onBack?: () => void;
}

const ValueSelector: React.FC<ValueSelectorProps> = ({ values, onSelect, fieldType = 'string', onBack }) => {
  // Group values by type and sort
  const groupAndSortValues = () => {
    // First show values that match the field type
    const sortedValues = [...values].sort((a, b) => {
      if (a.type === fieldType && b.type !== fieldType) return -1;
      if (a.type !== fieldType && b.type === fieldType) return 1;
      return a.name.localeCompare(b.name);
    });
    
    return sortedValues;
  };

  const handleSelectValue = (value: Value) => {
    if (value.isRecord) {
      // Handle record selection
      onSelect(value.name);
    } else {
      onSelect(value.name);
    }
  };

  const getValueIcon = (value: Value) => {
    if (value.isConstant) return "CONST";
    if (value.isConfigurable) return "CONFIG";
    if (value.isRecord) return "RECORD";
    return value.type.toUpperCase();
  };

  return (
    <div className="value-selector">
      <div className="panel-header">
        {onBack && (
          <button className="back-button" onClick={onBack}>
            &larr; Back
          </button>
        )}
        <h3>Select a Value</h3>
      </div>
      
      <ul className="value-list">
        {groupAndSortValues().map((value) => (
          <li 
            key={value.name} 
            className="value-list-item"
            onClick={() => handleSelectValue(value)}
          >
            <span className={`value-type ${value.isConstant ? 'constant-icon' : ''} ${value.isConfigurable ? 'configurable-icon' : ''}`}>
              {getValueIcon(value)}
            </span>
            <span className="value-name">{value.name}</span>
          </li>
        ))}
      </ul>
      
      <div className="escape-hatch" onClick={() => onSelect('advanced')}>
        Don't find what you're looking for? Try Advanced expression editor.
      </div>
    </div>
  );
};

export default ValueSelector;