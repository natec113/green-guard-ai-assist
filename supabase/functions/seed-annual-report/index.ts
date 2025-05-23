
// 🌱 Seed P&G Annual Report on Boot
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 🌱 Sample P&G Annual Report content for seeding
const PG_AR_2024_CONTENT = `
P&G 2024 Annual Report - Environmental Sustainability

Our Commitment to Environmental Responsibility
At Procter & Gamble, we are committed to responsible environmental stewardship. Our sustainability efforts focus on reducing our environmental footprint while delivering superior products to consumers worldwide.

Climate Action
We have set science-based targets to reduce greenhouse gas emissions across our operations and supply chain. Our facilities are increasingly powered by renewable energy sources, with solar and wind installations at key manufacturing sites.

Packaging Innovation
We are advancing sustainable packaging solutions, including concentrated formulas that reduce packaging materials and transportation impact. Our products increasingly feature recyclable packaging made from post-consumer recycled materials.

Water Stewardship
Water conservation is critical to our operations and the communities we serve. We have implemented water-efficient manufacturing processes and support watershed protection programs in water-stressed regions.

Ingredient Transparency
We provide detailed ingredient information for our products and are committed to using responsibly sourced materials. Our research focuses on developing biodegradable formulations that minimize environmental impact.

Supply Chain Sustainability
We work closely with suppliers to ensure responsible sourcing practices, including sustainable palm oil, responsibly managed forests, and fair labor practices throughout our supply chain.

Community Impact
Our environmental initiatives extend beyond our operations to benefit local communities through clean water access programs, environmental education, and disaster relief efforts.

Performance Metrics
- 50% reduction in greenhouse gas emissions by 2030
- 100% recyclable or reusable packaging by 2030
- 35% reduction in water usage per unit of production
- Zero manufacturing waste to landfill at 95% of our sites
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { 
            Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` 
          } 
        } 
      }
    );

    // 🌱 Check if already seeded
    const { data: existing } = await supabase
      .from('documents')
      .select('id')
      .eq('doc_id', 'PG_AR_2024')
      .single();

    if (existing) {
      return new Response(JSON.stringify({ 
        status: 'already_seeded',
        document_id: existing.id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 🌱 Seed the annual report
    const { data: doc } = await supabase.from('documents').insert({
      name: 'P&G Annual Report 2024',
      doc_id: 'PG_AR_2024',
      content: PG_AR_2024_CONTENT,
      metadata: { source: 'official_report', year: 2024 },
      public_read: true,
      user_id: null
    }).select().single();

    // 🌱 Create chunks
    const chunks = chunkText(PG_AR_2024_CONTENT, 500);
    for (const [index, chunk] of chunks.entries()) {
      await supabase.from('document_chunks').insert({
        document_id: doc.id,
        content: chunk,
        metadata: { chunk_index: index, source: 'PG_AR_2024' },
        public_read: true,
        user_id: null
      });
    }

    return new Response(JSON.stringify({ 
      status: 'seeded',
      document_id: doc.id,
      chunks_created: chunks.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('🌱 Seeding error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function chunkText(text: string, chunkSize: number): string[] {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}
