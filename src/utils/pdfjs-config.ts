import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker with public file
export const configurePDFJS = () => {
  // Check if worker is already configured
  if (pdfjsLib.GlobalWorkerOptions.workerSrc) {
    return;
  }

  // Use public worker file to avoid CORS issues
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    return;
  } catch (error) {
    // Fallback to local files
    const localPaths = [
      'pdfjs-dist/build/pdf.worker.min.mjs',
      'pdfjs-dist/build/pdf.worker.mjs',
      'pdfjs-dist/build/pdf.worker.min.js',
      'pdfjs-dist/build/pdf.worker.js'
    ];

    for (const path of localPaths) {
      try {
        const localUrl = new URL(path, import.meta.url).toString();
        pdfjsLib.GlobalWorkerOptions.workerSrc = localUrl;
        return;
      } catch (error) {
        continue;
      }
    }

    // If all else fails, disable worker (PDF.js will use main thread)
    pdfjsLib.GlobalWorkerOptions.workerSrc = null;
  }
};

// Load PDF document with error handling
export const loadPDFDocument = async (pdfUrl: string) => {
  try {
    configurePDFJS();
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdfDoc = await loadingTask.promise;
    return pdfDoc;
  } catch (error) {
    throw new Error('Failed to load PDF document');
  }
};

// Render PDF page to canvas
export const renderPDFPage = async (
  page: any, 
  canvas: HTMLCanvasElement, 
  scale: number = 1.0, 
  rotation: number = 0
) => {
  try {
    const viewport = page.getViewport({ scale, rotation });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext).promise;
  } catch (error) {
    throw new Error('Failed to render PDF page');
  }
};

