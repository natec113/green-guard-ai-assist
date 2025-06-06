
// 🌱 Content Adaptation Endpoint
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    // 🌱 Rewrite content to remove greenwashing
    const adaptation = await rewriteWithGroq(text);
    
    return new Response(JSON.stringify(adaptation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('🌱 Adaptation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function rewriteWithGroq(text: string) {
  const prompt = `Rewrite this marketing text to remove greenwashing while maintaining impact. Follow these guidelines:

1. Replace vague terms with specific, measurable claims
2. Remove unsubstantiated environmental claims
3. Focus on concrete benefits and actions
4. Maintain persuasive tone without misleading language

Original text: "${text}"

Respond in JSON format:
{
  "before": "original text",
  "after": "rewritten text",
  "changes": [
    {
      "original_phrase": "phrase that was changed",
      "new_phrase": "replacement phrase",
      "reason": "why the change was made"
    }
  ],
  "improvement_score": 85
}`;

  const groqApiKey = Deno.env.get('GROQ_API_KEY');
  
  if (!groqApiKey) {
    return {
      before: text,
      after: text,
      changes: [],
      improvement_score: 0,
      error: "No Groq API key available"
    };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192', // Updated to a current model
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error in rewriteWithGroq:', error);
    
    return {
      before: text,
      after: text,
      changes: [],
      improvement_score: 0,
      error: error.message
    };
  }
}
