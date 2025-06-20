import { parseResumeWithGroq, ResumeParseResult } from './groqService';

export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        if (file.type === 'application/pdf') {
          // For PDF files, we'll use a simple text extraction
          // In production, you'd want to use a proper PDF parser
          const text = await extractTextFromPDF(arrayBuffer);
          resolve(text);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // For DOCX files
          const text = await extractTextFromDOCX(arrayBuffer);
          resolve(text);
        } else if (file.type === 'text/plain') {
          // For TXT files
          const text = new TextDecoder().decode(arrayBuffer);
          resolve(text);
        } else {
          reject(new Error('Unsupported file type'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  // Simple PDF text extraction - in production use pdf-parse or similar
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const text = new TextDecoder().decode(uint8Array);
    
    // Basic PDF text extraction (this is simplified)
    const textMatch = text.match(/stream\s*(.*?)\s*endstream/gs);
    if (textMatch) {
      return textMatch.map(match => 
        match.replace(/stream\s*|\s*endstream/g, '')
             .replace(/[^\x20-\x7E\n]/g, ' ')
             .replace(/\s+/g, ' ')
      ).join(' ').trim();
    }
    
    // Fallback: try to extract readable text
    return text.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
  } catch (error) {
    throw new Error('Failed to extract text from PDF');
  }
};

const extractTextFromDOCX = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  // Simple DOCX text extraction - in production use mammoth or similar
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const text = new TextDecoder().decode(uint8Array);
    
    // Basic DOCX text extraction (this is simplified)
    const xmlMatch = text.match(/<w:t[^>]*>(.*?)<\/w:t>/gs);
    if (xmlMatch) {
      return xmlMatch.map(match => 
        match.replace(/<[^>]*>/g, '').trim()
      ).join(' ').replace(/\s+/g, ' ').trim();
    }
    
    return text.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
  } catch (error) {
    throw new Error('Failed to extract text from DOCX');
  }
};

export const parseResume = async (file: File): Promise<ResumeParseResult> => {
  try {
    const extractedText = await extractTextFromFile(file);
    
    if (!extractedText || extractedText.length < 50) {
      throw new Error('Could not extract sufficient text from resume');
    }
    
    const parseResult = await parseResumeWithGroq(extractedText);
    return parseResult;
  } catch (error) {
    console.error('Resume parsing error:', error);
    throw error;
  }
};