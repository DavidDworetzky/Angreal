"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const OpenAIClient_1 = require("./resources/OpenAIClient");
//Function that extracts the angreal.suggestion command from the activate function and registers it as a command
function registerAngrealSuggestionCommand(context, openAiClient) {
    const disposable = vscode.commands.registerCommand('angreal.suggestion', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            const line = document.lineAt(selection.active.line).text.trim();
            const entireContent = document.getText();
            if (line.length === 0) {
                vscode.window.showWarningMessage('Current line is empty, please type something.');
                return;
            }
            let linesToComplete = await vscode.window.showInputBox({ prompt: 'Enter the number of lines to complete' });
            if (!linesToComplete) {
                return;
            }
            const linesToCompleteQuantity = parseInt(linesToComplete.trim());
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Generating suggestions...",
                cancellable: true
            }, async (progress, token) => {
                token.onCancellationRequested(() => {
                    console.log("User canceled the long running operation");
                });
                progress.report({ increment: 0 });
                const response = await openAiClient.suggest(entireContent, line, linesToCompleteQuantity);
                // Add a newline to the beginning of the response 
                const formattedResponse = '\n' + response;
                progress.report({ increment: 100 });
                // Adding completion to the end of the line
                editor.edit(editBuilder => {
                    const position = document.lineAt(selection.active.line).range.end;
                    editBuilder.insert(position, formattedResponse);
                });
            });
        }
        else {
            vscode.window.showWarningMessage('No active editor found.');
        }
    });
    context.subscriptions.push(disposable);
}
//Function that extracts the angreal.replaceSelection command from the activate function and registers it as a command
// replaceSelection is a command that takes the document, the selection, and a prompt taken from the user and uses it to transform the selected code in the editor
function registerAngrealReplaceSelectionCommand(context, openAiClient) {
    const disposable = vscode.commands.registerCommand('angreal.replaceSelection', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            const entireContent = document.getText();
            if (selection.isEmpty) {
                vscode.window.showWarningMessage('No text selected, please select the code you want to transform.');
                return;
            }
            const selectedText = document.getText(selection);
            const prompt = await vscode.window.showInputBox({ prompt: 'Enter a prompt to transform the selected code' });
            if (!prompt) {
                return;
            }
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Transforming selected code...",
                cancellable: true
            }, async (progress, token) => {
                token.onCancellationRequested(() => {
                    console.log("User canceled the long running operation");
                });
                progress.report({ increment: 0 });
                const response = await openAiClient.replace(entireContent, selectedText, prompt);
                progress.report({ increment: 100 });
                // Replacing the selected text with the transformed code
                editor.edit(editBuilder => {
                    editBuilder.replace(selection, response);
                });
            });
        }
        else {
            vscode.window.showWarningMessage('No active editor found.');
        }
    });
    context.subscriptions.push(disposable);
}
// Update the activate function to use the new registerAngrealSuggestionCommand function
function activate(context) {
    // Get configuration settings for your extension
    const configuration = vscode.workspace.getConfiguration('angreal');
    // Try to retrieve the OpenAI API key
    let openAIKey = configuration.get('OpenAIKey');
    vscode.window.showInformationMessage('Open AI Key: ' + openAIKey);
    // If the OpenAI API key isn't available, display a warning
    if (!openAIKey) {
        vscode.window.showWarningMessage('OpenAI API key is not available. Please provide it in the configuration settings.');
    }
    else {
        let openAiClient = new OpenAIClient_1.default(openAIKey);
        registerAngrealSuggestionCommand(context, openAiClient);
        registerAngrealReplaceSelectionCommand(context, openAiClient);
    }
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map