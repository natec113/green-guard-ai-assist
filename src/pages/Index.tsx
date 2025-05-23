
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Sparkles, Users, Upload, CheckCircle, Search, Database } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import FileUpload from '@/components/FileUpload';
import GreenwashingAnalyzer from '@/components/GreenwashingAnalyzer';
import CommunicationOptimizer from '@/components/CommunicationOptimizer';
import AIAgentDashboard from '@/components/AIAgentDashboard';
import LegalGuidelines from '@/components/LegalGuidelines';
import LLMConfig from '@/components/LLMConfig';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadedContent, setUploadedContent] = useState('');
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Greenwashing Detection",
      description: "Advanced AI analysis using EU and US legal guidelines to identify potentially misleading environmental claims"
    },
    {
      icon: FileText,
      title: "Multi-Format Support",
      description: "Analyze text, Word documents, PowerPoint presentations, PDFs, Excel files, and more"
    },
    {
      icon: Sparkles,
      title: "Communication Optimization",
      description: "Transform flagged content into impactful, compliant messaging that resonates with consumers"
    },
    {
      icon: Users,
      title: "AI Marketing Agents",
      description: "Intelligent assistants to help marketing teams create authentic, effective communications"
    }
  ];

  const handleContentUploaded = (content: string) => {
    setUploadedContent(content);
    setActiveTab('analyze');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GreenGuard AI</h1>
                <p className="text-sm text-gray-600">P&G Marketing Compliance Suite</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <LLMConfig />
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                EU & US Compliant
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Eliminate Greenwashing, Amplify Impact
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered solution for P&G marketing teams to detect greenwashing risks, 
            optimize communications, and create authentic environmental messaging that complies with 
            European and US regulations.
          </p>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="px-4 pb-8">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h3>
            <p className="text-gray-600">Choose your workflow</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card 
              className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => navigate('/document-processor')}
            >
              <CardHeader className="text-center">
                <Database className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                <CardTitle className="text-xl">1. Upload P&G Annual Report</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-4">
                  First, upload the official P&G Annual Report to serve as the reference database for analysis
                </CardDescription>
                <Button className="w-full" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Annual Report
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => navigate('/marketing-analysis')}
            >
              <CardHeader className="text-center">
                <Search className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <CardTitle className="text-xl">2. Analyze Marketing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-4">
                  Upload marketing documents to analyze for greenwashing against the P&G Annual Report
                </CardDescription>
                <Button className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Analyze Marketing Content
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Application Tabs */}
      <section className="px-4 pb-12">
        <div className="container mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border-0 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Platform Overview', icon: Shield },
                  { id: 'upload', label: 'Quick Upload', icon: Upload },
                  { id: 'analyze', label: 'Quick Analysis', icon: Shield },
                  { id: 'optimize', label: 'Optimize Communication', icon: Sparkles },
                  { id: 'agents', label: 'AI Marketing Agents', icon: Users },
                  { id: 'guidelines', label: 'Legal Guidelines', icon: FileText }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to GreenGuard AI</h3>
                  <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    Your comprehensive solution for greenwashing detection and marketing compliance. 
                    Start by uploading the P&G Annual Report, then analyze your marketing content.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={() => navigate('/document-processor')}>
                      <Database className="w-4 h-4 mr-2" />
                      Upload Annual Report
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/marketing-analysis')}>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze Marketing Content
                    </Button>
                  </div>
                </div>
              )}
              {activeTab === 'upload' && (
                <FileUpload onContentUploaded={handleContentUploaded} />
              )}
              {activeTab === 'analyze' && (
                <GreenwashingAnalyzer content={uploadedContent} />
              )}
              {activeTab === 'optimize' && (
                <CommunicationOptimizer content={uploadedContent} />
              )}
              {activeTab === 'agents' && (
                <AIAgentDashboard />
              )}
              {activeTab === 'guidelines' && (
                <LegalGuidelines />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-4 pb-12">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Platform Features</h3>
            <p className="text-gray-600">Comprehensive tools for compliant marketing communications</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <feature.icon className="w-10 h-10 mx-auto mb-3 text-green-600" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">GreenGuard AI</span>
          </div>
          <p className="text-gray-400 text-sm">
            Empowering P&G marketing teams with AI-driven greenwashing detection and communication optimization
          </p>
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>✓ EU GDPR Compliant</span>
            <span>✓ US FTC Guidelines</span>
            <span>✓ Enterprise Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
