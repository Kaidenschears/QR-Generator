
import QRCode from 'qrcode';
import qrcodeGenerator from 'qrcode-generator';

class QRCodeUtils {
  static getVersionSize(version) {
    return (version * 4) + 17;
  }

  static async generateQRCode(text, canvas, version = 2, logoUrl = null, isRound = false, color = '#000000', isBackgroundLogo = false, opacity = 0.5, logoSize = 30) {
    try {
      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const qrWidth = 400;
      await QRCode.toCanvas(canvas, text, {
        version: version,
        errorCorrectionLevel: 'H',
        width: qrWidth,
        margin: 4,
        color: {
          dark: color,
          light: '#FFFFFF'
        }
      });

      if (isRound && version !== 40) {
        const qr = qrcodeGenerator(version, 'H');
        qr.addData(text);
        qr.make();

        const moduleCount = qr.getModuleCount();
        const actualSize = qrWidth * 0.9;
        
        const padding = 4;
        const paddedSize = moduleCount + (padding * 2);
        const matrix = Array(paddedSize).fill().map(() => Array(paddedSize).fill(0));
        
        for (let y = 0; y < moduleCount; y++) {
          for (let x = 0; x < moduleCount; x++) {
            if (qr.isDark(y, x)) {
              const isFinderPattern = (
                (x < 7 && y < 7) ||
                (x >= moduleCount - 7 && y < 7) ||
                (x < 7 && y >= moduleCount - 7)
              );
              matrix[y + padding][x + padding] = isFinderPattern ? 2 : 1;
            }
          }
        }

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = qrWidth;
        tempCanvas.height = qrWidth;
        const tempCtx = tempCanvas.getContext('2d');
        
        const dotSize = qrWidth / paddedSize;
        const dotPadding = dotSize * 0.15;
        
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, qrWidth, qrWidth);
        
        for (let y = 0; y < paddedSize; y++) {
          for (let x = 0; x < paddedSize; x++) {
            if (matrix[y][x] === 0) continue;
            
            tempCtx.fillStyle = matrix[y][x] === 2 ? '#000000' : color;
            if (matrix[y][x] === 2) {
              tempCtx.fillRect(
                x * dotSize,
                y * dotSize,
                dotSize,
                dotSize
              );
            } else {
              tempCtx.beginPath();
              tempCtx.roundRect(
                x * dotSize + dotPadding,
                y * dotSize + dotPadding,
                dotSize - 2 * dotPadding,
                dotSize - 2 * dotPadding,
                (dotSize - 2 * dotPadding) / 2
              );
              tempCtx.fill();
            }
          }
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const xOffset = (canvas.width - qrWidth) / 2;
        const yOffset = (canvas.height - qrWidth) / 2;
        ctx.drawImage(tempCanvas, xOffset, yOffset);
      }

      if (logoUrl) {
        await new Promise((resolve, reject) => {
          const logo = new Image();
          logo.onload = async () => {
            const qrSize = canvas.width;
            const logoSize = Math.floor(qrSize * 0.25);
            const x = (qrSize - logoSize) / 2;
            const y = (qrSize - logoSize) / 2;
            
            if (isBackgroundLogo) {
              // Create temporary canvas for blending
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = canvas.width;
              tempCanvas.height = canvas.height;
              const tempCtx = tempCanvas.getContext('2d');

              // Calculate logo size based on slider value (30-100%)
              const scaledSize = canvas.width * (logoSize / 100);
              const offset = (canvas.width - scaledSize) / 2;
              
              // Draw logo on temporary canvas with dynamic size
              tempCtx.drawImage(logo, 0, 0, canvas.width, canvas.height); // Draw full size first
              tempCtx.globalCompositeOperation = 'source-in';

              // Draw logo with opacity
              ctx.save();
              ctx.globalAlpha = opacity;
              ctx.drawImage(logo, offset, offset, scaledSize, scaledSize);
              ctx.restore();
              
              // Blend back to main canvas
              ctx.globalCompositeOperation = 'multiply';
              ctx.drawImage(tempCanvas, 0, 0);
              ctx.globalCompositeOperation = 'source-over';
            } else {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
              ctx.fillRect(x - 8, y - 8, logoSize + 16, logoSize + 16);
              
              if (version === 40) {
                ctx.globalAlpha = 0.9;
              }
              ctx.drawImage(logo, x, y, logoSize, logoSize);
              ctx.globalAlpha = 1.0;
            }
            resolve();
          };
          logo.onerror = reject;
          logo.src = logoUrl;
        });
      }
      return true;
    } catch (error) {
      console.error('QR Code Generation Error:', {
        message: error.message,
        text: text,
        version: version,
        hasLogo: !!logoUrl,
        isRound: isRound
      });
      
      if (error.message.includes('version')) {
        throw new Error('Invalid QR version - try a lower version number');
      } else if (error.message.includes('too long')) {
        throw new Error('Text content is too long for selected QR version');
      } else {
        throw new Error(`Failed to generate QR code: ${error.message}`);
      }
    }
  }
}

export default QRCodeUtils;
