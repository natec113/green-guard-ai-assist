
// 🌱 Process and Store Real P&G Annual Report
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
    const { content, filename } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('🌱 Processing document:', filename);
    console.log('🌱 Content length:', content.length);

    // 🌱 Remove existing P&G report data
    await supabase
      .from('document_chunks')
      .delete()
      .eq('metadata->>source', 'PG_AR_2024');

    await supabase
      .from('documents')
      .delete()
      .eq('doc_id', 'PG_AR_2024');

    // 🌱 Insert the new document
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({
        name: `P&G Annual Report 2024 - ${filename}`,
        doc_id: 'PG_AR_2024',
        content: content,
        metadata: { 
          source: 'official_report', 
          year: 2024, 
          filename: filename,
          processed_at: new Date().toISOString()
        },
        public_read: true
      })
      .select()
      .single();

    if (docError) {
      throw new Error(`Failed to insert document: ${docError.message}`);
    }

    console.log('🌱 Document inserted with ID:', doc.id);

    // 🌱 Create chunks from the content
    const chunks = chunkText(content, 800); // Larger chunks for better context
    let chunksInserted = 0;

    for (const [index, chunk] of chunks.entries()) {
      const { error: chunkError } = await supabase
        .from('document_chunks')
        .insert({
          document_id: doc.id,
          content: chunk,
          metadata: { 
            chunk_index: index, 
            source: 'PG_AR_2024',
            total_chunks: chunks.length
          },
          public_read: true
        });

      if (chunkError) {
        console.error('🌱 Error inserting chunk:', chunkError);
      } else {
        chunksInserted++;
      }
    }

    console.log('🌱 Chunks inserted:', chunksInserted, 'of', chunks.length);

    return new Response(JSON.stringify({ 
      status: 'success',
      message: 'P&G Annual Report processed successfully',
      document_id: doc.id,
      chunks_created: chunksInserted,
      content_length: content.length,
      filename: filename
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🌱 Processing error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to process P&G Annual Report'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function chunkText(text: string, chunkSize: number): string[] {
  // 🌱 Smart chunking that tries to break at sentence boundaries
  const chunks = [];
  let currentChunk = '';
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed chunk size, finalize current chunk
    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  // Add the last chunk if it exists
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // If any chunk is still too large, split it further
  const finalChunks = [];
  for (const chunk of chunks) {
    if (chunk.length <= chunkSize) {
      finalChunks.push(chunk);
    } else {
      // Split by sentences
      const sentences = chunk.split(/[.!?]+\s+/);
      let subChunk = '';
      
      for (const sentence of sentences) {
        if (subChunk.length + sentence.length > chunkSize && subChunk.length > 0) {
          finalChunks.push(subChunk.trim());
          subChunk = sentence;
        } else {
          subChunk += (subChunk ? '. ' : '') + sentence;
        }
      }
      
      if (subChunk.trim()) {
        finalChunks.push(subChunk.trim());
      }
    }
  }
  
  return finalChunks;
}
