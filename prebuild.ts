import fs from 'fs';
import path from 'path';

const devHtmlPath = path.resolve('./index.dev.html');
const indexHtmlPath = path.resolve('./index.html');

console.log("[Pre-build] Iniciando preparação do arquivo de template...");

if (fs.existsSync(devHtmlPath)) {
  console.log("[Pre-build] Restaurando index.html à partir do template limpo (index.dev.html)...");
  fs.copyFileSync(devHtmlPath, indexHtmlPath);
} else {
  console.warn("[Pre-build] Atenção: index.dev.html não foi encontrado. Presumindo que index.html já seja o template.");
}
