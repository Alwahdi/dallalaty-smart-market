// Center-crop an image file to a square and resize it (for avatars).
export async function cropSquare(file: File, size = 512): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error('تعذر قراءة الصورة'));
      i.src = url;
    });
    const side = Math.min(img.width, img.height);
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
    return await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('تعذر معالجة الصورة'))), 'image/jpeg', 0.88),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
