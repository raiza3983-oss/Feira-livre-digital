import fs from 'fs';
import path from 'path';

const sourceDir = path.resolve('./dist');
const targetDir = path.resolve('.');

if (!fs.existsSync(sourceDir)) {
  console.error("Erro: A pasta 'dist' não existe. Certifique-se de compilar primeiro.");
  process.exit(1);
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
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(targetDir, entry.name);

    // Prevent copying dist into itself or overwriting configuration files
    if (entry.name === 'dist' || entry.name === 'package-lock.json') {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Projetado na raiz: ${entry.name}`);
    }
  }
  console.log("Sucesso! Estrutura de produção copiada diretamente para a raiz do workspace.");
} catch (error) {
  console.error("Erro ao projetar builds na raiz:", error);
  process.exit(1);
}
