
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, File, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onContentUploaded: (content: string) => void;
}

const FileUpload = ({ onContentUploaded }: FileUploadProps) => {
  const [textContent, setTextContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    setUploadedFiles(acceptedFiles);
    
    try {
      // Simulate file processing for demo purposes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo, we'll use sample content based on file type
      const file = acceptedFiles[0];
      let sampleContent = '';
      
      if (file.name.includes('.pdf')) {
        sampleContent = 'Our new eco-friendly product line is 100% natural and biodegradable. Made with organic ingredients that are planet-safe and chemical-free. This sustainable solution helps create a greener future for tomorrow while being completely non-toxic and environmentally safe.';
      } else if (file.name.includes('.docx') || file.name.includes('.doc')) {
        sampleContent = 'Marketing Brief: Launch our eco-certified cleaning products that are nature-approved and crafted with care. These plant-based formulations are carbon-neutral and help reduce emissions while providing pure protection for your family.';
      } else {
        sampleContent = 'Press Release: Introducing our revolutionary green technology that is energy-efficient and helps us do our part for the environment. These mindfully sourced ingredients create a holistic approach to balanced living.';
      }
      
      setTextContent(sampleContent);
      onContentUploaded(sampleContent);
      
      toast({
        title: "File processed successfully",
        description: `${file.name} has been analyzed and content extracted.`,
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "There was an error processing your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onContentUploaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleTextSubmit = () => {
    if (textContent.trim()) {
      onContentUploaded(textContent);
      toast({
        title: "Content ready for analysis",
        description: "Your text has been prepared for greenwashing detection.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Marketing Content</h3>
        <p className="text-gray-600">
          Support for text, Word, PowerPoint, PDF, Excel, and other document formats
        </p>
      </div>

      {/* File Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer transition-all duration-300 ${
              isDragActive ? 'bg-green-50 border-green-300' : ''
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                ) : (
                  <Upload className="w-8 h-8 text-green-600" />
                )}
              </div>
              
              {isProcessing ? (
                <div>
                  <p className="text-lg font-medium text-gray-900">Processing your file...</p>
                  <p className="text-gray-500">Extracting content for analysis</p>
                </div>
              ) : isDragActive ? (
                <div>
                  <p className="text-lg font-medium text-green-600">Drop your files here</p>
                  <p className="text-gray-500">Release to upload</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-gray-500">
                    Supports .txt, .pdf, .doc, .docx, .ppt, .pptx, .xls, .xlsx (max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Uploaded Files</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text Input Alternative */}
      <Card>
        <CardHeader>
          <CardTitle>Or paste your text directly</CardTitle>
          <CardDescription>
            Copy and paste marketing copy, press releases, or any communication content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your marketing content here for greenwashing analysis..."
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            rows={8}
            className="resize-none"
          />
          <Button 
            onClick={handleTextSubmit}
            disabled={!textContent.trim()}
            className="w-full"
          >
            Analyze Text Content
          </Button>
        </CardContent>
      </Card>

      {/* Supported Formats Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Supported File Formats</h4>
              <p className="text-sm text-blue-700 mt-1">
                Text files (.txt), Word documents (.doc, .docx), PowerPoint presentations (.ppt, .pptx), 
                PDF files (.pdf), Excel spreadsheets (.xls, .xlsx), and other common document formats.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload;
