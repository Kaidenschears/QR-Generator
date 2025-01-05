import QRCode from 'qrcode';
import qrcodeGenerator from 'qrcode-generator';

class QRCodeUtils {
  static getVersionSize(version) {
    return (version * 4) + 17;
  }

  static async generateQRCode(text, canvas, version = 2, logoUrl = null, isRound = false, color = '#000000', isBackgroundLogo = false, saturation = 1) {
    try {
      // Set canvas dimensions
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // First generate the basic QR code
      await QRCode.toCanvas(canvas, text, {
        version: version,
        errorCorrectionLevel: 'H',
        width: 350,
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
        const width = 350;
        const dotSize = width / moduleCount;
        const padding = dotSize * 0.15;
        const offset = (canvas.width - width) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let y = 0; y < moduleCount; y++) {
          for (let x = 0; x < moduleCount; x++) {
            if (!qr.isDark(y, x)) continue;
            
            const isFinderPattern = (
              (x < 7 && y < 7) ||
              (x >= moduleCount - 7 && y < 7) ||
              (x < 7 && y >= moduleCount - 7)
            );

            ctx.fillStyle = isFinderPattern ? '#000000' : color;
            if (isFinderPattern) {
              ctx.fillRect(x * dotSize + offset, y * dotSize + offset, dotSize, dotSize);
            } else {
              ctx.beginPath();
              ctx.roundRect(
                x * dotSize + offset + padding,
                y * dotSize + offset + padding,
                dotSize - 2 * padding,
                dotSize - 2 * padding,
                (dotSize - 2 * padding) / 2
              );
              ctx.fill();
            }
          }
        }
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