
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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
          processed_at: new Date().toISOString(),
          content_length: content.length,
          content_hash: await hashText(content.substring(0, 1000)) // Hash first 1000 chars as fingerprint
        },
        public_read: true
      })
      .select()
      .single();

    if (docError) {
      console.error('🌱 Document insert error:', docError);
      throw new Error(`Failed to insert document: ${docError.message}`);
    }

    console.log('🌱 Document inserted with ID:', doc.id);

    // 🌱 Create optimized chunks from the content
    const chunks = await chunkTextAdvanced(content, 1500); // Larger chunks for better context
    let chunksInserted = 0;

    // Process chunks in batches to avoid overwhelming the database
    const BATCH_SIZE = 50;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const chunkInsertPromises = batch.map((chunk, batchIndex) => {
        const index = i + batchIndex;
        return supabase
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
      });

      const results = await Promise.all(chunkInsertPromises);
      const insertedCount = results.filter(r => !r.error).length;
      
      // Log any chunk insertion errors
      results.forEach((result, idx) => {
        if (result.error) {
          console.error(`🌱 Chunk ${i + idx} insertion error:`, result.error);
        }
      });
      
      chunksInserted += insertedCount;
      
      console.log(`🌱 Batch processed: ${insertedCount}/${batch.length} chunks inserted (total: ${chunksInserted}/${chunks.length})`);
    }

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

async function chunkTextAdvanced(text: string, targetSize: number): Promise<string[]> {
  // First, clean and normalize the text
  const cleanedText = text
    .replace(/\r\n/g, '\n')              // Normalize line endings
    .replace(/\n{3,}/g, '\n\n')          // Normalize multiple blank lines
    .replace(/\s{2,}/g, ' ');            // Normalize multiple spaces

  // Split by paragraphs first (better semantic boundaries)
  const paragraphs = cleanedText.split(/\n\s*\n/);
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed chunk size, finalize current chunk
    if (currentChunk.length + paragraph.length > targetSize && currentChunk.length > 0) {
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
  
  // For paragraphs that are still too large, split them at sentence boundaries
  const finalChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= targetSize) {
      finalChunks.push(chunk);
    } else {
      // Split by sentences for more precise chunking
      const sentences = chunk.split(/(?<=[.!?])\s+/);
      let subChunk = '';
      
      for (const sentence of sentences) {
        if (subChunk.length + sentence.length > targetSize && subChunk.length > 0) {
          finalChunks.push(subChunk.trim());
          subChunk = sentence;
        } else {
          subChunk += (subChunk ? ' ' : '') + sentence;
        }
      }
      
      if (subChunk.trim()) {
        finalChunks.push(subChunk.trim());
      }
    }
  }
  
  return finalChunks;
}

async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
