# New UI Design for Ballerina Expression Helper Plane

`current.png` image is about existing UI. where helper planed in open for expression field. 

`sheet.png` is new value creator UI flow. for a given field, user can create a value using helper plane. helper plane is opened when user clicks on the field or by clicking on the helper icon `ex`.

## Helper Plane Features

New helper plane has multiple options to create a value. When clicking on each option, it will open a new section in the helper plane, with a back button to return to the main options.

Each field has a type. Based on the field type, the helper plane will show different options to create a value.

### Options for String Field Type

1. **AI Suggestions**: First set of options will be default values (if field has one) or inferred from AI by looking at field documentation. These are dynamically fetched and shown with a loader placeholder until values are fetched.
   
2. **Create a value**: Opens a text box where user can enter a string value. String value encoding is done when saving the value (e.g., backslash becomes `\\`).
   
3. **Create a string template**: Opens a multiline text box for entering a string template. Suggestions appear when user enters `${}`, referencing existing values in the current scope. The value is saved as `` string `hello ${name}` `` for input like `hello ${name}`.

4. **Select a value from list**: Shows list of values in current scope, sorted first by type then by name. For string fields, string variables appear first, followed by other compatible types.
   - Includes constants, configuration values in scope
   - Includes structured values like arrays, maps, records with compatible member types
   - Shows "Do not find what you are looking for? Try Advanced expression editor" as an escape hatch

5. **Create configurable value**: Opens a text box to name a configurable value, which becomes the expression. Shows existing configurable values to select from.

6. **Refer to environment variable**: Opens a text box for an environment variable name, creating an expression to read it (e.g., `os:env("name")`). For non-string fields, includes type conversion.

7. **Call a function**: Opens a form to select and call functions, with appropriate parameters for the chosen function.

8. **Advanced expression editor**: Opens a full expression editor with code completion, syntax highlighting, etc.

### Options for Integer Field Type

1. **AI Suggestions/Default values**
2. **Create a value**: Text box for entering a number
3. **Select a value from list**
4. **Create configurable value**
5. **Refer to environment variable**
6. **Call a function**
7. **Advanced expression editor**

### Record Field Selection Rules

When selecting record field values:

For non-optional form field types:
- If selected record field paths are all required: generate `x.y.z` syntax
- If path has optional fields: request a default value and generate `x.y.z ?: defaultValue` syntax
- If path has optional type fields: use `?.` syntax and require a default value

For optional form field types:
- No default value is required

