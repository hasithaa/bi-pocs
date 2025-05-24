# New UI Design for Ballerina Expression Helper Plane

`current.png` image is about existing UI. where helper planed in open for expression field. 

`sheet.png` is new value creator UI flow. for a given field, user can create a value using helper plane. helper plane is opened when user clicks on the field or by clicking on the helper icon `ex`.

## Helper Plane Features

New helper plane appears to the left of the form panel when a user clicks on an expression field or the helper icon. The helper plane provides multiple options to create or update expression values. When clicking on each option, it will open a new section in the helper plane, with a back button to return to the main options.

Each field has a type. Based on the field type, the helper plane will show different options to create a value.

### UI Organization

The Expression Helper is organized into several sections:
1. **Header**: Contains the title and close button
2. **Current Value Preview**: Shows the current expression value (if any)
3. **Update Options**: Appear first when there's an existing expression value
4. **Create Options Separator**: A visual divider with text "or create a new value"
5. **Create Options**: Operations for creating new expressions
6. **AI Suggestions**: Contextual value suggestions shown with magic wand (✨) icons at the bottom of the options list

### Main Options Flow

When a field has an existing expression:
1. The appropriate "Update" option appears first based on expression type:
   - "Update value" for literals (strings, numbers, booleans)
   - "Update string template" for string templates
   - "Select different variable" for simple variable references
   - "Edit expression" for any other complex expressions
2. A visual separator shows "or create a new value"
3. Other creation options are shown below, excluding the one already available as update option

When a field has no expression:
1. Only creation options are shown

### Expression Masking Configuration

- A settings wheel icon (⚙️) in the Ballerina Integrator header provides access to application settings
- Clicking the settings icon opens a popup with configuration options
- The expression masking option can be toggled from this settings popup
- A "Reset All Forms" button allows users to clear all form values and saved expressions
- When enabled, form fields with expressions display "expression" instead of the actual value
- This helps simplify the form view when expressions are complex
- Expressions are only masked when they have a value; empty fields remain unchanged

### Main Options for String Field Type

1. **Create a new value / Update value**: Opens a form to create a new string or update an existing one
   - Shows "Create a new value" if the field is empty
   - Shows "Update value" if the field already has a value
   - Provides a text input that automatically displays unescaped values (e.g., if the expression is `"abc\\xyz"`, the input shows `abc\xyz`)
   - Includes a preview section showing the fully escaped value as it will be stored
   - Includes a note about using String Template or Advanced Editor for multi-line text
   - Has a "Use Value" button for new values or "Update Value" button for existing values
   
2. **Create a string template**: Opens a multiline text box for entering a string template. Suggestions appear when user enters `${}`, referencing existing values in the current scope. The value is saved as `` string `hello ${name}` `` for input like `hello ${name}`.

3. **Select from variables / Select different variable**: Shows list of values in current scope, sorted first by type then by name.
   - Shows "Select from variables" for new expressions
   - Shows "Select different variable" when updating an existing variable reference
   - For string fields, string variables appear first, followed by other compatible types
   - Includes constants, configuration values in scope
   - Includes structured values like arrays, maps, records with compatible member types
   - Shows "Do not find what you are looking for? Try Advanced expression editor" as an escape hatch

4. **Create configurable value**: Opens a form to create or select a configurable value
   - Create new section includes a text input for the configurable name
   - Configurable names must start with a letter and contain only letters, numbers, and underscores (no dots or spaces)
   - Shows a live preview of the expression
   - Validates input and displays appropriate error messages
   - Lists existing compatible configurable values that can be selected
   - Clicking an existing configurable immediately applies it as the expression

5. **Select env variable**: Opens a form to select or create environment variable expressions
   - Allows entering an environment variable name
   - Validates environment variable names (uppercase, letters, numbers, underscores)
   - Shows a live preview of the generated expression
   - For non-string fields, automatically adds the required type conversion
   - Includes a list of common environment variable suggestions for quick selection
   - Expressions are generated as `os:getEnv("ENV_NAME")` for string fields
   - For non-string fields: `check int:fromString(os:getEnv("ENV_NAME"))` 

6. **Call a function**: Opens a form to select and call functions
   - Shows a categorized list of common functions compatible with the field type
   - Includes a search feature to find specific functions
   - Selecting a function shows a parameter configuration form
   - Required parameters are clearly marked
   - Parameter inputs include descriptions and validation
   - Shows a preview of the generated function call expression
   - For string fields, functions with non-string return types automatically add toString()
   - A note indicates that more advanced function calls are available in the expression editor

7. **Open expression editor**: Opens a full expression editor
   - Shows a text area for entering custom Ballerina expressions
   - Pre-fills the editor with the existing expression when updating
   - Lists available features and capabilities
   - Includes a button to apply the expression
   - Button text changes between "Use Expression" and "Update Expression" depending on context
   - Follows the same design pattern as other components with back button and consistent styling

8. **AI Suggestions**: Contextual value suggestions based on the field type and purpose
   - Displays 3 AI-generated suggestions relevant to the field type
   - For path fields, suggestions include local file paths
   - Each suggestion is presented as a clickable button with a magic wand icon
   - Clicking a suggestion immediately applies it to the field
   - AI Suggestions are loaded only once when the helper is opened

### Options for Integer Field Type

1. **Create a new value / Update value**: Text box for entering a number
2. **Select from variables**
3. **Create configurable value**
4. **Select env variable**
5. **Call a function**
6. **Open expression editor**
7. **AI Suggestions**: Numeric value suggestions

### Variables List

Variables available in the current scope are displayed in a dedicated section in the left sidebar of the application. This includes:
- Regular variables (string, int, etc.)
- Constants (displayed in bold blue)
- Configurable values (displayed in green)

Each variable shows its name, type, and an appropriate icon.

### Expression Validation

- Error messages are shown only when needed (e.g., "missing expression" when the field is required but empty)
- Error messages are automatically hidden when a valid expression is provided

### Creating/Updating Values

- The value creator handles proper escaping of special characters in string literals
- When editing an existing string literal, the special characters are automatically unescaped for editing
- Empty strings are supported as valid values
- Ballerina string literal escape sequences (e.g., `\"`, `\\`, `\n`, `\t`) are properly handled

### Record Field Selection Rules

When selecting record field values:

For non-optional form field types:
- For paths containing optional fields: system uses optional chaining syntax (`?.`)
- A dialog prompts for a default value when selecting paths with optional fields
- Generated expression follows the pattern: `person?.address?.country?.name ?: "Unknown"`
- Preview of the expression is shown before confirming

For optional form field types:
- Optional chaining is still used but no default value is required

### Expression Categorization

The Expression Helper uses simplified expression categorization to provide appropriate update options:

1. **Literal**: Simple values like string literals, numbers, booleans
   - Example: `"hello"`, `42`, `true`
   - Update option: "Update value"

2. **StringTemplate**: Ballerina string templates with interpolation
   - Example: ``string `Hello ${name}!` ``
   - Update option: "Update string template"

3. **Variable**: Simple variable references
   - Example: `myVariable`
   - Update option: "Select different variable"

4. **Complex Expression**: Any other expression types
   - Examples: 
     - Member access: `person.name`
     - Optional chaining: `person?.address?.city`
     - Method calls: `person.getName()` 
     - Elvis operators: `person?.name ?: "Unknown"`
     - Function calls: `getString()`
   - Update option: "Edit expression"

This simplified categorization ensures appropriate update options are presented without overwhelming the user with too many specialized choices.

