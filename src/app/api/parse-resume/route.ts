import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import { IncomingMessage } from 'http';

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

type FilesType = {
  resume?: UploadedFile | UploadedFile[];
};

export async function POST(req: NextRequest) {
  try {
    const form = new formidable.IncomingForm();

    const files: FilesType = await new Promise((resolve, reject) => {
      form.parse(req as unknown as IncomingMessage, (_err, _fields, files) => {
        if (_err) reject(_err);
        else resolve(files);
      });
    });

    const file = Array.isArray(files.resume)
      ? files.resume[0]?.filepath
      : files.resume?.filepath;

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
