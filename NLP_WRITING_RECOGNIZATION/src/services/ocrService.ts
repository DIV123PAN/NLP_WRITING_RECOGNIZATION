import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

// Advanced image preprocessing functions
const preprocessImage = (canvas: HTMLCanvasElement, imageData: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(imageData);

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Get image data for processing
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Apply multiple preprocessing techniques
      applyGrayscale(data);
      applyContrast(data, 1.5);
      applyGaussianBlur(imgData, canvas);
      applyAdaptiveThreshold(imgData);
      applyMorphologicalOperations(imgData, canvas);
      applyNoiseReduction(imgData);

      // Put processed image back
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL());
    };
    img.src = imageData;
  });
};

// Convert to grayscale for better OCR performance
const applyGrayscale = (data: Uint8ClampedArray) => {
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    data[i] = gray;     // Red
    data[i + 1] = gray; // Green
    data[i + 2] = gray; // Blue
  }
};

// Enhance contrast to make text more distinct
const applyContrast = (data: Uint8ClampedArray, contrast: number) => {
  const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
  }
};

// Apply Gaussian blur to reduce noise
const applyGaussianBlur = (imgData: ImageData, canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  ctx.putImageData(imgData, 0, 0);
  ctx.filter = 'blur(0.5px)';
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';
  
  const blurred = ctx.getImageData(0, 0, canvas.width, canvas.height);
  imgData.data.set(blurred.data);
};

// Apply adaptive thresholding for better binarization
const applyAdaptiveThreshold = (imgData: ImageData) => {
  const { data, width, height } = imgData;
  const threshold = calculateOtsuThreshold(data);
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i];
    const binary = gray > threshold ? 255 : 0;
    data[i] = binary;
    data[i + 1] = binary;
    data[i + 2] = binary;
  }
};

// Calculate optimal threshold using Otsu's method
const calculateOtsuThreshold = (data: Uint8ClampedArray): number => {
  const histogram = new Array(256).fill(0);
  const total = data.length / 4;
  
  // Build histogram
  for (let i = 0; i < data.length; i += 4) {
    histogram[data[i]]++;
  }
  
  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }
  
  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let varMax = 0;
  let threshold = 0;
  
  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    
    wF = total - wB;
    if (wF === 0) break;
    
    sumB += t * histogram[t];
    
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    
    const varBetween = wB * wF * (mB - mF) * (mB - mF);
    
    if (varBetween > varMax) {
      varMax = varBetween;
      threshold = t;
    }
  }
  
  return threshold;
};

// Apply morphological operations to clean up the image
const applyMorphologicalOperations = (imgData: ImageData, canvas: HTMLCanvasElement) => {
  const { data, width, height } = imgData;
  const processed = new Uint8ClampedArray(data);
  
  // Erosion followed by dilation (opening) to remove noise
  const kernel = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0]
  ];
  
  // Erosion
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let minVal = 255;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          if (kernel[ky + 1][kx + 1]) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            minVal = Math.min(minVal, data[idx]);
          }
        }
      }
      const idx = (y * width + x) * 4;
      processed[idx] = processed[idx + 1] = processed[idx + 2] = minVal;
    }
  }
  
  // Dilation
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let maxVal = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          if (kernel[ky + 1][kx + 1]) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            maxVal = Math.max(maxVal, processed[idx]);
          }
        }
      }
      const idx = (y * width + x) * 4;
      data[idx] = data[idx + 1] = data[idx + 2] = maxVal;
    }
  }
};

// Apply noise reduction using median filter
const applyNoiseReduction = (imgData: ImageData) => {
  const { data, width, height } = imgData;
  const processed = new Uint8ClampedArray(data);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const neighbors = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          neighbors.push(data[idx]);
        }
      }
      neighbors.sort((a, b) => a - b);
      const median = neighbors[Math.floor(neighbors.length / 2)];
      
      const idx = (y * width + x) * 4;
      processed[idx] = processed[idx + 1] = processed[idx + 2] = median;
    }
  }
  
  data.set(processed);
};

// Enhanced OCR recognition with multiple attempts and configurations
export const recognizeText = async (imageData: string): Promise<OCRResult> => {
  try {
    // Create a canvas for preprocessing
    const canvas = document.createElement('canvas');
    
    // Preprocess the image for better OCR accuracy
    const processedImage = await preprocessImage(canvas, imageData);
    
    // Multiple OCR configurations for different handwriting styles
    const ocrConfigs = [
      // Configuration 1: Optimized for handwriting
      {
        lang: 'eng',
        options: {
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
          tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:()-\'\"',
          preserve_interword_spaces: '1',
          user_defined_dpi: '300',
          tessjs_create_hocr: '1',
          tessjs_create_tsv: '1',
        }
      },
      // Configuration 2: Alternative for cursive/script text
      {
        lang: 'eng',
        options: {
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE,
          tessedit_ocr_engine_mode: Tesseract.OEM.DEFAULT,
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:()-\'\"',
          preserve_interword_spaces: '1',
          user_defined_dpi: '300',
        }
      },
      // Configuration 3: For mixed content
      {
        lang: 'eng',
        options: {
          tessedit_pageseg_mode: Tesseract.PSM.AUTO,
          tessedit_ocr_engine_mode: Tesseract.OEM.DEFAULT,
          preserve_interword_spaces: '1',
          user_defined_dpi: '300',
        }
      }
    ];
    
    let bestResult: OCRResult = { text: '', confidence: 0 };
    
    // Try each configuration and keep the best result
    for (const config of ocrConfigs) {
      try {
        console.log('Trying OCR configuration:', config);
        const { data } = await Tesseract.recognize(processedImage, config.lang, {
          logger: m => console.log(`OCR Progress: ${m.status} ${m.progress ? Math.round(m.progress * 100) + '%' : ''}`),
          ...config.options
        });
        
        const result: OCRResult = {
          text: data.text.trim(),
          confidence: data.confidence
        };
        
        // Keep the result with highest confidence
        if (result.confidence > bestResult.confidence && result.text.length > 0) {
          bestResult = result;
        }
        
        console.log(`Configuration result: "${result.text}" (${result.confidence}% confidence)`);
        
        // If we get a very high confidence result, use it
        if (result.confidence > 85 && result.text.length > 0) {
          break;
        }
      } catch (configError) {
        console.warn('OCR configuration failed:', configError);
        continue;
      }
    }
    
    // Post-process the text to fix common OCR errors
    if (bestResult.text) {
      bestResult.text = postProcessText(bestResult.text);
    }
    
    // If no good result found, try with original image
    if (bestResult.confidence < 30 || bestResult.text.length === 0) {
      console.log('Trying with original image...');
      const { data } = await Tesseract.recognize(imageData, 'eng', {
        logger: m => console.log(`Fallback OCR: ${m.status} ${m.progress ? Math.round(m.progress * 100) + '%' : ''}`),
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        tessedit_ocr_engine_mode: Tesseract.OEM.DEFAULT,
      });
      
      if (data.confidence > bestResult.confidence) {
        bestResult = {
          text: postProcessText(data.text.trim()),
          confidence: data.confidence
        };
      }
    }
    
    console.log(`Final result: "${bestResult.text}" (${bestResult.confidence}% confidence)`);
    return bestResult;
    
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to recognize text. Please try with a clearer image.');
  }
};

// Post-process text to fix common OCR errors
const postProcessText = (text: string): string => {
  let processed = text;
  
  // Common OCR error corrections
  const corrections: { [key: string]: string } = {
    // Number/letter confusions
    '0': 'O', // Context-dependent
    '1': 'I', // Context-dependent
    '5': 'S', // Context-dependent
    '8': 'B', // Context-dependent
    // Common character misreads
    'rn': 'm',
    'cl': 'd',
    'vv': 'w',
    '|': 'I',
    // Fix spacing issues
    '  ': ' ',
    '   ': ' ',
  };
  
  // Apply corrections carefully
  for (const [wrong, right] of Object.entries(corrections)) {
    if (wrong.length === 1) {
      // For single character corrections, be more careful
      continue; // Skip single char corrections for now to avoid over-correction
    }
    processed = processed.replace(new RegExp(wrong, 'g'), right);
  }
  
  // Clean up extra whitespace
  processed = processed.replace(/\s+/g, ' ').trim();
  
  // Remove obviously wrong characters (non-printable, etc.)
  processed = processed.replace(/[^\x20-\x7E]/g, '');
  
  return processed;
};

export const downloadTextFile = (text: string, filename: string = 'recognized-text.txt') => {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
};