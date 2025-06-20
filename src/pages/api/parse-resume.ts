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
  // Use 'path' because formidable uses this key
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
    const uploadDir = path.join('/tmp', 'uploads');  // Use /tmp for serverless writable space

    mkdirSync(uploadDir, { recursive: true });
    console.log('Upload directory:', uploadDir);

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
      ? uploaded[0]?.path  // Note: use 'path', not 'filepath'
      : uploaded?.path;

    console.log('Received files:', files);

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const dataBuffer = fs.readFileSync(file);
    const parsed = await pdfParse(dataBuffer);

    // Optional: clean up the temp file after processing
    fs.unlink(file, (err) => {
      if (err) console.error('Failed to delete temp file:', err);
    });

    return res.status(200).json({ text: parsed.text });
  } catch (err) {
    console.error('Error parsing resume:', err);
    return res.status(500).json({ error: 'Failed to parse resume' });
  }
}
