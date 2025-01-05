import QRCode from 'qrcode';
import qrcodeGenerator from 'qrcode-generator';

class QRCodeUtils {
  static getVersionSize(version) {
    return (version * 4) + 17;
  }

  static async generateQRCode(text, canvas, version = 2, logoUrl = null, isRound = false, color = '#000000') {
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
        width: version === 40 ? 350 : 400, // Smaller size for version 40
        margin: version === 40 ? 6 : 4, // More margin for version 40
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
            const logoSize = Math.floor(qrSize * (version === 40 ? 0.20 : 0.25)); // 20% for v40, 25% for others
            const x = (qrSize - logoSize) / 2;
            const y = (qrSize - logoSize) / 2;
            
            // Create a semi-transparent white background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
            
            // Draw logo
            ctx.drawImage(logo, x, y, logoSize, logoSize);
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