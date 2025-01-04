
import React, { useState, useRef } from 'react';
import QRCodeUtils from './QRCodeUtils';

const QRCodeComponent = () => {
  const [qrContent, setQRContent] = useState('');
  const canvasRef = useRef(null);

  const generateQRCode = () => {
    if (!qrContent) {
      alert('Please enter some content first');
      return;
    }

    try {
      const matrix = QRCodeUtils.generateMatrix(qrContent);
      QRCodeUtils.renderToCanvas(matrix, canvasRef.current);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'qr-code.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-center">QR Code Generator</h1>
      
      <input 
        type="text"
        value={qrContent}
        onChange={(e) => setQRContent(e.target.value)}
        className="w-full px-3 py-2 border rounded"
        placeholder="Enter text or URL"
      />

      <div className="flex space-x-4">
        <button 
          onClick={generateQRCode}
          className="flex-grow bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Generate QR Code
        </button>
      </div>

      <div className="mt-4">
        <canvas 
          ref={canvasRef}
          className="mx-auto border"
          style={{ backgroundColor: 'white' }}
        />
        <button 
          onClick={handleDownload}
          className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Download QR Code
        </button>
      </div>
    </div>
  );
};

export default QRCodeComponent;
