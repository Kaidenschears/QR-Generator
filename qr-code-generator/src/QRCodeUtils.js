import QRCode from 'qrcode';
import qrcodeGenerator from 'qrcode-generator';

class QRCodeUtils {
  static getVersionSize(version) {
    return (version * 4) + 17;
  }

  static async generateQRCode(text, canvas, version = 2, logoUrl = null, isRound = false, color = '#000000', isBackgroundLogo = false) {
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
        width: version >= 30 ? 380 : 400, // Larger size for v30+
        margin: version >= 30 ? 4 : 4, // Consistent margins
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
        const dotSize = canvas.width / moduleCount;
        const padding = dotSize * 0.15;

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
              ctx.fillRect(x * dotSize, y * dotSize, dotSize, dotSize);
            } else {
              ctx.beginPath();
              ctx.roundRect(
                x * dotSize + padding,
                y * dotSize + padding,
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
              // Draw logo as background with 50% opacity
              ctx.globalAlpha = 0.5;
              ctx.drawImage(logo, 0, 0, canvas.width, canvas.height);
              ctx.globalAlpha = 1.0;
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