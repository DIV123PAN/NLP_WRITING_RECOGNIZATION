import React from 'react';
import { FileText, TrendingUp, Copy, Check, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface ResultsPanelProps {
  recognizedText: string;
  confidence: number;
  isRecognizing: boolean;
  onCopyText: () => void;
  textCopied: boolean;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  recognizedText,
  confidence,
  isRecognizing,
  onCopyText,
  textCopied,
}) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-green-600 bg-green-100';
    if (conf >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 80) return 'High';
    if (conf >= 60) return 'Medium';
    return 'Low';
  };

  const getConfidenceIcon = (conf: number) => {
    if (conf >= 80) return <CheckCircle className="w-4 h-4" />;
    if (conf >= 60) return <AlertTriangle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const getAccuracyTips = (conf: number) => {
    if (conf < 60) {
      return [
        "Try writing more clearly with darker strokes",
        "Ensure good lighting when taking photos",
        "Use a plain background for better contrast",
        "Write larger text for better recognition",
        "Avoid cursive writing if possible"
      ];
    } else if (conf < 80) {
      return [
        "Good result! For even better accuracy:",
        "Use darker ink or pencil",
        "Write on lined paper for better alignment",
        "Ensure the image is not blurry"
      ];
    }
    return ["Excellent recognition quality!"];
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-500" />
          Recognition Results
        </h3>
        {confidence > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Confidence:</span>
            <span className={`text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1 ${getConfidenceColor(confidence)}`}>
              {getConfidenceIcon(confidence)}
              {Math.round(confidence)}% ({getConfidenceLabel(confidence)})
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        {isRecognizing ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Processing your handwriting...</p>
              <p className="text-sm text-gray-500 mt-1">Using advanced AI preprocessing</p>
              <div className="mt-3 text-xs text-gray-400">
                <p>• Converting to optimal format</p>
                <p>• Enhancing contrast and clarity</p>
                <p>• Applying noise reduction</p>
                <p>• Running multiple recognition passes</p>
              </div>
            </div>
          </div>
        ) : recognizedText ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                {recognizedText}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                onClick={onCopyText}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                {textCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Text
                  </>
                )}
              </button>
              
              {confidence > 0 && (
                <div className="text-xs text-gray-500">
                  {recognizedText.length} characters recognized
                </div>
              )}
            </div>

            {/* Accuracy Tips */}
            {confidence > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  {confidence < 80 ? "Tips for Better Accuracy:" : "Great Job!"}
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  {getAccuracyTips(confidence).map((tip, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No text recognized yet</p>
            <p className="text-sm mt-1">Draw something on the canvas or upload an image</p>
            <div className="mt-4 text-xs text-gray-400 space-y-1">
              <p>💡 For best results:</p>
              <p>• Use dark ink on light paper</p>
              <p>• Write clearly and avoid cursive</p>
              <p>• Ensure good lighting and focus</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;