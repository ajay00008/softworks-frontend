import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
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
  Redo,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { loadPDFDocument, renderPDFPage } from '../utils/pdfjs-config';
import { useToast } from '@/hooks/use-toast';

interface TextEditablePDFEditorProps {
  pdfUrl: string;
  title?: string;
  height?: string;
  onSave?: (edits: any) => void;
}

interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  fontSize: number;
  isEditing: boolean;
  originalText: string;
}

interface PDFEdit {
  id: string;
  type: 'text' | 'drawing' | 'highlight';
  pageNumber: number;
  x: number;
  y: number;
  content: string;
  color?: string;
  size?: number;
  timestamp: number;
}

const TextEditablePDFEditor: React.FC<TextEditablePDFEditorProps> = ({ 
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
  
  // Text editing states
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [editingText, setEditingText] = useState<string>('');
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'select' | 'add' | 'edit' | null>(null);
  const [edits, setEdits] = useState<PDFEdit[]>([]);
  const [history, setHistory] = useState<PDFEdit[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const { toast } = useToast();

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
        
        // Extract text from all pages
        await extractTextFromPDF(pdfDoc);
        
      } catch (error) {
        setError('Failed to load PDF. Please try downloading the file.');
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl]);

  // Handle window resize for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      if (pdf && canvasRef.current) {
        // Re-render with responsive scale
        const page = pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        const containerWidth = canvas.parentElement?.clientWidth || 800;
        const viewport = page.getViewport({ scale: 1.0 });
        const responsiveScale = Math.min(scale, containerWidth / viewport.width);
        
        renderPDFPage(page, canvas, responsiveScale, rotation);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdf, currentPage, scale, rotation]);

  // Extract text from PDF pages
  const extractTextFromPDF = async (pdfDoc: any) => {
    const extractedTextItems: TextItem[] = [];
    
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        textContent.items.forEach((item: any, index: number) => {
          if (item.str && item.str.trim()) {
            extractedTextItems.push({
              id: `text-${pageNum}-${index}`,
              text: item.str,
              x: item.transform[4],
              y: item.transform[5],
              width: item.width,
              height: item.height,
              pageNumber: pageNum,
              fontSize: item.transform[0],
              isEditing: false,
              originalText: item.str
            });
          }
        });
      } catch (error) {
        console.error(`Error extracting text from page ${pageNum}:`, error);
      }
    }
    
    setTextItems(extractedTextItems);
  };

  // Render PDF page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        const overlay = overlayRef.current;
        
        // Calculate responsive scale
        const containerWidth = canvas.parentElement?.clientWidth || 800;
        const viewport = page.getViewport({ scale: 1.0 });
        const responsiveScale = Math.min(scale, containerWidth / viewport.width);
        
        await renderPDFPage(page, canvas, responsiveScale, rotation);
        
        // Set overlay size to match canvas
        if (overlay) {
          overlay.width = canvas.width;
          overlay.height = canvas.height;
        }
        
        // Render text items on overlay
        renderTextItems();
      } catch (error) {
        setError('Failed to render PDF page');
      }
    };

    renderPage();
  }, [pdf, currentPage, scale, rotation, textItems]);

  // Render text items on overlay
  const renderTextItems = () => {
    if (!overlayRef.current) return;
    
    const overlay = overlayRef.current;
    const context = overlay.getContext('2d');
    if (!context) return;

    // Clear overlay
    context.clearRect(0, 0, overlay.width, overlay.height);
    
    // Get current page text items
    const pageTextItems = textItems.filter(item => item.pageNumber === currentPage);
    
    pageTextItems.forEach(item => {
      const x = item.x * scale;
      const y = (overlay.height - item.y * scale);
      
      // Draw text background for editing
      if (item.isEditing) {
        context.fillStyle = 'rgba(255, 255, 0, 0.3)';
        context.fillRect(x, y - item.height * scale, item.width * scale, item.height * scale);
      }
      
      // Draw text
      context.fillStyle = item.isEditing ? '#ff0000' : '#000000';
      context.font = `${item.fontSize * scale}px Arial`;
      context.fillText(item.text, x, y);
      
      // Draw selection border
      if (selectedTextId === item.id) {
        context.strokeStyle = '#007bff';
        context.lineWidth = 2;
        context.strokeRect(x, y - item.height * scale, item.width * scale, item.height * scale);
      }
    });
  };

  // Handle canvas click for text selection
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (editMode !== 'select' && editMode !== 'edit') return;

    const canvas = overlayRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked text item
    const pageTextItems = textItems.filter(item => item.pageNumber === currentPage);
    const clickedItem = pageTextItems.find(item => {
      const itemX = item.x * scale;
      const itemY = canvas.height - item.y * scale;
      return x >= itemX && x <= itemX + item.width * scale &&
             y >= itemY - item.height * scale && y <= itemY;
    });

    if (clickedItem) {
      setSelectedTextId(clickedItem.id);
      setEditingText(clickedItem.text);
      setEditMode('edit');
    } else {
      setSelectedTextId(null);
      setEditMode('select');
    }
  };

  // Handle text editing
  const handleTextEdit = () => {
    if (!selectedTextId || !editingText.trim()) return;

    const updatedTextItems = textItems.map(item => {
      if (item.id === selectedTextId) {
        return {
          ...item,
          text: editingText,
          isEditing: false
        };
      }
      return item;
    });

    setTextItems(updatedTextItems);
    
    // Add to edits history
    const edit: PDFEdit = {
      id: Date.now().toString(),
      type: 'text',
      pageNumber: currentPage,
      x: 0,
      y: 0,
      content: editingText,
      timestamp: Date.now()
    };
    
    addEdit(edit);
    setSelectedTextId(null);
    setEditingText('');
    setEditMode('select');
    
    toast({ title: "Text Updated", description: "Text has been successfully updated" });
  };

  // Handle text editing cancel
  const handleTextEditCancel = () => {
    const updatedTextItems = textItems.map(item => {
      if (item.id === selectedTextId) {
        return {
          ...item,
          text: item.originalText,
          isEditing: false
        };
      }
      return item;
    });

    setTextItems(updatedTextItems);
    setSelectedTextId(null);
    setEditingText('');
    setEditMode('select');
  };

  // Add new text
  const handleAddText = () => {
    if (!editingText.trim()) return;

    const newTextItem: TextItem = {
      id: `new-text-${Date.now()}`,
      text: editingText,
      x: 100,
      y: 100,
      width: editingText.length * 10,
      height: 20,
      pageNumber: currentPage,
      fontSize: 12,
      isEditing: false,
      originalText: editingText
    };

    setTextItems(prev => [...prev, newTextItem]);
    
    const edit: PDFEdit = {
      id: Date.now().toString(),
      type: 'text',
      pageNumber: currentPage,
      x: 100,
      y: 100,
      content: editingText,
      timestamp: Date.now()
    };
    
    addEdit(edit);
    setEditingText('');
    
    toast({ title: "Text Added", description: "New text has been added to the PDF" });
  };

  // Add edit to history
  const addEdit = (edit: PDFEdit) => {
    setEdits(prev => [...prev, edit]);
    setHistory(prev => [...prev, edit]);
    setHistoryIndex(prev => prev + 1);
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

  // Save PDF
  const handleSave = () => {
    if (onSave) {
      onSave(edits);
    }
    toast({ title: "PDF Saved", description: "Your changes have been saved" });
  };

  if (error) {
    return (
      <div className="text-center py-12 border rounded-lg bg-gray-50">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          PDF Editor Error
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
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
    <div className="space-y-4 max-h-full overflow-y-auto">
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Text Editable PDF Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Navigation Controls - Responsive */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Button onClick={handlePreviousPage} disabled={currentPage <= 1} variant="outline" size="sm">
                  ←
                </Button>
                <span className="text-sm whitespace-nowrap">Page {currentPage} of {totalPages}</span>
                <Button onClick={handleNextPage} disabled={currentPage >= totalPages} variant="outline" size="sm">
                  →
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button onClick={handleZoomOut} variant="outline" size="sm">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm whitespace-nowrap">{Math.round(scale * 100)}%</span>
                <Button onClick={handleZoomIn} variant="outline" size="sm">
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
              
              <Button onClick={handleRotate} variant="outline" size="sm">
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={handleSave} variant="default" size="sm">
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </div>
          </div>

          {/* Editing Tools - Responsive */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setEditMode(editMode === 'select' ? null : 'select')}
                  variant={editMode === 'select' ? 'default' : 'outline'}
                  size="sm"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Select Text</span>
                </Button>
                
                <Button
                  onClick={() => setEditMode(editMode === 'add' ? null : 'add')}
                  variant={editMode === 'add' ? 'default' : 'outline'}
                  size="sm"
                >
                  <Type className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Add Text</span>
                </Button>
              </div>

              {/* Text Input - Responsive */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <Input
                  placeholder="Enter text..."
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="w-full sm:max-w-xs"
                />
                
                <div className="flex items-center space-x-2">
                  {editMode === 'edit' && (
                    <>
                      <Button onClick={handleTextEdit} size="sm" disabled={!editingText.trim()}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button onClick={handleTextEditCancel} size="sm" variant="outline">
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  
                  {editMode === 'add' && (
                    <Button onClick={handleAddText} size="sm" disabled={!editingText.trim()}>
                      <Type className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Text Items List - Responsive */}
          {textItems.filter(item => item.pageNumber === currentPage).length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Text Items on Page {currentPage}</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {textItems
                  .filter(item => item.pageNumber === currentPage)
                  .map(item => (
                    <div
                      key={item.id}
                      className={`p-2 border rounded cursor-pointer ${
                        selectedTextId === item.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedTextId(item.id);
                        setEditingText(item.text);
                        setEditMode('edit');
                      }}
                    >
                      <span className="text-sm break-words">{item.text}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Canvas - Responsive */}
      <div className="border rounded-lg overflow-auto" style={{ height: '60vh', minHeight: '400px' }}>
        <div className="flex justify-center p-2 sm:p-4">
          <div className="relative max-w-full">
            <canvas
              ref={canvasRef}
              className="border shadow-lg max-w-full h-auto"
              style={{ 
                cursor: editMode === 'select' ? 'crosshair' : 'default',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
            <canvas
              ref={overlayRef}
              className="absolute top-0 left-0 border shadow-lg max-w-full h-auto"
              onClick={handleCanvasClick}
              style={{ 
                cursor: editMode === 'select' ? 'crosshair' : 'default',
                pointerEvents: editMode ? 'auto' : 'none',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditablePDFEditor;
