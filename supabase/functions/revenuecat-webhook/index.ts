const REVENUECAT_WEBHOOK_AUTH_HEADER = 'X-RevenueCat-Signature'

const PLUS_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
])

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

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sigBytes = await crypto.subtle.sign('HMAC', key, enc.encode(body))
  const expected = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Timing-safe byte-by-byte comparison
  const a = enc.encode(expected)
  const b = enc.encode(signature)
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
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
  if (!signature) {
    return new Response('Signature manquante', { status: 401 })
  }

  const rawBody = await req.text()
  if (!await verifySignature(rawBody, signature, webhookSecret)) {
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
    return new Response(JSON.stringify({ ignored: true, type: eventType }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

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
