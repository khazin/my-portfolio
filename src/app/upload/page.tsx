'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()

  const formData = new FormData(e.currentTarget)

  const res = await fetch('/api/parse-resume', {
    method: 'POST',
    body: formData,
    // do NOT set 'Content-Type' header manually here
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error('Upload error:', errorText)
    return
  }

  const data = await res.json()
  console.log('Parsed resume:', data)
}



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
