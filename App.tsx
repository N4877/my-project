import React, { useState, useEffect } from 'react';
import { ImageData } from './types';
import { fileToBase64, urlToBase64 } from './utils/imageUtils';
import { editImage } from './services/geminiService';
import ImageDisplay from './components/ImageDisplay';
import Spinner from './components/Spinner';
import PhotoIcon from './components/icons/PhotoIcon';

const DEFAULT_IMAGE_URL = 'https://picsum.photos/id/1062/1024/1024';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [editedImage, setEditedImage] = useState<ImageData | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDefaultImage = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const imageData = await urlToBase64(DEFAULT_IMAGE_URL);
        setOriginalImage(imageData);
      } catch (e) {
        setError('Failed to load default image. Please upload your own.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadDefaultImage();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setError(null);
        setIsLoading(true);
        setEditedImage(null);
        const imageData = await fileToBase64(file);
        setOriginalImage(imageData);
      } catch (err) {
        setError('Failed to read image file.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt || !originalImage) {
      setError('Please provide an image and a prompt.');
      return;
    }

    try {
      setError(null);
      setIsGenerating(true);
      setEditedImage(null);
      const result = await editImage(originalImage, prompt);
      if (result) {
        setEditedImage(result);
      } else {
        setError('The model did not return an image. Try a different prompt.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Gemini Image Editor
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Edit photos with text prompts using Gemini 2.5 Flash Image.
          </p>
        </header>

        <main className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/3 w-full bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-gray-700 pb-2">Controls</h2>
            
            <div className="mb-6">
              <label htmlFor="image-upload" className="block text-lg font-medium text-gray-300 mb-2">
                1. Choose an Image
              </label>
               <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-500" />
                  <div className="flex text-sm text-gray-400 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-cyan-500 px-1"
                    >
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/png, image/jpeg" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG or JPG</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="prompt" className="block text-lg font-medium text-gray-300 mb-2">
                2. Describe Your Edit
              </label>
              <textarea
                id="prompt"
                name="prompt"
                rows={4}
                className="block w-full shadow-sm sm:text-sm bg-gray-900 border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500"
                placeholder="e.g., Add a retro filter, make it black and white, remove the car in the background..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={!originalImage || isGenerating}
              />
              <button
                type="submit"
                disabled={isGenerating || !prompt || !originalImage}
                className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? <Spinner /> : 'Generate Image'}
              </button>
            </form>

             {error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-sm">
                <p className="font-bold">An error occurred:</p>
                <p>{error}</p>
              </div>
            )}
          </aside>

          <div className="lg:w-2/3 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImageDisplay label="Original" imageData={originalImage} isLoading={isLoading} />
            <ImageDisplay label="Edited" imageData={editedImage} isLoading={isGenerating} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
