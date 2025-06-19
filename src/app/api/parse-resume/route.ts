import { NextRequest, NextResponse } from 'next/server';
import formidable, { Files } from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import { IncomingMessage } from 'http';

// Disable Next.js default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadedFile {
  filepath: string;
  originalFilename?: string;
  mimetype?: string;
  size?: number;
}

export async function POST(req: NextRequest) {
  try {
    const form = new formidable.IncomingForm();

    const files: Files = await new Promise((resolve, reject) => {
      form.parse(req as unknown as IncomingMessage, (_err, _fields, files) => {
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
