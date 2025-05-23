
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Eye, TrendingUp, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GreenwashingAnalyzerProps {
  content: string;
}

const GreenwashingAnalyzer = ({ content }: GreenwashingAnalyzerProps) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (content) {
      analyzeContent();
    }
  }, [content]);

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('Starting RAG analysis with content length:', content.length);
      
      // Use anon key directly instead of relying on session
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkYWx0Y3ZwbmNkZm9ja3Rub2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDIwOTgsImV4cCI6MjA2MzU3ODA5OH0.h61gcLd3J06ccu4lumZBH-kQCUsl0c8v9mu3pzrfdfE";
      
      const response = await fetch('https://fdaltcvpncdfocktnokn.supabase.co/functions/v1/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Analysis API error:', response.status, errorData);
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('RAG analysis result:', result);
      
      // Handle error in the response
      if (result.error) {
        throw new Error(result.error);
      }
      
      // 🌱 Transform the response to match UI expectations
      const transformedAnalysis = {
        riskLevel: result.label,
        riskScore: getRiskScore(result.label),
        flaggedWords: result.flagged_phrases?.map((p: any) => p.phrase) || [],
        flaggedPhrases: result.flagged_phrases || [],
        supportedClaims: result.supported_claims || [],
        totalWords: content.split(' ').length,
        flaggedCount: result.flagged_phrases?.length || 0,
        supportedCount: result.supported_claims?.length || 0,
        compliance: {
          eu: result.label !== 'high',
          us: result.label !== 'high'
        },
        recommendations: generateRecommendations(result.flagged_phrases || [], result.label),
        detailedFindings: result.flagged_phrases || [],
        pgReferences: result.pg_references || [],
        pgContextUsed: result.pg_context_used || 0,
        analysisMethod: result.analysis_method || 'RAG-based analysis'
      };
      
      setAnalysis(transformedAnalysis);
      
      toast({
        title: "🌱 RAG Analysis Complete",
        description: `Analyzed against P&G Annual Report. Found ${transformedAnalysis.flaggedCount} unsupported phrases, ${transformedAnalysis.supportedCount} validated claims`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      
      toast({
        title: "Analysis failed",
        description: errorMessage,
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
          <p className="text-gray-500">Upload a file or paste text content to begin RAG-powered greenwashing analysis against P&G's documented practices</p>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">🌱 RAG Analysis in Progress...</h3>
          <p className="text-gray-500 mb-4">Comparing against P&G Annual Report 2024 using AI-powered retrieval</p>
          <Progress value={66} className="w-64 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-300">
        <CardContent className="p-12 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Analysis Error</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <Button onClick={analyzeContent} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">🌱 RAG-Powered Greenwashing Analysis</h3>
        <p className="text-gray-600">Validated against P&G Annual Report 2024 documented practices</p>
        {analysis?.pgContextUsed && (
          <Badge variant="outline" className="mt-2">
            {analysis.pgContextUsed} P&G document passages analyzed
          </Badge>
        )}
      </div>

      {/* Risk Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className={`border-2 ${getRiskColor(analysis?.riskLevel)}`}>
          <CardHeader className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <CardTitle className="capitalize">{analysis?.riskLevel} Risk</CardTitle>
            <CardDescription>RAG Analysis</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold mb-2">{analysis?.riskScore}%</div>
            <p className="text-sm">Risk Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <CardTitle>{analysis?.flaggedCount}</CardTitle>
            <CardDescription>Unsupported Claims</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-sm text-gray-600">
              Not validated by P&G report
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <CardTitle>{analysis?.supportedCount}</CardTitle>
            <CardDescription>Validated Claims</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-sm text-gray-600">
              Supported by P&G practices
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

      {/* Supported Claims Section */}
      {analysis?.supportedClaims && analysis.supportedClaims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>🌱 Validated Environmental Claims</span>
            </CardTitle>
            <CardDescription>
              Claims supported by P&G's documented practices and initiatives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {analysis.supportedClaims.map((claim: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      "{claim.phrase}"
                    </Badge>
                    <Badge className="bg-green-600">Validated</Badge>
                  </div>
                  <p className="text-sm text-green-700">
                    <strong>Supporting Evidence:</strong> {claim.supporting_evidence}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unsupported Claims */}
      {analysis?.detailedFindings && analysis.detailedFindings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>🌱 Unsupported Environmental Claims</span>
            </CardTitle>
            <CardDescription>
              Claims that lack substantiation in P&G's documented practices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {analysis.detailedFindings.map((finding: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 bg-red-50">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="border-red-500 text-red-700">
                      "{finding.phrase}"
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {finding.risk_level} Risk
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Issue:</strong> {finding.justification}
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Suggestion:</strong> {finding.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* P&G References */}
      {analysis?.pgReferences && analysis.pgReferences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>🌱 P&G Annual Report References</span>
            </CardTitle>
            <CardDescription>
              Relevant P&G initiatives and practices used in analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.pgReferences.map((ref: string, index: number) => (
                <Alert key={index}>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>{ref}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>🌱 RAG-Based Recommendations</span>
          </CardTitle>
          <CardDescription>
            Actionable steps based on P&G's documented best practices
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
          🌱 Re-analyze with RAG
        </Button>
        <Button onClick={() => window.print()}>
          Export Report
        </Button>
      </div>
    </div>
  );
};

export default GreenwashingAnalyzer;
