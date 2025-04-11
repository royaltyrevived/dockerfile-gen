// package.json for VS Code Extension
const vsCodePackageJson = {
    "name": "dockerfile-generator",
    "displayName": "Dockerfile Generator",
    "description": "Generate Dockerfiles for any project",
    "version": "0.1.0",
    "engines": {
      "vscode": "^1.80.0"
    },
    "categories": [
      "Other"
    ],
    "activationEvents": [
      "onCommand:dockerfile-generator.generate"
    ],
    "main": "./extension.js",
    "contributes": {
      "commands": [
        {
          "command": "dockerfile-generator.generate",
          "title": "Generate Dockerfile"
        }
      ],
      "menus": {
        "explorer/context": [
          {
            "when": "explorerResourceIsFolder",
            "command": "dockerfile-generator.generate",
            "group": "navigation"
          }
        ]
      }
    },
    "scripts": {
      "lint": "eslint .",
      "pretest": "npm run lint",
      "test": "node ./test/runTest.js"
    },
    "devDependencies": {
      "@types/vscode": "^1.80.0",
      "@types/glob": "^8.1.0",
      "@types/mocha": "^10.0.1",
      "@types/node": "16.x",
      "eslint": "^8.45.0",
      "glob": "^8.1.0",
      "mocha": "^10.2.0",
      "typescript": "^5.1.6",
      "@vscode/test-electron": "^2.3.4"
    },
    "dependencies": {
      "dockerfile-gen": "file:../"
    }
  };
  
  // Extension main file
  const extensionJs = `const vscode = require('vscode');
  const path = require('path');
  const { generateDockerfile, detectProjectType, getEntryPoint } = require('dockerfile-gen');
  
  /**
   * @param {vscode.ExtensionContext} context
   */
  function activate(context) {
    console.log('Dockerfile Generator extension is now active!');
  
    let disposable = vscode.commands.registerCommand('dockerfile-generator.generate', async function (uri) {
      try {
        let folderPath;
        
        // If triggered from explorer context menu, use that folder
        if (uri && uri.fsPath) {
          folderPath = uri.fsPath;
        } 
        // Otherwise use the workspace folder
        else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
          folderPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        } else {
          vscode.window.showErrorMessage('No folder selected. Please open a folder or select one in the explorer.');
          return;
        }
        
        // Detect project type
        const projectType = await detectProjectType(folderPath);
        
        // Ask for configuration
        const typeOptions = ['node', 'express', 'react', 'nextjs', 'python', 'python-pip', 'python-pipenv', 'python-poetry', 'golang', 'java-maven', 'java-gradle', 'java', 'ruby', 'php', 'php-composer', 'rust', 'unknown'];
        const selectedType = await vscode.window.showQuickPick(typeOptions, {
          placeHolder: 'Select project type',
          value: projectType
        });
        
        if (!selectedType) return; // User cancelled
        
        const entryPoint = await getEntryPoint(folderPath, selectedType);
        const inputEntryPoint = await vscode.window.showInputBox({
          prompt: 'Entry point',
          value: entryPoint
        });
        
        if (inputEntryPoint === undefined) return; // User cancelled
        
        const inputPort = await vscode.window.showInputBox({
          prompt: 'Port to expose',
          value: '3000'
        });
        
        if (inputPort === undefined) return; // User cancelled
        
        const useMultistage = await vscode.window.showQuickPick(['Yes', 'No'], {
          placeHolder: 'Generate multi-stage Dockerfile?'
        });
        
        if (useMultistage === undefined) return; // User cancelled
        
        const defaultOutputPath = path.join(folderPath, 'Dockerfile');
        const outputFile = await vscode.window.showInputBox({
          prompt: 'Output Dockerfile path',
          value: defaultOutputPath
        });
        
        if (outputFile === undefined) return; // User cancelled
        
        // Generate the Dockerfile
        const result = await generateDockerfile({
          type: selectedType,
          dir: folderPath,
          output: outputFile,
          port: inputPort,
          entryPoint: inputEntryPoint,
          multistage: useMultistage === 'Yes'
        });
        
        // Show success message
        vscode.window.showInformationMessage(\`Dockerfile generated successfully at \${result.outputPath}\`);
        
        // Open the generated file
        const document = await vscode.workspace.openTextDocument(result.outputPath);
        await vscode.window.showTextDocument(document);
        
      } catch (error) {
        vscode.window.showErrorMessage(\`Error generating Dockerfile: \${error.message}\`);
      }
    });
  
    context.subscriptions.push(disposable);
  }
  
  function deactivate() {}
  
  module.exports = {
    activate,
    deactivate
  }`;
  
  // README.md for the VS Code extension
  const readmeMd = `# Dockerfile Generator
  
  A Visual Studio Code extension for generating Dockerfiles for various project types.
  
  ## Features
  
  - Automatically detects project type based on files in the workspace
  - Supports multiple project types:
    - Node.js (Express, React, Next.js)
    - Python (pip, pipenv, poetry)
    - Go
    - Java (Maven, Gradle)
    - Ruby
    - PHP (with Composer)
    - Rust
  - Generates appropriate Dockerfiles with best practices for each project type
  - Access from Explorer context menu or command palette
  
  ## Usage
  
  ### From Explorer Context Menu
  
  1. Right-click on a folder in the Explorer
  2. Select "Generate Dockerfile"
  3. Follow the prompts to configure your Dockerfile
  4. The generated Dockerfile will open in the editor
  
  ### From Command Palette
  
  1. Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
  2. Type "Generate Dockerfile" and select the command
  3. The tool will use your current workspace folder
  4. Follow the prompts to configure your Dockerfile
  5. The generated Dockerfile will open in the editor
  
  ## Requirements
  
  No special requirements or dependencies.
  
  ## Extension Settings
  
  This extension does not contribute any settings.
  
  ## Known Issues
  
  None at this time.
  
  ## Release Notes
  
  ### 0.1.0
  
  Initial release of Dockerfile Generator
  `;
  
  // Return all files for the VS Code extension
  return {
    "package.json": JSON.stringify(vsCodePackageJson, null, 2),
    "extension.js": extensionJs,
    "README.md": readmeMd
  };
