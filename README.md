# C++20 Module Go-to-Definition Workaround

This Visual Studio Code extension provides a workaround for navigating `import` statements in C++20 modules using the **Quick Open** functionality (`Ctrl+P`). It is particularly useful in environments where the language server (e.g., `clangd`) does not support _Go to Definition_ for module imports.

## Background

The `clangd` language server currently does not support the "Go to Definition" feature for `import` statements in C++20 modules. While it can successfully resolve `#include` directives and other symbols based on `compile_commands.json`, it does not appear to resolve the location of modules imported via `import`.

This behavior likely stems from `clangd`'s limited support for resolving module paths based on C++20 Modules.

## Features

This extension implements a simple workaround under the following assumptions:

- The names of imported modules generally resemble file paths.
- Module names use `.` or `:` as partition separators (e.g., `foo.bar:baz`).
- The project file system structure roughly aligns with module naming.

The extension provides the following behavior:

1. When the cursor is on a line that begins with an `import` statement, the extension extracts the remainder of the line after the `import` keyword.
2. The module name portion is then processed: any occurrences of `.` or `:` are replaced with whitespace.
3. The result is copied to the clipboard.
4. When used in combination with `workbench.action.quickOpen` (`Ctrl+P`), this allows the user to quickly locate files that match the transformed module name—effectively simulating a "Go to Definition" behavior.

### Example Use Case

```cpp
import foo.bar.module.sub:internal
```

→ transforms into:

```
foo bar module sub internal
```

→ which can match a file name like:

```
.../foo/bar/module/sub/internal.cppm
```

## Optional Prefix Filtering

Module names do not always map directly to file paths. For example:

```cpp
import com.example.abc.def.ghi;
```

To allow ignoring certain prefixes (like `com.example`), the extension will support a user-defined configuration field:

```jsonc
// settings.json (planned feature)
"cppm.prefixMatchIgnore": [
  "com.foo",
  "com.bar",
  "com.foobar"
]
```

In this case, the extension will:

- Check if the current import line starts with one of the configured prefixes
- If matched, the **prefix is stripped**
- The remaining portion is converted by replacing `.` and `:` with whitespace
- The result is copied to the clipboard

This is useful in projects that adopt a Java-style naming convention, such as `com.company.package`.

## Automation with Keybindings

VS Code version 1.77 and later supports the built-in `runCommands` functionality. You can use it to automate the workflow:

```jsonc
// keybindings.json
{
  "command": "runCommands",
  "key": "f11",
  "args": {
    "commands": [
      "cppm.copyModuleNameForQuickOpen",
      "workbench.action.quickOpen",
      "editor.action.clipboardPasteAction"
    ]
  },
  "when": "editorTextFocus"
}
```

This binds the `F11` key to:

1. Extract and transform the current `import` line
2. Open the Quick Open dialog
3. Paste the processed module name

## Requirements

Your module naming convention should roughly reflect file system structure.

## Extension Settings

_(Coming soon)_

This extension will contribute the following setting:

- `cppm.prefixMatchIgnore`: An array of string prefixes to strip from import lines before processing.

## Known Issues

- Not all `import` statements will map cleanly to file paths.
- The extension does not parse or interact with actual module graphs or BMI files.
- Does not validate if the imported module actually exists.

## Release Notes

### 0.0.1

- Initial release
- Supports basic `import` parsing and transformation
- Clipboard integration with `.`, `:` separator replacement

---
