import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable-serverless';
import fs from 'fs';
import pdfParse from 'pdf-parse';

// Disable built-in body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadedFile {
  filepath: string;
  originalFilename?: string;
  mimetype?: string;
}

export async function POST(req: NextRequest) {
  try {
    const form = new formidable.IncomingForm();

    const files: any = await new Promise((resolve, reject) => {
      form.parse(req as unknown as any, (_err, _fields, files) => {
        if (_err) reject(_err);
        else resolve(files);
      });
    });

    const file = (files.resume as UploadedFile)?.filepath;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const dataBuffer = fs.readFileSync(file);
    const parsed = await pdfParse(dataBuffer);

    return NextResponse.json({ text: parsed.text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}
