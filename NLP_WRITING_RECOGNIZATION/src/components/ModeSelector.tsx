import React from 'react';
import { PenTool, Upload } from 'lucide-react';

interface ModeSelectorProps {
  mode: 'draw' | 'upload';
  onModeChange: (mode: 'draw' | 'upload') => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onModeChange }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Input Method</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onModeChange('draw')}
          className={`flex items-center justify-center gap-2 p-4 rounded-xl font-medium transition-all duration-200 ${
            mode === 'draw'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <PenTool className="w-5 h-5" />
          Draw Text
        </button>
        <button
          onClick={() => onModeChange('upload')}
          className={`flex items-center justify-center gap-2 p-4 rounded-xl font-medium transition-all duration-200 ${
            mode === 'upload'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Upload className="w-5 h-5" />
          Upload Image
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;