
// 🌱 Document Upload & Processing Endpoint
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
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // 🌱 Extract text from file
    const content = await extractTextFromFile(file);
    
    // 🌱 Store document
    const { data: doc } = await supabase.from('documents').insert({
      name: file.name,
      doc_id: crypto.randomUUID(),
      content,
      metadata: { 
        file_type: file.type,
        file_size: file.size 
      }
    }).select().single();

    // 🌱 Chunk and embed content
    const chunks = chunkText(content, 1000);
    const chunkPromises = chunks.map(async (chunk, index) => {
      const embedding = await getEmbedding(chunk);
      
      return supabase.from('document_chunks').insert({
        document_id: doc.id,
        content: chunk,
        metadata: { chunk_index: index },
        embedding_hash: await hashEmbedding(embedding)
      });
    });

    await Promise.all(chunkPromises);

    return new Response(JSON.stringify({ 
      document_id: doc.id,
      chunks_created: chunks.length,
      status: 'processed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('🌱 Upload error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function extractTextFromFile(file: File): Promise<string> {
  // 🌱 Simple text extraction - could be enhanced with PDF parsing
  if (file.type === 'text/plain') {
    return await file.text();
  }
  
  // For other file types, return filename for now
  return `Document: ${file.name}`;
}

function chunkText(text: string, chunkSize: number): string[] {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

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

async function hashEmbedding(embedding: number[]): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(embedding));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
