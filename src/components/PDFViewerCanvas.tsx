import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { FileText, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw, Move } from 'lucide-react';
import { loadPDFDocument, renderPDFPage } from '../utils/pdfjs-config';
import '../utils/pdf-test'; // Ensure PDF.js configuration is loaded

interface PDFViewerCanvasProps {
  pdfUrl: string;
  title?: string;
  height?: string;
  showControls?: boolean;
  onEdit?: (pageNumber: number, x: number, y: number, text: string) => void;
}

const PDFViewerCanvas: React.FC<PDFViewerCanvasProps> = ({ 
  pdfUrl, 
  title = "PDF Preview", 
  height = "600px",
  showControls = true,
  onEdit
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [editPosition, setEditPosition] = useState({ x: 0, y: 0 });

  // PDF.js is configured in the utils file

  // Load PDF document
  useEffect(() => {
    if (!pdfUrl) return;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const pdfDoc = await loadPDFDocument(pdfUrl);
        
        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        setCurrentPage(1);
      } catch (error) {
        setError('Failed to load PDF. Please try downloading the file.');
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl]);

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        
        await renderPDFPage(page, canvas, scale, rotation);
      } catch (error) {
        setError('Failed to render PDF page');
      }
    };

    renderPage();
  }, [pdf, currentPage, scale, rotation]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setEditPosition({ x, y });
  };

  const handleAddText = () => {
    if (editText.trim() && onEdit) {
      onEdit(currentPage, editPosition.x, editPosition.y, editText);
      setEditText('');
      setIsEditing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  if (error) {
    return (
      <div className="text-center py-12 border rounded-lg bg-gray-50">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          PDF Viewer Error
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex justify-center space-x-4">
          <Button onClick={handleDownload} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handleOpenInNewTab} variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading PDF...</p>
      </div>
    );
  }

  if (!pdf) {
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

  return (
    <div className="space-y-4">
      {/* Controls */}
      {showControls && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handlePreviousPage}
                    disabled={currentPage <= 1}
                    variant="outline"
                    size="sm"
                  >
                    ←
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    variant="outline"
                    size="sm"
                  >
                    →
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button onClick={handleZoomOut} variant="outline" size="sm">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">{Math.round(scale * 100)}%</span>
                  <Button onClick={handleZoomIn} variant="outline" size="sm">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button onClick={handleRotate} variant="outline" size="sm">
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleOpenInNewTab} variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Canvas */}
      <div className="border rounded-lg overflow-auto" style={{ height }}>
        <div className="flex justify-center p-4">
          <canvas
            ref={canvasRef}
            className="border shadow-lg"
            onClick={handleCanvasClick}
            style={{ cursor: isEditing ? 'crosshair' : 'default' }}
          />
        </div>
      </div>

      {/* Editing Tools */}
      {onEdit && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "default" : "outline"}
                size="sm"
              >
                <Move className="w-4 h-4 mr-2" />
                {isEditing ? 'Exit Edit' : 'Edit Mode'}
              </Button>
              
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Enter text to add..."
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="px-3 py-1 border rounded text-sm"
                  />
                  <Button onClick={handleAddText} size="sm" disabled={!editText.trim()}>
                    Add Text
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PDFViewerCanvas;
