import React, { useState, useCallback } from 'react';
import { Eye, Brain, Sparkles } from 'lucide-react';
import DrawingCanvas from './components/DrawingCanvas';
import ImageUpload from './components/ImageUpload';
import ModeSelector from './components/ModeSelector';
import Controls from './components/Controls';
import ResultsPanel from './components/ResultsPanel';
import { recognizeText, downloadTextFile, copyToClipboard } from './services/ocrService';

function App() {
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const [penSize, setPenSize] = useState(4);
  const [imageData, setImageData] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [clearCanvas, setClearCanvas] = useState(false);
  const [textCopied, setTextCopied] = useState(false);

  const handleImageUpdate = useCallback((data: string) => {
    setImageData(data);
  }, []);

  const handleImageUpload = useCallback((data: string) => {
    setUploadedImage(data);
    setImageData(data);
  }, []);

  const handleClearImage = useCallback(() => {
    setUploadedImage('');
    setImageData('');
    setRecognizedText('');
    setConfidence(0);
  }, []);

  const handleModeChange = useCallback((newMode: 'draw' | 'upload') => {
    setMode(newMode);
    setImageData('');
    setUploadedImage('');
    setRecognizedText('');
    setConfidence(0);
    if (newMode === 'draw') {
      setClearCanvas(true);
    }
  }, []);

  const handleRecognizeText = async () => {
    if (!imageData) return;

    setIsRecognizing(true);
    try {
      const result = await recognizeText(imageData);
      setRecognizedText(result.text);
      setConfidence(result.confidence);
    } catch (error) {
      console.error('Recognition failed:', error);
      setRecognizedText('Recognition failed. Please try again.');
      setConfidence(0);
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleClearCanvas = () => {
    setClearCanvas(true);
    setRecognizedText('');
    setConfidence(0);
  };

  const handleClearComplete = () => {
    setClearCanvas(false);
  };

  const handleExportText = () => {
    if (recognizedText) {
      downloadTextFile(recognizedText, `handwriting-${Date.now()}.txt`);
    }
  };

  const handleCopyText = async () => {
    if (recognizedText) {
      const success = await copyToClipboard(recognizedText);
      if (success) {
        setTextCopied(true);
        setTimeout(() => setTextCopied(false), 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Handwriting Recognition</h1>
                <p className="text-gray-600">Advanced NLP-powered text recognition</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Tesseract.js</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Area */}
          <div className="lg:col-span-2 space-y-6">
            <ModeSelector mode={mode} onModeChange={handleModeChange} />
            
            {mode === 'draw' ? (
              <DrawingCanvas
                penSize={penSize}
                onImageUpdate={handleImageUpdate}
                clearCanvas={clearCanvas}
                onClearComplete={handleClearComplete}
              />
            ) : (
              <ImageUpload
                onImageUpload={handleImageUpload}
                onClearImage={handleClearImage}
                uploadedImage={uploadedImage}
              />
            )}
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <Controls
              mode={mode}
              penSize={penSize}
              onPenSizeChange={setPenSize}
              onClearCanvas={handleClearCanvas}
              onClearImage={handleClearImage}
              onRecognize={handleRecognizeText}
              isRecognizing={isRecognizing}
              onExportText={handleExportText}
              hasText={!!recognizedText}
              hasImage={!!imageData}
            />
          </div>
        </div>

        {/* Results Panel */}
        <div className="mt-8">
          <ResultsPanel
            recognizedText={recognizedText}
            confidence={confidence}
            isRecognizing={isRecognizing}
            onCopyText={handleCopyText}
            textCopied={textCopied}
          />
        </div>

        {/* Features Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Input Your Text</h3>
              <p className="text-sm text-gray-600">Draw text on the canvas or upload a photo of handwritten text</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">AI Recognition</h3>
              <p className="text-sm text-gray-600">Our AI analyzes your handwriting using advanced OCR technology</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Get Results</h3>
              <p className="text-sm text-gray-600">View, copy, or export the recognized text with confidence scores</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;