# Dockerfile Generator CLI

A command-line tool for generating Dockerfiles for various project types with VS Code integration.

## Features

- **Auto-detection**: Automatically detects project type based on project files
- **Multiple language support**: Node.js, Python, Go, Java, Ruby, PHP, Rust and more
- **Framework awareness**: Detects frameworks like React, Express, NextJS
- **VS Code extension**: Seamless integration with Visual Studio Code
- **Interactive mode**: Guided setup for your Dockerfile
- **Customization**: Configure exposed ports, entry points, and more

## Installation

### CLI Tool

```bash
# Install globally
npm install -g dockerfile-gen

# Or install locally
npm install --save-dev dockerfile-gen
```

### VS Code Extension

1. Install from VS Code Marketplace: search for "Dockerfile Generator"
2. Or manually: 
   ```bash
   cd vscode-extension
   npm install
   npm run package
   code --install-extension dockerfile-generator-0.1.0.vsix
   ```

## Usage

### Command Line

```bash
# Basic usage (auto-detects project type)
dockerfile-gen

# Interactive mode
dockerfile-gen -i

# Specify project type
dockerfile-gen -t node

# Specify directory and output file
dockerfile-gen -d /path/to/project -o /path/to/Dockerfile

# Specify port to expose
dockerfile-gen -p 8080

# Verbose output (shows details and preview)
dockerfile-gen -v
```

### VS Code

1. Right-click on a folder in Explorer
2. Select "Generate Dockerfile"
3. Follow the prompts
4. Edit the generated Dockerfile if needed

## Supported Project Types

- **Node.js**: Standard Node.js, Express, React, NextJS
- **Python**: Standard Python, pip, pipenv, poetry
- **Go**: Standard Go projects 
- **Java**: Standard Java, Maven, Gradle
- **Ruby**: Ruby/Rails projects
- **PHP**: Standard PHP, Composer-based projects
- **Rust**: Cargo-based projects

## Options

| Option | Description |
|--------|-------------|
| `-i, --interactive` | Run in interactive mode |
| `-t, --type <type>` | Specify project type |
| `-d, --dir <directory>` | Specify project directory (default: current directory) |
| `-o, --output <file>` | Specify output Dockerfile path (default: ./Dockerfile) |
| `-p, --port <port>` | Specify port to expose (default: 3000) |
| `-v, --verbose` | Verbose output with details and preview |
| `-h, --help` | Display help information |
| `-V, --version` | Display version information |

## Example Dockerfiles

The generator creates optimized Dockerfiles for each project type:

- **Node.js**: Multi-stage builds for React, production-ready NextJS configurations
- **Python**: Proper dependency management for pip, pipenv, and poetry
- **Go**: Optimized multi-stage builds with proper Go module handling
- **Java**: Maven and Gradle builds with JRE-only runtime images
- **Ruby**: Proper Gemfile handling
- **PHP**: Apache integration with Composer support
- **Rust**: Cargo-based builds with dependency caching

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

PS I VIBE CODED THE WHOLE THING SO HAVE NOT CHECKED THIS FULLY
