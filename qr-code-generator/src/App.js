import React, { useState, useRef, useEffect } from 'react';

// QR Code Generation Utility
class QRCodeGenerator {
  static generateQRCode(data, size = 10) {
    // Basic QR Code generation matrix
    const matrix = this.createBaseMatrix(data, size);
    return matrix;
  }

  static createBaseMatrix(data, size) {
    // Create a matrix based on input data
    const matrix = Array(size).fill().map(() => Array(size).fill(0));
    
    // Add some basic encoding pattern
    const dataBytes = this.stringToBytes(data);
    
    // Simple encoding pattern
    dataBytes.forEach((byte, index) => {
      const row = Math.floor(index / size);
      const col = index % size;
      
      // Use bits of the byte to create pattern
      if (row < size && col < size) {
        matrix[row][col] = (byte & 1) ? 1 : 0;
      }
    });
    
    // Add finder patterns (basic version)
    this.addFinderPatterns(matrix);
    
    return matrix;
  }

  static stringToBytes(str) {
    return str.split('').map(char => char.charCodeAt(0));
  }

  static addFinderPatterns(matrix) {
    const size = matrix.length;
    const patternSize = Math.min(7, Math.floor(size / 7));

    // Top-left finder pattern
    for (let i = 0; i < patternSize; i++) {
      for (let j = 0; j < patternSize; j++) {
        if ((i === 0 || i === patternSize - 1 || j === 0 || j === patternSize - 1) || 
            (i > 1 && i < patternSize - 2 && j > 1 && j < patternSize - 2)) {
          matrix[i][j] = 1;
        }
      }
    }

    // Top-right finder pattern
    for (let i = 0; i < patternSize; i++) {
      for (let j = size - patternSize; j < size; j++) {
        if ((i === 0 || i === patternSize - 1 || j === size - patternSize || j === size - 1) || 
            (i > 1 && i < patternSize - 2 && j > size - patternSize + 2 && j < size - 2)) {
          matrix[i][j] = 1;
        }
      }
    }

    // Bottom-left finder pattern
    for (let i = size - patternSize; i < size; i++) {
      for (let j = 0; j < patternSize; j++) {
        if ((i === size - patternSize || i === size - 1 || j === 0 || j === patternSize - 1) || 
            (i > size - patternSize + 2 && i < size - 2 && j > 1 && j < patternSize - 2)) {
          matrix[i][j] = 1;
        }
      }
    }
  }
}

const QRCodeComponent = () => {
  const [qrContent, setQRContent] = useState('');
  const [inputType, setInputType] = useState('text');
  const canvasRef = useRef(null);

  const renderQRCode = (matrix) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / matrix.length;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'black';
    matrix.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillRect(
            x * cellSize, 
            y * cellSize, 
            cellSize, 
            cellSize
          );
        }
      });
    });
  };
  const options = [

    { label: 'Version 1', value: 'fruit' },
 
    { label: 'Version 20', value: 'vegetable' },
 
    { label: 'Version 40', value: 'meat' },
 
  ];
const [version, setVersion] = React.useState('Version');

 const handleChange = (event) => {

   setVersion(event.target.value);

 };
  const handleGenerate = () => {
    if (!qrContent) return;

    const matrix = QRCodeGenerator.generateQRCode(qrContent, 25);
    renderQRCode(matrix);
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'qr-code.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQRContent(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
       <p>You selected: {version}</p> {/* Display the selected version */}
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