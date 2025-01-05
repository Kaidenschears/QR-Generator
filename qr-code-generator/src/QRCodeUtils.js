import QRCode from 'qrcode';

class QRCodeUtils {
  static getVersionSize(version) {
    // QR code versions 1-40 (sizes 21-177)
    return (version * 4) + 17;
  }

  static async generateQRCode(text, canvas, version = 2) {
    try {
      await QRCode.toCanvas(canvas, text, {
        width: 400, // Fixed larger size
        margin: 4, // Slightly larger margin
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        version: version //Added version control
      });
      return true;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return false;
    }
  }
}

export default QRCodeUtils;