// Comprime uma imagem no próprio navegador (redimensiona + reduz qualidade)
// antes de enviar pro Supabase Storage. Evita uploads lentos/travados com
// fotos pesadas tiradas direto da câmera do celular (costumam vir com 2-8MB).
export function compressImage(file, maxDim = 1400, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          } else {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Falha ao comprimir imagem'));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Não foi possível ler a imagem'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Falha ao abrir o arquivo'));
    reader.readAsDataURL(file);
  });
}

// Evita que um upload travado fique preso pra sempre em "Enviando..." sem
// nunca dar erro nem sucesso — corta depois de X segundos com uma mensagem clara.
export function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Tempo esgotado ao ${label} (${Math.round(ms / 1000)}s) — provavelmente conexão lenta`)), ms)
    ),
  ]);
}
