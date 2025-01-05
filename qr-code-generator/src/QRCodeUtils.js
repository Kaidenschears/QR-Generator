import QRCode from 'qrcode';

class QRCodeUtils {
  static getVersionSize(version) {
    return (version * 4) + 17;
  }

  static async generateQRCode(text, canvas, version = 2, logoUrl = null, isRound = false) {
    try {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      await QRCode.toCanvas(canvas, text, {
        width: 400,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        version: version,
        rendererOpts: {
          quality: 1
        }
      });

      if (isRound) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const moduleCount = (version * 4) + 17;
        const dotSize = canvas.width / moduleCount;
        const padding = dotSize * 0.15;  // 15% padding for smaller dots

        for (let y = 0; y < moduleCount; y++) {
          for (let x = 0; x < moduleCount; x++) {
            const i = (Math.floor(y * dotSize) * canvas.width + Math.floor(x * dotSize)) * 4;
            if (data[i] === 0) {
              // Enhanced finder pattern detection
              const isInFinderPattern = (x < 7 && y < 7) || // Top-left
                                      (x >= moduleCount - 7 && y < 7) || // Top-right
                                      (x < 7 && y >= moduleCount - 7);   // Bottom-left
              
              const isFinderBorder = (x === 7 && y <= 7) || 
                                   (y === 7 && x <= 7) ||
                                   (x === moduleCount - 8 && y <= 7) ||
                                   (y === 7 && x >= moduleCount - 8) ||
                                   (x === 7 && y >= moduleCount - 8) ||
                                   (y === moduleCount - 8 && x <= 7);
              
              ctx.fillStyle = '#000000';
              if (isInFinderPattern || isFinderBorder) {
                // Draw solid squares for finder patterns and borders
                ctx.fillRect(x * dotSize, y * dotSize, dotSize, dotSize);
              } else {
                // Draw smaller rounded dots for data
                ctx.beginPath();
                ctx.roundRect(
                  x * dotSize + padding,
                  y * dotSize + padding,
                  dotSize - 2 * padding,
                  dotSize - 2 * padding,
                  (dotSize - 2 * padding) / 2  // More rounded corners
                );
                ctx.fill();
              }
            }
          }
        }
      }

      if (version === 40 && logoUrl) {
        const ctx = canvas.getContext('2d');
        const logo = new Image();
        logo.src = logoUrl;
        
        await new Promise((resolve, reject) => {
          logo.onload = () => {
            const logoSize = 80;
            const x = (canvas.width - logoSize) / 2;
            const y = (canvas.height - logoSize) / 2;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
            ctx.drawImage(logo, x, y, logoSize, logoSize);
            resolve();
          };
          logo.onerror = reject;
        });
      }
      return true;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return false;
    }
  }
}

export default QRCodeUtils;