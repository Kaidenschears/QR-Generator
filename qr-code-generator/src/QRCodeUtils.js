
import QRCode from 'qrcode';

class QRCodeUtils {
  static async generateQRCode(text, canvas) {
    try {
      await QRCode.toCanvas(canvas, text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return true;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return false;
    }
  }
}

export default QRCodeUtils;
