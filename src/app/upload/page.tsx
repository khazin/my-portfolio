'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form) // ✅ automatically grabs the `resume` field

    const res = await fetch('/api/parse-resume', {
      method: 'POST',
      body: formData,
    })

    let data
    try {
      data = await res.json()
      setText(data.text || JSON.stringify(data, null, 2)) // show JSON as fallback
    } catch (err) {
      const errText = await res.text()
      console.error('Non-JSON response:', errText)
      setText(`Error: ${errText}`)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Upload Your Resume (PDF)</h1>

        <form onSubmit={handleUpload} encType="multipart/form-data" className="space-y-4">
          <input
            type="file"
            name="resume" // ✅ MUST match the field expected in backend
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
