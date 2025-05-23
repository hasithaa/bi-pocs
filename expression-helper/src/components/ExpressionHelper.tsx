import React, { useState, useEffect, useRef } from 'react';
import ValueCreator from './ValueCreator';
import StringTemplate from './StringTemplate';
import ValueSelector from './ValueSelector';
import ConfigurableValue from './ConfigurableValue';
import EnvVariable from './EnvVariable';
import AdvancedEditor from './AdvancedEditor';
import FunctionCaller from './FunctionCaller';
import { Field } from '../types/Field';
import '../styles.css';

interface ExpressionHelperProps {
  field?: Field;
  onExpressionChange: (expression: string) => void;
  onClose: () => void;
}

const ExpressionHelper: React.FC<ExpressionHelperProps> = ({ field, onExpressionChange, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [expression, setExpression] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const suggestionsLoaded = useRef<boolean>(false);

  // Modified to load only local file path suggestions
  useEffect(() => {
    if (field && !suggestionsLoaded.current) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        if (field.name === 'path' || field.type === 'string') {
          // Provide only local file path suggestions
          setAiSuggestions([
            `"./data/sample.json"`, 
            `"./config/settings.json"`,
            `"/home/user/documents/data.json"`,
            `"C:/Users/username/Documents/config.json"`
          ]);
        } else if (field.type === 'int') {
          setAiSuggestions(['42', '100', (field.defaultValue || '0').toString()]);
        }
        setIsLoading(false);
        suggestionsLoaded.current = true;
      }, 1000);
    }
  }, [field]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleExpressionChange = (newExpression: string) => {
    setExpression(newExpression);
    onExpressionChange(newExpression);
  };

  const handleBack = () => {
    setSelectedOption(null);
  };

  const renderSuggestions = () => {
    return (
      <div className="expression-suggestions">
        {isLoading ? (
          <div className="loading-placeholder">Loading suggestions...</div>
        ) : (
          <>
            {aiSuggestions.length > 0 ? (
              <div className="suggestions-button-group">
                {aiSuggestions.map((suggestion, index) => (
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
    );
  };

  const renderOptionPanel = () => {
    if (!selectedOption) return null;

    switch (selectedOption) {
      case 'createValue':
        return (
          <ValueCreator 
            fieldType={field?.type || 'string'} 
            onValueChange={handleExpressionChange}
            onBack={handleBack}
          />
        );
      case 'stringTemplate':
        return field?.type === 'string' ? (
          <StringTemplate 
            onTemplateChange={handleExpressionChange} 
            onBack={handleBack}
          />
        ) : null;
      case 'selectValue':
        return (
          <ValueSelector 
            values={[
              { name: 'name', type: 'string' },
              { name: 'city', type: 'string' },
              { name: 'country', type: 'string' },
              { name: 'PORT', type: 'string', isConstant: true },
              { name: 'config1', type: 'string', isConfigurable: true },
              { name: 'config2', type: 'string', isConfigurable: true },
              { name: 'user', type: 'record', isRecord: true, nestedFields: [
                { name: 'firstName', type: 'string' },
                { name: 'lastName', type: 'string' },
                { name: 'address', type: 'record', isRecord: true, nestedFields: [
                  { name: 'street', type: 'string' },
                  { name: 'city', type: 'string' }
                ]}
              ]}
            ]} 
            onSelect={handleExpressionChange}
            fieldType={field?.type}
            onBack={handleBack}
          />
        );
      case 'configurableValue':
        return (
          <ConfigurableValue 
            existingValues={['config1', 'config2', 'db.url', 'api.key']} 
            onValueCreate={handleExpressionChange}
            onBack={handleBack}
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
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="expression-helper-content">
        {!selectedOption ? (
          <div className="expression-helper-main-content">
            <div className="option-buttons-grid">
              <button 
                className="option-button"
                onClick={() => handleOptionSelect('createValue')}
              >
                Create a new value
              </button>
              
              {field?.type === 'string' && (
                <button 
                  className="option-button"
                  onClick={() => handleOptionSelect('stringTemplate')}
                >
                  Create template
                </button>
              )}
              
              <button 
                className="option-button"
                onClick={() => handleOptionSelect('selectValue')}
              >
                Select from variables
              </button>
              
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
                Select env variable
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
                Advanced expression editor
              </button>
              
              {/* AI Suggestions moved below the operation buttons */}
              {renderSuggestions()}
            </div>
          </div>
        ) : renderOptionPanel()}
      </div>
    </div>
  );
};

export default ExpressionHelper;