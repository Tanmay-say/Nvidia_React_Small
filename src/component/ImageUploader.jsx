import React, { useState } from 'react';

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

    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageB64 = reader.result.split(',')[1]; // Get the base64 string

      if (!imageB64) {
        setError('Error converting image to base64.');
        return;
      }

      try {
        // Use Fetch API to handle streaming response
        const response = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageB64 }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let result = '';
        let done = false;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          result += decoder.decode(value || new Uint8Array(), { stream: !done });
          // Process the streamed chunks
          const parsedContent = parseStreamedData(result);
          setDescription(parsedContent);
        }

        setError('');
      } catch (error) {
        console.error('Error:', error);
        setError('Error uploading image or fetching description.');
      }
    };

    reader.readAsDataURL(image);
  };

  // Function to parse streamed data
  const parseStreamedData = (data) => {
    const lines = data.split('\n');
    let content = '';

    lines.forEach((line) => {
      if (line.startsWith('data: ')) {
        const jsonStr = line.replace('data: ', '').trim();
        if (jsonStr !== '[DONE]') {
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices[0].delta.content;
            if (delta) {
              content += delta;
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    });

    return content;
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
          <h2>Response:</h2>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
