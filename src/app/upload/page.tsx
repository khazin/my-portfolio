'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setText('') // clear previous text

    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText)
      }

      const data = await res.json()
      setText(JSON.stringify(data, null, 2))
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      setText('Error: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Upload Your Resume (PDF)</h1>
      <form onSubmit={handleUpload}>
        <input type="file" name="resume" accept=".pdf" required />
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
