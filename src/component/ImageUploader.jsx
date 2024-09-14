import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      setError('Please select an image to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      // Send image to backend
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Get the description from the response and display it
      setDescription(response.data?.choices[0]?.message?.content || 'No description received.');
      setError('');
    } catch (error) {
      setError('Error uploading image or fetching description.');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Upload an Image</h1>
      
      {/* Input to select image */}
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleUpload}>Upload and Get Description</button>

      {/* Display any errors */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Conditionally render the description */}
      {description && (
        <div style={{ marginTop: '20px' }}>
          <h2>Image Description:</h2>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
