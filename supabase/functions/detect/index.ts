
// 🌱 Greenwashing Detection Endpoint with RAG
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text || text.trim() === "") {
      throw new Error("No text provided for analysis");
    }
    
    console.log('🌱 Analyzing text for greenwashing:', text.substring(0, 100) + '...');
    
    // Create Supabase client with SERVICE_ROLE_KEY for admin access to documents
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // 🌱 Search for relevant passages in P&G annual report
    console.log('🌱 Retrieving P&G document context...');
    const pgPassages = await searchPGAnnualReport(supabase, text);
    
    if (pgPassages.length === 0) {
      console.log('⚠️ Warning: No P&G document context found, using fallback');
    } else {
      console.log(`✅ Found ${pgPassages.length} relevant passages from P&G Annual Report`);
    }
    
    // 🌱 Analyze with Groq using RAG context
    console.log('🌱 Sending to Groq for RAG analysis...');
    const detection = await analyzeWithRAG(text, pgPassages);
    console.log('✅ Analysis complete');
    
    // 🌱 Log the detection (without user_id)
    await supabase.from('greenwashing_detections').insert({
      text_content: text,
      detection_result: detection
    });
    console.log('✅ Detection saved to database');

    return new Response(JSON.stringify(detection), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('🌱 Detection error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "An error occurred during greenwashing analysis"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function searchPGAnnualReport(supabase: any, query: string) {
  console.log('🌱 Searching P&G Annual Report for:', query.substring(0, 50) + '...');
  
  try {
    // First try full text search
    const { data: chunks, error } = await supabase
      .from('document_chunks')
      .select('content, metadata')
      .eq('metadata->>source', 'PG_AR_2024')
      .textSearch('content', query, { type: 'websearch', config: 'english' })
      .limit(10);
      
    if (error) {
      console.error('🌱 Error searching document chunks:', error);
      throw error;
    }
    
    console.log('🌱 Found P&G passages:', chunks?.length || 0);
    
    if (!chunks || chunks.length === 0) {
      console.log('🌱 No matching chunks found, using keyword search fallback');
      
      // Extract keywords from query (simple approach - words with 4+ chars)
      const keywords = query
        .split(/\s+/)
        .filter(word => word.length >= 4)
        .map(word => word.toLowerCase())
        .slice(0, 5); // Take top 5 keywords
      
      if (keywords.length > 0) {
        console.log('🌱 Using keywords for fallback search:', keywords.join(', '));
        
        // For each keyword, find matching chunks
        const keywordSearches = keywords.map(keyword => 
          supabase
            .from('document_chunks')
            .select('content, metadata')
            .eq('metadata->>source', 'PG_AR_2024')
            .ilike('content', `%${keyword}%`)
            .limit(3)
        );
        
        const results = await Promise.all(keywordSearches);
        // Combine all results and remove duplicates
        const allChunks = results
          .flatMap(result => result.data || [])
          .filter((chunk, index, self) => 
            index === self.findIndex(c => c.content === chunk.content)
          );
        
        console.log('🌱 Keyword search found:', allChunks.length);
        return allChunks;
      }
      
      // Last resort: get random chunks from the P&G document
      const { data: fallbackChunks } = await supabase
        .from('document_chunks')
        .select('content, metadata')
        .eq('metadata->>source', 'PG_AR_2024')
        .limit(5);
      
      console.log('🌱 Using random document chunks as fallback');
      return fallbackChunks || [];
    }
    
    return chunks;
  } catch (error) {
    console.error('🌱 Error in searchPGAnnualReport:', error);
    // Return empty array on error, don't fail completely
    return [];
  }
}

async function analyzeWithRAG(text: string, pgPassages: any[]) {
  let pgContext = "No P&G Annual Report context available.";
  
  if (pgPassages && pgPassages.length > 0) {
    pgContext = pgPassages.map(p => p.content).join('\n\n');
    console.log('🌱 Using context length:', pgContext.length, 'characters');
  }
  
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

  try {
    console.log('🌱 Calling Groq API...');
    
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🌱 Groq API error:', response.status, errorText);
      throw new Error(`Groq API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('🌱 Invalid Groq API response:', data);
      throw new Error('Invalid response from Groq API');
    }
    
    const resultText = data.choices[0].message.content;
    let result;
    
    try {
      result = JSON.parse(resultText);
    } catch (parseError) {
      console.error('🌱 Failed to parse Groq result as JSON:', resultText);
      throw new Error('Failed to parse AI response as JSON');
    }
    
    // Add metadata about the analysis
    result.pg_context_used = pgPassages.length;
    result.analysis_method = 'RAG-based comparison with P&G Annual Report 2024';
    
    return result;
  } catch (error) {
    console.error('🌱 Error in analyzeWithRAG:', error);
    throw error;
  }
}
