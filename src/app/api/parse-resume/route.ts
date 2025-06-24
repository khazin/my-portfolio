import { NextRequest, NextResponse } from 'next/server'
import { Buffer } from 'buffer'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('resume') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const pdfParse = (await import('pdf-parse')).default
    const parsed = await pdfParse(buffer)

    let rawText = parsed.text

    rawText = rawText
      .replace(/WORKEXPERIENCE/g, 'WORK EXPERIENCE')
      .replace(/DESKTOPENGINEER/g, 'DESKTOP ENGINEER')
      .replace(/BSCINCOMPUTERSCIENCE/g, 'BSC IN COMPUTER SCIENCE')
      .replace(/OXFORDBROOKESUNIVERSITY/g, 'OXFORD BROOKES UNIVERSITY')
      .replace(/SKILLS/g, '\nSKILLS\n')
      .replace(/EDUCATION/g, '\nEDUCATION\n')
      .replace(/WORK EXPERIENCE/g, '\nWORK EXPERIENCE\n')

    const cleanedText = rawText
      .replace(/([A-Z]{2,})(?=[A-Z][a-z])/g, '$1 ')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([a-zA-Z])(\d)/g, '$1 $2')
      .replace(/(\d)([a-zA-Z])/g, '$1 $2')
      .replace(/\|/g, ' | ')
      .replace(/\s{2,}/g, ' ')
      .replace(/\n{2,}/g, '\n')
      .trim()

    const result: Record<string, string> = {}
    const eduMatch = cleanedText.match(/EDUCATION\s+([\s\S]+?)WORK EXPERIENCE/i)
    if (eduMatch) result.education = eduMatch[1].trim()

    const workMatch = cleanedText.match(/WORK EXPERIENCE\s+([\s\S]+?)SKILLS/i)
    if (workMatch) result.workExperience = workMatch[1].trim()

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Error parsing resume:', error)
    let errorMessage = 'Failed to parse resume'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
