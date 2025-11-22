import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify API key (you should set this as a secret)
    const apiKey = req.headers.get('x-api-key');
    const validApiKey = Deno.env.get('API_KEY');
    
    if (!apiKey || apiKey !== validApiKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const {
      user_id,
      product_link,
      quantity,
      voucher_code,
      recipient_name,
      phone_or_contact,
      address,
      email,
      notes
    } = body;

    // Validate required fields
    if (!product_link || !quantity || !recipient_name || !phone_or_contact || !address) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check daily order limit
    const { data: settings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'daily_order_limit')
      .single();

    const dailyLimit = parseInt(settings?.value || '0');

    if (dailyLimit > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      if (count && count >= dailyLimit) {
        return new Response(
          JSON.stringify({ error: 'Daily order limit reached' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get voucher if provided
    let voucherId = null;
    let serviceFee = 0;

    if (voucher_code) {
      const { data: voucher } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', voucher_code)
        .eq('is_active', true)
        .single();

      if (voucher) {
        voucherId = voucher.id;
        serviceFee = parseFloat(voucher.fee_amount || '0');
      }
    }

    // Generate order code
    const { data: orderCodeData } = await supabase.rpc('generate_order_code');
    const orderCode = orderCodeData;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user_id || null,
        order_code: orderCode,
        product_link,
        quantity: parseInt(quantity),
        voucher_id: voucherId,
        recipient_name,
        phone_or_contact,
        address,
        email: email || null,
        notes: notes || null,
        service_fee: serviceFee,
        status: 'pending',
        payment_status: 'unpaid',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    console.log('Order created successfully via API:', order.order_code);

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          order_code: order.order_code,
          id: order.id,
          status: order.status,
          service_fee: order.service_fee,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in api-place-order:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
