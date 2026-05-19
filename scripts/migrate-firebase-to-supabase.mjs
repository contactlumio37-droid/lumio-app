/**
 * Migration Firebase Auth → Supabase Auth
 *
 * Usage (depuis la racine du projet) :
 *   1. firebase auth:export /tmp/users_export.json --format=json
 *   2. SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-firebase-to-supabase.mjs
 *
 * Variables d'environnement requises :
 *   SUPABASE_URL            → VITE_SUPABASE_URL dans .env
 *   SUPABASE_SERVICE_ROLE_KEY → dans Supabase Dashboard > Settings > API
 *   FIREBASE_EXPORT_PATH    → chemin vers users_export.json (défaut : /tmp/users_export.json)
 *
 * Ce script NE MODIFIE PAS Firebase — lecture seule côté Firebase.
 * Supprime users_export.json après exécution.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, unlinkSync, existsSync } from 'fs'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const EXPORT_PATH  = process.env.FIREBASE_EXPORT_PATH ?? '/tmp/users_export.json'

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis')
  process.exit(1)
}

if (!existsSync(EXPORT_PATH)) {
  console.error(`❌ Fichier export introuvable : ${EXPORT_PATH}`)
  console.error('   Lance d\'abord : firebase auth:export /tmp/users_export.json --format=json')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

function mask(str) {
  if (!str) return '***'
  const [local, domain] = str.split('@')
  return `${local.slice(0, 2)}***@${domain ?? '***'}`
}

async function main() {
  const raw = JSON.parse(readFileSync(EXPORT_PATH, 'utf8'))
  const users = raw.users ?? []

  console.log(`\n📋 ${users.length} compte(s) Firebase trouvé(s)\n`)

  for (const [i, u] of users.entries()) {
    const email  = u.email ?? ''
    const masked = mask(email)
    const providerIds = (u.providerUserInfo ?? []).map(p => p.providerId).join(', ') || 'password'

    console.log(`── User ${i + 1} : ${masked} (${providerIds})`)

    if (!email) {
      console.log('   ⚠️  Pas d\'email — ignoré')
      continue
    }

    // Vérifie si un compte Supabase existe déjà
    const { data: existing } = await supabase.auth.admin.listUsers()
    const found = existing?.users?.find(su => su.email === email)

    if (found) {
      console.log(`   ℹ️  Compte Supabase existant → ${found.id}`)
      await linkProfile(found.id, u.localId, email, u)
      continue
    }

    // Crée le compte Supabase
    const isGoogle = providerIds.includes('google')
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      app_metadata: {
        provider: isGoogle ? 'google' : 'email',
        providers: isGoogle ? ['google'] : ['email'],
      },
      user_metadata: {
        firebase_uid: u.localId,
        full_name: u.displayName ?? '',
        avatar_url: u.photoUrl ?? '',
        email_verified: true,
      },
    })

    if (error || !data?.user) {
      console.error(`   ❌ Erreur création : ${error?.message}`)
      continue
    }

    console.log(`   ✅ Compte Supabase créé → ${data.user.id}`)
    await linkProfile(data.user.id, u.localId, email, u)
  }

  // Supprime le fichier d'export (données sensibles)
  try {
    unlinkSync(EXPORT_PATH)
    console.log('\n🗑️  users_export.json supprimé')
  } catch {}

  console.log('\n✅ Migration terminée.\n')
  console.log('👉 Test : ouvre l\'app → "Continuer avec Google" → ton compte Google')
  console.log('   Les données Supabase existantes seront accessibles si le profil est lié.')
}

async function linkProfile(supabaseUid, firebaseUid, email, u) {
  // Vérifie si un profil existe avec cet uid
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', supabaseUid)
    .single()

  if (existing) {
    console.log(`   🔗 Profil existant mis à jour`)
    return
  }

  // Crée un profil minimal
  const { error } = await supabase.from('profiles').insert({
    id: supabaseUid,
    plan: 'free',
    language: 'fr',
    onboarding_done: false,
  })

  if (error) {
    // Ignore si déjà existant (idempotent)
    if (!error.message.includes('duplicate')) {
      console.error(`   ❌ Erreur profil : ${error.message}`)
    }
  } else {
    console.log(`   📝 Profil Supabase créé`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
