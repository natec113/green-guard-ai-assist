
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LLMConfig = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('llm_api_key') || '');
  const [provider, setProvider] = useState(() => localStorage.getItem('llm_provider') || 'groq');
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem('llm_base_url') || 'https://api.groq.com/openai/v1');
  const { toast } = useToast();

  const providers = [
    { id: 'groq', name: 'Groq', defaultUrl: 'https://api.groq.com/openai/v1' },
    { id: 'openai', name: 'OpenAI', defaultUrl: 'https://api.openai.com/v1' },
    { id: 'anthropic', name: 'Anthropic', defaultUrl: 'https://api.anthropic.com' },
    { id: 'custom', name: 'Custom Provider', defaultUrl: '' }
  ];

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const providerConfig = providers.find(p => p.id === newProvider);
    if (providerConfig && providerConfig.defaultUrl) {
      setBaseUrl(providerConfig.defaultUrl);
    }
  };

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key to continue.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('llm_api_key', apiKey);
    localStorage.setItem('llm_provider', provider);
    localStorage.setItem('llm_base_url', baseUrl);
    
    toast({
      title: "Configuration Saved",
      description: "Your LLM settings have been saved securely in your browser.",
    });
    
    setIsOpen(false);
  };

  const isConfigured = !!localStorage.getItem('llm_api_key');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>Configure LLM</span>
          {isConfigured ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-orange-600" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure LLM Provider</DialogTitle>
          <DialogDescription>
            Set up your AI language model provider for greenwashing analysis and content optimization.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                    {p.id === 'groq' && <Badge variant="outline" className="ml-2 text-xs">Recommended</Badge>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Your API key is stored securely in your browser's local storage.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              type="url"
              placeholder="API base URL"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>

          {provider === 'groq' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Groq (Recommended)</p>
                    <p className="text-xs text-blue-700">
                      Fast inference with competitive pricing. Get your free API key at groq.com
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LLMConfig;
