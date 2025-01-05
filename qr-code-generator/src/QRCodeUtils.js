import QRCode from 'qrcode';

class QRCodeUtils {
  static getVersionSize(version) {
    // QR code versions 1-40 (sizes 21-177)
    return (version * 4) + 17;
  }

  static async generateQRCode(text, canvas, version = 2) {
    try {
      const size = this.getVersionSize(version);
      await QRCode.toCanvas(canvas, text, {
        width: size * 4, // Adjust width based on version
        margin: 2,
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