import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

const sourceDir = path.resolve('./dist');
const targetZip = path.resolve('./dist.zip');

if (!fs.existsSync(sourceDir)) {
  console.error("Erro: A pasta 'dist' não existe. Certifique-se de que o build foi realizado com sucesso.");
  process.exit(1);
}

try {
  const zip = new AdmZip();
  console.log("Iniciando compressão da pasta 'dist'...");
  zip.addLocalFolder(sourceDir);
  zip.writeZip(targetZip);
  
  if (fs.existsSync(targetZip)) {
    const stats = fs.statSync(targetZip);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`Sucesso! Arquivo '${targetZip}' gerado com sucesso (${sizeInMB} MB).`);
  } else {
    throw new Error("Arquivo ZIP não foi encontrado após a gravação.");
  }
} catch (error) {
  console.error("Erro ao compactar a pasta 'dist':", error);
  process.exit(1);
}
