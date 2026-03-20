import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export interface ParseResult {
  text: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  extractedAt: string;
}

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return 'File size exceeds 5MB limit.';
  }
  if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith('.docx') && !file.name.endsWith('.pdf')) {
    return 'Only PDF and DOCX files are allowed.';
  }
  return null;
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .filter((item: any) => 'str' in item)
      .map((item: any) => item.str);
    pages.push(strings.join(' '));
  }

  return pages.join('\n\n');
}

async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

export async function parseResume(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();

  let text: string;

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    text = await extractPdfText(buffer);
  } else {
    text = await extractDocxText(buffer);
  }

  return {
    text: text.trim(),
    fileName: file.name,
    fileType: file.type || (file.name.endsWith('.pdf') ? 'PDF' : 'DOCX'),
    fileSize: file.size,
    extractedAt: new Date().toISOString(),
  };
}
