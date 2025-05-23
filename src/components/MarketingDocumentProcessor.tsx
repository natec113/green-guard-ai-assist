
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Search, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import GreenwashingAnalyzer from './GreenwashingAnalyzer';
import { supabase } from "@/integrations/supabase/client";

const MarketingDocumentProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [filename, setFilename] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    setFileSize(file.size);
    setUploadProgress(0);
    setShowAnalysis(false);
    
    try {
      const text = await file.text();
      setTextContent(text);
      toast({
        title: "Marketing document loaded",
        description: `${file.name} (${(file.size / 1024).toFixed(2)}KB) is ready for greenwashing analysis.`,
      });
      setUploadProgress(100);
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "Please ensure the file is a text document or PDF.",
        variant: "destructive",
      });
    }
  };

  const analyzeContent = () => {
    if (!textContent.trim()) {
      toast({
        title: "No content to analyze",
        description: "Please load a marketing document or paste content first.",
        variant: "destructive",
      });
      return;
    }

    setShowAnalysis(true);
    toast({
      title: "🌱 Starting analysis",
      description: "Comparing marketing content against P&G Annual Report...",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">🌱 Marketing Document Analysis</h3>
        <p className="text-gray-600">
          Upload marketing content to analyze for greenwashing against the P&G Annual Report
        </p>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload Marketing Document</span>
          </CardTitle>
          <CardDescription>
            Select a marketing document, press release, or content to analyze for greenwashing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">Click to select marketing document</span>
            <span className="text-xs text-gray-500 mt-1">Supports .txt, .pdf, .doc, .docx files</span>
            <Input
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Loading file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Text Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Marketing Content</span>
          </CardTitle>
          <CardDescription>
            Paste or edit marketing content for greenwashing analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Input
                placeholder="Enter document name (optional)"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="max-w-xs"
              />
              {fileSize && (
                <div className="text-xs text-gray-500 flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  {fileSize > 1024 
                    ? `${(fileSize / 1024).toFixed(2)} KB` 
                    : `${fileSize} bytes`}
                </div>
              )}
            </div>
            <Textarea
              placeholder="Paste marketing content here (press releases, product descriptions, environmental claims, etc.)..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          
          {textContent && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-600">
                <strong>Content Preview:</strong> {textContent.length.toLocaleString()} characters
              </p>
              <p className="text-xs text-blue-500 mt-1">
                Preview: {textContent.substring(0, 150)}...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analyze Button */}
      <div className="flex justify-center">
        <Button 
          onClick={analyzeContent}
          disabled={!textContent.trim()}
          size="lg"
          className="w-full max-w-md"
        >
          <Search className="w-4 h-4 mr-2" />
          🌱 Analyze for Greenwashing
        </Button>
      </div>

      {/* Analysis Results */}
      {showAnalysis && textContent && (
        <div className="mt-8">
          <GreenwashingAnalyzer content={textContent} />
        </div>
      )}

      {/* Instructions */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">How It Works</h4>
              <ul className="text-sm text-amber-700 mt-1 space-y-1 list-disc list-inside">
                <li><strong>Unsupported Claims:</strong> Greenwashing phrases not backed by P&G Annual Report</li>
                <li><strong>Supported Claims:</strong> Environmental claims validated by documented P&G practices</li>
                <li><strong>RAG Analysis:</strong> Uses retrieval-augmented generation against actual P&G data</li>
                <li>Make sure to upload the P&G Annual Report first in the Document Processor</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingDocumentProcessor;
