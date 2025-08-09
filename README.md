# C++20 Module Go-to-Definition Workaround

This provides a workaround for navigating `import` statements in C++20 modules using the **Quick Open** functionality (`Ctrl+P`).

## Background

The `clangd` language server currently does not support the "Go to Definition" feature for `import` statements in C++20 modules. While it can successfully resolve `#include` directives and other symbols based on `compile_commands.json`, it does not appear to resolve the location of modules imported via `import`.

This behavior likely stems from `clangd`'s limited support for resolving module paths based on C++20 Modules.

## Features

This extension implements a simple workaround under the following assumptions:

- The project’s directory structure roughly aligns with module naming.
- Module names use `.` or `:` as partition separators (e.g., `foo.bar:baz`).

The extension performs the following steps:

1. When the cursor is on a line that begins with an `import` statement, the extension extracts the remainder of the line after the `import` keyword and treats it as the **search text**.
2. If the search text starts with any prefix listed in the optional user configuration (`cppm.prefixMatchIgnore`), that prefix is stripped.
3. The search text is transformed for `workbench.action.quickOpen`:
   - Replace all `.` and `:` with spaces.
   - Add a `" / "` prefix to improve matching by hinting that the first word may represent a folder name.
4. The transformed search text is copied to the clipboard.
5. The extension automatically opens the Quick Open dialog (`Ctrl+P`) and pastes the search text.

This enables a quick, keyboard-driven navigation flow—effectively simulating a "Go to Definition" behavior for C++20 module imports.

> ℹ️ This extension **does not parse or interact with actual module graphs or BMI files**. It simply performs text-based transformation based on assumptions about your project's structure.

> ℹ️ If the current line does not start with a valid `import` statement, or the cursor is not on such a line, the command silently does nothing.

### Example Use Case

```cpp
import foo.bar.module.sub:partition;
```

→ transforms into:

```
foo bar module sub partition
```

→ matches a file path like:

```
... / ... foo ... / ... bar ... / ... module ... / ... sub ... / partition.cppm
```

## Command Usage

The extension contributes one command:

- **Command ID**: `cppm.copyModuleNameForQuickOpen`
- **Command Palette Title**: `C++: Copy Module Name for Quick Open`

You can run it in one of the following ways:

### 1. Via Command Palette

Press `F1` (or `Ctrl+Shift+P`), search for `C++: Copy Module Name for Quick Open`, and run it.

### 2. Via Custom Keybinding

You can assign a keyboard shortcut to run the command.
Example: Bind it to `F11` by adding the following to your `keybindings.json`:

```jsonc
{
  "key": "f11",
  "command": "cppm.copyModuleNameForQuickOpen",
  "when": "editorTextFocus"
}
```

## Requirements

The module naming convention should roughly reflect the project's directory structure.

## Extension Settings

The extension contributes the following setting:

### Optional Prefix Filtering

- `cppm.prefixMatchIgnore`: An array of string prefixes to strip from import lines before processing.

Module names do not always map directly to file paths. For example:

```cpp
import com.example.image.processing.filters.blur;
```

To allow ignoring certain prefixes (like `com.example`), the extension supports a user-defined configuration field:

```jsonc
// settings.json
"cppm.prefixMatchIgnore": [
  "com.example",
  "com.company"
]
```

In this case, the extension will:

- Check if the module name starts with one of the configured prefixes
- If matched, strip the prefix (e.g., `com.example.`)

This is useful for projects that adopt a Java-style naming convention, such as `com.company.module`.

---

## Known Issues

## License

[MIT](LICENSE)
