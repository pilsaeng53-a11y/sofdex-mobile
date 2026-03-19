import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Record a transaction in the database
 * Called when user completes deposit, withdrawal, transfer, or trade
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      type, // 'deposit', 'withdrawal', 'transfer', 'trade'
      asset,
      amount,
      from_address,
      to_address,
      network,
      fee = 0,
      notes = '',
    } = body;

    // Validate required fields
    if (!type || !asset || !amount || !network) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Create transaction record
    const transaction = await base44.entities.Transaction.create({
      user_id: user.id,
      wallet_address: user.email, // Use email as identifier
      type,
      asset,
      amount: parseFloat(amount),
      from_address: from_address || '',
      to_address: to_address || '',
      network,
      fee: parseFloat(fee),
      status: 'pending', // Starts as pending, would be updated when confirmed on-chain
      timestamp: new Date().toISOString(),
      notes,
    });

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        status: 'pending',
        message: `${type} recorded successfully`,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Transaction recording error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to record transaction' }),
      { status: 500 }
    );
  }
});