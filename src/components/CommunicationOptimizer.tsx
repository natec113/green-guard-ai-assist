
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Download, RefreshCw, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommunicationOptimizerProps {
  content: string;
}

const CommunicationOptimizer = ({ content }: CommunicationOptimizerProps) => {
  const [optimizedContent, setOptimizedContent] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizations, setOptimizations] = useState<any[]>([]);
  const { toast } = useToast();

  const optimizeContent = async () => {
    setIsOptimizing(true);
    
    // Simulate AI optimization
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Generate optimized version
    const optimized = generateOptimizedContent(content);
    setOptimizedContent(optimized.text);
    setOptimizations(optimized.changes);
    setIsOptimizing(false);
    
    toast({
      title: "Content optimized",
      description: "Your communication has been improved for compliance and impact",
    });
  };

  const generateOptimizedContent = (originalContent: string) => {
    // Replace problematic terms with specific alternatives
    let optimized = originalContent;
    const changes = [];

    const replacements = [
      {
        from: /\beco-friendly\b/gi,
        to: "made with 30% recycled materials",
        reason: "Replaced vague claim with specific measurable benefit"
      },
      {
        from: /\b100% natural\b/gi,
        to: "made with plant-derived ingredients",
        reason: "Clarified the meaning of 'natural' with specific source"
      },
      {
        from: /\bbiodegradable\b/gi,
        to: "breaks down in industrial composting facilities within 90 days",
        reason: "Added specific timeframe and conditions for biodegradability"
      },
      {
        from: /\bchemical-free\b/gi,
        to: "formulated without synthetic preservatives",
        reason: "Replaced scientifically inaccurate term with specific exclusions"
      },
      {
        from: /\bplanet-safe\b/gi,
        to: "designed to minimize environmental impact",
        reason: "Changed absolute claim to more accurate relative statement"
      },
      {
        from: /\bcarbon-neutral\b/gi,
        to: "certified carbon-neutral through verified offset programs",
        reason: "Added verification and specificity to environmental claim"
      },
      {
        from: /\bgreener future\b/gi,
        to: "environmental improvements for future generations",
        reason: "Replaced marketing language with clearer statement"
      },
      {
        from: /\bnon-toxic\b/gi,
        to: "meets EPA safety standards for household use",
        reason: "Replaced absolute claim with specific regulatory compliance"
      }
    ];

    replacements.forEach(replacement => {
      if (replacement.from.test(optimized)) {
        optimized = optimized.replace(replacement.from, replacement.to);
        changes.push({
          type: 'replacement',
          original: replacement.from.source.replace(/\\b|\\w/g, ''),
          optimized: replacement.to,
          reason: replacement.reason
        });
      }
    });

    // Add supporting elements
    if (optimized.includes('sustainable') || optimized.includes('environmental')) {
      changes.push({
        type: 'addition',
        suggestion: "Consider adding third-party certifications (e.g., EPA Safer Choice, USDA Organic)",
        reason: "Third-party validation strengthens environmental claims"
      });
    }

    if (optimized.includes('recycled') || optimized.includes('packaging')) {
      changes.push({
        type: 'addition',
        suggestion: "Include specific recycling instructions and disposal guidelines",
        reason: "Helps consumers take action and demonstrates genuine commitment"
      });
    }

    return {
      text: optimized,
      changes: changes
    };
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(optimizedContent);
      toast({
        title: "Copied to clipboard",
        description: "Optimized content has been copied",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please select and copy the text manually",
        variant: "destructive",
      });
    }
  };

  const downloadContent = () => {
    const blob = new Blob([optimizedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized-content.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Optimized content is being downloaded",
    });
  };

  if (!content && !optimizedContent) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Content to Optimize</h3>
          <p className="text-gray-500">Upload content and analyze it first to access optimization features</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Communication Optimizer</h3>
        <p className="text-gray-600">Transform your content into compliant, impactful messaging</p>
      </div>

      {/* Original Content */}
      <Card>
        <CardHeader>
          <CardTitle>Original Content</CardTitle>
          <CardDescription>Your uploaded content for optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Button */}
      <div className="text-center">
        <Button 
          onClick={optimizeContent} 
          disabled={isOptimizing}
          size="lg"
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Optimize Content
            </>
          )}
        </Button>
      </div>

      {/* Optimization Progress */}
      {isOptimizing && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="animate-pulse">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-green-600" />
              </div>
              <h4 className="text-lg font-medium">Optimizing Your Content</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✓ Analyzing greenwashing risks</p>
                <p>✓ Applying EU and US compliance guidelines</p>
                <p>✓ Enhancing clarity and impact</p>
                <p className="animate-pulse">⚡ Generating optimized version...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimized Content */}
      {optimizedContent && (
        <>
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span>Optimized Content</span>
              </CardTitle>
              <CardDescription>
                Compliance-focused version with improved clarity and impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={optimizedContent}
                onChange={(e) => setOptimizedContent(e.target.value)}
                rows={8}
                className="resize-none bg-white"
              />
              <div className="flex justify-end space-x-2 mt-4">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={downloadContent} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Optimization Changes */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Summary</CardTitle>
              <CardDescription>
                Changes made to improve compliance and effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizations.map((change, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="capitalize">
                        {change.type}
                      </Badge>
                    </div>
                    
                    {change.type === 'replacement' && (
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Original: </span>
                          <span className="text-sm text-red-600 line-through">{change.original}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Optimized: </span>
                          <span className="text-sm text-green-600">{change.optimized}</span>
                        </div>
                      </div>
                    )}
                    
                    {change.type === 'addition' && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Suggestion: </span>
                        <span className="text-sm text-blue-600">{change.suggestion}</span>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Reason:</strong> {change.reason}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CommunicationOptimizer;
