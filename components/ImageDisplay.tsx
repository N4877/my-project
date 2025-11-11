import React from 'react';
import { ImageData } from '../types';
import PhotoIcon from './icons/PhotoIcon';

interface ImageDisplayProps {
  label: string;
  imageData: ImageData | null;
  isLoading?: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ label, imageData, isLoading = false }) => {
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold text-gray-300 tracking-wide">{label}</h2>
      <div className="aspect-square w-full rounded-lg bg-gray-800/50 border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden relative shadow-lg">
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            <p className="mt-4 text-gray-200 font-medium">Generating...</p>
          </div>
        )}
        {imageData ? (
          <img
            src={`data:${imageData.mimeType};base64,${imageData.base64}`}
            alt={label}
            className="object-contain w-full h-full"
          />
        ) : (
          !isLoading && (
            <div className="text-gray-500 flex flex-col items-center p-4 text-center">
              <PhotoIcon className="w-16 h-16" />
              <p className="mt-2 text-sm">Image will appear here</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ImageDisplay;
