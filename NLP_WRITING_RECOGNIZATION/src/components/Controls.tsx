import React from 'react';
import { Trash2, Download, RotateCcw, Palette, X } from 'lucide-react';

interface ControlsProps {
  mode: 'draw' | 'upload';
  penSize: number;
  onPenSizeChange: (size: number) => void;
  onClearCanvas: () => void;
  onClearImage: () => void;
  onRecognize: () => void;
  isRecognizing: boolean;
  onExportText: () => void;
  hasText: boolean;
  hasImage: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  mode,
  penSize,
  onPenSizeChange,
  onClearCanvas,
  onClearImage,
  onRecognize,
  isRecognizing,
  onExportText,
  hasText,
  hasImage,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Palette className="w-5 h-5 text-purple-500" />
        Controls
      </h3>
      
      <div className="space-y-6">
        {/* Pen Size - Only show for draw mode */}
        {mode === 'draw' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pen Size: {penSize}px
            </label>
            <input
              type="range"
              min="2"
              max="12"
              value={penSize}
              onChange={(e) => onPenSizeChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Fine</span>
              <span>Thick</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={onRecognize}
            disabled={isRecognizing || !hasImage}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRecognizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Recognizing...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Recognize Text
              </>
            )}
          </button>

          {mode === 'draw' ? (
            <button
              onClick={onClearCanvas}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Canvas
            </button>
          ) : (
            <button
              onClick={onClearImage}
              disabled={!hasImage}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Remove Image
            </button>
          )}

          <button
            onClick={onExportText}
            disabled={!hasText}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Text
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;