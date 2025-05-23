
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, MessageSquare, PenTool, Target, Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AIAgentDashboard = () => {
  const [activeAgent, setActiveAgent] = useState('content-creator');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const agents = [
    {
      id: 'content-creator',
      name: 'Content Creator',
      icon: PenTool,
      description: 'Generates compliant marketing copy and content ideas',
      capabilities: ['Blog posts', 'Social media', 'Press releases', 'Product descriptions'],
      status: 'active'
    },
    {
      id: 'compliance-checker',
      name: 'Compliance Checker',
      icon: Target,
      description: 'Reviews content for regulatory compliance and greenwashing risks',
      capabilities: ['Regulatory review', 'Risk assessment', 'Legal guidance', 'Best practices'],
      status: 'active'
    },
    {
      id: 'strategy-advisor',
      name: 'Strategy Advisor',
      icon: MessageSquare,
      description: 'Provides strategic marketing advice and campaign optimization',
      capabilities: ['Campaign strategy', 'Audience insights', 'Market trends', 'Competitive analysis'],
      status: 'active'
    }
  ];

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(chatInput, activeAgent);
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 2000);

    toast({
      title: "Message sent",
      description: `${agents.find(a => a.id === activeAgent)?.name} is processing your request`,
    });
  };

  const generateBotResponse = (input: string, agentId: string) => {
    const responses: Record<string, string[]> = {
      'content-creator': [
        "I can help you create compliant marketing content. Here's a draft that avoids greenwashing while highlighting your product's genuine benefits:",
        "Let me suggest some authentic messaging that focuses on specific, verifiable claims rather than vague environmental statements:",
        "I'll create content that emphasizes your product's actual performance and measurable environmental improvements:"
      ],
      'compliance-checker': [
        "I've reviewed your content and found several areas that need attention to meet EU and US guidelines. Here are my recommendations:",
        "Based on current regulations, I recommend the following changes to ensure compliance:",
        "Your content has some compliance risks. Let me guide you through the necessary adjustments:"
      ],
      'strategy-advisor': [
        "For your marketing strategy, I recommend focusing on authentic storytelling that builds trust with environmentally conscious consumers:",
        "Based on market trends, here's how you can position your brand more effectively:",
        "Your campaign would benefit from these strategic adjustments to maximize impact while maintaining authenticity:"
      ]
    };

    const agentResponses = responses[agentId] || responses['content-creator'];
    return agentResponses[Math.floor(Math.random() * agentResponses.length)];
  };

  const currentAgent = agents.find(a => a.id === activeAgent);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Marketing Agents</h3>
        <p className="text-gray-600">Intelligent assistants to help your marketing team create authentic, compliant communications</p>
      </div>

      <Tabs value={activeAgent} onValueChange={setActiveAgent}>
        <TabsList className="grid w-full grid-cols-3">
          {agents.map(agent => (
            <TabsTrigger key={agent.id} value={agent.id} className="space-x-2">
              <agent.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{agent.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {agents.map(agent => (
          <TabsContent key={agent.id} value={agent.id}>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Agent Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <agent.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{agent.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="font-medium mb-3">Capabilities:</h4>
                    <div className="space-y-2">
                      {agent.capabilities.map((capability, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          <span className="text-sm text-gray-600">{capability}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chat Interface */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="w-5 h-5" />
                    <span>Chat with {agent.name}</span>
                  </CardTitle>
                  <CardDescription>
                    Ask questions, request content, or get advice from your AI marketing assistant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Chat History */}
                  <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
                    {chatHistory.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <Bot className="w-8 h-8 mx-auto mb-2" />
                        <p>Start a conversation with {agent.name}</p>
                        <p className="text-sm mt-1">Ask about content creation, compliance, or strategy</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatHistory.map(message => (
                          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.type === 'user' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white border border-gray-200'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder={`Ask ${agent.name} for help...`}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={isTyping}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || isTyping}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for marketing teams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Create Social Post", desc: "Generate compliant social media content" },
              { title: "Review Campaign", desc: "Check campaign for greenwashing risks" },
              { title: "Optimize Copy", desc: "Improve existing marketing copy" },
              { title: "Strategy Review", desc: "Get strategic marketing advice" }
            ].map((action, index) => (
              <Button key={index} variant="outline" className="h-auto p-4 text-left">
                <div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-gray-500 mt-1">{action.desc}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAgentDashboard;
