import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Convert Next.js request to Node-style readable stream
async function toNodeRequest(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Readable stream expected');

  const readable = new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) this.push(null);
      else this.push(value);
    },
  });

  const headers: any = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  return Object.assign(readable, { headers });
}

async function parseForm(request: Request) {
  const uploadDir = path.join('/tmp', 'uploads');
  fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    multiples: false,
  });

  const nodeReq = await toNodeRequest(request);

  return new Promise((resolve, reject) => {
    form.parse(nodeReq as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const pdfParse = (await import('pdf-parse')).default;

    const files = await parseForm(req);
    const resumeFile = (files as any).resume;

    const fileObj = Array.isArray(resumeFile) ? resumeFile[0] : resumeFile;
    console.log('Uploaded file:', fileObj);

    const filePath = fileObj?.filepath || fileObj?.path;

    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json({ error: 'No file uploaded or invalid path' }, { status: 400 });
    }

    const buffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(buffer);

    let rawText = parsed.text;

    rawText = rawText
      .replace(/WORKEXPERIENCE/g, 'WORK EXPERIENCE')
      .replace(/DESKTOPENGINEER/g, 'DESKTOP ENGINEER')
      .replace(/BSCINCOMPUTERSCIENCE/g, 'BSC IN COMPUTER SCIENCE')
      .replace(/OXFORDBROOKESUNIVERSITY/g, 'OXFORD BROOKES UNIVERSITY')
      .replace(/SKILLS/g, '\nSKILLS\n')
      .replace(/EDUCATION/g, '\nEDUCATION\n')
      .replace(/WORK EXPERIENCE/g, '\nWORK EXPERIENCE\n');

    const cleanedText = rawText
      .replace(/([A-Z]{2,})(?=[A-Z][a-z])/g, '$1 ')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([a-zA-Z])(\d)/g, '$1 $2')
      .replace(/(\d)([a-zA-Z])/g, '$1 $2')
      .replace(/\|/g, ' | ')
      .replace(/\s{2,}/g, ' ')
      .replace(/\n{2,}/g, '\n')
      .trim();

    const result: any = {};
    const eduMatch = cleanedText.match(/EDUCATION\s+([\s\S]+?)WORK EXPERIENCE/i);
    if (eduMatch) result.education = eduMatch[1].trim();

    const workMatch = cleanedText.match(/WORK EXPERIENCE\s+([\s\S]+?)SKILLS/i);
    if (workMatch) result.workExperience = workMatch[1].trim();

    fs.unlink(filePath, () => {}); // clean up

    return NextResponse.json(result);
  } catch (err) {
    console.error('Error parsing resume:', err);
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}
