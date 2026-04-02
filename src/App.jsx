// Deployment Sync: 2026-04-02 
import { useState } from 'react';
import './index.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
 
  const API_TOKEN = import.meta.env.VITE_HF_TOKEN;

  async function query(data) {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Failed to generate image. Please try again.");
    }

    const result = await response.blob();
    return result;
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    if (!API_TOKEN) {
      setError("API Token is not configured. Please add VITE_HF_TOKEN to your environment variables.");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);

    try {
      const blob = await query({ "inputs": prompt });
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error("Generation Error:", err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `lumina-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <>
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      <div className="container">
        <div className="header">
          <h1>Lumina AI</h1>
          <p>The next generation of AI-powered creative intelligence.</p>
        </div>

        <div className="input-section">
          <input
            type="text"
            className="prompt-input"
            placeholder="What should I create for you?..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
          />
          <button
            className="generate-button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? <div className="spinner"></div> : 'Generate Now'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        )}

        <div className={`image-display ${generatedImage ? 'has-image' : ''}`}>
          {isGenerating ? (
            <div className="loading-indicator">
              <div className="large-spinner"></div>
              <p>Thinking and generating...</p>
            </div>
          ) : generatedImage ? (
            <div className="image-wrapper">
              <img src={generatedImage} alt={prompt} className="generated-image" />
              <button className="download-button" onClick={handleDownload}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download
              </button>
            </div>
          ) : (
            <div className="placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Visionary ideas start here</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
