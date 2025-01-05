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
        
        const dotSize = canvas.width / ((version * 4) + 17);
        const radius = dotSize / 2.5;

        for (let y = 0; y < canvas.height; y += dotSize) {
          for (let x = 0; x < canvas.width; x += dotSize) {
            const i = (y * canvas.width + x) * 4;
            if (data[i] === 0) {
              ctx.beginPath();
              ctx.arc(x + dotSize/2, y + dotSize/2, radius, 0, Math.PI * 2);
              ctx.fillStyle = '#000000';
              ctx.fill();
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