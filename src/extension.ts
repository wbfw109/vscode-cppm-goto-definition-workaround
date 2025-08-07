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

      const position = editor.selection.active;
      const line = editor.document.lineAt(position.line).text.trim();

      if (!line.startsWith("import ")) {
        return;
      }
      const match = line.match(/import\s+(.+)/);
      if (!match || !match[1]) {
        return;
      }

      let moduleName = match[1].trim();
      if (moduleName.endsWith(";")) {
        moduleName = moduleName.slice(0, -1).trim();
      }

      // Load User settings
      const config = vscode.workspace.getConfiguration();
      const ignoredPrefixes: string[] =
        config.get("cppm.prefixMatchIgnore") || [];

      // Apply User configuration
      for (const prefix of ignoredPrefixes) {
        if (moduleName.startsWith(prefix + ".")) {
          moduleName = moduleName.slice(prefix.length + 1); // prefix + '.'
          break;
        }
      }

      const transformed = moduleName.replace(/[.:]/g, " ").trim();
      await vscode.env.clipboard.writeText(transformed);

      // Match file
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
