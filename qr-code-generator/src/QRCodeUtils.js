import QRCode from 'qrcode';
import qrcodeGenerator from 'qrcode-generator';

class QRCodeUtils {
  static getVersionSize(version) {
    return (version * 4) + 17;
  }

  static async generateQRCode(text, canvas, version = 2, logoUrl = null, isRound = false, color = '#000000', isBackgroundLogo = false, saturation = 1) {
    try {
      // Set canvas dimensions with padding
      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // First generate the basic QR code
      const qrWidth = 400;
      await QRCode.toCanvas(canvas, text, {
        version: version,
        errorCorrectionLevel: 'H',
        width: qrWidth,
        margin: 4,
        color: {
          dark: isBackgroundLogo ? '#000000' : color,
          light: '#FFFFFF'
        }
      });

      if (isRound && version !== 40) {
        const qr = qrcodeGenerator(version, 'H');
        qr.addData(text);
        qr.make();

        const moduleCount = qr.getModuleCount();
        const actualSize = qrWidth * 0.9; // Make QR code slightly smaller to add padding
        
        // Create temporary canvas for QR code
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = qrWidth;
        tempCanvas.height = qrWidth;
        const tempCtx = tempCanvas.getContext('2d');
        
        const dotSize = actualSize / moduleCount;
        const padding = dotSize * 0.15;
        const offset = (qrWidth - actualSize) / 2; // Center the QR code
        
        // Draw on temporary canvas
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, qrWidth, qrWidth);
        
        for (let y = 0; y < moduleCount; y++) {
          for (let x = 0; x < moduleCount; x++) {
            if (!qr.isDark(y, x)) continue;
            
            const isFinderPattern = (
              (x < 7 && y < 7) ||
              (x >= moduleCount - 7 && y < 7) ||
              (x < 7 && y >= moduleCount - 7)
            );

            tempCtx.fillStyle = isFinderPattern ? '#000000' : color;
            if (isFinderPattern) {
              tempCtx.fillRect(x * dotSize, y * dotSize, dotSize, dotSize);
            } else {
              tempCtx.beginPath();
              tempCtx.roundRect(
                offset + x * dotSize + padding + (qrWidth - actualSize) / 2,
                offset + y * dotSize + padding + (qrWidth - actualSize) / 2,
                dotSize - 2 * padding,
                dotSize - 2 * padding,
                (dotSize - 2 * padding) / 2
              );
              tempCtx.fill();
            }
          }
        }
        
        // Clear main canvas and draw centered QR code
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const xOffset = (canvas.width - qrWidth) / 2;
        const yOffset = (canvas.height - qrWidth) / 2;
        ctx.drawImage(tempCanvas, xOffset, yOffset);
      }

      if (logoUrl) {
        const logo = new Image();
        logo.src = logoUrl;
        
        await new Promise((resolve, reject) => {
          logo.onload = () => {
            const qrSize = canvas.width;
            const logoSize = Math.floor(qrSize * 0.25); // 25% of QR code size
            const x = (qrSize - logoSize) / 2;
            const y = (qrSize - logoSize) / 2;
            
            if (isBackgroundLogo) {
              // Save the current canvas state
              ctx.save();
              
              // Draw logo scaled to canvas size
              ctx.drawImage(logo, 0, 0, canvas.width, canvas.height);
              
              // Apply multiply blend mode for better contrast
              ctx.globalCompositeOperation = 'multiply';
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Draw QR code with adjusted opacity
              ctx.globalCompositeOperation = 'source-over';
              ctx.globalAlpha = saturation;
              QRCode.toCanvas(canvas, text, {
                version: version,
                errorCorrectionLevel: 'H',
                width: version >= 30 ? 380 : 400,
                margin: version >= 30 ? 4 : 4,
                color: {
                  dark: '#000000',
                  light: '#FFFFFF'
                }
              });
              
              // Restore canvas state
              ctx.restore();
            } else {
              // Create a more opaque white background for contrast
              ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
              ctx.fillRect(x - 8, y - 8, logoSize + 16, logoSize + 16);
              
              // Draw logo with appropriate opacity
              if (version === 40) {
                ctx.globalAlpha = 0.9;
              }
              ctx.drawImage(logo, x, y, logoSize, logoSize);
              ctx.globalAlpha = 1.0;
            }
            resolve();
          };
          logo.onerror = reject;
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
      return false;
    }
  }
}

export default QRCodeUtils;