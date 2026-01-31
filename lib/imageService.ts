/**
 * Resizes and compresses an image file to avoid memory issues and reduce API payload size.
 */
export const resizeImage = (file: File, maxWidth = 1600, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
        }

        // Fill white background for transparent PNGs converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG to save space
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Crops (transforms) an image based on zoom, pan and rotation settings.
 * Renders the visible area of the original image into a canvas of the same dimensions (or slightly fitted),
 * effectively "zooming in" or "rotating".
 */
export const cropImage = async (
  imageData: string, 
  config: { scale: number, x: number, y: number, rotation: number }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No context');

      const width = img.width;
      const height = img.height;
      
      canvas.width = width;
      canvas.height = height;
      
      // Background white
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      
      ctx.save();
      // Move to center
      ctx.translate(width / 2, height / 2);
      // Apply transforms
      ctx.translate(config.x, config.y);
      ctx.rotate((config.rotation * Math.PI) / 180);
      ctx.scale(config.scale, config.scale);
      // Draw image centered
      ctx.drawImage(img, -width / 2, -height / 2);
      ctx.restore();
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => reject('Failed to load image for cropping');
    img.src = imageData;
  });
};