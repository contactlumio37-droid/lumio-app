-- Nettoie les valeurs gender invalides déjà en base.
-- Convertit les anciennes valeurs UI stockées par erreur en valeurs DB valides.
-- Met à NULL tout ce qui n'est pas 'm', 'f', 'n'.
UPDATE public.profiles
SET gender = CASE
  WHEN gender = 'male'   THEN 'm'
  WHEN gender = 'female' THEN 'f'
  WHEN gender = 'nb'     THEN 'n'
  WHEN gender = 'na'     THEN NULL
  WHEN gender NOT IN ('m', 'f', 'n') THEN NULL
  ELSE gender
END
WHERE gender IS DISTINCT FROM CASE
  WHEN gender = 'male'   THEN 'm'
  WHEN gender = 'female' THEN 'f'
  WHEN gender = 'nb'     THEN 'n'
  WHEN gender = 'na'     THEN NULL
  WHEN gender NOT IN ('m', 'f', 'n') THEN NULL
  ELSE gender
END;
