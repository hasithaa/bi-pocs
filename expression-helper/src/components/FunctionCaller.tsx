import React, { useState, useEffect, useMemo } from 'react';
import '../styles.css';

interface FunctionParam {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

interface FunctionDefinition {
  name: string;
  displayName: string;
  module?: string;
  returnType: string;
  description: string;
  params: FunctionParam[];
  category: string;
}

interface FunctionCallerProps {
  onFunctionCall: (expression: string) => void;
  fieldType?: string;
  onBack: () => void;
}

const FunctionCaller: React.FC<FunctionCallerProps> = ({ onFunctionCall, fieldType = 'string', onBack }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFunction, setSelectedFunction] = useState<FunctionDefinition | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Common functions for example
  const commonFunctions: FunctionDefinition[] = [
    {
      name: 'time:currentTime',
      displayName: 'currentTime',
      module: 'time',
      returnType: 'time:Time',
      description: 'Returns the current time value.',
      params: [],
      category: 'Date and Time'
    },
    {
      name: 'time:utcNow',
      displayName: 'utcNow',
      module: 'time',
      returnType: 'time:Utc',
      description: 'Returns the current UTC time.',
      params: [],
      category: 'Date and Time'
    },
    {
      name: 'time:toTimeZoneString',
      displayName: 'toTimeZoneString',
      module: 'time',
      returnType: 'string',
      description: 'Converts a time value to a formatted string according to the specified timezone.',
      params: [
        { name: 'time', type: 'time:Time', required: true, description: 'The time value to format' },
        { name: 'format', type: 'string', required: false, defaultValue: 'yyyy-MM-dd HH:mm:ss', description: 'Format string' }
      ],
      category: 'Date and Time'
    },
    {
      name: 'lang:uuid',
      displayName: 'uuid',
      module: 'lang',
      returnType: 'string',
      description: 'Generates a random UUID string.',
      params: [],
      category: 'String Functions'
    },
    {
      name: 'string:includes',
      displayName: 'includes',
      module: 'string',
      returnType: 'boolean',
      description: 'Checks if a string contains a substring.',
      params: [
        { name: 'str', type: 'string', required: true, description: 'The source string' },
        { name: 'substring', type: 'string', required: true, description: 'The substring to search for' }
      ],
      category: 'String Functions'
    },
    {
      name: 'array:length',
      displayName: 'length',
      module: 'array',
      returnType: 'int',
      description: 'Returns the length of an array.',
      params: [
        { name: 'arr', type: 'any[]', required: true, description: 'The array to get the length of' }
      ],
      category: 'Array Functions'
    }
  ];

  // Reset param values when function selection changes
  useEffect(() => {
    if (selectedFunction) {
      const initialParams: Record<string, string> = {};
      selectedFunction.params.forEach(param => {
        if (param.defaultValue) {
          initialParams[param.name] = param.defaultValue;
        } else {
          initialParams[param.name] = '';
        }
      });
      setParamValues(initialParams);
      setError(null);
    }
  }, [selectedFunction]);

  // Filter functions based on search query and return type compatibility
  const filteredFunctions = useMemo(() => {
    return commonFunctions.filter(func => {
      const matchesSearch = 
        searchQuery === '' || 
        func.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        func.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        func.category.toLowerCase().includes(searchQuery.toLowerCase());

      // For string fields, all return types can be used with toString()
      // For other fields, only match exact types or compatible types
      let isCompatible = true;
      if (fieldType !== 'string') {
        isCompatible = func.returnType === fieldType || 
          (fieldType === 'int' && func.returnType === 'integer') ||
          (fieldType === 'decimal' && ['float', 'int', 'integer'].includes(func.returnType));
      }

      return matchesSearch && isCompatible;
    });
  }, [searchQuery, fieldType, commonFunctions]);

  // Group functions by category
  const groupedFunctions = useMemo(() => {
    const groups: Record<string, FunctionDefinition[]> = {};
    
    filteredFunctions.forEach(func => {
      if (!groups[func.category]) {
        groups[func.category] = [];
      }
      groups[func.category].push(func);
    });
    
    return groups;
  }, [filteredFunctions]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFunctionSelect = (func: FunctionDefinition) => {
    setSelectedFunction(func);
  };

  const handleParamChange = (paramName: string, value: string) => {
    setParamValues(prev => ({
      ...prev,
      [paramName]: value
    }));
    setError(null);
  };

  const validateParams = (): boolean => {
    if (!selectedFunction) return false;
    
    // Check if all required params have values
    const missingParams = selectedFunction.params
      .filter(param => param.required && !paramValues[param.name]);
    
    if (missingParams.length > 0) {
      setError(`Missing required parameter: ${missingParams[0].name}`);
      return false;
    }
    
    return true;
  };

  const handleApplyFunction = () => {
    if (!selectedFunction) return;
    
    if (!validateParams()) return;
    
    // Generate the function call expression
    const paramString = selectedFunction.params
      .filter(param => paramValues[param.name] !== '')
      .map(param => paramValues[param.name])
      .join(', ');
    
    const functionCall = `${selectedFunction.name}(${paramString})`;
    
    // Add toString() for string fields if needed
    const finalExpression = fieldType === 'string' && selectedFunction.returnType !== 'string'
      ? `${functionCall}.toString()`
      : functionCall;
    
    onFunctionCall(finalExpression);
  };

  const handleBack = () => {
    if (selectedFunction) {
      setSelectedFunction(null);
    } else {
      onBack();
    }
  };

  return (
    <div className="function-caller">
      <div className="panel-header">
        <h3>{selectedFunction ? `Configure function: ${selectedFunction.displayName}` : 'Call a function'}</h3>
        <button className="back-button" onClick={handleBack}>
          Back
        </button>
      </div>

      {!selectedFunction ? (
        // Function selection view
        <>
          <div className="panel-description">
            Select a function to call. The return value will be used in your expression.
          </div>

          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search functions..." 
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
          </div>

          <div className="functions-list-container">
            {Object.entries(groupedFunctions).length > 0 ? (
              Object.entries(groupedFunctions).map(([category, functions]) => (
                <div key={category} className="function-category">
                  <h4 className="category-header">{category}</h4>
                  {functions.map(func => (
                    <button
                      key={func.name}
                      className="function-item"
                      onClick={() => handleFunctionSelect(func)}
                    >
                      <div className="function-info">
                        <span className="function-name">{func.displayName}</span>
                        <span className="function-return-type">{func.returnType}</span>
                      </div>
                      <div className="function-description">{func.description}</div>
                    </button>
                  ))}
                </div>
              ))
            ) : (
              <div className="no-functions">
                No functions found matching your search or compatible with this field type.
              </div>
            )}
          </div>

          <div className="helper-note">
            <p>For more advanced function calls, use the expression editor.</p>
          </div>
        </>
      ) : (
        // Function parameters view
        <>
          <div className="function-details">
            <div className="function-signature">
              <span className="return-type">{selectedFunction.returnType}</span>
              <span className="function-full-name">{selectedFunction.name}</span>
              <span className="parameters-list">
                (
                {selectedFunction.params.map((param, index) => (
                  <span key={param.name} className="parameter-signature">
                    {index > 0 ? ', ' : ''}
                    <span className="parameter-type">{param.type}</span>
                    <span className="parameter-name">{param.name}</span>
                    {!param.required && <span className="optional-mark">?</span>}
                  </span>
                ))}
                )
              </span>
            </div>
            <div className="function-description">{selectedFunction.description}</div>
          </div>

          <div className="parameters-form">
            {selectedFunction.params.length > 0 ? (
              <>
                <h4>Function parameters</h4>
                {selectedFunction.params.map(param => (
                  <div key={param.name} className="parameter-input-group">
                    <label htmlFor={`param-${param.name}`}>
                      {param.name}
                      {param.required && <span className="required-mark">*</span>}
                      <span className="param-type">{param.type}</span>
                    </label>
                    <input
                      id={`param-${param.name}`}
                      type="text"
                      value={paramValues[param.name] || ''}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      placeholder={param.description || `Enter ${param.name}`}
                      className={param.required && !paramValues[param.name] ? 'error' : ''}
                    />
                    {param.description && (
                      <div className="param-description">{param.description}</div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="no-params">This function does not require any parameters.</div>
            )}
            
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="preview-expression">
            Expression: <code>
              {selectedFunction.name}(
                {selectedFunction.params
                  .filter(param => paramValues[param.name] !== '')
                  .map(param => paramValues[param.name])
                  .join(', ')}
              ){fieldType === 'string' && selectedFunction.returnType !== 'string' ? '.toString()' : ''}
            </code>
          </div>

          <button 
            className="apply-button"
            onClick={handleApplyFunction}
          >
            Use Function
          </button>
        </>
      )}
    </div>
  );
};

export default FunctionCaller;