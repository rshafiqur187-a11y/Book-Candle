import fs from 'fs';
import { Readable } from 'stream';

async function streamToBlob(stream: Readable, mimeType: string): Promise<Blob> {
  const chunks: any[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  return new Blob([buffer], { type: mimeType });
}

async function test() {
  const stream = fs.createReadStream('package.json');
  const blob = await streamToBlob(stream, 'application/json');
  
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', blob, 'package.json');
  
  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData
  });
  console.log(await res.text());
}
test();
