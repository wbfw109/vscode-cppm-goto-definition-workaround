// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // // Use the console to output diagnostic information (console.log) and errors (console.error)
  // // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "helloworld" is now active!');
  // // Display a message box to the user
  // vscode.window.showErrorMessage('No active editor found');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "cppm.copyModuleNameForQuickOpen",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      // 🚧 Limitation: Maximum Parsing Line
      const MAX_LINES = 5;

      const doc = editor.document;
      const currentLine = editor.selection.active.line;

      const startLine = findStartLine(doc, currentLine, MAX_LINES);
      if (startLine === -1) {
        return;
      }

      const lines = collectLinesToSemicolon(doc, startLine, MAX_LINES);
      if (!lines) {
        return;
      }

      const moduleName = buildModuleName(lines);
      if (!moduleName) {
        return;
      }

      let searchText = moduleName;

      // Optional: strip ignored prefix
      const config = vscode.workspace.getConfiguration();
      const ignoredPrefixes: string[] =
        config.get("cppm.prefixMatchIgnore") || [];
      for (const prefix of ignoredPrefixes) {
        if (searchText.startsWith(prefix + ".")) {
          searchText = searchText.slice(prefix.length + 1); // remove "prefix."
          break;
        }
      }

      // Transform search text for `workbench.action.quickOpen`
      // - Add "/" prefix to hint that the first token may be a folder
      // - Replace '.' and ':' (module partitions) with "/"
      searchText = "/" + searchText.replace(/[.:]/g, "/").trim();

      await vscode.env.clipboard.writeText(searchText);

      // Trigger Quick Open and paste
      await vscode.commands.executeCommand("workbench.action.quickOpen");
      await vscode.commands.executeCommand(
        "editor.action.clipboardPasteAction"
      );
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

/**
 * Removes both block (`/* ... *\/`) and line (`// ...`) comments from a single line of text.
 * @param line The raw source line to clean.
 * @returns The line without any comments.
 */
function stripCommentsOnce(line: string): string {
  return line.replace(/\/\*.*?\*\//g, "").replace(/\/\/.*/, "");
}

/**
 * Checks whether the given line is a continuation of a multi-line C++ module import statement.
 * Continuation lines start with whitespace followed by a dot (e.g., `  .sub.module`).
 * @param line The raw source line to check.
 * @returns True if the line is a continuation line, false otherwise.
 */
function isContinuationLine(line: string): boolean {
  return /^\s+\.[A-Za-z0-9_.:]+;?\s*$/.test(stripCommentsOnce(line));
}

/**
 * Checks whether the given line is the start of a C++ module import statement.
 * A start line begins with `import` or `export import`, followed by the module name.
 * @param line The raw source line to check.
 * @returns True if the line is a start line, false otherwise.
 */
function isStartLine(line: string): boolean {
  return /^(?:export\s+)?import\s+[A-Za-z0-9_.:]+;?\s*$/.test(
    stripCommentsOnce(line)
  );
}

/**
 * Checks whether the given line ends with a semicolon (`;`).
 * @param line The raw source line to check.
 * @returns True if the line ends with a semicolon, false otherwise.
 */
function endsWithSemicolon(line: string): boolean {
  return /;\s*$/.test(stripCommentsOnce(line));
}

/**
 * Finds the start line of a C++ module import statement that may span multiple lines.
 * Traverses upward if the current line is a continuation.
 * @param doc The VS Code text document.
 * @param currentLine The line number where the cursor is located.
 * @param maxLines The maximum number of lines to inspect (including the current one).
 * @returns The line number of the start line, or -1 if not found or invalid.
 */
function findStartLine(
  doc: vscode.TextDocument,
  currentLine: number,
  maxLines: number
): number {
  let startLine = currentLine;
  let used = 1;

  const currentText = doc.lineAt(startLine).text;
  if (isStartLine(currentText)) {
    return startLine;
  }
  if (!isContinuationLine(currentText)) {
    return -1;
  }

  while (startLine > 0 && used < maxLines) {
    const prevLine = startLine - 1;
    const text = doc.lineAt(prevLine).text;

    if (isStartLine(text)) {
      return prevLine;
    }
    if (isContinuationLine(text)) {
      startLine = prevLine;
      used++;
      continue;
    }
    return -1;
  }
  return -1;
}

/**
 * Collects all lines from the start of the import statement until the line ending with a semicolon.
 * All collected lines have comments removed.
 * @param doc The VS Code text document.
 * @param startLine The line number where the import statement starts.
 * @param maxLines The maximum number of lines to collect.
 * @returns An array of lines with comments removed, or null if the statement is invalid or exceeds limits.
 */
function collectLinesToSemicolon(
  doc: vscode.TextDocument,
  startLine: number,
  maxLines: number
): string[] | null {
  const lines: string[] = [];
  let used = 0;
  let line = startLine;

  const startTextRaw = doc.lineAt(line).text;
  lines.push(stripCommentsOnce(startTextRaw));
  used++;

  // 🌳 If Single-line import statement; return immediately.
  if (endsWithSemicolon(startTextRaw)) {
    return lines;
  }

  // 🌳 If Multi-line import statement; continue collecting continuation lines.
  while (used < maxLines) {
    line++;
    if (line >= doc.lineCount) {
      return null;
    }

    const raw = doc.lineAt(line).text;
    if (!isContinuationLine(raw)) {
      return null;
    }

    lines.push(stripCommentsOnce(raw));
    used++;

    if (endsWithSemicolon(raw)) {
      return lines;
    }
  }
  return null; // not finished within limit
}

/**
 * Builds the full module name from the collected lines of an import statement.
 * 🚧 Prerequisite: Assumes each line has already been stripped of comments and validated.
 * @param lines The array of comment-free lines that make up the import statement.
 * @returns The full module name as a string, or null if parsing fails.
 */
function buildModuleName(lines: string[]): string | null {
  const EXPORT_IMPORT_PREFIX = "export import ";
  const IMPORT_PREFIX = "import ";

  if (lines.length === 0) {
    return null;
  }

  // Starting line: remove the "import " or "export import " prefix
  let first_line = lines[0].trim();
  if (first_line.startsWith(EXPORT_IMPORT_PREFIX)) {
    first_line = first_line.slice(EXPORT_IMPORT_PREFIX.length);
  } else if (first_line.startsWith(IMPORT_PREFIX)) {
    first_line = first_line.slice(IMPORT_PREFIX.length);
  } else {
    return null; // Defensive check for unexpected input
  }

  // 🌳 If Single-line import statement; return immediately.
  if (lines.length === 1) {
    return first_line.endsWith(";")
      ? first_line.slice(0, -1).trim()
      : first_line;
  }

  // 🌳 If Multi-line import statement; continue collecting continuation lines.
  let name = first_line;
  for (let i = 1; i < lines.length; i++) {
    let seg = lines[i].trim().slice(1); // remove '.'
    if (i === lines.length - 1 && seg.endsWith(";")) {
      seg = seg.slice(0, -1).trim();
    }
    name += "." + seg;
  }
  return name;
}
