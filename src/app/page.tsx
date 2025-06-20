'use client'

import { useState } from 'react'

export default function HomePage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const fileInput = form.resume as HTMLInputElement
    const file = fileInput.files?.[0]

    const formData = new FormData()
    formData.append('resume', file!)

    const res = await fetch('/api/parse-resume', {
      method: 'POST',
      body: formData,
    })
    
    if (!res.ok) {
      const text = await res.text(); // this will reveal the real HTML error
      console.error("Non-JSON response:", text);
      throw new Error(`Server error ${res.status}`);
       console.log(text);
    }
     

    const data = await res.json()
    setText(data.text || data.error)
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Upload Your Resume (PDF)</h1>
        <form onSubmit={handleUpload} encType="multipart/form-data" className="space-y-4">
          <input
            type="file"
            name="resume"
            accept=".pdf"
            required
            className="block w-full border p-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Parsing...' : 'Upload & Parse'}
          </button>
        </form>

        {text && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Parsed Text:</h2>
            <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded text-sm">
              {text}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
