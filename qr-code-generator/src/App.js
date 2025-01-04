
import React, { useState, useRef } from 'react';
import './App.css';

// QR Code Generation Utility
[Previous QRCodeGenerator class implementation remains the same...]

const QRCodeComponent = () => {
  const [qrContent, setQRContent] = useState('');
  const [inputType, setInputType] = useState('text');
  const [version, setVersion] = useState('Version 1');
  const canvasRef = useRef(null);

  const versions = [
    { label: 'Version 1', value: 'v1' },
    { label: 'Version 20', value: 'v20' },
    { label: 'Version 40', value: 'v40' },
  ];

  const handleVersionChange = (event) => {
    setVersion(event.target.value);
  };

  // [Previous handler functions remain the same...]

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-center">QR Code Generator</h1>
      
      <div className="flex space-x-4 mb-4">
        <button 
          className={`px-4 py-2 rounded ${inputType === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setInputType('text')}
        >
          Text/URL
        </button>
        <button 
          className={`px-4 py-2 rounded ${inputType === 'image' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setInputType('image')}
        >
          Image
        </button>
      </div>

      <select
        value={version}
        onChange={handleVersionChange}
        className="w-full px-3 py-2 border rounded mb-4"
      >
        {versions.map((v) => (
          <option key={v.value} value={v.label}>
            {v.label}
          </option>
        ))}
      </select>

      {inputType === 'text' && (
        <input 
          type="text"
          value={qrContent}
          onChange={(e) => setQRContent(e.target.value)}
          placeholder="Enter text or URL"
          className="w-full px-3 py-2 border rounded"
        />
      )}

      {inputType === 'image' && (
        <input 
          type="file" 
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full px-3 py-2 border rounded"
        />
      )}

      <div className="flex space-x-4">
        <button 
          onClick={handleGenerate}
          className="flex-grow bg-green-500 text-white px-4 py-2 rounded"
        >
          Generate QR Code
        </button>
      </div>

      {qrContent && (
        <div className="mt-4">
          <canvas 
            ref={canvasRef}
            width="300" 
            height="300"
            className="mx-auto border"
          />
          <button 
            onClick={handleDownload}
            className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded"
          >
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCodeComponent;
