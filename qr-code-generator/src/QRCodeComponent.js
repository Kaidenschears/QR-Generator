
import React, { useState, useRef, useEffect } from 'react';

class QRCodeGenerator {
  static generateQRCode(data, size = 29) {
    // Create base matrix
    const matrix = Array(size).fill().map(() => Array(size).fill(0));
    
    // Add finder patterns
    this.addFinderPattern(matrix, 0, 0);
    this.addFinderPattern(matrix, size - 7, 0);
    this.addFinderPattern(matrix, 0, size - 7);
    
    // Add alignment patterns
    this.addAlignmentPattern(matrix, size - 9, size - 9);
    
    // Add timing patterns
    this.addTimingPatterns(matrix, size);
    
    // Add data
    this.addData(matrix, data, size);
    
    return matrix;
  }

  static addFinderPattern(matrix, startX, startY) {
    // Outer square
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6) {
          matrix[startY + i][startX + j] = 1;
        }
      }
    }
    
    // Inner square
    for (let i = 2; i < 5; i++) {
      for (let j = 2; j < 5; j++) {
        matrix[startY + i][startX + j] = 1;
      }
    }
  }

  static addAlignmentPattern(matrix, x, y) {
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (Math.abs(i) === 2 || Math.abs(j) === 2 || (i === 0 && j === 0)) {
          matrix[y + i][x + j] = 1;
        }
      }
    }
  }

  static addTimingPatterns(matrix, size) {
    // Horizontal timing pattern
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2;
    }
    
    // Vertical timing pattern
    for (let i = 8; i < size - 8; i++) {
      matrix[i][6] = i % 2;
    }
  }

  static addData(matrix, data, size) {
    const dataBytes = this.stringToBytes(data);
    let bitIndex = 0;
    
    // Bottom-up, right-to-left pattern
    for (let x = size - 1; x >= 0; x -= 2) {
      if (x <= 6) x = 5; // Skip timing pattern
      
      for (let y = size - 1; y >= 0; y--) {
        for (let i = 0; i < 2; i++) {
          const xx = x - i;
          if (xx < 0) continue;
          
          // Skip patterns
          if (matrix[y][xx] !== 0) continue;
          
          if (bitIndex < dataBytes.length * 8) {
            const byteIndex = Math.floor(bitIndex / 8);
            const bit = (dataBytes[byteIndex] >> (7 - (bitIndex % 8))) & 1;
            matrix[y][xx] = bit;
            bitIndex++;
          }
        }
      }
    }
  }

  static stringToBytes(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i));
    }
    return bytes;
  }
}

const QRCodeComponent = () => {
  const [qrContent, setQRContent] = useState('');
  const [inputType, setInputType] = useState('text');
  const canvasRef = useRef(null);

  const renderQRCode = (matrix) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const size = matrix.length;
    const cellSize = Math.floor(canvas.width / size);

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center the QR code
    const offset = Math.floor((canvas.width - (size * cellSize)) / 2);

    // Draw QR code
    ctx.fillStyle = 'black';
    matrix.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1) {
          ctx.fillRect(
            offset + x * cellSize, 
            offset + y * cellSize, 
            cellSize - 1, 
            cellSize - 1
          );
        }
      });
    });
  };

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  const handleGenerate = () => {
    if (!qrContent) {
      alert('Please enter some content first');
      return;
    }
    try {
      const matrix = QRCodeGenerator.generateQRCode(qrContent, 29);
      renderQRCode(matrix);
    } catch (error) {
      console.error('QR Code generation failed:', error);
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
      
      <div className="flex space-x-4 mb-4">
        <button 
          className={`px-4 py-2 rounded ${inputType === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setInputType('text')}
        >
          Text/URL
        </button>
      </div>

      <input 
        type="text"
        value={qrContent || 'https://www.star.nesdis.noaa.gov/goes/fulldisk.php?sat=G16'}
        onChange={(e) => setQRContent(e.target.value)}
        placeholder="Enter text or URL"
        className="w-full px-3 py-2 border rounded"
      />

      <div className="flex space-x-4">
        <button 
          onClick={handleGenerate}
          className="flex-grow bg-green-500 text-white px-4 py-2 rounded"
        >
          Generate QR Code
        </button>
      </div>

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
    </div>
  );
};

export default QRCodeComponent;
