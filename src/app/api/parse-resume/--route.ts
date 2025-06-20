import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import { IncomingMessage } from 'http';

export const config = {
  api: {
    bodyParser: false,
  },
  runtime: 'nodejs', // must be Node.js runtime, not Edge
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

// Helper to parse the form using formidable
const parseForm = (req: IncomingMessage): Promise<FilesType> => {
  const form = formidable({ uploadDir: '/tmp', keepExtensions: true });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, _fields, files) => {
      if (err) reject(err);
      else resolve(files as FilesType);
    });
  });
};

export async function POST(req: Request) {
  try {
    const pdfParse = (await import('pdf-parse')).default;

    // 👇 This is the fix: get Node.js native request
    const nodeReq = (req as any).node as IncomingMessage;
    if (!nodeReq) throw new Error('Unable to access Node.js request');

    const files = await parseForm(nodeReq);

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
    console.error('Error parsing resume:', err);
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}
