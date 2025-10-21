// Simple test utility for PDF.js configuration
import { configurePDFJS } from './pdfjs-config';

export const testPDFJSConfiguration = () => {
  try {
    configurePDFJS();
    return true;
  } catch (error) {
    return false;
  }
};

// Test PDF.js worker configuration
export const testPDFWorker = async () => {
  try {
    const { loadPDFDocument } = await import('./pdfjs-config');
    // Test with a simple data URL
    const testPdf = 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDIgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9Db250ZW50cyA0IDAgUgo+Pgo1IDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMyAwIFIKL1Jlc291cmNlcyA8PAovRm9udCA8PAovRjEgMiAwIFIKPj4KPj4KL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KL0NvbnRlbnRzIDQgMCBSCj4+CjQgMCBvYmoKPDwKL0xlbmd0aCA0NQo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcyIDcyMCBUZAooSGVsbG8gV29ybGQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs1IDAgUiBdCi9Db3VudCAxCj4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYKMDAwMDAwMDAwOSAwMDAwMCBuCjAwMDAwMDAwNTQgMDAwMDAgbgowMDAwMDAwMTEwIDAwMDAwIG4KMDAwMDAwMDE2NSAwMDAwMCBuCjAwMDAwMDAyNDQgMDAwMDAgbgp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjM0NwolJUVPRgo=';
    await loadPDFDocument(testPdf);
    return true;
  } catch (error) {
    return false;
  }
};

// Auto-test on import in development
if (import.meta.env.DEV) {
  testPDFJSConfiguration();
}
