-- Fix RLS policy profiles_update_own pour supporter l'upsert (INSERT OR UPDATE).
-- Cause : les sous-requêtes retournent NULL pour les nouvelles lignes,
-- ce qui fait échouer la comparaison IS NOT DISTINCT FROM.
-- Solution : utiliser COALESCE pour traiter NULL comme "valeur par défaut acceptable".
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Protège plan et revenuecat_id contre les modifications client
    -- COALESCE gère le cas "nouvelle ligne" où la sous-requête retourne NULL
    AND plan IS NOT DISTINCT FROM
        COALESCE(
          (SELECT plan FROM public.profiles WHERE id = auth.uid()),
          'free'  -- valeur par défaut si ligne inexistante
        )
    AND revenuecat_id IS NOT DISTINCT FROM
        (SELECT revenuecat_id FROM public.profiles WHERE id = auth.uid())
    AND is_admin IS NOT DISTINCT FROM
        COALESCE(
          (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
          false  -- valeur par défaut si ligne inexistante
        )
    -- Freemium : limite JSONB (seulement si la colonne change réellement)
    AND (
      COALESCE(
        (SELECT plan FROM public.profiles WHERE id = auth.uid()),
        'free'
      ) = 'plus'
      OR (
        (trackers = COALESCE(
            (SELECT trackers FROM public.profiles WHERE id = auth.uid()),
            '[]'::jsonb)
          OR jsonb_array_length(COALESCE(trackers, '[]'::jsonb)) <= 3)
        AND
        (objectives = COALESCE(
            (SELECT objectives FROM public.profiles WHERE id = auth.uid()),
            '[]'::jsonb)
          OR jsonb_array_length(COALESCE(objectives, '[]'::jsonb)) <= 2)
        AND
        (journal_entries = COALESCE(
            (SELECT journal_entries FROM public.profiles WHERE id = auth.uid()),
            '[]'::jsonb)
          OR jsonb_array_length(COALESCE(journal_entries, '[]'::jsonb)) <= 5)
      )
    )
  );
