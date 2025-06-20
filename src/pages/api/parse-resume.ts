// pages/api/parse-resume.ts

import formidable from 'formidable';
import fs, { mkdirSync } from 'fs';
import path from 'path';
import { IncomingMessage } from 'http';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadedFile {
  // Change from 'filepath' to 'path' as formidable uses 'path'
  path: string;
  originalFilename?: string;
  mimetype?: string;
  size?: number;
}

type FilesType = {
  resume?: UploadedFile | UploadedFile[];
};

function parseForm(req: IncomingMessage): Promise<FilesType> {
  return new Promise((resolve, reject) => {
    const uploadDir = path.join(process.cwd(), '/public/uploads');
    mkdirSync(uploadDir, { recursive: true });

    const form = formidable({
      uploadDir,
      keepExtensions: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.parse(req, (err: any, _fields: any, files: any) => {
      if (err) reject(err);
      else resolve(files as FilesType);
    });
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const pdfParse = (await import('pdf-parse')).default;
    const files = await parseForm(req);

    const uploaded = files.resume;
    const file = Array.isArray(uploaded)
      ? uploaded[0]?.path   // <-- Use 'path' here instead of 'filepath'
      : uploaded?.path;     // <-- And here

    console.log('Received files:', files);

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const dataBuffer = fs.readFileSync(file);
    const parsed = await pdfParse(dataBuffer);

    return res.status(200).json({ text: parsed.text });
  } catch (err) {
    console.error('Error parsing resume:', err);
    return res.status(500).json({ error: 'Failed to parse resume' });
  }
}
