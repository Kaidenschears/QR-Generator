
import React, { useState, useRef } from 'react';
import QRCodeUtils from './QRCodeUtils';

const QRCodeComponent = () => {
  const [qrContent, setQRContent] = useState('');
  const [version, setVersion] = useState(2);
  const [logoUrl, setLogoUrl] = useState(null);
  const [isRoundQR, setIsRoundQR] = useState(false);
  const [qrColor, setQrColor] = useState('#000000');
  const [isBackgroundLogo, setIsBackgroundLogo] = useState(false);
  const [saturation, setSaturation] = useState(1);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const url = e.target.result;
        setLogoUrl(url);
        // Generate preview immediately with current settings
        if (previewCanvasRef.current) {
          await QRCodeUtils.generateQRCode("Preview QR Code", previewCanvasRef.current, 40, url, isRoundQR);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateQRCode = async () => {
    if (!qrContent) {
      alert('Please enter some content first');
      return;
    }

    try {
      await QRCodeUtils.generateQRCode(qrContent, canvasRef.current, version, logoUrl, isRoundQR, qrColor, isBackgroundLogo, saturation);
    } catch (error) {
      console.error('QR Code Error:', error);
      alert(error.message || 'Failed to generate QR code');
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
            {[1,2,3,4,5,6,30].map(v => (
              <option key={v} value={v}>Version {v}</option>
            ))}
          </select>
          <input
            type="color"
            value={qrColor}
            onChange={(e) => setQrColor(e.target.value)}
            className="ml-2"
            title="QR Code Color"
          />
          {version < 30 && (
            <label className="flex items-center space-x-2 ml-4">
              <input
                type="checkbox"
                checked={isRoundQR}
                onChange={(e) => setIsRoundQR(e.target.checked)}
                className="form-checkbox"
              />
              <span>Round Style</span>
            </label>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoUpload}
            accept="image/*"
            className="hidden"
          />
          <div className="flex flex-col space-y-2">
            {!logoUrl ? (
              <button
                onClick={() => fileInputRef.current.click()}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Add Logo
              </button>
            ) : (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={isBackgroundLogo}
                    onChange={(e) => setIsBackgroundLogo(e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>Background Logo</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <span>QR Saturation:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={saturation}
                    onChange={(e) => setSaturation(parseFloat(e.target.value))}
                    className="w-32"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Change Logo
                  </button>
                  <button
                    onClick={async () => {
                      setLogoUrl(null);
                      if (canvasRef.current) {
                        await QRCodeUtils.generateQRCode(qrContent, canvasRef.current, version, null, isRoundQR);
                      }
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Delete Logo
                  </button>
                </div>
                <img src={logoUrl} alt="Logo preview" className="mx-auto border" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
              </div>
            )}
          </div>
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
