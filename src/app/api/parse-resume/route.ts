import { NextRequest, NextResponse } from 'next/server'
import formidable from 'formidable-serverless'
import fs from 'fs'
import pdfParse from 'pdf-parse'

// Disable default Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: NextRequest) {
  try {
    const form = new formidable.IncomingForm()
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err)
        else resolve([fields, files])
      })
    })

    const file = (files.resume as any)?.filepath
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const dataBuffer = fs.readFileSync(file)
    const parsed = await pdfParse(dataBuffer)

    return NextResponse.json({ text: parsed.text })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Parsing failed' }, { status: 500 })
  }
}
