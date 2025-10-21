import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Move, 
  Type, 
  PenTool, 
  Image,
  Save,
  Undo,
  Redo
} from 'lucide-react';
import { loadPDFDocument, renderPDFPage } from '../utils/pdfjs-config';
import '../utils/pdf-test'; // Ensure PDF.js configuration is loaded

interface PDFEditorProps {
  pdfUrl: string;
  title?: string;
  height?: string;
  onSave?: (edits: any) => void;
}

interface Edit {
  id: string;
  type: 'text' | 'drawing' | 'highlight' | 'image';
  pageNumber: number;
  x: number;
  y: number;
  content: string;
  color?: string;
  size?: number;
  timestamp: number;
}

const AdvancedPDFEditor: React.FC<PDFEditorProps> = ({ 
  pdfUrl, 
  title = "PDF Editor", 
  height = "600px",
  onSave
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Editing states
  const [editMode, setEditMode] = useState<'text' | 'draw' | 'highlight' | 'image' | null>(null);
  const [editText, setEditText] = useState('');
  const [drawColor, setDrawColor] = useState('#ff0000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const [isDrawing, setIsDrawing] = useState(false);
  const [edits, setEdits] = useState<Edit[]>([]);
  const [editHistory, setEditHistory] = useState<Edit[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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

  // Render PDF page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        
        await renderPDFPage(page, canvas, scale, rotation);
        
        // Render edits on overlay
        renderEdits();
      } catch (error) {
        setError('Failed to render PDF page');
      }
    };

    renderPage();
  }, [pdf, currentPage, scale, rotation, edits]);

  // Render edits on overlay canvas
  const renderEdits = () => {
    if (!overlayRef.current) return;
    
    const overlay = overlayRef.current;
    const context = overlay.getContext('2d');
    if (!context) return;

    // Clear overlay
    context.clearRect(0, 0, overlay.width, overlay.height);
    
    // Render edits for current page
    const pageEdits = edits.filter(edit => edit.pageNumber === currentPage);
    pageEdits.forEach(edit => {
      switch (edit.type) {
        case 'text':
          context.fillStyle = '#000000';
          context.font = '16px Arial';
          context.fillText(edit.content, edit.x, edit.y);
          break;
        case 'drawing':
          context.strokeStyle = edit.color || '#ff0000';
          context.lineWidth = edit.size || 2;
          context.stroke();
          break;
        case 'highlight':
          context.fillStyle = edit.color || '#ffff00';
          context.globalAlpha = 0.3;
          context.fillRect(edit.x, edit.y, 100, 20);
          context.globalAlpha = 1;
          break;
      }
    });
  };

  // Handle canvas interactions
  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (editMode === 'draw') {
      setIsDrawing(true);
      const canvas = overlayRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const context = canvas.getContext('2d');
      if (!context) return;
      
      context.beginPath();
      context.moveTo(x, y);
      context.strokeStyle = drawColor;
      context.lineWidth = 2;
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && editMode === 'draw') {
      const canvas = overlayRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const context = canvas.getContext('2d');
      if (!context) return;
      
      context.lineTo(x, y);
      context.stroke();
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Save drawing to edits
      const newEdit: Edit = {
        id: Date.now().toString(),
        type: 'drawing',
        pageNumber: currentPage,
        x: 0,
        y: 0,
        content: '',
        color: drawColor,
        size: 2,
        timestamp: Date.now()
      };
      addEdit(newEdit);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (editMode === 'text' && editText.trim()) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const newEdit: Edit = {
        id: Date.now().toString(),
        type: 'text',
        pageNumber: currentPage,
        x,
        y,
        content: editText,
        timestamp: Date.now()
      };
      
      addEdit(newEdit);
      setEditText('');
    }
  };

  const addEdit = (edit: Edit) => {
    setEdits(prev => [...prev, edit]);
    setEditHistory(prev => [...prev, edit]);
    setHistoryIndex(prev => prev + 1);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(edits);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setEdits(prev => prev.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (historyIndex < editHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
      const nextEdit = editHistory[historyIndex + 1];
      setEdits(prev => [...prev, nextEdit]);
    }
  };

  // Navigation
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
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
          PDF Editor Error
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
        <p className="text-gray-600">Loading PDF Editor...</p>
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
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">PDF Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button onClick={handlePreviousPage} disabled={currentPage <= 1} variant="outline" size="sm">
                  ←
                </Button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <Button onClick={handleNextPage} disabled={currentPage >= totalPages} variant="outline" size="sm">
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

          {/* Editing Tools */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setEditMode(editMode === 'text' ? null : 'text')}
                variant={editMode === 'text' ? 'default' : 'outline'}
                size="sm"
              >
                <Type className="w-4 h-4 mr-2" />
                Text
              </Button>
              
              <Button
                onClick={() => setEditMode(editMode === 'draw' ? null : 'draw')}
                variant={editMode === 'draw' ? 'default' : 'outline'}
                size="sm"
              >
                <PenTool className="w-4 h-4 mr-2" />
                Draw
              </Button>
              
              <Button
                onClick={() => setEditMode(editMode === 'highlight' ? null : 'highlight')}
                variant={editMode === 'highlight' ? 'default' : 'outline'}
                size="sm"
              >
                <Image className="w-4 h-4 mr-2" />
                Highlight
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={handleUndo} disabled={historyIndex <= 0} variant="outline" size="sm">
                <Undo className="w-4 h-4" />
              </Button>
              <Button onClick={handleRedo} disabled={historyIndex >= editHistory.length - 1} variant="outline" size="sm">
                <Redo className="w-4 h-4" />
              </Button>
              <Button onClick={handleSave} variant="default" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Text Input */}
          {editMode === 'text' && (
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter text to add..."
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={() => setEditText('')} variant="outline" size="sm">
                Clear
              </Button>
            </div>
          )}

          {/* Color Selection */}
          {(editMode === 'draw' || editMode === 'highlight') && (
            <div className="flex items-center space-x-2">
              <span className="text-sm">Color:</span>
              <div className="flex space-x-1">
                {['#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ffa500', '#800080'].map(color => (
                  <button
                    key={color}
                    onClick={() => editMode === 'draw' ? setDrawColor(color) : setHighlightColor(color)}
                    className={`w-6 h-6 rounded border-2 ${
                      (editMode === 'draw' ? drawColor : highlightColor) === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Canvas */}
      <div className="border rounded-lg overflow-auto" style={{ height }}>
        <div className="flex justify-center p-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="border shadow-lg"
              onClick={handleCanvasClick}
              style={{ cursor: editMode === 'text' ? 'crosshair' : 'default' }}
            />
            <canvas
              ref={overlayRef}
              className="absolute top-0 left-0 border shadow-lg"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              style={{ 
                cursor: editMode === 'draw' ? 'crosshair' : editMode === 'text' ? 'crosshair' : 'default',
                pointerEvents: editMode ? 'auto' : 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Edit Summary */}
      {edits.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2">Edits Made ({edits.length})</h4>
            <div className="text-sm text-gray-600">
              {edits.filter(edit => edit.pageNumber === currentPage).length} edits on current page
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedPDFEditor;
