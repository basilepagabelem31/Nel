// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.order_id
      const orderNumber = session.metadata?.order_number

      if (!orderId) {
        console.error('No order_id in session metadata')
        break
      }

      // Mettre à jour le statut de la commande
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (orderError) {
        console.error('Error updating order:', orderError)
        break
      }

      // Mettre à jour le paiement
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          provider_payment_id: session.id,
          paid_at: new Date().toISOString()
        })
        .eq('order_id', orderId)

      if (paymentError) {
        console.error('Error updating payment:', paymentError)
      }

      // Envoyer notification client (email + in-app)
      if (session.customer_email) {
        // Notification in-app
        await supabase.from('notifications').insert({
          user_id: session.metadata?.user_id,
          type: 'in_app',
          subject: 'Paiement confirmé ✓',
          content: `Votre paiement pour la commande #${orderNumber} a été confirmé. Votre commande va être préparée.`,
        })

        // TODO: Appeler l'API email ici (Resend)
        // await sendOrderConfirmationEmail(session.customer_email, orderNumber)
      }

      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.order_id

      if (orderId) {
        // Annuler la commande si session expirée
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId)

        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('order_id', orderId)
      }
      break
    }

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}