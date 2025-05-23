import React, { useState, useMemo } from 'react';

interface Value {
  name: string;
  type: string;
  isConstant?: boolean;
  isConfigurable?: boolean;
  isRecord?: boolean;
  nestedFields?: Value[];
}

interface ValueSelectorProps {
  values: Value[];
  onSelect: (value: string) => void;
  onBack: () => void;
  fieldType?: string;
  currentValue?: string; // Add current value prop
}

const ValueSelector: React.FC<ValueSelectorProps> = ({ 
  values, 
  onSelect, 
  onBack, 
  fieldType = 'string',
  currentValue = '' 
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRecords, setExpandedRecords] = useState<Record<string, boolean>>({});

  // Sort and filter values based on type compatibility and search query
  const sortedValues = useMemo(() => {
    // Filter values based on search query
    const filteredValues = values.filter(value => 
      value.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort values into categories
    const stringVariables: Value[] = [];
    const compatibleTypes: Value[] = [];
    const otherTypes: Value[] = [];
    
    filteredValues.forEach(value => {
      // Exact type match
      if (value.type === fieldType) {
        // Prioritize string variables
        stringVariables.push(value);
      } 
      // For string fields, add compatible types (like string constants and configurables)
      else if (
        fieldType === 'string' && 
        value.type === 'string' && 
        (value.isConstant || value.isConfigurable)
      ) {
        compatibleTypes.push(value);
      }
      // Other values
      else {
        otherTypes.push(value);
      }
    });
    
    return { stringVariables, compatibleTypes, otherTypes };
  }, [values, searchQuery, fieldType]);

  const toggleRecord = (valueName: string) => {
    setExpandedRecords(prev => ({
      ...prev,
      [valueName]: !prev[valueName]
    }));
  };

  // Get icon for variable type
  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'string':
        return 'Aa'; // Text icon
      case 'int':
      case 'float':
      case 'decimal':
        return '123'; // Number icon
      case 'boolean':
        return '☑'; // Checkbox icon
      case 'record':
        return '{}'; // Braces for record
      case 'array':
        return '[]'; // Brackets for array
      default:
        return '⚪'; // Default icon
    }
  };
  
  // Get icon for variable kind
  const getKindIcon = (value: Value): string => {
    if (value.isConstant) {
      return '🔒'; // Lock for constant
    } else if (value.isConfigurable) {
      return '⚙️'; // Gear for configurable
    } else {
      return '📝'; // Note for regular variable
    }
  };
  
  // Determine if we're updating an existing variable reference or method call
  const isUpdatingVariable = currentValue && 
    /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*(\(\))?)*$/.test(currentValue);

  // Render a variable item
  const renderVariableItem = (value: Value, depth: number = 0, parentPath: string = '') => {
    const isRecord = value.isRecord && value.nestedFields?.length;
    const isExpanded = expandedRecords[parentPath ? `${parentPath}.${value.name}` : value.name];
    
    // Check if this is an integer field
    const isInteger = value.type === 'int' || value.type === 'integer';
    
    // Determine if the item should be clickable
    // Integer fields should not be clickable when target field is string
    const isClickable = isRecord || !(isInteger && fieldType === 'string');
    
    // Full path for this item
    const fullPath = parentPath ? `${parentPath}.${value.name}` : value.name;
    
    return (
      <div key={`${fullPath}-${depth}`} className="variable-item-container">
        <div 
          className={`variable-item ${value.isConstant ? 'constant' : ''} ${value.isConfigurable ? 'configurable' : ''} ${!isClickable ? 'non-clickable' : ''}`}
          onClick={() => {
            if (isRecord) {
              toggleRecord(fullPath);
            } else if (isClickable) {
              onSelect(fullPath);
            }
          }}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <div className="variable-icons">
            <span className="variable-type-icon" title={`Type: ${value.type}`}>
              {getTypeIcon(value.type)}
            </span>
            <span className="variable-kind-icon" title={value.isConstant ? 'Constant' : value.isConfigurable ? 'Configurable' : 'Variable'}>
              {getKindIcon(value)}
            </span>
          </div>
          <span className="variable-name">{value.name}</span>
          <span className="variable-type">{value.type}</span>
          {isRecord && (
            <button className="expand-toggle" onClick={(e) => {
              e.stopPropagation();
              toggleRecord(fullPath);
            }}>
              {isExpanded ? '▾' : '▸'}
            </button>
          )}
        </div>
        
        {/* Show toString() method for integer fields when target field is string */}
        {isInteger && fieldType === 'string' && (
          <div 
            className="variable-method-item"
            onClick={() => onSelect(`${fullPath}.toString()`)}
          >
            <div className="variable-icons">
              <span className="variable-method-icon" title="Method">
                ƒ
              </span>
            </div>
            <span className="variable-name">toString()</span>
            <span className="variable-type">string</span>
          </div>
        )}
        
        {isRecord && isExpanded && value.nestedFields?.map(nestedField => 
          renderVariableItem(nestedField, depth + 1, fullPath)
        )}
      </div>
    );
  };

  return (
    <div className="value-selector">
      <div className="panel-header">
        <h3>{isUpdatingVariable ? 'Select different variable' : 'Select from variables'}</h3>
        <button className="back-button" onClick={onBack}>
          Back
        </button>
      </div>
      
      <div className="panel-description">
        {isUpdatingVariable 
          ? `Currently using "${currentValue}". Select a different variable to use as the expression value.`
          : 'Select a variable to use as the expression value.'
        }
      </div>

      <div className="search-container">
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search variables..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="variables-list-container">
        {sortedValues.stringVariables.length > 0 && (
          <div className="variables-section">
            <div className="section-label">{fieldType} variables</div>
            {sortedValues.stringVariables.map(value => renderVariableItem(value))}
          </div>
        )}
        
        {sortedValues.compatibleTypes.length > 0 && (
          <div className="variables-section">
            <div className="section-label">Configurable & constant {fieldType}s</div>
            {sortedValues.compatibleTypes.map(value => renderVariableItem(value))}
          </div>
        )}
        
        {sortedValues.otherTypes.length > 0 && (
          <div className="variables-section">
            <div className="section-label">Other variables</div>
            {sortedValues.otherTypes.map(value => renderVariableItem(value))}
          </div>
        )}
        
        {sortedValues.stringVariables.length === 0 && 
         sortedValues.compatibleTypes.length === 0 && 
         sortedValues.otherTypes.length === 0 && (
          <div className="no-variables">
            No matching variables found.
          </div>
        )}
      </div>
      
      <div className="helper-note">
        <p>Don't find what you're looking for? Try the Advanced expression editor.</p>
      </div>
    </div>
  );
};

export default ValueSelector;