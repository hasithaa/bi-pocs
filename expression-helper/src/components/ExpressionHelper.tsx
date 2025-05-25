import React, { useState, useEffect, useRef } from 'react';
import ValueCreator from './ValueCreator';
import StringTemplate from './StringTemplate';
import ValueSelector from './ValueSelector';
import ConfigurableValue from './ConfigurableValue';
import EnvVariable from './EnvVariable';
import AdvancedEditor from './AdvancedEditor';
import FunctionCaller from './FunctionCaller';
import { Field, SyntaxKind } from '../types/Field';
import '../styles.css';

interface ExpressionHelperProps {
  field?: Field;
  onExpressionChange: (expression: string, syntaxKind?: SyntaxKind) => void;
  onClose: () => void;
  onMaskChange?: (masked: boolean) => void;
}

const ExpressionHelper: React.FC<ExpressionHelperProps> = ({ field, onExpressionChange, onClose, onMaskChange }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [expression, setExpression] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [maskExpression, setMaskExpression] = useState<boolean>(false);
  const suggestionsLoaded = useRef<boolean>(false);
  
  // Determine syntax kind if not provided by field
  const determineSyntaxKind = (): SyntaxKind => {
    if (!field?.value || field.value.trim() === '') {
      return SyntaxKind.Literal;
    }
    
    // If syntax_kind is already available, use it
    if (field.syntax_kind) {
      return field.syntax_kind;
    }
    
    const value = field.value.trim();
    
    // Check for string template
    if (value.startsWith('string `') && value.endsWith('`')) {
      return SyntaxKind.StringTemplate;
    }
    
    // Check for literal (string, numeric, boolean)
    if ((value.startsWith('"') && value.endsWith('"')) || 
        /^-?\d+(\.\d+)?$/.test(value) ||
        value === 'true' || value === 'false' || value === 'null') {
      return SyntaxKind.Literal;
    }
    
    // Check for Elvis operator
    if (value.includes('?:')) {
      return SyntaxKind.Elvis;
    }
    
    // Check for method call
    if (value.includes('(') && value.includes(')')) {
      return SyntaxKind.MethodCall;
    }
    
    // Check for optional access
    if (value.includes('?.')) {
      return SyntaxKind.OptionalAccess;
    }
    
    // Check for member access
    if (value.includes('.')) {
      return SyntaxKind.MemberAccess;
    }
    
    // Default to VarRef
    return SyntaxKind.VarRef;
  };
  
  // Get current syntax kind
  const syntaxKind = field?.syntax_kind || determineSyntaxKind();

  // Simplified approach - determine if it's a basic type or more complex
  const isStringTemplate = syntaxKind === SyntaxKind.StringTemplate;
  const isLiteral = syntaxKind === SyntaxKind.Literal;
  const isVariable = syntaxKind === SyntaxKind.VarRef;
  const isComplexExpression = !isStringTemplate && !isLiteral && !isVariable;
  
  // Determine if we have any existing value
  const hasExistingValue = field?.value && field.value.trim() !== '';
  
  // Determine if it's a string literal (for unescaping in ValueCreator)
  const isStringLiteral = hasExistingValue && 
    field?.value?.startsWith('"') && 
    field?.value?.endsWith('"');
  
  // Determine if it's a variable reference (like a, a.b, a.b.c, a?.b.c) or a method call like a.toString()
  const isVariableReference = hasExistingValue && 
    !isStringTemplate && !isStringLiteral &&
    /^[a-zA-Z_][a-zA-Z0-9_]*((\.|(\?\.))[a-zA-Z_][a-zA-Z0-9_]*(\(\))?)*$/.test(field?.value || '');

  // Modified to load only local file path suggestions and limit to 3 items
  useEffect(() => {
    if (field && !suggestionsLoaded.current) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        if (field.name === 'path' || field.type === 'string') {
          // Provide only local file path suggestions, no empty string, limit to 3
          setAiSuggestions([
            `"./data/sample.json"`, 
            `"./config/settings.json"`,
            `"/home/user/documents/data.json"`
          ]);
        } else if (field.type === 'int') {
          // Limit to 3 numeric suggestions
          setAiSuggestions(['42', '100', '1000']);
        }
        setIsLoading(false);
        suggestionsLoaded.current = true;
      }, 1000);
    }
  }, [field]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleExpressionChange = (newExpression: string, newSyntaxKind?: SyntaxKind) => {
    setExpression(newExpression);
    
    // Determine the syntax kind of the new expression if not provided
    const detectedSyntaxKind = newSyntaxKind || determineSyntaxKindForExpression(newExpression);
    
    // Pass both the new expression and its syntax kind to the parent
    onExpressionChange(newExpression, detectedSyntaxKind);
  };
  
  // Helper function to determine syntax kind for a new expression
  const determineSyntaxKindForExpression = (expr: string): SyntaxKind => {
    if (!expr || expr.trim() === '') {
      return SyntaxKind.Literal;
    }
    
    const value = expr.trim();
    
    if (value.startsWith('string `') && value.endsWith('`')) {
      return SyntaxKind.StringTemplate;
    }
    
    if ((value.startsWith('"') && value.endsWith('"')) || 
        /^-?\d+(\.\d+)?$/.test(value) ||
        value === 'true' || value === 'false' || value === 'null') {
      return SyntaxKind.Literal;
    }
    
    // Check for Elvis operator with variable reference (VAR_Elvis)
    if (value.includes('?:') && /^[a-zA-Z_][a-zA-Z0-9_]*((\.|(\?\.))[a-zA-Z_][a-zA-Z0-9_]*)*/.test(value.split('?:')[0].trim())) {
      return SyntaxKind.VAR_Elvis;
    } else if (value.includes('?:')) {
      return SyntaxKind.Elvis;
    }
    
    if (value.includes('(') && value.includes(')')) {
      return SyntaxKind.MethodCall;
    }
    
    if (value.includes('?.')) {
      return SyntaxKind.OptionalAccess;
    }
    
    if (value.includes('.')) {
      return SyntaxKind.MemberAccess;
    }
    
    return SyntaxKind.VarRef;
  };

  const handleBack = () => {
    setSelectedOption(null);
  };

  const handleMaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMaskValue = e.target.checked;
    setMaskExpression(newMaskValue);
    if (onMaskChange) {
      onMaskChange(newMaskValue);
    }
  };

  const renderSuggestions = () => {
    return (
      <>
        <div className="expression-suggestions">
          {isLoading ? (
            <div className="loading-placeholder">Loading suggestions...</div>
          ) : (
            <>
              {aiSuggestions.length > 0 ? (
                <div className="suggestions-button-group">
                  {/* Limit the number of suggestions displayed to 3 */}
                  {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                    <button 
                      key={index} 
                      onClick={() => handleExpressionChange(suggestion)}
                      className="suggestion-button"
                    >
                      <span className="magic-wand-icon">✨</span>
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="no-suggestions">No suggestions available.</div>
              )}
            </>
          )}
        </div>
        
        {/* Add Common Operations section after AI suggestions */}
        {renderCommonOperations()}
      </>
    );
  };
  
  // Add common operations based on field type
  const renderCommonOperations = () => {
    if (field?.type === 'string') {
      return (
        <div className="common-operations">
          <h4 className="common-operations-title">Common String Operations</h4>
          <div className="common-operations-grid">
            <button 
              className="operation-button"
              onClick={() => handleExpressionChange(`string:concat(${field.value || '"string1"'}, ${field.value ? field.value : '"string2"'})`)}
            >
              <span className="operation-icon">🔗</span>
              <span className="operation-text">String Concat</span>
            </button>
            <button 
              className="operation-button"
              onClick={() => handleExpressionChange(`string:substring(${field.value || '"Hello World"'}, 0, 5)`)}
            >
              <span className="operation-icon">✂️</span>
              <span className="operation-text">Substring</span>
            </button>
            <button 
              className="operation-button"
              onClick={() => handleExpressionChange(`string:trim(${field.value || '"  text  "'})`)}
            >
              <span className="operation-icon">🧹</span>
              <span className="operation-text">Trim</span>
            </button>
            <button 
              className="operation-button"
              onClick={() => handleExpressionChange(`string:toLowerAscii(${field.value || '"TEXT"'})`)}
            >
              <span className="operation-icon">⬇️</span>
              <span className="operation-text">To Lowercase</span>
            </button>
            <button 
              className="operation-button"
              onClick={() => handleExpressionChange(`string:toUpperAscii(${field.value || '"text"'})`)}
            >
              <span className="operation-icon">⬆️</span>
              <span className="operation-text">To Uppercase</span>
            </button>
          </div>
        </div>
      );
    } else if (field?.type === 'int') {
      return (
        <div className="common-operations">
          <h4 className="common-operations-title">Common Integer Operations</h4>
          <div className="common-operations-grid">
            <button 
              className="operation-button"
              onClick={() => handleExpressionChange(`${field.value || '0'} + 1`)}
            >
              <span className="operation-icon">➕</span>
              <span className="operation-text">Add</span>
            </button>
            <button 
              className="operation-button"
              onClick={() => handleExpressionChange(`${field.value || '0'} - 1`)}
            >
              <span className="operation-icon">➖</span>
              <span className="operation-text">Subtract</span>
            </button>
            <button 
              className="operation-button"
              onClick={() => handleExpressionChange(`${field.value || '0'} * 2`)}
            >
              <span className="operation-icon">✖️</span>
              <span className="operation-text">Multiply</span>
            </button>
            <button 
              className="operation-button"
              onClick={() => handleExpressionChange(`${field.value || '10'} / 2`)}
            >
              <span className="operation-icon">➗</span>
              <span className="operation-text">Divide</span>
            </button>
            <button 
              className="operation-button"
              onClick={() => handleExpressionChange(`${field.value || '5'} % 2`)}
            >
              <span className="operation-icon">🔄</span>
              <span className="operation-text">Modulo</span>
            </button>
            <button 
              className="operation-button"
              onClick={() => handleExpressionChange(`lang:absInt(${field.value || '-5'})`)}
            >
              <span className="operation-icon">📊</span>
              <span className="operation-text">Absolute Value</span>
            </button>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const renderOptionPanel = () => {
    if (!selectedOption) return null;

    // Common variables available in the scope - including configurables
    const scopeVariables = [
      { name: 'name', type: 'string' },
      { name: 'city', type: 'string' },
      { name: 'country', type: 'string' },
      { name: 'PORT', type: 'string', isConstant: true },
      { name: 'config1', type: 'string', isConfigurable: true },
      { name: 'config2', type: 'string', isConfigurable: true },
      { name: 'DB_URL', type: 'string', isConfigurable: true },
      { name: 'API_KEY', type: 'string', isConfigurable: true },
      { name: 'timeout', type: 'int', isConfigurable: true },
      { name: 'maxRetries', type: 'int', isConfigurable: true },
      { name: 'isEnabled', type: 'boolean', isConfigurable: true },
      { name: 'person', type: 'record', isRecord: true, nestedFields: [
        { name: 'name', type: 'string' },
        { name: 'age', type: 'int' },
        { name: 'address', type: 'record', isRecord: true, nestedFields: [
          { name: 'street', type: 'string' },
          { name: 'city', type: 'string' },
          { name: 'state', type: 'string' },
          { name: 'country', type: 'record', isRecord: true, isOptional: true, nestedFields: [
            { name: 'name', type: 'string' },
            { name: 'code', type: 'string' }
          ]},
          { name: 'zip', type: 'string', isOptional: true }
        ]}
      ]}
    ];

    // Filter out just the configurable values for the ConfigurableValue component
    const configurableValues = scopeVariables
      .filter(variable => variable.isConfigurable)
      .map(({ name, type }) => ({ name, type }));

    switch (selectedOption) {
      case 'createValue':
        return (
          <ValueCreator 
            fieldType={field?.type || 'string'} 
            onValueChange={handleExpressionChange}
            onBack={handleBack}
            existingValue={!isStringTemplate ? field?.value : undefined} // Only pass value if not a template
          />
        );
      case 'stringTemplate':
        return field?.type === 'string' ? (
          <StringTemplate 
            onTemplateChange={handleExpressionChange} 
            onBack={handleBack}
            existingTemplate={isStringTemplate ? field?.value : undefined} // Pass template if exists
          />
        ) : null;
      case 'selectValue':
        return (
          <ValueSelector 
            values={scopeVariables}
            onSelect={handleExpressionChange}
            fieldType={field?.type}
            onBack={handleBack}
            currentValue={field?.value}
          />
        );
      case 'configurableValue':
        return (
          <ConfigurableValue 
            existingValues={configurableValues}
            onValueCreate={handleExpressionChange}
            onBack={handleBack}
            fieldType={field?.type}
          />
        );
      case 'envVariable':
        return (
          <EnvVariable 
            onChange={handleExpressionChange} 
            fieldType={field?.type}
            onBack={handleBack}
          />
        );
      case 'callFunction':
        return (
          <FunctionCaller
            onFunctionCall={handleExpressionChange}
            fieldType={field?.type}
            onBack={handleBack}
          />
        );
      case 'advancedEditor':
        return (
          <AdvancedEditor 
            onExpressionChange={handleExpressionChange}
            onBack={handleBack}
            existingExpression={field?.value}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="expression-helper-side-panel">
      <div className="expression-helper-header">
        <h2>Expression Helper</h2>
        <div className="header-actions">
          {onMaskChange && (
            <button 
              className="settings-button" 
              title="Expression Settings"
              onClick={() => onMaskChange(!maskExpression)}
            >
              ⚙️
            </button>
          )}
          <button className="close-button" onClick={onClose}>×</button>
        </div>
      </div>
      
      {field?.value && (
        <div className="current-expression-preview">
          <div className="preview-label">Current value:</div>
          <div className="preview-value">{field.value}</div>
        </div>
      )}
      
      <div className="expression-helper-content">
        {!selectedOption ? (
          <div className="expression-helper-main-content">
            <div className="option-buttons-grid">
              {/* If there's an existing value, show update options first */}
              {hasExistingValue && (
                <>
                  {/* Show appropriate update option based on simplified categories */}
                  {isStringTemplate && field?.type === 'string' && (
                    <button 
                      className="option-button update-button"
                      onClick={() => handleOptionSelect('stringTemplate')}
                    >
                      Update string template
                    </button>
                  )}
                  
                  {isLiteral && (
                    <button 
                      className="option-button update-button"
                      onClick={() => handleOptionSelect('createValue')}
                    >
                      Update value
                    </button>
                  )}
                  
                  {isVariable && (
                    <button 
                      className="option-button update-button"
                      onClick={() => handleOptionSelect('selectValue')}
                    >
                      Select different variable
                    </button>
                  )}
                  
                  {isComplexExpression && (
                    <button 
                      className="option-button update-button"
                      onClick={() => handleOptionSelect('advancedEditor')}
                    >
                      Edit expression
                    </button>
                  )}
                  
                  <div className="option-separator">
                    <span className="separator-text">or create a new value</span>
                  </div>
                </>
              )}
              
              {/* Standard create options */}
              {/* Only show "Create a new value" if we're not already showing "Update value" */}
              {(!hasExistingValue || !isLiteral) && (
                <button 
                  className="option-button"
                  onClick={() => handleOptionSelect('createValue')}
                >
                  Create a new value
                </button>
              )}
              
              {/* Only show "Create string template" if we're not already showing "Update string template" */}
              {field?.type === 'string' && (!isStringTemplate) && (
                <button 
                  className="option-button"
                  onClick={() => handleOptionSelect('stringTemplate')}
                >
                  Create string template
                </button>
              )}
              
              {/* Only show "Select from variables" if we're not already showing "Select different variable" */}
              {(!isVariable) && (
                <button 
                  className="option-button"
                  onClick={() => handleOptionSelect('selectValue')}
                >
                  Select from variables
                </button>
              )}
              
              <button 
                className="option-button"
                onClick={() => handleOptionSelect('configurableValue')}
              >
                Create configurable value
              </button>
              
              <button 
                className="option-button"
                onClick={() => handleOptionSelect('envVariable')}
              >
                Select environment variable
              </button>
              
              <button 
                className="option-button"
                onClick={() => handleOptionSelect('callFunction')}
              >
                Call a function
              </button>
              
              <button 
                className="option-button"
                onClick={() => handleOptionSelect('advancedEditor')}
              >
                Open expression editor
              </button>
              
              {/* AI Suggestions and Common Operations at the end */}
              {renderSuggestions()}
            </div>
          </div>
        ) : renderOptionPanel()}
      </div>
    </div>
  );
};

export default ExpressionHelper;