import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [previewURL, setPreviewURL] = React.useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      alert('Please select an image first!');
      return;
    }

    setIsLoading(true);

    // Simulate processing delay
    setTimeout(() => {
      setIsLoading(false);
      navigate('/game', { state: { imageURL: URL.createObjectURL(selectedFile) } });
    }, 1500);
  };

  return (
    <div className="home-container">
      <h1>Image Puzzle Game</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      {previewURL && (
        <div className="image-preview">
          <img src={previewURL} alt="Preview" className="preview-img" />
        </div>
      )}

      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? (
          <span className="loading-dots">Starting Game</span>
        ) : (
          'Start Game'
        )}
      </button>
    </div>
  );
}

export default Home;
