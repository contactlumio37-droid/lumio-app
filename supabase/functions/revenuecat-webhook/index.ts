import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'

const REVENUECAT_WEBHOOK_AUTH_HEADER = 'X-RevenueCat-Signature'

// Événements RevenueCat qui activent le plan plus
const PLUS_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
])

// Événements RevenueCat qui révoquer le plan plus
const FREE_EVENTS = new Set([
  'CANCELLATION',
  'EXPIRATION',
  'BILLING_ISSUE',
  'SUBSCRIBER_ALIAS',
])

interface RevenueCatWebhookPayload {
  event: {
    type: string
    app_user_id: string
    original_app_user_id?: string
  }
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  const hmac = createHmac('sha256', secret)
  hmac.update(body)
  const expected = hmac.digest('hex')
  return expected === signature
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')
  if (!webhookSecret) {
    console.error('REVENUECAT_WEBHOOK_SECRET non configuré')
    return new Response('Configuration error', { status: 500 })
  }

  const signature = req.headers.get(REVENUECAT_WEBHOOK_AUTH_HEADER)
  const rawBody = await req.text()

  // Vérifie la signature HMAC si fournie
  if (signature && !verifySignature(rawBody, signature, webhookSecret)) {
    return new Response('Signature invalide', { status: 401 })
  }

  let payload: RevenueCatWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new Response('JSON invalide', { status: 400 })
  }

  const { type: eventType, app_user_id } = payload.event

  let newPlan: 'free' | 'plus' | null = null
  if (PLUS_EVENTS.has(eventType)) {
    newPlan = 'plus'
  } else if (FREE_EVENTS.has(eventType)) {
    newPlan = 'free'
  } else {
    // Événement non géré — on ignore
    return new Response(JSON.stringify({ ignored: true, type: eventType }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Client admin pour bypasser RLS sur la colonne plan
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Met à jour profiles.plan via service_role (RLS bypassé)
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ plan: newPlan, revenuecat_id: app_user_id })
    .eq('revenuecat_id', app_user_id)

  if (error) {
    console.error('Erreur mise à jour plan :', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true, plan: newPlan }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
