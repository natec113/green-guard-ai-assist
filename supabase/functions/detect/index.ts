
// 🌱 Greenwashing Detection Endpoint
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // 🌱 Get embeddings for the input text
    const embedding = await getEmbedding(text);
    
    // 🌱 Search for relevant passages in document chunks
    const passages = await searchRelevantPassages(supabase, embedding, text);
    
    // 🌱 Analyze with Groq for greenwashing detection
    const detection = await analyzeWithGroq(text, passages);
    
    // 🌱 Log the detection (without user_id)
    await supabase.from('greenwashing_detections').insert({
      text_content: text,
      detection_result: detection
    });

    return new Response(JSON.stringify(detection), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('🌱 Detection error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  });
  
  const data = await response.json();
  return data.data[0].embedding;
}

async function searchRelevantPassages(supabase: any, embedding: number[], query: string) {
  // 🌱 For now, use text search until vector search is available
  const { data } = await supabase
    .from('document_chunks')
    .select('content, metadata')
    .textSearch('content', query)
    .limit(5);
    
  return data || [];
}

async function analyzeWithGroq(text: string, passages: any[]) {
  const context = passages.map(p => p.content).join('\n\n');
  
  const prompt = `Analyze this text for greenwashing using P&G guidelines and regulatory standards.

Context from P&G documents:
${context}

Text to analyze: "${text}"

Identify specific phrases (not just individual words) that may constitute greenwashing. For each flagged phrase, provide:
1. The exact phrase from the text
2. Risk level (high/medium/low)
3. Justification based on P&G guidelines
4. Suggested improvement

Respond in JSON format:
{
  "label": "high|medium|low",
  "justification": "explanation",
  "flagged_phrases": [
    {
      "phrase": "exact phrase from text",
      "risk_level": "high|medium|low", 
      "justification": "why this phrase is problematic",
      "suggestion": "how to improve it"
    }
  ],
  "passages": ["relevant document excerpts"]
}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
