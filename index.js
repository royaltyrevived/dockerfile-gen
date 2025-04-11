
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { Command } = require('commander');
const chalk = require('chalk');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const program = new Command();

program
  .name('generate-dockerfile')
  .description('CLI tool to generate multi-stage Dockerfile based on project type')
  .version('1.0.0')
  .option('-d, --dir <directory>', 'Project directory', process.cwd())
  .option('-t, --type <projectType>', 'Specify the project type manually')
  .option('-p, --port <port>', 'Port to expose in Dockerfile', '3000')
  .option('-o, --output <outputPath>', 'Dockerfile output path', 'Dockerfile')
  .option('--verbose', 'Enable verbose logging', false)
  .parse(process.argv);

const options = program.opts();

async function detectProjectType(directory) {
  const files = await readdir(directory);

  if (files.includes('package.json')) {
    const pkgJson = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));
    const dependencies = Object.assign({}, pkgJson.dependencies, pkgJson.devDependencies);

    if (dependencies.react) return 'react';
    if (dependencies.next) return 'nextjs';
    if (dependencies.vue) return 'vue';
    if (dependencies.svelte) return 'svelte';
    if (dependencies['@nestjs/core']) return 'nestjs';
    if (dependencies.express) return 'express';
    return 'node';
  }

  if (files.includes('requirements.txt')) return 'python-pip';
  if (files.includes('pyproject.toml')) return 'python-poetry';
  if (files.includes('main.py')) return 'python';
  if (files.includes('main.go')) return 'golang';
  if (files.includes('main.rs')) return 'rust';
  if (files.includes('Main.java')) return 'java';
  if (files.includes('artisan')) return 'laravel';
  if (files.includes('Gemfile')) return 'rails';
  if (files.includes('Program.cs') || files.some(f => f.endsWith('.csproj'))) return 'dotnet';
  if (files.includes('index.html')) return 'static-site';

  return 'unknown';
}

async function getEntryPoint(directory, projectType) {
  const defaultEntries = {
    node: 'index.js',
    express: 'server.js',
    react: 'npm run build',
    nextjs: 'npm run build && npm start',
    vue: 'npm run serve',
    svelte: 'npm run build',
    angular: 'npm run start',
    nestjs: 'npm run start',
    python: 'main.py',
    'python-pip': 'main.py',
    'python-poetry': 'main.py',
    golang: 'main.go',
    rust: 'main.rs',
    java: 'Main.java',
    'spring-boot': 'mvn spring-boot:run',
    laravel: 'php artisan serve',
    rails: 'rails s',
    dotnet: 'dotnet run',
    'static-site': 'index.html',
  };

  if (defaultEntries[projectType]) return defaultEntries[projectType];

  const files = await readdir(directory);
  const firstJsFile = files.find(f => f.endsWith('.js'));
  if (firstJsFile) return firstJsFile;

  return 'index.js';
}

async function generateDockerfile(projectType, entryPoint, port, outputPath) {
  let dockerfileContent = '';

  switch (projectType) {
    case 'node':
    case 'express':
    case 'nestjs':
      dockerfileContent = `
# Stage 1: Builder
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build || echo "No build step"

# Stage 2: Runner
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
EXPOSE ${port}
CMD ["node", "${entryPoint}"]
      `.trim();
      break;

    case 'react':
    case 'nextjs':
    case 'vue':
    case 'angular':
      dockerfileContent = `
# Stage 1: Build frontend
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
      `.trim();
      break;

    case 'python':
    case 'python-pip':
    case 'python-poetry':
      dockerfileContent = `
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE ${port}
CMD ["python", "${entryPoint}"]
      `.trim();
      break;

    case 'golang':
      dockerfileContent = `
# Stage 1: Builder
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN go build -o main

# Stage 2: Runner
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
EXPOSE ${port}
CMD ["./main"]
      `.trim();
      break;

    case 'static-site':
      dockerfileContent = `
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
      `.trim();
      break;

    default:
      dockerfileContent = `
# Generic Dockerfile
FROM alpine
WORKDIR /app
COPY . .
CMD ["sh"]
      `.trim();
  }

  await writeFile(outputPath, dockerfileContent);
  console.log(chalk.green(`✅ Dockerfile created successfully at ${outputPath}`));
}

(async () => {
  const directory = options.dir;
  const detectedType = options.type || await detectProjectType(directory);

  if (options.verbose) {
    console.log(chalk.yellow(`📁 Project directory: ${directory}`));
    console.log(chalk.yellow(`🕵️ Detected project type: ${detectedType}`));
  }

  const entryPoint = await getEntryPoint(directory, detectedType);
  const port = options.port;
  const outputPath = path.resolve(options.output);

  await generateDockerfile(detectedType, entryPoint, port, outputPath);
})();
