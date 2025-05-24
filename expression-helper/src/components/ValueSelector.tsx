import React, { useState, useMemo } from 'react';
import { Value, SyntaxKind } from '../types/Field';

interface ValueSelectorProps {
  values: Value[];
  onSelect: (value: string, syntaxKind?: SyntaxKind) => void;
  onBack: () => void;
  fieldType?: string;
  currentValue?: string;
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
  const [showDefaultValueModal, setShowDefaultValueModal] = useState<boolean>(false);
  const [defaultValue, setDefaultValue] = useState<string>('""');
  const [pendingPath, setPendingPath] = useState<string>('');
  const [pendingSyntaxKind, setPendingSyntaxKind] = useState<SyntaxKind | undefined>(undefined);
  
  // Determine if we're updating an existing variable reference
  const isUpdatingVariable = currentValue && 
    /^[a-zA-Z_][a-zA-Z0-9_]*((\.|(\?\.))[a-zA-Z_][a-zA-Z0-9_]*(\(\))?)*$/.test(currentValue);

  // Check if a field in the path is optional
  const isFieldOptional = (fieldName: string, currentFields: Value[]): boolean => {
    const field = currentFields.find(f => f.name === fieldName);
    return field ? !!field.isOptional : false;
  };

  // Helper to find a record by its full path
  const findRecordByPath = (path: string, allValues: Value[]): Value | null => {
    const segments = path.split('.');
    if (segments.length === 0) return null;
    
    // Find root level record
    let currentRecord: Value | undefined = allValues.find(v => v.name === segments[0] && v.isRecord);
    if (!currentRecord) return null;
    
    // Navigate through the segments
    for (let i = 1; i < segments.length; i++) {
      if (!currentRecord || !currentRecord.nestedFields) return null;
      
      const fieldName = segments[i];
      const nextRecord: Value | undefined = currentRecord.nestedFields.find(
        f => f.name === fieldName && f.isRecord
      );
      
      if (!nextRecord) return null;
      
      currentRecord = nextRecord;
    }
    
    return currentRecord || null;
  };
  
  // Format path with appropriate dot notation (. or ?.) based on field optionality
  const formatPath = (path: string): string => {
    const segments = path.split('.');
    if (segments.length === 1) return segments[0]; // No dots needed for single field
    
    let formattedPath = segments[0];
    let currentFields = values.filter(v => !v.isRecord);
    let recordFields = values.filter(v => v.isRecord);
    
    // Process each segment starting from the second one
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      
      // Find the current record we're navigating
      if (i > 1) {
        // We need to find the nested fields for proper navigation
        const parentSegment = segments[i-1];
        const parentRecord = findRecordByPath(segments.slice(0, i).join('.'), values);
        
        if (parentRecord && parentRecord.nestedFields) {
          currentFields = parentRecord.nestedFields;
        }
      } else {
        // First level - find the record
        const rootRecord = recordFields.find(r => r.name === segments[0]);
        if (rootRecord && rootRecord.nestedFields) {
          currentFields = rootRecord.nestedFields;
        }
      }
      
      // Check if this segment is optional
      const isOptional = isFieldOptional(segment, currentFields);
      formattedPath += (isOptional ? '?.' : '.') + segment;
    }
    
    return formattedPath;
  };
  
  // Check if path contains any optional fields
  const pathContainsOptionalFields = (path: string): boolean => {
    return formatPath(path).includes('?.');
  };

  // Handle click on a variable item
  const handleVariableSelect = (path: string, isTerminalNodeOptional: boolean): void => {
    // Format the path correctly with proper dot notation
    const formattedPath = formatPath(path);
    
    // Determine the syntax kind based on the formatted path
    let syntaxKind = SyntaxKind.VarRef;
    
    if (formattedPath.includes('?.')) {
      syntaxKind = SyntaxKind.OptionalAccess;
    } else if (formattedPath.includes('.')) {
      if (formattedPath.includes('()')) {
        syntaxKind = SyntaxKind.MethodCall;
      } else {
        syntaxKind = SyntaxKind.MemberAccess;
      }
    }
    
    // For string fields with optional parts, request a default value
    if ((formattedPath.includes('?.') || isTerminalNodeOptional) && fieldType === 'string') {
      setPendingPath(formattedPath);
      setPendingSyntaxKind(syntaxKind);
      setShowDefaultValueModal(true);
    } else {
      // Use the formatted path directly with syntax kind
      onSelect(formattedPath, syntaxKind);
    }
  };
  
  // Handle submitting the default value modal
  const handleDefaultValueSubmit = () => {
    setShowDefaultValueModal(false);
    
    // Create the expression with nil coalescing operator
    const finalExpression = `${pendingPath} ?: ${defaultValue}`;
    
    // Use VAR_Elvis syntax kind for variable references with elvis operator
    onSelect(finalExpression, SyntaxKind.VAR_Elvis);
    
    // Reset state
    setPendingPath('');
    setPendingSyntaxKind(undefined);
    setDefaultValue('""');
  };

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
  
  // Render a variable item
  const renderVariableItem = (value: Value, depth: number = 0, parentPath: string = '') => {
    const isRecord = value.isRecord && value.nestedFields?.length;
    const isExpanded = expandedRecords[parentPath ? `${parentPath}.${value.name}` : value.name];
    
    // Check if this is an integer or boolean field
    const isInteger = value.type === 'int' || value.type === 'integer';
    const isBoolean = value.type === 'boolean';
    const isNumeric = isInteger || ['float', 'decimal'].includes(value.type);
    
    // For string target fields, numeric and boolean values need conversion
    const needsConversion = fieldType === 'string' && (isNumeric || isBoolean);
    
    // Determine if the item should be clickable
    // Non-string values should not be clickable when target field is string
    const isClickable = isRecord || !needsConversion;
    
    // Full path for this item
    const fullPath = parentPath ? `${parentPath}.${value.name}` : value.name;
    
    return (
      <div key={`${fullPath}-${depth}`} className="variable-item-container">
        <div 
          className={`variable-item ${value.isConstant ? 'constant' : ''} ${value.isConfigurable ? 'configurable' : ''} ${!isClickable ? 'non-clickable' : ''} ${value.isOptional ? 'optional-field' : ''}`}
          onClick={() => {
            if (isRecord) {
              toggleRecord(fullPath);
            } else if (isClickable) {
              handleVariableSelect(fullPath, !!value.isOptional);
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
          <span className="variable-name">{value.name}{value.isOptional ? '?' : ''}</span>
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
        
        {/* Show toString() method for numeric and boolean fields when target field is string */}
        {needsConversion && (
          <div 
            className="variable-method-item"
            onClick={() => handleVariableSelect(`${fullPath}.toString()`, !!value.isOptional)}
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
            {sortedValues.stringVariables.map(value => renderVariableItem(value, 0, ''))}
          </div>
        )}
        
        {sortedValues.compatibleTypes.length > 0 && (
          <div className="variables-section">
            <div className="section-label">Configurable & constant {fieldType}s</div>
            {sortedValues.compatibleTypes.map(value => renderVariableItem(value, 0, ''))}
          </div>
        )}
        
        {sortedValues.otherTypes.length > 0 && (
          <div className="variables-section">
            <div className="section-label">Other variables</div>
            {sortedValues.otherTypes.map(value => renderVariableItem(value, 0, ''))}
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
      
      {/* Default Value Modal */}
      {showDefaultValueModal && (
        <div className="default-value-modal">
          <div className="modal-content">
            <h3>Provide Default Value</h3>
            <p>
              You're selecting a path that contains optional fields. Please provide a default value to use 
              when a field is null.
            </p>
            <div className="input-group">
              <label htmlFor="default-value">Default value:</label>
              <input 
                type="text" 
                id="default-value"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                className="default-value-input"
                autoFocus
              />
            </div>
            <div className="preview-expression">
              Expression: <code>{pendingPath} ?: {defaultValue}</code>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowDefaultValueModal(false)}
              >
                Cancel
              </button>
              <button 
                className="submit-button"
                onClick={handleDefaultValueSubmit}
              >
                Use This Expression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValueSelector;