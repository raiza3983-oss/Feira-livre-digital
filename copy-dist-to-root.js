import fs from 'fs';
import path from 'path';

const sourceDir = path.resolve('./dist');
const targetDir = path.resolve('.');

if (!fs.existsSync(sourceDir)) {
  console.error("Erro: A pasta 'dist' não existe. Certifique-se de compilar primeiro.");
  process.exit(1);
}

// Ensure the intermediate index.dev.html is correctly renamed to index.html in dist
const devHtmlPath = path.join(sourceDir, 'index.dev.html');
const indexHtmlPath = path.join(sourceDir, 'index.html');

if (fs.existsSync(devHtmlPath)) {
  console.log("Renomeando dist/index.dev.html para dist/index.html...");
  fs.copyFileSync(devHtmlPath, indexHtmlPath);
  fs.unlinkSync(devHtmlPath);
}

// Function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log("Copiando arquivos compilados da pasta 'dist' para a raiz...");

  // Backup index.html to index.dev.html if it contains '/src/main.tsx' (is the clean template)
  const rootIndexHtml = path.resolve('./index.html');
  const rootIndexDevHtml = path.resolve('./index.dev.html');
  if (fs.existsSync(rootIndexHtml)) {
    const content = fs.readFileSync(rootIndexHtml, 'utf-8');
    if (content.includes('/src/main.tsx')) {
      console.log("Fazendo backup de index.html limpo para index.dev.html...");
      fs.copyFileSync(rootIndexHtml, rootIndexDevHtml);
    }
  }
  
  // Clean target assets directory to avoid stale files
  const targetAssetsDir = path.join(targetDir, 'assets');
  if (fs.existsSync(targetAssetsDir)) {
    console.log("Limpando pasta 'assets' anterior na raiz...");
    fs.rmSync(targetAssetsDir, { recursive: true, force: true });
  }

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(targetDir, entry.name);

    // Prevent copying dist into itself or overwriting node_modules or package config files
    if (entry.name === 'dist' || entry.name === 'package-lock.json' || entry.name === 'package.json' || entry.name === 'node_modules') {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
      console.log(`Pasta projetada na raiz: ${entry.name}`);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Arquivo projetado na raiz: ${entry.name}`);
    }
  }
  console.log("Sucesso! Estrutura de produção copiada diretamente para a raiz do workspace.");
} catch (error) {
  console.error("Erro ao projetar builds na raiz:", error);
  process.exit(1);
}
