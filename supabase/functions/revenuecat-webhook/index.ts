// RevenueCat webhook — updates profiles.plan on subscription lifecycle events.
// Signature: HMAC-SHA256 of the raw request body, sent in X-RevenueCat-Signature.

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
])

interface RCEvent {
  type:                   string
  app_user_id:            string
  original_app_user_id?:  string
}

interface RCWebhookPayload {
  event: RCEvent
}

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sigBytes = await crypto.subtle.sign('HMAC', key, enc.encode(body))
  const expected = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Timing-safe comparison
  const a = enc.encode(expected)
  const b = enc.encode(signature)
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')
  if (!webhookSecret) {
    console.error('[rc-webhook] REVENUECAT_WEBHOOK_SECRET not set')
    return new Response('Configuration error', { status: 500 })
  }

  const signature = req.headers.get('X-RevenueCat-Signature')
  if (!signature) return new Response('Signature manquante', { status: 401 })

  const rawBody = await req.text()
  if (!await verifySignature(rawBody, signature, webhookSecret)) {
    return new Response('Signature invalide', { status: 401 })
  }

  let payload: RCWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new Response('JSON invalide', { status: 400 })
  }

  const { type: eventType, app_user_id, original_app_user_id } = payload.event

  let newPlan: 'free' | 'plus' | null = null
  if (PLUS_EVENTS.has(eventType))      newPlan = 'plus'
  else if (FREE_EVENTS.has(eventType)) newPlan = 'free'
  else return json({ ignored: true, type: eventType })

  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')              ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  // RevenueCat app_user_id = Supabase user id (set via initRevenueCat(userId)).
  // Try matching by supabase id first; fall back to revenuecat_id column for
  // aliased / legacy users. Also try original_app_user_id as last resort.
  const candidates = [...new Set([app_user_id, original_app_user_id].filter(Boolean))] as string[]

  let updated = false
  for (const candidate of candidates) {
    const { count } = await supabaseAdmin
      .from('profiles')
      .update({ plan: newPlan, revenuecat_id: app_user_id })
      .or(`id.eq.${candidate},revenuecat_id.eq.${candidate}`)
      .select('id', { count: 'exact', head: true })

    if ((count ?? 0) > 0) { updated = true; break }
  }

  if (!updated) {
    console.warn(`[rc-webhook] No profile matched for app_user_id=${app_user_id}`)
    // Return 200 so RevenueCat does not retry indefinitely
    return json({ ok: true, updated: false, plan: newPlan })
  }

  return json({ ok: true, updated: true, plan: newPlan })
})
