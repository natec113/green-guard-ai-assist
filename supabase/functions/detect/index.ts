
// 🌱 Greenwashing Detection Endpoint with RAG
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
    
    // 🌱 Search for relevant passages in P&G annual report
    const pgPassages = await searchPGAnnualReport(supabase, text);
    
    // 🌱 Analyze with Groq using RAG context
    const detection = await analyzeWithRAG(text, pgPassages);
    
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

async function searchPGAnnualReport(supabase: any, query: string) {
  console.log('🌱 Searching P&G Annual Report for:', query);
  
  // 🌱 Search specifically in P&G Annual Report chunks
  const { data: chunks } = await supabase
    .from('document_chunks')
    .select('content, metadata')
    .eq('metadata->>source', 'PG_AR_2024')
    .textSearch('content', query, { type: 'websearch' })
    .limit(10);
    
  console.log('🌱 Found P&G passages:', chunks?.length || 0);
  
  if (!chunks || chunks.length === 0) {
    // 🌱 Fallback: get some general P&G content
    const { data: fallbackChunks } = await supabase
      .from('document_chunks')
      .select('content, metadata')
      .eq('metadata->>source', 'PG_AR_2024')
      .limit(5);
    
    return fallbackChunks || [];
  }
  
  return chunks;
}

async function analyzeWithRAG(text: string, pgPassages: any[]) {
  const pgContext = pgPassages.map(p => p.content).join('\n\n');
  
  const prompt = `You are a greenwashing detection expert using P&G's own documented practices as the reference standard.

CONTEXT FROM P&G ANNUAL REPORT 2024:
${pgContext}

ANALYSIS TASK:
Analyze this text for greenwashing: "${text}"

CRITICAL INSTRUCTIONS:
1. ONLY flag phrases that make environmental claims NOT supported by the P&G Annual Report context above
2. If a claim is substantiated by P&G's documented practices, metrics, or commitments in the report, do NOT flag it
3. Focus on unsupported vague claims like "eco-friendly" or "green" without specific backing
4. Consider P&G's actual sustainability initiatives, targets, and achievements as valid substantiation

For each potentially problematic phrase, check if it's supported by the P&G context. If supported, exclude it from flagged_phrases.

Respond in JSON format:
{
  "label": "high|medium|low",
  "justification": "explanation focusing on what IS and ISN'T supported by P&G's documented practices",
  "flagged_phrases": [
    {
      "phrase": "exact phrase from text",
      "risk_level": "high|medium|low", 
      "justification": "why this specific phrase lacks substantiation in P&G's documented practices",
      "suggestion": "how to improve it with specific P&G data/initiatives"
    }
  ],
  "supported_claims": [
    {
      "phrase": "exact phrase that IS supported",
      "supporting_evidence": "specific P&G practice/metric that validates this claim"
    }
  ],
  "pg_references": ["specific P&G initiatives/metrics that provide context"]
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
  const result = JSON.parse(data.choices[0].message.content);
  
  // 🌱 Add P&G context to the result
  result.pg_context_used = pgPassages.length;
  result.analysis_method = 'RAG-based comparison with P&G Annual Report 2024';
  
  return result;
}
