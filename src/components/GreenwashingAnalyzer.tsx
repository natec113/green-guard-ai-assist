
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Eye, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GreenwashingAnalyzerProps {
  content: string;
}

const GreenwashingAnalyzer = ({ content }: GreenwashingAnalyzerProps) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Greenwashing trigger words from the requirements
  const greenwashingWords = [
    'eco-friendly', 'eco', 'bio', 'natural', 'nature', 'health', 'healthy', 'environment',
    'ecological', 'planet', 'earth', 'plant-based', 'waste-free', 'zero plastic',
    'climate positive', 'low carbon', 'emission-free', 'sustainable', 'sustainability',
    'green', 'greener future', 'doing our part', 'environmentally safe', 'non-toxic',
    'clean', 'biodegradable', 'compostable', 'carbon', 'net-zero', 'conscious',
    'low-impact', 'organic', 'eco-safe', 'environmentally', 'eco-certified',
    'certified green', 'nature-approved', 'thoughtfully made', 'mindful',
    'mindfully sourced', 'care', 'crafted with care', 'healing', 'giving back',
    'pure', 'purity', 'light-weight', 'garden-grown', 'naturally balanced',
    'holistic', 'balanced living', 'energy-cleansed', 'mindfully made',
    'toxin-free', 'soulful ingredients', 'wellness-based', 'minimal impact',
    'ethical', 'ethically', 'responsible', 'responsibility', 'environmental',
    'mindfully', 'cleaner', 'tomorrow', 'future', 'less plastic', 'energy',
    'efficient', 'carbon-neutral', 'eco-box', 'plant-powered', 'pure clean',
    'pure protection', 'co2', 'emissions', 'chemical', 'ocean plastic',
    'beach-plastic', 'zero waste'
  ];

  useEffect(() => {
    if (content) {
      analyzeContent();
    }
  }, [content]);

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const lowerContent = content.toLowerCase();
    const foundWords = greenwashingWords.filter(word => 
      lowerContent.includes(word.toLowerCase())
    );
    
    const riskLevel = foundWords.length > 8 ? 'high' : 
                     foundWords.length > 4 ? 'medium' : 'low';
    
    const riskScore = Math.min(100, (foundWords.length / greenwashingWords.length) * 100 * 3);
    
    const analysisResult = {
      riskLevel,
      riskScore: Math.round(riskScore),
      flaggedWords: foundWords,
      totalWords: content.split(' ').length,
      flaggedCount: foundWords.length,
      compliance: {
        eu: riskLevel === 'low',
        us: riskLevel !== 'high'
      },
      recommendations: generateRecommendations(foundWords, riskLevel),
      detailedFindings: generateDetailedFindings(foundWords, content)
    };
    
    setAnalysis(analysisResult);
    setIsAnalyzing(false);
    
    toast({
      title: "Analysis complete",
      description: `Found ${foundWords.length} potential greenwashing indicators`,
    });
  };

  const generateRecommendations = (flaggedWords: string[], riskLevel: string) => {
    const recommendations = [];
    
    if (riskLevel === 'high') {
      recommendations.push("Consider removing vague environmental claims without substantiation");
      recommendations.push("Replace general terms with specific, measurable benefits");
      recommendations.push("Add scientific backing or certifications to support claims");
    }
    
    if (flaggedWords.includes('natural') || flaggedWords.includes('pure')) {
      recommendations.push("Define what 'natural' or 'pure' means in your specific context");
    }
    
    if (flaggedWords.includes('eco-friendly') || flaggedWords.includes('green')) {
      recommendations.push("Replace with specific environmental benefits (e.g., '30% less packaging material')");
    }
    
    recommendations.push("Consider third-party certifications to validate environmental claims");
    recommendations.push("Focus on specific, measurable improvements rather than general statements");
    
    return recommendations;
  };

  const generateDetailedFindings = (flaggedWords: string[], content: string) => {
    return flaggedWords.map(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = content.match(regex) || [];
      const context = content.split(' ').find(w => w.toLowerCase().includes(word.toLowerCase()));
      
      return {
        word: word,
        occurrences: matches.length,
        context: context || word,
        severity: word === 'natural' || word === 'eco-friendly' ? 'high' : 
                 word === 'sustainable' || word === 'green' ? 'medium' : 'low',
        suggestion: getSuggestionForWord(word)
      };
    });
  };

  const getSuggestionForWord = (word: string) => {
    const suggestions: Record<string, string> = {
      'natural': 'Specify which ingredients are from natural sources',
      'eco-friendly': 'Provide specific environmental benefits with data',
      'sustainable': 'Define sustainability metrics and goals',
      'green': 'Replace with specific environmental improvements',
      'pure': 'Clarify what purity means in your context',
      'clean': 'Specify what makes the product clean'
    };
    return suggestions[word] || 'Provide specific evidence to support this claim';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!content && !isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Content to Analyze</h3>
          <p className="text-gray-500">Upload a file or paste text content to begin greenwashing analysis</p>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Content...</h3>
          <p className="text-gray-500 mb-4">Using EU and US greenwashing guidelines</p>
          <Progress value={66} className="w-64 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Greenwashing Analysis Results</h3>
        <p className="text-gray-600">Based on European and US regulatory guidelines</p>
      </div>

      {/* Risk Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className={`border-2 ${getRiskColor(analysis?.riskLevel)}`}>
          <CardHeader className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <CardTitle className="capitalize">{analysis?.riskLevel} Risk</CardTitle>
            <CardDescription>Overall Assessment</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold mb-2">{analysis?.riskScore}%</div>
            <p className="text-sm">Risk Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Eye className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <CardTitle>{analysis?.flaggedCount}</CardTitle>
            <CardDescription>Flagged Terms</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-sm text-gray-600">
              Out of {analysis?.totalWords} total words
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <CardTitle>Compliance Status</CardTitle>
            <CardDescription>Regulatory Guidelines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">EU Guidelines:</span>
              <Badge variant={analysis?.compliance.eu ? "default" : "destructive"}>
                {analysis?.compliance.eu ? "Compliant" : "Non-Compliant"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">US FTC Guidelines:</span>
              <Badge variant={analysis?.compliance.us ? "default" : "destructive"}>
                {analysis?.compliance.us ? "Compliant" : "Review Required"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Flagged Terms Analysis</span>
          </CardTitle>
          <CardDescription>
            Terms that may indicate greenwashing according to regulatory guidelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {analysis?.detailedFindings.map((finding: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={
                      finding.severity === 'high' ? 'border-red-500 text-red-700' :
                      finding.severity === 'medium' ? 'border-yellow-500 text-yellow-700' :
                      'border-green-500 text-green-700'
                    }>
                      {finding.word}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {finding.occurrences} occurrence{finding.occurrences !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {finding.severity} Risk
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Context:</strong> "{finding.context}"
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Suggestion:</strong> {finding.suggestion}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Compliance Recommendations</span>
          </CardTitle>
          <CardDescription>
            Actions to improve compliance and reduce greenwashing risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis?.recommendations.map((rec: string, index: number) => (
              <Alert key={index}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{rec}</AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button onClick={analyzeContent} variant="outline">
          Re-analyze Content
        </Button>
        <Button onClick={() => window.print()}>
          Export Report
        </Button>
      </div>
    </div>
  );
};

export default GreenwashingAnalyzer;
