
class QRCodeUtils {
  static generateMatrix(text, size = 29) {
    const matrix = Array(size).fill().map(() => Array(size).fill(0));
    
    // Add finder patterns (the three large squares in corners)
    this.addFinderPattern(matrix, 0, 0);
    this.addFinderPattern(matrix, size - 7, 0);
    this.addFinderPattern(matrix, 0, size - 7);
    
    // Add alignment pattern (smaller square near bottom-right)
    this.addAlignmentPattern(matrix, size - 9, size - 9);
    
    // Add timing patterns (dotted lines between finder patterns)
    this.addTimingPatterns(matrix, size);
    
    // Add data in a zigzag pattern
    this.addData(matrix, text, size);
    
    return matrix;
  }

  static addFinderPattern(matrix, startX, startY) {
    // Draw 7x7 finder pattern
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          matrix[startY + i][startX + j] = 1;
        }
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
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2;
      matrix[i][6] = i % 2;
    }
  }

  static addData(matrix, text, size) {
    const data = this.textToBinary(text);
    let dataIndex = 0;
    
    // Zigzag pattern from bottom-right
    for (let col = size - 1; col >= 0; col -= 2) {
      if (col <= 6) col = 5; // Skip timing pattern
      
      const upward = (col % 4 === 0);
      for (let row = upward ? size - 1 : 0; upward ? row >= 0 : row < size; row += upward ? -1 : 1) {
        for (let x = 0; x < 2; x++) {
          const currentCol = col - x;
          if (currentCol < 0) continue;
          
          // Skip if cell is part of a pattern
          if (matrix[row][currentCol] !== 0) continue;
          
          if (dataIndex < data.length) {
            matrix[row][currentCol] = data[dataIndex++] === '1' ? 1 : 0;
          }
        }
      }
    }
  }

  static textToBinary(text) {
    return text.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
  }

  static renderToCanvas(matrix, canvas, cellSize = 8) {
    const ctx = canvas.getContext('2d');
    const size = matrix.length;
    const padding = 40;
    
    canvas.width = size * cellSize + (padding * 2);
    canvas.height = size * cellSize + (padding * 2);
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw QR code
    ctx.fillStyle = '#000000';
    matrix.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1) {
          ctx.fillRect(
            padding + (x * cellSize),
            padding + (y * cellSize),
            cellSize - 1,
            cellSize - 1
          );
        }
      });
    });
  }
}

export default QRCodeUtils;
