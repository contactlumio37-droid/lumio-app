import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PULSE_SECRET = Deno.env.get('PULSE_SECRET') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

type Lang = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'

const MESSAGES: Record<string, Record<Lang, { title: string; body: string }[]>> = {
  bad_sleep: {
    fr: [
      { title: 'Ton sommeil mérite attention', body: 'Deux nuits difficiles de suite. Essaie de t\'accorder un moment calme ce soir.' },
      { title: 'Nuits agitées', body: 'Lumio a remarqué que ton sommeil est perturbé. Prends soin de toi aujourd\'hui.' },
    ],
    en: [
      { title: 'Your sleep deserves attention', body: 'Two rough nights in a row. Try to give yourself a calm moment this evening.' },
      { title: 'Restless nights', body: 'Lumio noticed your sleep has been disrupted. Take care of yourself today.' },
    ],
    es: [
      { title: 'Tu sueño merece atención', body: 'Dos noches difíciles seguidas. Intenta darte un momento tranquilo esta noche.' },
      { title: 'Noches agitadas', body: 'Lumio ha notado que tu sueño está perturbado. Cuídate hoy.' },
    ],
    de: [
      { title: 'Dein Schlaf braucht Aufmerksamkeit', body: 'Zwei schwierige Nächte hintereinander. Gönne dir heute Abend einen ruhigen Moment.' },
      { title: 'Unruhige Nächte', body: 'Lumio hat bemerkt, dass dein Schlaf gestört ist. Pass heute auf dich auf.' },
    ],
    it: [
      { title: 'Il tuo sonno merita attenzione', body: 'Due notti difficili di fila. Prova a concederti un momento tranquillo stasera.' },
      { title: 'Notti agitate', body: 'Lumio ha notato che il tuo sonno è disturbato. Prenditi cura di te oggi.' },
    ],
    pt: [
      { title: 'O seu sono merece atenção', body: 'Duas noites difíceis seguidas. Tente dar-se um momento calmo esta noite.' },
      { title: 'Noites agitadas', body: 'Lumio notou que o seu sono está perturbado. Cuide-se hoje.' },
    ],
  },
  low_mood: {
    fr: [
      { title: 'Comment tu vas, vraiment ?', body: 'Ces derniers jours semblent lourds. Ton compagnon est là.' },
      { title: 'Lumio t\'observe avec douceur', body: 'Trois jours difficiles. Tu n\'as pas à traverser ça seul·e.' },
    ],
    en: [
      { title: 'How are you, really?', body: 'The last few days seem heavy. Your companion is here.' },
      { title: 'Lumio watches over you gently', body: 'Three tough days. You don\'t have to go through this alone.' },
    ],
    es: [
      { title: '¿Cómo estás, de verdad?', body: 'Los últimos días parecen pesados. Tu compañero está aquí.' },
      { title: 'Lumio te observa con dulzura', body: 'Tres días difíciles. No tienes que pasar por esto solo.' },
    ],
    de: [
      { title: 'Wie geht es dir wirklich?', body: 'Die letzten Tage scheinen schwer zu sein. Dein Begleiter ist da.' },
      { title: 'Lumio beobachtet dich sanft', body: 'Drei schwierige Tage. Du musst das nicht alleine durchstehen.' },
    ],
    it: [
      { title: 'Come stai, davvero?', body: 'Gli ultimi giorni sembrano pesanti. Il tuo compagno è qui.' },
      { title: 'Lumio ti osserva con dolcezza', body: 'Tre giorni difficili. Non devi affrontarlo da solo.' },
    ],
    pt: [
      { title: 'Como você está, de verdade?', body: 'Os últimos dias parecem pesados. Seu companheiro está aqui.' },
      { title: 'Lumio observa você com carinho', body: 'Três dias difíceis. Você não precisa passar por isso sozinho.' },
    ],
  },
  absence: {
    fr: [
      { title: 'Ton compagnon s\'ennuie de toi', body: 'Ça fait 2 jours sans Checkout. Tout va bien ?' },
      { title: 'Une petite pensée pour toi', body: 'Tu nous manques. Quelques minutes ce soir ?' },
    ],
    en: [
      { title: 'Your companion misses you', body: '2 days without a Checkout. Is everything okay?' },
      { title: 'A little thought for you', body: 'We miss you. A few minutes tonight?' },
    ],
    es: [
      { title: 'Tu compañero te extraña', body: '2 días sin Checkout. ¿Todo bien?' },
      { title: 'Un pequeño pensamiento para ti', body: 'Te echamos de menos. ¿Unos minutos esta noche?' },
    ],
    de: [
      { title: 'Dein Begleiter vermisst dich', body: '2 Tage ohne Checkout. Alles in Ordnung?' },
      { title: 'Ein kleiner Gedanke für dich', body: 'Wir vermissen dich. Ein paar Minuten heute Abend?' },
    ],
    it: [
      { title: 'Il tuo compagno ti manca', body: '2 giorni senza Checkout. Va tutto bene?' },
      { title: 'Un piccolo pensiero per te', body: 'Ci manchi. Qualche minuto stasera?' },
    ],
    pt: [
      { title: 'Seu companheiro sente sua falta', body: '2 dias sem Checkout. Tudo bem?' },
      { title: 'Um pequeno pensamento para você', body: 'Sentimos sua falta. Alguns minutos esta noite?' },
    ],
  },
  streak_7: {
    fr: [
      { title: '7 jours de suite ! 🌟', body: 'Une semaine complète de Checkout. Ton compagnon est fier de toi.' },
      { title: 'Une semaine de constance ✨', body: '7 jours sans interruption. Tu construis quelque chose de solide.' },
    ],
    en: [
      { title: '7 days straight! 🌟', body: 'A full week of Checkout. Your companion is proud of you.' },
      { title: 'A week of consistency ✨', body: '7 days unbroken. You\'re building something solid.' },
    ],
    es: [
      { title: '¡7 días seguidos! 🌟', body: 'Una semana completa de Checkout. Tu compañero está orgulloso de ti.' },
      { title: 'Una semana de constancia ✨', body: '7 días sin interrupción. Estás construyendo algo sólido.' },
    ],
    de: [
      { title: '7 Tage am Stück! 🌟', body: 'Eine ganze Woche Checkout. Dein Begleiter ist stolz auf dich.' },
      { title: 'Eine Woche Beständigkeit ✨', body: '7 Tage ohne Unterbrechung. Du baust etwas Solides auf.' },
    ],
    it: [
      { title: '7 giorni di fila! 🌟', body: 'Una settimana completa di Checkout. Il tuo compagno è orgoglioso di te.' },
      { title: 'Una settimana di costanza ✨', body: '7 giorni senza interruzioni. Stai costruendo qualcosa di solido.' },
    ],
    pt: [
      { title: '7 dias seguidos! 🌟', body: 'Uma semana completa de Checkout. Seu companheiro está orgulhoso de você.' },
      { title: 'Uma semana de constância ✨', body: '7 dias sem interrupção. Você está construindo algo sólido.' },
    ],
  },
  rebound: {
    fr: [
      { title: 'Tu remontes la pente 🌱', body: 'Après quelques jours difficiles, ton humeur remonte. Belle résilience.' },
      { title: 'Le retour de la lumière ✨', body: 'Ton compagnon a remarqué ton regain d\'énergie. Continue !' },
    ],
    en: [
      { title: 'You\'re climbing back up 🌱', body: 'After a few tough days, your mood is rising. Beautiful resilience.' },
      { title: 'The return of the light ✨', body: 'Your companion noticed your renewed energy. Keep going!' },
    ],
    es: [
      { title: 'Estás subiendo de nuevo 🌱', body: 'Después de unos días difíciles, tu estado de ánimo mejora. Bella resiliencia.' },
      { title: 'El regreso de la luz ✨', body: 'Tu compañero notó tu energía renovada. ¡Sigue así!' },
    ],
    de: [
      { title: 'Du kämpfst dich zurück 🌱', body: 'Nach ein paar schwierigen Tagen steigt deine Stimmung. Schöne Resilienz.' },
      { title: 'Die Rückkehr des Lichts ✨', body: 'Dein Begleiter hat deine erneuerte Energie bemerkt. Weiter so!' },
    ],
    it: [
      { title: 'Stai risalendo 🌱', body: 'Dopo qualche giorno difficile, il tuo umore sta migliorando. Bella resilienza.' },
      { title: 'Il ritorno della luce ✨', body: 'Il tuo compagno ha notato la tua energia rinnovata. Continua così!' },
    ],
    pt: [
      { title: 'Você está subindo de volta 🌱', body: 'Após alguns dias difíceis, seu humor está melhorando. Bela resiliência.' },
      { title: 'O retorno da luz ✨', body: 'Seu companheiro notou sua energia renovada. Continue assim!' },
    ],
  },
  anger_repeat: {
    fr: [
      { title: 'La colère revient souvent…', body: 'Lumio l\'a remarqué cette semaine. Et si tu explorais ce qui se passe ?' },
      { title: 'Quelque chose te pèse ?', body: 'La colère répétée cache souvent autre chose. Le Checkout du soir peut aider.' },
    ],
    en: [
      { title: 'Anger keeps returning…', body: 'Lumio noticed it this week. What if you explored what\'s happening?' },
      { title: 'Something weighing on you?', body: 'Repeated anger often hides something else. The evening Checkout can help.' },
    ],
    es: [
      { title: 'La ira regresa a menudo…', body: 'Lumio lo notó esta semana. ¿Y si exploraras lo que está pasando?' },
      { title: '¿Algo te pesa?', body: 'La ira repetida suele esconder otra cosa. El Checkout vespertino puede ayudar.' },
    ],
    de: [
      { title: 'Wut kehrt oft zurück…', body: 'Lumio hat es diese Woche bemerkt. Was wäre, wenn du erforschst, was passiert?' },
      { title: 'Etwas drückt dich?', body: 'Wiederholte Wut verbirgt oft etwas anderes. Der Abend-Checkout kann helfen.' },
    ],
    it: [
      { title: 'La rabbia torna spesso…', body: 'Lumio l\'ha notato questa settimana. E se esplorassi cosa sta succedendo?' },
      { title: 'Qualcosa ti pesa?', body: 'La rabbia ripetuta spesso nasconde qualcos\'altro. Il Checkout serale può aiutare.' },
    ],
    pt: [
      { title: 'A raiva continua voltando…', body: 'Lumio notou isso esta semana. E se você explorasse o que está acontecendo?' },
      { title: 'Algo te pesa?', body: 'A raiva repetida muitas vezes esconde outra coisa. O Checkout noturno pode ajudar.' },
    ],
  },
  alert_threshold: {
    fr: [
      { title: 'Lumio s\'inquiète pour toi 💙', body: 'Cinq jours difficiles de suite. Parler à un professionnel peut vraiment aider.' },
      { title: 'Tu mérites du soutien 💙', body: 'Ces jours pèsent beaucoup. Un accompagnement professionnel peut faire la différence.' },
    ],
    en: [
      { title: 'Lumio is worried about you 💙', body: 'Five difficult days in a row. Talking to a professional can really help.' },
      { title: 'You deserve support 💙', body: 'These days feel very heavy. Professional support can make a difference.' },
    ],
    es: [
      { title: 'Lumio está preocupado por ti 💙', body: 'Cinco días difíciles seguidos. Hablar con un profesional puede realmente ayudar.' },
      { title: 'Mereces apoyo 💙', body: 'Estos días pesan mucho. El apoyo profesional puede marcar la diferencia.' },
    ],
    de: [
      { title: 'Lumio macht sich Sorgen um dich 💙', body: 'Fünf schwierige Tage hintereinander. Mit einem Fachmann zu sprechen kann wirklich helfen.' },
      { title: 'Du verdienst Unterstützung 💙', body: 'Diese Tage lasten sehr schwer. Professionelle Unterstützung kann einen Unterschied machen.' },
    ],
    it: [
      { title: 'Lumio è preoccupato per te 💙', body: 'Cinque giorni difficili di fila. Parlare con un professionista può davvero aiutare.' },
      { title: 'Meriti supporto 💙', body: 'Questi giorni pesano molto. Il supporto professionale può fare la differenza.' },
    ],
    pt: [
      { title: 'Lumio está preocupado com você 💙', body: 'Cinco dias difíceis seguidos. Falar com um profissional pode realmente ajudar.' },
      { title: 'Você merece apoio 💙', body: 'Esses dias pesam muito. O suporte profissional pode fazer a diferença.' },
    ],
  },
}

const TRIGGERS = ['bad_sleep', 'low_mood', 'absence', 'streak_7', 'rebound', 'anger_repeat', 'alert_threshold'] as const
type TriggerType = typeof TRIGGERS[number]

const TRIGGER_FUNCTIONS: Record<TriggerType, string> = {
  bad_sleep: 'pulse_check_bad_sleep',
  low_mood: 'pulse_check_low_mood',
  absence: 'pulse_check_absence',
  streak_7: 'pulse_check_streak',
  rebound: 'pulse_check_rebound',
  anger_repeat: 'pulse_check_anger',
  alert_threshold: 'pulse_check_alert',
}

function pickMessage(trigger: TriggerType, lang: string): { title: string; body: string } {
  const langKey = (['fr','en','es','de','it','pt'].includes(lang) ? lang : 'fr') as Lang
  const pool = MESSAGES[trigger][langKey]
  return pool[Math.floor(Math.random() * pool.length)]
}

// ── FCM HTTP v1 API ───────────────────────────────────────────────────────────

interface FcmServiceAccount {
  project_id: string
  private_key: string
  client_email: string
}

function base64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function getFcmAccessToken(sa: FcmServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const claims = btoa(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

  const sigInput = `${header}.${claims}`
  const pemBody = sa.private_key.replace(/-----[^-]+-----|\s/g, '')
  const keyBuf = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0))

  const key = await crypto.subtle.importKey(
    'pkcs8', keyBuf,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(sigInput))
  const jwt = `${sigInput}.${base64url(sig)}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  })
  const { access_token } = await res.json() as { access_token: string }
  return access_token
}

async function sendFcmNotification(fcmToken: string, title: string, body: string): Promise<void> {
  const saJson = Deno.env.get('FCM_SERVICE_ACCOUNT_JSON')
  if (!saJson || !fcmToken) return

  let sa: FcmServiceAccount
  try {
    sa = JSON.parse(saJson)
  } catch {
    console.error('[pulse] FCM_SERVICE_ACCOUNT_JSON invalide')
    return
  }

  try {
    const accessToken = await getFcmAccessToken(sa)
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: { title, body },
            data: { type: 'pulse' },
          },
        }),
      }
    )
    if (!res.ok) {
      const err = await res.text()
      console.error(`[pulse] FCM error ${res.status}:`, err)
    }
  } catch (err) {
    console.error('[pulse] FCM exception:', err)
  }
}

// ── Secret check ──────────────────────────────────────────────────────────────

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const ab = enc.encode(a)
  const bb = enc.encode(b)
  if (ab.length !== bb.length) return false
  let diff = 0
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i]
  return diff === 0
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const secret = req.headers.get('x-pulse-secret')
  if (!PULSE_SECRET || !timingSafeEqual(secret ?? '', PULSE_SECRET)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const today = new Date().toISOString().slice(0, 10)

  let triggered = 0
  let notifsSent = 0

  for (const trigger of TRIGGERS) {
    const fnName = TRIGGER_FUNCTIONS[trigger]
    const { data: users, error } = await supabase.rpc(fnName)
    if (error || !users) continue

    for (const row of users as { user_id: string }[]) {
      const userId = row.user_id

      const { data: profile } = await supabase
        .from('profiles')
        .select('language, fcm_token')
        .eq('id', userId)
        .single()

      const lang = profile?.language ?? 'fr'
      const fcmToken = profile?.fcm_token ?? null
      const msg = pickMessage(trigger, lang)

      await supabase.from('pulse_log').insert({
        user_id: userId,
        trigger_type: trigger,
        notif_text: msg.body,
      })

      await supabase
        .from('daily_snapshots')
        .update({ pulse_triggered: true, pulse_type: trigger })
        .eq('user_id', userId)
        .eq('date', today)

      if (fcmToken) {
        await sendFcmNotification(fcmToken, msg.title, msg.body)
        notifsSent++
      }

      triggered++
    }
  }

  const { data: scheduled } = await supabase
    .from('scheduled_notifications')
    .select('*')
    .eq('sent', false)
    .lte('send_at', new Date().toISOString())

  if (scheduled) {
    for (const notif of scheduled as { id: string; user_id: string; title: string; body: string }[]) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('fcm_token')
        .eq('id', notif.user_id)
        .single()

      if (profile?.fcm_token) {
        await sendFcmNotification(profile.fcm_token, notif.title, notif.body)
        notifsSent++
      }

      await supabase
        .from('scheduled_notifications')
        .update({ sent: true, sent_at: new Date().toISOString() })
        .eq('id', notif.id)
    }
  }

  return new Response(
    JSON.stringify({ ok: true, triggered, notifsSent }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
