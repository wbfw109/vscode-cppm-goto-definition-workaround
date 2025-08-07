# C++20 Module Go-to-Definition Workaround

This provides a workaround for navigating `import` statements in C++20 modules using the **Quick Open** functionality (`Ctrl+P`).

## Background

The `clangd` language server currently does not support the "Go to Definition" feature for `import` statements in C++20 modules. While it can successfully resolve `#include` directives and other symbols based on `compile_commands.json`, it does not appear to resolve the location of modules imported via `import`.

This behavior likely stems from `clangd`'s limited support for resolving module paths based on C++20 Modules.

## Features

This extension implements a simple workaround under the following assumptions:

- The names of imported modules generally resemble file paths.
- Module names use `.` or `:` as partition separators (e.g., `foo.bar:baz`).
- The project file system structure roughly aligns with module naming.

The extension performs the following steps:

1. When the cursor is on a line that begins with an `import` statement, the extension extracts the remainder of the line after the `import` keyword.
2. The module name is processed: any occurrences of `.` or `:` are replaced with whitespace.
3. If a prefix matches any entry in the optional user configuration (`cppm.prefixMatchIgnore`), that prefix is stripped.
4. The result is copied to the clipboard.
5. The extension automatically opens the Quick Open dialog (`Ctrl+P`) and pastes the processed module name.

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
.../foo/bar/module/sub/partition.cppm
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

Your module naming convention should roughly reflect file system structure.

## Extension Settings

The extension contributes the following setting:

### Optional Prefix Filtering

- `cppm.prefixMatchIgnore`: An array of string prefixes to strip from import lines before processing.

Module names do not always map directly to file paths. For example:

```cpp
import com.example.abc.def.ghi;
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
- Replace all `.` and `:` with spaces in the remaining portion
- Copy the result to the clipboard
- Automatically open the Quick Open panel and paste the value

This is useful for large projects that adopt a Java-style naming convention, such as `com.company.module`.

---

## Known Issues

## License

[MIT](LICENSE)
