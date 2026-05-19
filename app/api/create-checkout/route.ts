// Chemin : app/api/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📦 Données reçues:', body) // 🔍 LOG DE DEBUG

    const { orderId, orderNumber, items, totalAmount, email } = body

    if (!orderId || !items || !totalAmount) {
      console.error('❌ Données manquantes:', { orderId, items, totalAmount })
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            description: item.description?.substring(0, 500),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/commande/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/commande/cancel?order_id=${orderId}`,
      customer_email: email || user.email,
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        user_id: user.id,
      },
    })

    console.log('✅ Session Stripe créée:', session.id)

    // Mettre à jour la commande avec le session_id Stripe
    await supabase
      .from('orders')
      .update({ payment_intent_id: session.id })
      .eq('id', orderId)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('❌ Erreur Stripe:', error.message)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}