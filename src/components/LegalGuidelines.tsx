
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Scale, Globe, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";

const LegalGuidelines = () => {
  const euGuidelines = [
    {
      title: "Unfair Commercial Practices Directive",
      reference: "2005/29/EC",
      summary: "Prohibits misleading environmental claims that could deceive average consumers",
      keyPoints: [
        "Claims must be substantiated with scientific evidence",
        "Vague or general environmental benefits are prohibited",
        "Clear evidence required for comparative environmental claims"
      ]
    },
    {
      title: "Green Claims Code",
      reference: "European Commission 2021",
      summary: "Specific guidance on environmental marketing claims",
      keyPoints: [
        "Claims must be truthful, clear, and evidence-based",
        "Avoid selective disclosure of environmental impacts",
        "Use clear, specific language rather than vague terms"
      ]
    },
    {
      title: "Consumer Rights Directive",
      reference: "2011/83/EU",
      summary: "Ensures consumers receive accurate information about environmental characteristics",
      keyPoints: [
        "Material information about environmental impact must be provided",
        "Cannot omit important environmental limitations",
        "Pre-contractual information must be clear and prominent"
      ]
    }
  ];

  const usGuidelines = [
    {
      title: "FTC Green Guides",
      reference: "16 CFR Part 260",
      summary: "Federal Trade Commission guidance on environmental marketing claims",
      keyPoints: [
        "Environmental claims must be substantiated by competent evidence",
        "Claims should be clear, prominent, and understandable",
        "Avoid broad, unqualified claims like 'eco-friendly' or 'green'"
      ]
    },
    {
      title: "FTC Act Section 5",
      reference: "15 USC §45",
      summary: "Prohibits unfair or deceptive acts or practices in commerce",
      keyPoints: [
        "Deceptive environmental claims are illegal",
        "Material omissions can make claims deceptive",
        "Claims must be substantiated before being made"
      ]
    },
    {
      title: "NAFTA Environmental Guidelines",
      reference: "USCA Title 19",
      summary: "Trade agreement provisions affecting environmental claims",
      keyPoints: [
        "Cross-border environmental claims must comply with all applicable jurisdictions",
        "Standards for environmental product labeling",
        "Mutual recognition of environmental certifications"
      ]
    }
  ];

  const flaggedTerms = [
    { term: "Natural", risk: "high", reason: "Scientifically meaningless without specific context" },
    { term: "Eco-friendly", risk: "high", reason: "Vague claim requiring substantial evidence" },
    { term: "Green", risk: "medium", reason: "General term needing specific environmental benefits" },
    { term: "Sustainable", risk: "medium", reason: "Requires clear definition and measurable criteria" },
    { term: "Pure", risk: "medium", reason: "Absolute claim that's difficult to substantiate" },
    { term: "Clean", risk: "low", reason: "Acceptable if clearly defined in context" }
  ];

  const bestPractices = [
    "Use specific, measurable claims (e.g., '30% less packaging material')",
    "Provide third-party certifications when available",
    "Include clear limitations and conditions",
    "Use lifecycle assessment data to support claims",
    "Avoid comparative claims without substantiation",
    "Regular legal review of all environmental marketing materials"
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Legal Guidelines & Compliance</h3>
        <p className="text-gray-600">Comprehensive reference for European and US greenwashing regulations</p>
      </div>

      <Tabs defaultValue="eu" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="eu" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>EU Guidelines</span>
          </TabsTrigger>
          <TabsTrigger value="us" className="flex items-center space-x-2">
            <Scale className="w-4 h-4" />
            <span>US Guidelines</span>
          </TabsTrigger>
          <TabsTrigger value="terms" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Flagged Terms</span>
          </TabsTrigger>
          <TabsTrigger value="practices" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Best Practices</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eu" className="space-y-4">
          <Alert>
            <Globe className="h-4 w-4" />
            <AlertDescription>
              European Union environmental marketing regulations are among the strictest globally. 
              Compliance is mandatory for all P&G products sold in EU markets.
            </AlertDescription>
          </Alert>

          {euGuidelines.map((guideline, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{guideline.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-2 mt-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{guideline.reference}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline">EU Regulation</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{guideline.summary}</p>
                <div>
                  <h4 className="font-medium mb-2">Key Requirements:</h4>
                  <ul className="space-y-1">
                    {guideline.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="us" className="space-y-4">
          <Alert>
            <Scale className="h-4 w-4" />
            <AlertDescription>
              US Federal Trade Commission guidelines provide clear standards for environmental marketing claims. 
              Violations can result in significant penalties and legal action.
            </AlertDescription>
          </Alert>

          {usGuidelines.map((guideline, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{guideline.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-2 mt-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{guideline.reference}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline">US Federal</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{guideline.summary}</p>
                <div>
                  <h4 className="font-medium mb-2">Key Requirements:</h4>
                  <ul className="space-y-1">
                    {guideline.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="terms" className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              These terms frequently appear in greenwashing cases and require special attention. 
              Use specific, substantiated alternatives when possible.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>High-Risk Terms</CardTitle>
              <CardDescription>Terms that commonly trigger greenwashing violations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {flaggedTerms.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant={
                        item.risk === 'high' ? 'destructive' : 
                        item.risk === 'medium' ? 'secondary' : 'outline'
                      }>
                        {item.term}
                      </Badge>
                      <span className="text-sm text-gray-600">{item.reason}</span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {item.risk} Risk
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complete Flagged Terms List</CardTitle>
              <CardDescription>All terms monitored by the GreenGuard AI system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  'Eco-friendly', 'Eco', 'Bio', 'Natural', 'Nature', 'Health', 'Healthy', 'Environment',
                  'Ecological', 'Planet', 'Earth', 'Plant-based', 'Waste-free', 'Zero plastic',
                  'Climate positive', 'Low carbon', 'Emission-free', 'Sustainable', 'Sustainability',
                  'Green', 'Greener future', 'Doing our part', 'Environmentally safe', 'Non-toxic',
                  'Clean', 'Biodegradable', 'Compostable', 'Carbon', 'Net-zero', 'Conscious',
                  'Low-impact', 'Organic', 'Eco-safe', 'Environmentally', 'Eco-certified',
                  'Certified green', 'Nature-approved', 'Thoughtfully made', 'Mindful',
                  'Mindfully sourced', 'Care', 'Crafted with care', 'Healing', 'Giving back',
                  'Pure', 'Purity', 'Light-weight', 'Garden-grown', 'Naturally balanced',
                  'Holistic', 'Balanced living', 'Energy-cleansed', 'Mindfully made',
                  'Toxin-free', 'Soulful ingredients', 'Wellness-based', 'Minimal impact',
                  'Ethical', 'Ethically', 'Responsible', 'Responsibility', 'Environmental',
                  'Mindfully', 'Cleaner', 'Tomorrow', 'Future', 'Less plastic', 'Energy',
                  'Efficient', 'Carbon-neutral', 'Eco-Box', 'Plant-powered', 'Pure clean',
                  'Pure protection', 'CO2', 'Emissions', 'Chemical', 'Ocean Plastic',
                  'Beach-plastic', 'Zero waste'
                ].map((term, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {term}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practices" className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Following these best practices will help ensure your environmental marketing claims 
              are compliant, credible, and effective.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Best Practices</CardTitle>
              <CardDescription>Recommended approaches for environmental marketing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bestPractices.map((practice, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{practice}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800">✓ Recommended Approaches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">• "Made with 30% recycled materials"</p>
                <p className="text-sm">• "Certified by EPA Safer Choice program"</p>
                <p className="text-sm">• "Reduces packaging waste by 25%"</p>
                <p className="text-sm">• "Biodegrades in 90 days in industrial composting"</p>
                <p className="text-sm">• "Formulated without synthetic fragrances"</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-800">✗ Avoid These Claims</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">• "100% natural"</p>
                <p className="text-sm">• "Eco-friendly packaging"</p>
                <p className="text-sm">• "Better for the planet"</p>
                <p className="text-sm">• "Chemical-free formula"</p>
                <p className="text-sm">• "Environmentally safe"</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LegalGuidelines;
