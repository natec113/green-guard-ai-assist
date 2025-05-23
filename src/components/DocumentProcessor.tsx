
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

const DocumentProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [filename, setFilename] = useState('');
  const [processingResult, setProcessingResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    
    try {
      const text = await file.text();
      setTextContent(text);
      toast({
        title: "File loaded",
        description: `${file.name} has been loaded. Review the content and click "Process Document" to update the system.`,
      });
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "Please ensure the file is a text document.",
        variant: "destructive",
      });
    }
  };

  const processDocument = async () => {
    if (!textContent.trim()) {
      toast({
        title: "No content to process",
        description: "Please load a document or paste content first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('https://fdaltcvpncdfocktnokn.supabase.co/functions/v1/process-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: textContent,
          filename: filename || 'manual_input.txt'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process document');
      }

      const result = await response.json();
      setProcessingResult(result);
      
      toast({
        title: "🌱 Document processed successfully!",
        description: `P&G Annual Report updated with ${result.chunks_created} content chunks`,
      });
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing failed",
        description: "There was an error processing the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Update P&G Annual Report</h3>
        <p className="text-gray-600">
          Upload the actual P&G Annual Report to replace the sample data used for greenwashing analysis
        </p>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload P&G Annual Report</span>
          </CardTitle>
          <CardDescription>
            Select a text file containing the P&G Annual Report content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="cursor-pointer"
          />
          <p className="text-sm text-gray-500">
            Supported formats: .txt, .pdf, .doc, .docx (Note: PDF and Word files will need to be converted to text first)
          </p>
        </CardContent>
      </Card>

      {/* Manual Text Input */}
      <Card>
        <CardHeader>
          <CardTitle>Or Paste Content Directly</CardTitle>
          <CardDescription>
            Copy and paste the P&G Annual Report content directly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter filename (optional)"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
            <Textarea
              placeholder="Paste the P&G Annual Report content here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={12}
              className="resize-none font-mono text-sm"
            />
          </div>
          
          {textContent && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Content Preview:</strong> {textContent.length.toLocaleString()} characters loaded
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Preview: {textContent.substring(0, 150)}...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Button */}
      <div className="flex justify-center">
        <Button 
          onClick={processDocument}
          disabled={!textContent.trim() || isProcessing}
          size="lg"
          className="w-full max-w-md"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Document...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Process P&G Annual Report
            </>
          )}
        </Button>
      </div>

      {/* Processing Result */}
      {processingResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span>Processing Complete</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-green-700">
            <p><strong>Document ID:</strong> {processingResult.document_id}</p>
            <p><strong>Chunks Created:</strong> {processingResult.chunks_created}</p>
            <p><strong>Content Length:</strong> {processingResult.content_length?.toLocaleString()} characters</p>
            <p><strong>Filename:</strong> {processingResult.filename}</p>
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <p className="text-sm font-medium">✅ The greenwashing analysis system has been updated!</p>
              <p className="text-sm">Future analyses will now use the actual P&G Annual Report you provided.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Instructions</h4>
              <ol className="text-sm text-blue-700 mt-1 space-y-1 list-decimal list-inside">
                <li>Upload or paste the actual P&G Annual Report content</li>
                <li>Click "Process P&G Annual Report" to update the system</li>
                <li>The system will replace the sample data with your real report</li>
                <li>Future greenwashing analyses will use the actual P&G data</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentProcessor;
