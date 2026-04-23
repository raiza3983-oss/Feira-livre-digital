import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Otimiza uma imagem redimensionando-a e comprimindo-a para JPEG.
 * @param file O arquivo de imagem original.
 * @param maxWidth Largura máxima permitida.
 * @param maxHeight Altura máxima permitida.
 * @param quality Qualidade da compressão (0 a 1).
 * @returns Uma Promise que resolve com a string base64 da imagem otimizada.
 */
export async function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    // Se não for imagem, não tenta comprimir
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcula as novas dimensões mantendo o aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível obter o contexto do canvas'));
          return;
        }

        // Desenha a imagem no canvas redimensionado
        ctx.drawImage(img, 0, 0, width, height);
        
        // Exporta como JPEG com a qualidade desejada
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
