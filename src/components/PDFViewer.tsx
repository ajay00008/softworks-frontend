import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { FileText, Download, ExternalLink, Eye } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
  height?: string;
  showFallback?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  pdfUrl, 
  title = "PDF Preview", 
  height = "600px",
  showFallback = true 
}) => {
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pdfUrl) {
      setIframeError(false);
      setIsLoading(true);
      
      // Check for CSP errors after a delay
      const timeout = setTimeout(() => {
        try {
          const iframe = document.querySelector(`iframe[title="${title}"]`) as HTMLIFrameElement;
          if (iframe && iframe.contentDocument === null) {
            setIframeError(true);
          }
        } catch (error) {
          setIframeError(true);
        }
        setIsLoading(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [pdfUrl, title]);

  const handleIframeError = () => {
    setIframeError(true);
    setIsLoading(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIframeError(false);
  };

  const handleDownload = async () => {
    try {
      // If pdfUrl is a direct API endpoint, use it as is
      if (pdfUrl.includes('/api/admin/question-papers/') && pdfUrl.includes('/download')) {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = title + '.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For static files, we need to fetch with auth headers
        const response = await fetch(pdfUrl, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch PDF');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = title + '.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  if (!pdfUrl) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No PDF Available
        </h3>
        <p className="text-gray-600">
          This question paper doesn't have a PDF yet.
        </p>
      </div>
    );
  }

  if (iframeError && showFallback) {
    return (
      <div className="text-center py-12 border rounded-lg bg-gray-50">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          PDF Preview Not Available
        </h3>
        <p className="text-gray-600 mb-4">
          The PDF cannot be displayed in the browser due to security restrictions.
        </p>
        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button
            onClick={handleOpenInNewTab}
            variant="outline"
            className="flex items-center"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Alternative Options:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Download the PDF to view it locally</p>
            <p>• Open in a new tab to view in browser</p>
            <p>• Use the upload option to replace with edited version</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading PDF...</p>
          </div>
        </div>
      )}
      
      <iframe
        src={pdfUrl}
        width="100%"
        height={height}
        className="border rounded-lg"
        title={title}
        onError={handleIframeError}
        onLoad={handleIframeLoad}
      />
    </div>
  );
};

export default PDFViewer;
