import React, { useState } from 'react';

interface StringTemplateProps {
    onTemplateChange: (template: string) => void;
    initialValue?: string;
    onBack?: () => void;
}

const StringTemplate: React.FC<StringTemplateProps> = ({ onTemplateChange, initialValue = '', onBack }) => {
    const [template, setTemplate] = useState<string>(initialValue);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newTemplate = event.target.value;
        setTemplate(newTemplate);
        // Format as string template with backticks
        onTemplateChange(`string \`${newTemplate}\``);
    };

    return (
        <div className="string-template">
            <div className="panel-header">
                {onBack && (
                    <button className="back-button" onClick={onBack}>
                        &larr; Back
                    </button>
                )}
                <h3>Create String Template</h3>
            </div>
            <textarea
                value={template}
                onChange={handleChange}
                placeholder="Enter your string template here..."
                rows={5}
                className="string-template-textarea"
            />
            <div className="editor-info">
                <p>Suggestions:</p>
                <ul>
                    <li>${'{variable}'} - Reference existing values</li>
                    <li>Use multiline for complex templates</li>
                </ul>
            </div>
        </div>
    );
};

export default StringTemplate;