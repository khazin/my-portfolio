import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  const form = new formidable.IncomingForm();
  return new Promise((resolve) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) {
        resolve(new Response(JSON.stringify({ error: err.message }), { status: 500 }));
        return;
      }
      resolve(new Response(JSON.stringify({ files, fields }), { status: 200 }));
    });
  });
}
