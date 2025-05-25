import React, { useState, useEffect } from 'react';
import ExpressionHelper from './components/ExpressionHelper';
import { Field, SyntaxKind } from './types/Field';
import './styles.css';

const App: React.FC = () => {
  // Instead of a single expression value, maintain a map of expressions by node type
  const [expressionsByNode, setExpressionsByNode] = useState<Record<string, string>>({
    abs: "-42", // Default value for abs node
    fileReadJson: "" // Default empty value for fileReadJson node
  });
  const [syntaxKindByNode, setSyntaxKindByNode] = useState<Record<string, SyntaxKind>>({
    abs: SyntaxKind.Literal,
    fileReadJson: SyntaxKind.Literal
  });
  const [showHelper, setShowHelper] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [maskExpressions, setMaskExpressions] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<string | null>('automation');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'may15': true,
    'entryPoints': true,
    'listeners': false,
    'connections': false,
    'types': false,
    'functions': false,
    'dataMappers': false,
    'configurations': false,
    'localConnectors': false
  });
  
  // Get the current expression based on selected node
  const getCurrentExpression = () => {
    return selectedNode ? expressionsByNode[selectedNode] || "" : "";
  };
  
  // Get the current syntax kind based on selected node
  const getCurrentSyntaxKind = () => {
    return selectedNode ? syntaxKindByNode[selectedNode] || SyntaxKind.Literal : SyntaxKind.Literal;
  };
  
  // Example field for testing - now uses node-specific values
  const exampleField: Field = {
    name: selectedNode === 'abs' ? 'n' : 'path',
    type: selectedNode === 'abs' ? 'int' : 'string',
    isRequired: true,
    defaultValue: '',
    value: getCurrentExpression(),
    syntax_kind: getCurrentSyntaxKind()
  };

  // Save expression to localStorage whenever it changes
  useEffect(() => {
    if (selectedNode === 'fileReadJson') {
      localStorage.setItem('savedExpression', expressionsByNode.fileReadJson || "");
    }
  }, [expressionsByNode.fileReadJson]);

  // Load saved expression from localStorage
  useEffect(() => {
    const savedValue = localStorage.getItem('savedExpression');
    if (savedValue) {
      setExpressionsByNode(prev => ({
        ...prev,
        fileReadJson: savedValue
      }));
    }
  }, []);

  const handleExpressionChange = (newExpression: string, newSyntaxKind?: SyntaxKind) => {
    if (selectedNode) {
      // Update the expression for the current node only
      setExpressionsByNode(prev => ({
        ...prev,
        [selectedNode]: newExpression
      }));
      
      // Update syntax kind if provided
      if (newSyntaxKind) {
        setSyntaxKindByNode(prev => ({
          ...prev,
          [selectedNode]: newSyntaxKind
        }));
      }
      
      console.log(`Expression updated for node ${selectedNode}:`, newExpression, 'Syntax Kind:', newSyntaxKind || getCurrentSyntaxKind());
    }
  };

  const handleNodeClick = () => {
    // Only open the form panel, not the helper
    setShowForm(true);
    // Ensure helper is closed when reopening the form
    setShowHelper(false);
  };

  const handleFieldClick = () => {
    // Only open the helper when explicitly clicking on a field
    setShowHelper(true);
  };

  const handleHelperClose = () => {
    setShowHelper(false);
  };
  
  const handleFormClose = () => {
    setShowForm(false);
    // Also ensure helper is closed when closing the form
    setShowHelper(false);
  };
  
  const handleSave = () => {
    // Save the form and close it
    console.log('Form saved with expression:', getCurrentExpression());
    setShowForm(false);
    // Ensure helper is closed when saving
    setShowHelper(false);
  };

  const handleMaskChange = (masked: boolean) => {
    setMaskExpressions(masked);
  };
  
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  const handleResetForms = () => {
    // Clear all expressions
    setExpressionsByNode({
      abs: "",
      fileReadJson: ""
    });
    
    // Clear from localStorage
    localStorage.removeItem('savedExpression');
    
    // Close the form panel if open
    setShowForm(false);
    
    // Close helper if open
    setShowHelper(false);
    
    // Close settings popup
    setShowSettings(false);
    
    console.log('All forms reset');
  };

  const toggleExpand = (item: string) => {
    setExpandedItems({
      ...expandedItems,
      [item]: !expandedItems[item]
    });
  };

  const renderTreeItem = (id: string, icon: string, label: string, hasChildren: boolean, level: number = 0) => {
    return (
      <div 
        key={id}
        className={`tree-item ${selectedNode === id ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 16}px` }}
      >
        {hasChildren && (
          <span 
            className="expand-icon"
            onClick={() => toggleExpand(id)}
          >
            {expandedItems[id] ? '▾' : '▸'}
          </span>
        )}
        <span 
          className="tree-icon"
          onClick={() => setSelectedNode(id)}
        >
          {icon}
        </span>
        <span 
          className="tree-label"
          onClick={() => setSelectedNode(id)}
        >
          {label}
        </span>
      </div>
    );
  };

  // Add the renderVariablesSection function
  const renderVariablesSection = () => {
    return (
      <div></div>
    );
  };

  return (
    <div className="app-container">
      {/* Left Sidebar - Tree Navigation */}
      <div className="sidebar">
        <div className="project-header">
          <span>BALLERINA INTEGRATOR</span>
          <div className="project-actions">
            <button className="icon-button">+</button>
            <button className="icon-button" onClick={toggleSettings}>⚙️</button>
          </div>
        </div>

        <div className="sidebar-content">
          {renderTreeItem('may15', '📁', 'may15', true)}
          
          {expandedItems['may15'] && (
            <>
              {renderTreeItem('entryPoints', '⟩', 'Entry Points', true, 1)}
              
              {expandedItems['entryPoints'] && (
                <>
                  {renderTreeItem('automation', '🔄', 'Automation', false, 2)}
                </>
              )}
              
              {renderTreeItem('listeners', '👂', 'Listeners', true, 1)}
              {renderTreeItem('connections', '🔌', 'Connections', true, 1)}
              {renderTreeItem('types', 'T', 'Types', true, 1)}
              {renderTreeItem('functions', 'ƒ', 'Functions', true, 1)}
              {renderTreeItem('dataMappers', '⇄', 'Data Mappers', true, 1)}
              {renderTreeItem('configurations', '⚙️', 'Configurations', true, 1)}
              {renderTreeItem('localConnectors', '🔗', 'Local Connectors', true, 1)}
            </>
          )}
          
          {/* Add the variables section after the tree items */}
          {renderVariablesSection()}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Navigation Bar */}
        <div className="top-nav">
          <div className="breadcrumb">
            <span className="home-icon">🏠</span>
            <span>/</span>
            <span>Diagram</span>
          </div>
          
          <div className="content-tabs">
            <div className="tab active">
              <span className="back-icon">←</span>
              <span>Automation</span>
              <span className="close-icon">×</span>
            </div>
          </div>
        </div>

        {/* Diagram Area */}
        <div className="diagram-area">
          <div className="diagram-content">
            <div className="diagram-node start">Start</div>
            <div className="diagram-connector"></div>
            <div className="diagram-node function">
              <span className="node-icon">ƒ</span>
              Declare Variable<br/>
              <span className="node-code">var1 = ""</span>
            </div>
            <div className="diagram-connector"></div>
            
            {/* Add new lang.int:abs node */}
            <div 
              className="diagram-node function"
              onClick={() => {
                setSelectedNode('abs');
                handleNodeClick();
              }}
            >
              <span className="node-icon">ƒ</span>
              lang.int:abs<br/>
              <span className="node-code">intResult = abs(n)</span>
            </div>
            <div className="diagram-connector"></div>
            
            {/* io:fileReadJson node */}
            <div 
              className="diagram-node io-node"
              onClick={() => {
                setSelectedNode('fileReadJson');
                handleNodeClick();
              }}
            >
              <span className="node-icon">📂</span>
              io:fileReadJson<br/>
              <span className="node-code">jsonResult = readFile(path)</span>
            </div>
            
            <div className="diagram-node task-empty">
              Select node from node panel
            </div>
            <div className="diagram-connector"></div>
            <div className="diagram-node lock">
              <span className="lock-icon">🔒</span>
              Lock
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Fields (only show when form is active) */}
      {showForm && (
        <div className="form-panel-container">
          {showHelper && (
            <div className="expression-helper-container">
              <ExpressionHelper 
                field={exampleField}
                onExpressionChange={handleExpressionChange}
                onClose={handleHelperClose}
              />
            </div>
          )}
          
          <div className="form-panel">
            <div className="form-panel-header">
              <h2>
                {selectedNode === 'abs' ? 'lang.int : abs' : 'io : fileReadJson'}
              </h2>
              <button className="close-form" onClick={handleFormClose}>×</button>
            </div>

            <div className="form-panel-content">
              {selectedNode === 'abs' ? (
                // Form for lang.int:abs
                <>
                  <div className="form-description">
                    Returns the absolute value of an int value.
                  </div>

                  <div className="form-group">
                    <label htmlFor="variable-name">
                      Variable name*
                      <span className="sub-label">Name of the variable</span>
                    </label>
                    <input 
                      type="text" 
                      id="variable-name" 
                      className="form-control" 
                      value="intResult"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="variable-type">
                      Variable Type*
                      <span className="sub-label">Type of the variable</span>
                    </label>
                    <div className="form-control-with-icon">
                      <input 
                        type="text" 
                        id="variable-type" 
                        className="form-control" 
                        value="int"
                        readOnly
                      />
                      <span className="lock-icon-small">🔒</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="int-value">
                      n*
                      <span className="sub-label">int value to be operated on.</span>
                    </label>
                    <div className="form-control-with-helper">
                      <input 
                        type="text" 
                        id="int-value" 
                        className="form-control" 
                        value={expressionsByNode.abs}
                        onClick={handleFieldClick}
                        placeholder="Enter int value"
                        readOnly
                      />
                      <button 
                        className="helper-button" 
                        onClick={handleFieldClick}
                      >
                        Ex
                      </button>
                    </div>
                    {!expressionsByNode.abs && (
                      <div className="field-error">
                        <span className="error-icon">⚠️</span> missing expression
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button className="save-button" onClick={handleSave}>Save</button>
                  </div>
                </>
              ) : (
                // Form for io:fileReadJson (existing form)
                <>
                  <div className="form-description">
                    Reads file content as a JSON.
                  </div>

                  <div className="form-group">
                    <label htmlFor="variable-name">
                      Variable name*
                      <span className="sub-label">Name of the variable</span>
                    </label>
                    <input 
                      type="text" 
                      id="variable-name" 
                      className="form-control" 
                      value="jsonResult"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="variable-type">
                      Variable Type*
                      <span className="sub-label">Type of the variable</span>
                    </label>
                    <div className="form-control-with-icon">
                      <input 
                        type="text" 
                        id="variable-type" 
                        className="form-control" 
                        value="json"
                        readOnly
                      />
                      <span className="lock-icon-small">🔒</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="file-path">
                      Path*
                      <span className="sub-label">The path of the JSON file.</span>
                    </label>
                    <div className="form-control-with-helper">
                      <input 
                        type="text" 
                        id="file-path" 
                        className="form-control" 
                        value={expressionsByNode.fileReadJson}
                        onClick={handleFieldClick}
                        placeholder="Enter file path"
                        readOnly
                      />
                      <button 
                        className="helper-button" 
                        onClick={handleFieldClick}
                      >
                        Ex
                      </button>
                    </div>
                    {!expressionsByNode.fileReadJson && (
                      <div className="field-error">
                        <span className="error-icon">⚠️</span> missing expression
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <div className="form-section-header">
                      <span>Advanced Configurations</span>
                      <span className="collapse-icon">▾</span>
                    </div>
                    
                    <div className="checkbox-group">
                      <input type="checkbox" id="check-error" />
                      <label htmlFor="check-error">
                        Check Error
                        <span className="sub-label">Trigger error flow</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="save-button" onClick={handleSave}>Save</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Popup */}
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-popup" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h3>Settings</h3>
              <button className="close-button" onClick={() => setShowSettings(false)}>×</button>
            </div>
            <div className="settings-content">
              <div className="settings-group">
                <label className="settings-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={maskExpressions} 
                    onChange={(e) => handleMaskChange(e.target.checked)}
                    className="settings-checkbox" 
                  />
                  Mask expression values in form fields
                </label>
                <div className="settings-description">
                  Display "expression" instead of actual values in form fields for better readability
                </div>
              </div>
              
              <div className="settings-divider"></div>
              
              <div className="settings-group">
                <h4 className="settings-section-title">Form Management</h4>
                <button 
                  className="reset-button" 
                  onClick={handleResetForms}
                >
                  Reset All Forms
                </button>
                <div className="settings-description">
                  Reset all form values and clear saved expressions
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;