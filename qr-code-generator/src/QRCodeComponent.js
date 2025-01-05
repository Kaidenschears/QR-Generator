
import React, { useState, useRef } from 'react';
import QRCodeUtils from './QRCodeUtils';

const QRCodeComponent = () => {
  const [qrContent, setQRContent] = useState('');
  const [version, setVersion] = useState(2);
  const canvasRef = useRef(null);

  const generateQRCode = async () => {
    if (!qrContent) {
      alert('Please enter some content first');
      return;
    }

    const success = await QRCodeUtils.generateQRCode(qrContent, canvasRef.current, version);
    if (!success) {
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
      
      <div className="space-y-4">
        <input 
          type="text"
          value={qrContent}
          onChange={(e) => setQRContent(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <div className="flex items-center space-x-2">
          <label className="text-sm">Version:</label>
          <select 
            value={version}
            onChange={(e) => setVersion(Number(e.target.value))}
            className="px-2 py-1 border rounded"
          >
            {[1,2,3,4,5,6].map(v => (
              <option key={v} value={v}>Version {v}</option>
            ))}
          </select>
        </div>
      </div>

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
