'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

 const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  const fileInput = (e.currentTarget.elements.namedItem('resume') as HTMLInputElement);
  const file = fileInput.files?.[0];

  if (!file) {
    alert('Please select a file');
    setLoading(false);
    return;
  }

  const reader = new FileReader();

  reader.onload = async () => {
    if (typeof reader.result !== 'string') {
      setText('Error: Unable to read file as base64');
      setLoading(false);
      return;
    }

    const base64 = reader.result.split(',')[1]; // remove data:*/*;base64, prefix
    console.log('Base64 length:', base64.length);
    console.log('Base64 snippet:', base64.slice(0, 30));

    const payload = JSON.stringify({ file: base64 });
    console.log('Sending payload:', payload);

    try {
      const formData = new FormData()
    formData.append('resume', file)
      const res = await fetch('/api/parse-resume', {
         method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const data = await res.json();
      setText(data.text || JSON.stringify(data));
    } catch (err: unknown) {
      let message = 'Unknown error';
      if (err instanceof Error) {
        message = err.message;
      }
      setText('Error: ' + message);
    } finally {
      setLoading(false);
    }
  };

  reader.readAsDataURL(file);
};


  return (
    <div>
      <h1>Upload Your Resume (PDF)</h1>
      <form onSubmit={handleUpload}>
        <input type="file" name="resume" accept="multipart/form-data" required />
        <button type="submit" disabled={loading}>
          {loading ? 'Parsing...' : 'Upload & Parse'}
        </button>
      </form>

      {text && (
        <pre style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
          {text}
        </pre>
      )}
    </div>
  )
}
