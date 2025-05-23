import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Eye, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GreenwashingAnalyzerProps {
  content: string;
}

const GreenwashingAnalyzer = ({ content }: GreenwashingAnalyzerProps) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (content) {
      analyzeContent();
    }
  }, [content]);

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    
    try {
      // 🌱 Call the new detect endpoint
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/functions/v1/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze content');
      }

      const result = await response.json();
      
      // 🌱 Transform the response to match UI expectations
      const transformedAnalysis = {
        riskLevel: result.label,
        riskScore: getRiskScore(result.label),
        flaggedWords: result.flagged_phrases?.map((p: any) => p.phrase) || [],
        flaggedPhrases: result.flagged_phrases || [],
        totalWords: content.split(' ').length,
        flaggedCount: result.flagged_phrases?.length || 0,
        compliance: {
          eu: result.label !== 'high',
          us: result.label !== 'high'
        },
        recommendations: generateRecommendations(result.flagged_phrases || [], result.label),
        detailedFindings: result.flagged_phrases || [],
        passages: result.passages || []
      };
      
      setAnalysis(transformedAnalysis);
      
      toast({
        title: "AI analysis complete",
        description: `Found ${transformedAnalysis.flaggedCount} potential greenwashing phrases`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Please check your LLM configuration and try again",
        variant: "destructive",
      });
      
      // 🌱 Fallback to local analysis
      performLocalAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskScore = (level: string) => {
    switch (level) {
      case 'high': return 85;
      case 'medium': return 50;
      case 'low': return 20;
      default: return 0;
    }
  };

  const performLocalAnalysis = () => {
    // 🌱 Fallback local analysis logic
    const greenwashingWords = [
      'eco-friendly', 'natural', 'green', 'sustainable', 'pure', 'clean',
      'biodegradable', 'organic', 'carbon-neutral', 'environmentally safe'
    ];
    
    const lowerContent = content.toLowerCase();
    const foundPhrases = greenwashingWords
      .filter(word => lowerContent.includes(word.toLowerCase()))
      .map(word => ({
        phrase: word,
        risk_level: 'medium',
        justification: 'Generic environmental claim without specific evidence',
        suggestion: 'Replace with specific, measurable benefits'
      }));
    
    const riskLevel = foundPhrases.length > 5 ? 'high' : 
                     foundPhrases.length > 2 ? 'medium' : 'low';
    
    setAnalysis({
      riskLevel,
      riskScore: getRiskScore(riskLevel),
      flaggedWords: foundPhrases.map(p => p.phrase),
      flaggedPhrases: foundPhrases,
      totalWords: content.split(' ').length,
      flaggedCount: foundPhrases.length,
      compliance: { eu: riskLevel !== 'high', us: riskLevel !== 'high' },
      recommendations: generateRecommendations(foundPhrases, riskLevel),
      detailedFindings: foundPhrases,
      passages: []
    });
  };

  const generateRecommendations = (flaggedPhrases: any[], riskLevel: string) => {
    const recommendations = [];
    
    if (riskLevel === 'high') {
      recommendations.push("Consider removing vague environmental claims without substantiation");
      recommendations.push("Replace general terms with specific, measurable benefits");
    }
    
    if (flaggedPhrases.some(p => p.phrase.includes('natural'))) {
      recommendations.push("Define what 'natural' means in your specific context");
    }
    
    recommendations.push("Consider third-party certifications to validate environmental claims");
    
    return recommendations;
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
          <p className="text-gray-500">Upload a file or paste text content to begin AI-powered greenwashing analysis</p>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">🌱 AI Analysis in Progress...</h3>
          <p className="text-gray-500 mb-4">Using P&G guidelines and RAG-powered detection</p>
          <Progress value={66} className="w-64 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">🌱 AI-Powered Greenwashing Analysis</h3>
        <p className="text-gray-600">Based on P&G guidelines and regulatory standards</p>
      </div>

      {/* Risk Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className={`border-2 ${getRiskColor(analysis?.riskLevel)}`}>
          <CardHeader className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <CardTitle className="capitalize">{analysis?.riskLevel} Risk</CardTitle>
            <CardDescription>AI Assessment</CardDescription>
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
            <CardDescription>Flagged Phrases</CardDescription>
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
            <span>🌱 AI-Detected Phrases</span>
          </CardTitle>
          <CardDescription>
            Phrases flagged by our AI system using P&G guidelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {analysis?.detailedFindings.map((finding: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={
                      finding.risk_level === 'high' ? 'border-red-500 text-red-700' :
                      finding.risk_level === 'medium' ? 'border-yellow-500 text-yellow-700' :
                      'border-green-500 text-green-700'
                    }>
                      "{finding.phrase}"
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {finding.risk_level} Risk
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>AI Justification:</strong> {finding.justification}
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
            <span>🌱 AI Recommendations</span>
          </CardTitle>
          <CardDescription>
            Actionable steps to improve compliance
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
          🌱 Re-analyze with AI
        </Button>
        <Button onClick={() => window.print()}>
          Export Report
        </Button>
      </div>
    </div>
  );
};

export default GreenwashingAnalyzer;
