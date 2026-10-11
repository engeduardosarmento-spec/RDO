/**
 * Utilitário para compressão e redimensionamento de imagens de campo diretamente no navegador.
 * Evita sobrecarga de armazenamento no IndexedDB preservando legibilidade e proporções.
 */
export async function comprimirImagem(
  arquivo: File,
  larguraMaxima: number = 1280,
  alturaMaxima: number = 960,
  qualidadeJpeg: number = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error('Erro ao ler arquivo da imagem'));
    leitor.onload = (evento) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Erro ao carregar dados da imagem'));
      img.onload = () => {
        let largura = img.width;
        let altura = img.height;

        if (largura > larguraMaxima || altura > alturaMaxima) {
          const proporcao = Math.min(larguraMaxima / largura, alturaMaxima / altura);
          largura = Math.round(largura * proporcao);
          altura = Math.round(altura * proporcao);
        }

        const canvas = document.createElement('canvas');
        canvas.width = largura;
        canvas.height = altura;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Contexto 2D do Canvas não disponível'));
          return;
        }

        // Desenha com interpolação suave
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, largura, altura);

        const dataUrl = canvas.toDataURL('image/jpeg', qualidadeJpeg);
        resolve(dataUrl);
      };
      img.src = evento.target?.result as string;
    };
    leitor.readAsDataURL(arquivo);
  });
}
