
import QRCode from 'qrcode';
import qrcodeGenerator from 'qrcode-generator';

class QRCodeUtils {
  static getVersionSize(version) {
    return (version * 4) + 17;
  }

  static async generateQRCode(text, canvas, version = 2, logoUrl = null, isRound = false) {
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
        width: 400,
        margin: 4,
        color: {
          dark: '#000000',
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

            ctx.fillStyle = '#000000';
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

      if (version === 40 && logoUrl) {
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
