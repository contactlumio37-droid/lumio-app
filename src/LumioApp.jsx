import { useState, useRef, useCallback, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { db } from "./firebase";
import { doc, setDoc, collection, addDoc, getDocs, updateDoc, deleteDoc, query, orderBy, where, serverTimestamp } from "firebase/firestore";

// ─── i18n ─────────────────────────────────────────────────────────────────────
const I18N = {
  fr: {
    months: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
    monthsShort: ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"],
    days: "DLMMJVS".split(""),
    greet: h => h<12?"Bonjour":h<18?"Bon après-midi":"Bonsoir",
    moods: {ok:"OK",tired:"Fatigué",sad:"Triste",stress:"Stress",angry:"Colère",sick:"Malade"},
    nav: {home:"Accueil",entry:"Saisie",track:"Suivi",journal:"Décharge",settings:"Réglages"},
    save:"Enregistrer", saved:"✓ Enregistré !",
    today:"Aujourd'hui", clickToEdit:"Appuie sur un jour pour modifier ✏",
    mood:"Humeur", moodHint:"matin · après-midi",
    indicators:"Indicateurs", manage:"⚙ Gérer",
    catalogue:"Catalogue", customTracker:"Tracker personnalisé", createTracker:"+ Créer un tracker",
    joys:"☀️ Petits bonheurs", joysPlaceholder:"Un moment, une sensation…",
    note:"Note libre", notePlaceholder:"Quelque chose à noter…",
    objectives:"Objectifs", addObj:"+ Ajouter", noObj:"Aucun objectif pour l'instant",
    createFirstObj:"Créer mon premier objectif",
    objTitle:"Titre", objType:"Type de suivi", objUnit:"Unité", objTarget:"Cible", objStart:"Départ",
    objChecklist:"☑ Cases", objDated:"📈 Valeur", objCounter:"🔢 Compteur",
    addItem:"+ Élément", cancel:"Annuler", create:"Créer", add:"Ajouter",
    weekMoods:"🌈 7 derniers jours", streaks:"🔥 Séries",
    sportDays:"jours sport", filledDays:"jours remplis",
    insight:"✦ Insight IA", insightText:(name,n)=>`${name}, ${n} jour${n>1?"s":""} de sport consécutifs. Tes nuits semblent meilleures ces jours-là. Continue 💪`,
    month:"📅 Mois", year:"🗓 Année",
    states:"🟩 États", curves:"📈 Courbes",
    selectData:"Données à afficher", noTrackers:"Aucun indicateur actif. Active-en dans Saisie.",
    journal:"💭 Décharge", journalMode:"📖 Journal", streamMode:"· Flux",
    deposit:"Déposer ✦", depositPlaceholder:"Dépose ce que tu portes…",
    edit:"✏ Modifier", savEdit:"✓ Sauvegarder",
    settings:"Paramètres", theme:"Thème", accentColor:"Couleur d'accent",
    language:"Langue", gender:"Genre", notifications:"🔔 Notifications",
    dailyReminder:"Rappel quotidien", time:"Heure",
    roadmap:"🗺 Roadmap", feedback:"💬 Feedback",
    voteHint:"Vote pour les fonctionnalités qui t'intéressent 👇",
    bugType:"🐛 Bug", ideaType:"💡 Suggestion", bugPlaceholder:"Décris le problème…",
    ideaPlaceholder:"Quelle fonctionnalité aimerais-tu voir ?",
    send:"Envoyer", sent:"✓ Envoyé ! Merci 🙏",
    general:"⚙ Général",
    customizeMoods:"🎭 Personnaliser mes humeurs",
    addMood:"+ Ajouter une humeur", moodLabel:"Label", moodColor:"Couleur",
    yes:"Oui", no:"Non",
    themeDark:"Sombre", themeLight:"Clair", themeWarm:"Chaud",
    maleG:"Homme", femaleG:"Femme", nbG:"Non-binaire", noG:"Ne pas préciser",
    widgets:"Widgets",
    adMsg:"Publicité · ", adUpgrade:"Plus de pub → 6€/mois",
    revenuecat:"Tarifs gérés dans RevenueCat",
    plan:"Plan", free:"Gratuit", premium:"Lumio+",
    logout:"Déconnexion",
  },
  en: {
    months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    monthsShort: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    days: "SMTWTFS".split(""),
    greet: h => h<12?"Good morning":h<18?"Good afternoon":"Good evening",
    moods: {ok:"OK",tired:"Tired",sad:"Sad",stress:"Stress",angry:"Angry",sick:"Sick"},
    nav: {home:"Home",entry:"Today",track:"Track",journal:"Journal",settings:"Settings"},
    save:"Save", saved:"✓ Saved!",
    today:"Today", clickToEdit:"Tap a day to edit ✏",
    mood:"Mood", moodHint:"morning · afternoon",
    indicators:"Indicators", manage:"⚙ Manage",
    catalogue:"Catalogue", customTracker:"Custom tracker", createTracker:"+ Create tracker",
    joys:"☀️ Today's joys", joysPlaceholder:"A moment, a feeling…",
    note:"Free note", notePlaceholder:"Something to note…",
    objectives:"Goals", addObj:"+ Add", noObj:"No goals yet",
    createFirstObj:"Create my first goal",
    objTitle:"Title", objType:"Tracking type", objUnit:"Unit", objTarget:"Target", objStart:"Start",
    objChecklist:"☑ Checklist", objDated:"📈 Value", objCounter:"🔢 Counter",
    addItem:"+ Add item", cancel:"Cancel", create:"Create", add:"Add",
    weekMoods:"🌈 Last 7 days", streaks:"🔥 Streaks",
    sportDays:"sport days", filledDays:"days filled",
    insight:"✦ AI Insight", insightText:(name,n)=>`${name}, ${n} consecutive sport day${n>1?"s":""}. Your sleep seems better on those days. Keep it up 💪`,
    month:"📅 Month", year:"🗓 Year",
    states:"🟩 States", curves:"📈 Curves",
    selectData:"Data to display", noTrackers:"No active indicators. Add some in Today.",
    journal:"💭 Journal", journalMode:"📖 Journal", streamMode:"· Stream",
    deposit:"Write ✦", depositPlaceholder:"Drop what you're carrying…",
    edit:"✏ Edit", savEdit:"✓ Save",
    settings:"Settings", theme:"Theme", accentColor:"Accent color",
    language:"Language", gender:"Gender", notifications:"🔔 Notifications",
    dailyReminder:"Daily reminder", time:"Time",
    roadmap:"🗺 Roadmap", feedback:"💬 Feedback",
    voteHint:"Vote for the features you want most 👇",
    bugType:"🐛 Bug", ideaType:"💡 Suggestion", bugPlaceholder:"Describe the issue…",
    ideaPlaceholder:"What feature would you like to see?",
    send:"Send", sent:"✓ Sent! Thank you 🙏",
    general:"⚙ General",
    customizeMoods:"🎭 Customize my moods",
    addMood:"+ Add mood", moodLabel:"Label", moodColor:"Color",
    yes:"Yes", no:"No",
    themeDark:"Dark", themeLight:"Light", themeWarm:"Warm",
    maleG:"Male", femaleG:"Female", nbG:"Non-binary", noG:"Prefer not to say",
    widgets:"Widgets",
    adMsg:"Advertisement · ", adUpgrade:"No more ads → €6/month",
    revenuecat:"Pricing managed in RevenueCat",
    plan:"Plan", free:"Free", premium:"Lumio+",
    logout:"Logout",
  },
  es: {
    months: ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
    monthsShort: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
    days: "DLMMJVS".split(""),
    greet: h => h<12?"Buenos días":h<18?"Buenas tardes":"Buenas noches",
    moods: {ok:"OK",tired:"Cansado",sad:"Triste",stress:"Estrés",angry:"Enfado",sick:"Enfermo"},
    nav: {home:"Inicio",entry:"Hoy",track:"Seguim.",journal:"Diario",settings:"Ajustes"},
    save:"Guardar", saved:"✓ ¡Guardado!",
    today:"Hoy", clickToEdit:"Toca un día para editar ✏",
    mood:"Humor", moodHint:"mañana · tarde",
    indicators:"Indicadores", manage:"⚙ Gestionar",
    catalogue:"Catálogo", customTracker:"Indicador personalizado", createTracker:"+ Crear indicador",
    joys:"☀️ Pequeñas alegrías", joysPlaceholder:"Un momento, una sensación…",
    note:"Nota libre", notePlaceholder:"Algo que anotar…",
    objectives:"Objetivos", addObj:"+ Añadir", noObj:"Sin objetivos por ahora",
    createFirstObj:"Crear mi primer objetivo",
    objTitle:"Título", objType:"Tipo de seguimiento", objUnit:"Unidad", objTarget:"Meta", objStart:"Inicio",
    objChecklist:"☑ Lista", objDated:"📈 Valor", objCounter:"🔢 Contador",
    addItem:"+ Añadir elemento", cancel:"Cancelar", create:"Crear", add:"Añadir",
    weekMoods:"🌈 Últimos 7 días", streaks:"🔥 Rachas",
    sportDays:"días de deporte", filledDays:"días registrados",
    insight:"✦ Insight IA", insightText:(name,n)=>`${name}, ${n} día${n>1?"s":""} de deporte seguidos. ¡Sigue así! 💪`,
    month:"📅 Mes", year:"🗓 Año",
    states:"🟩 Estados", curves:"📈 Curvas",
    selectData:"Datos a mostrar", noTrackers:"Sin indicadores activos.",
    journal:"💭 Diario", journalMode:"📖 Diario", streamMode:"· Flujo",
    deposit:"Escribir ✦", depositPlaceholder:"Suelta lo que llevas…",
    edit:"✏ Editar", savEdit:"✓ Guardar",
    settings:"Ajustes", theme:"Tema", accentColor:"Color de acento",
    language:"Idioma", gender:"Género", notifications:"🔔 Notificaciones",
    dailyReminder:"Recordatorio diario", time:"Hora",
    roadmap:"🗺 Hoja de ruta", feedback:"💬 Opiniones",
    voteHint:"Vota por las funciones que más quieres 👇",
    bugType:"🐛 Error", ideaType:"💡 Sugerencia", bugPlaceholder:"Describe el problema…",
    ideaPlaceholder:"¿Qué función te gustaría ver?",
    send:"Enviar", sent:"✓ ¡Enviado! Gracias 🙏",
    general:"⚙ General",
    customizeMoods:"🎭 Personalizar mis estados",
    addMood:"+ Añadir estado", moodLabel:"Etiqueta", moodColor:"Color",
    yes:"Sí", no:"No",
    themeDark:"Oscuro", themeLight:"Claro", themeWarm:"Cálido",
    maleG:"Hombre", femaleG:"Mujer", nbG:"No binario", noG:"Prefiero no decir",
    widgets:"Widgets",
    adMsg:"Publicidad · ", adUpgrade:"Sin anuncios → 6€/mes",
    revenuecat:"Precios gestionados en RevenueCat",
    plan:"Plan", free:"Gratis", premium:"Lumio+",
    logout:"Cerrar sesión",
  },
  de: {
    months: ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
    monthsShort: ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],
    days: "SMDMFSS".split(""),
    greet: h => h<12?"Guten Morgen":h<18?"Guten Tag":"Guten Abend",
    moods: {ok:"OK",tired:"Müde",sad:"Traurig",stress:"Stress",angry:"Wütend",sick:"Krank"},
    nav: {home:"Start",entry:"Heute",track:"Verlauf",journal:"Tagebuch",settings:"Einst."},
    save:"Speichern", saved:"✓ Gespeichert!",
    today:"Heute", clickToEdit:"Tag antippen zum Bearbeiten ✏",
    mood:"Stimmung", moodHint:"morgens · nachmittags",
    indicators:"Indikatoren", manage:"⚙ Verwalten",
    catalogue:"Katalog", customTracker:"Eigener Tracker", createTracker:"+ Tracker erstellen",
    joys:"☀️ Kleine Freuden", joysPlaceholder:"Ein Moment, ein Gefühl…",
    note:"Freie Notiz", notePlaceholder:"Etwas zu notieren…",
    objectives:"Ziele", addObj:"+ Hinzufügen", noObj:"Noch keine Ziele",
    createFirstObj:"Mein erstes Ziel erstellen",
    objTitle:"Titel", objType:"Tracking-Typ", objUnit:"Einheit", objTarget:"Ziel", objStart:"Start",
    objChecklist:"☑ Checkliste", objDated:"📈 Wert", objCounter:"🔢 Zähler",
    addItem:"+ Element", cancel:"Abbrechen", create:"Erstellen", add:"Hinzufügen",
    weekMoods:"🌈 Letzte 7 Tage", streaks:"🔥 Serien",
    sportDays:"Sport-Tage", filledDays:"ausgefüllte Tage",
    insight:"✦ KI-Einblick", insightText:(name,n)=>`${name}, ${n} Sport-Tag${n>1?"e":""} in Folge. Weiter so 💪`,
    month:"📅 Monat", year:"🗓 Jahr",
    states:"🟩 Zustände", curves:"📈 Kurven",
    selectData:"Anzuzeigende Daten", noTrackers:"Keine aktiven Indikatoren.",
    journal:"💭 Tagebuch", journalMode:"📖 Tagebuch", streamMode:"· Stream",
    deposit:"Schreiben ✦", depositPlaceholder:"Lass los, was du trägst…",
    edit:"✏ Bearbeiten", savEdit:"✓ Speichern",
    settings:"Einstellungen", theme:"Thema", accentColor:"Akzentfarbe",
    language:"Sprache", gender:"Geschlecht", notifications:"🔔 Benachrichtigungen",
    dailyReminder:"Tägliche Erinnerung", time:"Uhrzeit",
    roadmap:"🗺 Roadmap", feedback:"💬 Feedback",
    voteHint:"Stimme für die Funktionen ab, die du am meisten willst 👇",
    bugType:"🐛 Fehler", ideaType:"💡 Vorschlag", bugPlaceholder:"Beschreibe das Problem…",
    ideaPlaceholder:"Welche Funktion möchtest du sehen?",
    send:"Senden", sent:"✓ Gesendet! Danke 🙏",
    general:"⚙ Allgemein",
    customizeMoods:"🎭 Stimmungen anpassen",
    addMood:"+ Stimmung hinzufügen", moodLabel:"Bezeichnung", moodColor:"Farbe",
    yes:"Ja", no:"Nein",
    themeDark:"Dunkel", themeLight:"Hell", themeWarm:"Warm",
    maleG:"Männlich", femaleG:"Weiblich", nbG:"Nicht-binär", noG:"Keine Angabe",
    widgets:"Widgets",
    adMsg:"Werbung · ", adUpgrade:"Keine Werbung → 6€/Monat",
    revenuecat:"Preise in RevenueCat verwaltet",
    plan:"Tarif", free:"Kostenlos", premium:"Lumio+",
    logout:"Abmelden",
  },
  it: {
    months: ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"],
    monthsShort: ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"],
    days: "DLMMGVS".split(""),
    greet: h => h<12?"Buongiorno":h<18?"Buon pomeriggio":"Buonasera",
    moods: {ok:"OK",tired:"Stanco",sad:"Triste",stress:"Stress",angry:"Arrabbiato",sick:"Malato"},
    nav: {home:"Home",entry:"Oggi",track:"Traccia",journal:"Diario",settings:"Impost."},
    save:"Salva", saved:"✓ Salvato!",
    today:"Oggi", clickToEdit:"Tocca un giorno per modificare ✏",
    mood:"Umore", moodHint:"mattina · pomeriggio",
    indicators:"Indicatori", manage:"⚙ Gestisci",
    catalogue:"Catalogo", customTracker:"Indicatore personalizzato", createTracker:"+ Crea indicatore",
    joys:"☀️ Piccole gioie", joysPlaceholder:"Un momento, una sensazione…",
    note:"Nota libera", notePlaceholder:"Qualcosa da annotare…",
    objectives:"Obiettivi", addObj:"+ Aggiungere", noObj:"Nessun obiettivo",
    createFirstObj:"Crea il mio primo obiettivo",
    objTitle:"Titolo", objType:"Tipo di monitoraggio", objUnit:"Unità", objTarget:"Obiettivo", objStart:"Inizio",
    objChecklist:"☑ Lista", objDated:"📈 Valore", objCounter:"🔢 Contatore",
    addItem:"+ Aggiungi elemento", cancel:"Annulla", create:"Crea", add:"Aggiungi",
    weekMoods:"🌈 Ultimi 7 giorni", streaks:"🔥 Serie",
    sportDays:"giorni sport", filledDays:"giorni registrati",
    insight:"✦ Insight IA", insightText:(name,n)=>`${name}, ${n} giorno${n>1?"i":""} di sport. Continua 💪`,
    month:"📅 Mese", year:"🗓 Anno",
    states:"🟩 Stati", curves:"📈 Curve",
    selectData:"Dati da visualizzare", noTrackers:"Nessun indicatore attivo.",
    journal:"💭 Diario", journalMode:"📖 Diario", streamMode:"· Flusso",
    deposit:"Scrivere ✦", depositPlaceholder:"Lascia andare quello che porti…",
    edit:"✏ Modifica", savEdit:"✓ Salva",
    settings:"Impostazioni", theme:"Tema", accentColor:"Colore principale",
    language:"Lingua", gender:"Genere", notifications:"🔔 Notifiche",
    dailyReminder:"Promemoria giornaliero", time:"Ora",
    roadmap:"🗺 Roadmap", feedback:"💬 Feedback",
    voteHint:"Vota per le funzioni che vuoi di più 👇",
    bugType:"🐛 Bug", ideaType:"💡 Suggerimento", bugPlaceholder:"Descrivi il problema…",
    ideaPlaceholder:"Quale funzione vorresti vedere?",
    send:"Invia", sent:"✓ Inviato! Grazie 🙏",
    general:"⚙ Generale",
    customizeMoods:"🎭 Personalizza i miei stati d'animo",
    addMood:"+ Aggiungi stato", moodLabel:"Etichetta", moodColor:"Colore",
    yes:"Sì", no:"No",
    themeDark:"Scuro", themeLight:"Chiaro", themeWarm:"Caldo",
    maleG:"Uomo", femaleG:"Donna", nbG:"Non binario", noG:"Preferisco non dire",
    widgets:"Widget",
    adMsg:"Pubblicità · ", adUpgrade:"Niente pubblicità → 6€/mese",
    revenuecat:"Prezzi gestiti in RevenueCat",
    plan:"Piano", free:"Gratuito", premium:"Lumio+",
    logout:"Esci",
  },
  pt: {
    months: ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
    monthsShort: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
    days: "DSTQQSS".split(""),
    greet: h => h<12?"Bom dia":h<18?"Boa tarde":"Boa noite",
    moods: {ok:"OK",tired:"Cansado",sad:"Triste",stress:"Estresse",angry:"Raiva",sick:"Doente"},
    nav: {home:"Início",entry:"Hoje",track:"Registro",journal:"Diário",settings:"Config."},
    save:"Salvar", saved:"✓ Salvo!",
    today:"Hoje", clickToEdit:"Toque num dia para editar ✏",
    mood:"Humor", moodHint:"manhã · tarde",
    indicators:"Indicadores", manage:"⚙ Gerenciar",
    catalogue:"Catálogo", customTracker:"Indicador personalizado", createTracker:"+ Criar indicador",
    joys:"☀️ Pequenas alegrias", joysPlaceholder:"Um momento, uma sensação…",
    note:"Nota livre", notePlaceholder:"Algo a anotar…",
    objectives:"Objetivos", addObj:"+ Adicionar", noObj:"Nenhum objetivo ainda",
    createFirstObj:"Criar meu primeiro objetivo",
    objTitle:"Título", objType:"Tipo de acompanhamento", objUnit:"Unidade", objTarget:"Meta", objStart:"Início",
    objChecklist:"☑ Lista", objDated:"📈 Valor", objCounter:"🔢 Contador",
    addItem:"+ Adicionar item", cancel:"Cancelar", create:"Criar", add:"Adicionar",
    weekMoods:"🌈 Últimos 7 dias", streaks:"🔥 Sequências",
    sportDays:"dias de esporte", filledDays:"dias preenchidos",
    insight:"✦ Insight IA", insightText:(name,n)=>`${name}, ${n} dia${n>1?"s":""} seguidos de esporte. Continue 💪`,
    month:"📅 Mês", year:"🗓 Ano",
    states:"🟩 Estados", curves:"📈 Curvas",
    selectData:"Dados a exibir", noTrackers:"Nenhum indicador ativo.",
    journal:"💭 Diário", journalMode:"📖 Diário", streamMode:"· Fluxo",
    deposit:"Escrever ✦", depositPlaceholder:"Solte o que você carrega…",
    edit:"✏ Editar", savEdit:"✓ Salvar",
    settings:"Configurações", theme:"Tema", accentColor:"Cor de destaque",
    language:"Idioma", gender:"Gênero", notifications:"🔔 Notificações",
    dailyReminder:"Lembrete diário", time:"Hora",
    roadmap:"🗺 Roadmap", feedback:"💬 Feedback",
    voteHint:"Vote nas funcionalidades que você mais quer 👇",
    bugType:"🐛 Bug", ideaType:"💡 Sugestão", bugPlaceholder:"Descreva o problema…",
    ideaPlaceholder:"Qual funcionalidade você gostaria de ver?",
    send:"Enviar", sent:"✓ Enviado! Obrigado 🙏",
    general:"⚙ Geral",
    customizeMoods:"🎭 Personalizar meus humores",
    addMood:"+ Adicionar humor", moodLabel:"Rótulo", moodColor:"Cor",
    yes:"Sim", no:"Não",
    themeDark:"Escuro", themeLight:"Claro", themeWarm:"Quente",
    maleG:"Masculino", femaleG:"Feminino", nbG:"Não-binário", noG:"Prefiro não dizer",
    widgets:"Widgets",
    adMsg:"Publicidade · ", adUpgrade:"Sem anúncios → R$15/mês",
    revenuecat:"Preços gerenciados no RevenueCat",
    plan:"Plano", free:"Grátis", premium:"Lumio+",
    logout:"Sair",
  },
};

// ─── THEME SYSTEM ─────────────────────────────────────────────────────────────
const THEMES = {
  dark:  { name:"Sombre", icon:"🌙", bg:"#0d0d1a", bg2:"rgba(255,255,255,0.045)", bg3:"rgba(255,255,255,0.07)", border:"rgba(255,255,255,0.08)", border2:"rgba(255,255,255,0.13)", text:"#ffffff", text2:"rgba(255,255,255,0.65)", text3:"rgba(255,255,255,0.35)", navBg:"rgba(13,13,26,0.97)", inputBg:"rgba(255,255,255,0.07)", label:"rgba(255,255,255,0.35)", pillBg:"rgba(255,255,255,0.06)" },
  light: { name:"Clair",  icon:"☀️", bg:"#f4f6fb", bg2:"#ffffff", bg3:"#eef1f8", border:"rgba(0,0,0,0.08)", border2:"rgba(0,0,0,0.15)", text:"#1a1a2e", text2:"#4a4a6a", text3:"#9090a8", navBg:"rgba(244,246,251,0.97)", inputBg:"#ffffff", label:"#9090a8", pillBg:"rgba(0,0,0,0.05)" },
  warm:  { name:"Chaud",  icon:"🌅", bg:"#fdf6ee", bg2:"#fffaf4", bg3:"#f5ece0", border:"rgba(160,100,50,0.12)", border2:"rgba(160,100,50,0.22)", text:"#2d1f0e", text2:"#7a5c3a", text3:"#b09070", navBg:"rgba(253,246,238,0.97)", inputBg:"#fffaf4", label:"#b09070", pillBg:"rgba(160,100,50,0.07)" },
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const APP_VERSION = "v0.8";
const NOW = new Date(), CUR_M = NOW.getMonth(), CUR_Y = NOW.getFullYear(), TODAY = NOW.getDate();
const LANG_FLAGS = [{code:"fr",flag:"🇫🇷",label:"Français"},{code:"en",flag:"🇬🇧",label:"English"},{code:"es",flag:"🇪🇸",label:"Español"},{code:"de",flag:"🇩🇪",label:"Deutsch"},{code:"it",flag:"🇮🇹",label:"Italiano"},{code:"pt",flag:"🇧🇷",label:"Português"}];
const DEFAULT_MOODS = [
  {id:"ok",    color:"#4ADE80"},
  {id:"tired", color:"#FACC15"},
  {id:"sad",   color:"#60A5FA"},
  {id:"stress",color:"#A78BFA"},
  {id:"angry", color:"#F87171"},
  {id:"sick",  color:"#F472B6"},
];
const TRACKER_CATALOGUE = [
  {id:"sleep",     label:"Sommeil",            icon:"🌙",type:"scale3", color:"#7C9EFF"},
  {id:"sport",     label:"Sport",              icon:"🏃",type:"bool",   color:"#4ADE80"},
  {id:"emotion",   label:"Charge émotionnelle",icon:"🧠",type:"scale3", color:"#F472B6"},
  {id:"meditation",label:"Méditation",         icon:"🧘",type:"bool",   color:"#A78BFA"},
  {id:"reading",   label:"Lecture",            icon:"📖",type:"bool",   color:"#FBBF24"},
  {id:"hydration", label:"Hydratation",        icon:"💧",type:"scale3", color:"#60A5FA"},
  {id:"pain",      label:"Douleur",            icon:"🩹",type:"scale3", color:"#FB923C"},
  {id:"food",      label:"Alimentation",       icon:"🥗",type:"scale3", color:"#34D399"},
];
const INIT_ROADMAP = [
  {id:1,title:"Suivi cycle menstruel",desc:"Module Luna pour femmes et personnes NB",status:"building",votes:0},
  {id:2,title:"Forum communautaire",desc:"Partage et échanges entre utilisateurs",status:"soon",votes:0},
  {id:3,title:"Mode Couple",desc:"Objectifs partagés et to-do commune",status:"later",votes:0},
  {id:4,title:"Insights IA avancés",desc:"Corrélations et patterns personnalisés",status:"building",votes:0},
];

const dIM = (m,y) => new Date(y,m+1,0).getDate();
const fDOM = (m,y) => new Date(y,m,1).getDay();
const getMoodObj = (id, moods) => moods.find(m=>m.id===id);

function fmtDate(d,m,y,lang){
  const t=I18N[lang]||I18N.fr;
  const wd=new Date(y,m,d).getDay();
  const wdNames={fr:["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],en:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],es:["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"],de:["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],it:["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"],pt:["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"]};
  return `${(wdNames[lang]||wdNames.fr)[wd]} ${d} ${t.months[m]} ${y}`;
}

function seedMonth(mi,y){
  const days=dIM(mi,y),ids=DEFAULT_MOODS.map(m=>m.id),out={};
  for(let d=1;d<=days;d++){
    if(Math.random()<.1)continue;
    out[d]={mood1:ids[Math.floor(Math.random()*ids.length)],mood2:Math.random()>.7?ids[Math.floor(Math.random()*ids.length)]:null,
      trackers:{sleep:Math.floor(Math.random()*4),sport:Math.random()>.5,emotion:Math.floor(Math.random()*4),hydration:Math.floor(Math.random()*4)},
      joys:[],note:""};
  }
  return out;
}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
const Card = ({children,style={},th}) => <div style={{background:th.bg2,borderRadius:16,padding:16,border:`1px solid ${th.border}`,...style}}>{children}</div>;
const SLabel = ({children,th}) => <div style={{fontSize:10,color:th.label,textTransform:"uppercase",letterSpacing:1.2,fontWeight:700,marginBottom:8}}>{children}</div>;
const Pill = ({children,active,color,onClick,small,th}) => (
  <button onClick={onClick} style={{padding:small?"4px 10px":"6px 13px",borderRadius:20,border:`2px solid ${active?color:"transparent"}`,background:active?color+"22":th.pillBg,color:active?color:th.text3,cursor:"pointer",fontSize:small?11:12,fontWeight:active?700:400,fontFamily:"inherit",transition:"all .15s"}}>{children}</button>
);
const Btn = ({children,onClick,color,outline,full,small,disabled,style={},th}) => {
  const c=color||"#7C9EFF";
  return <button onClick={onClick} disabled={disabled} style={{width:full?"100%":"auto",padding:small?"8px 14px":"12px 18px",background:outline?"transparent":disabled?th.bg3:c,border:outline?`1.5px solid ${c}44`:"none",borderRadius:12,color:outline?c:disabled?th.text3:"#fff",fontWeight:700,fontSize:small?12:14,cursor:disabled?"default":"pointer",fontFamily:"inherit",transition:"all .2s",...style}}>{children}</button>;
};
const TInput = ({value,onChange,placeholder,type="text",th,style={}}) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{width:"100%",background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:12,padding:"10px 14px",color:th.text,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",...style}}/>
);
const Toggle = ({value,onChange,accent}) => (
  <button onClick={()=>onChange(!value)} style={{width:44,height:26,borderRadius:99,border:"none",cursor:"pointer",position:"relative",background:value?accent:"rgba(128,128,128,0.3)",transition:"background .2s",flexShrink:0}}>
    <div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:value?21:3,transition:"left .2s"}}/>
  </button>
);
const ToggleBar = ({options,value,onChange,accent,small,th}) => (
  <div style={{display:"flex",background:th.bg3,borderRadius:12,padding:3}}>
    {options.map(([v,l])=><button key={v} onClick={()=>onChange(v)} style={{flex:1,padding:small?"4px 0":"6px 0",borderRadius:10,border:"none",cursor:"pointer",background:value===v?(accent||"#7C9EFF"):"transparent",color:value===v?"#fff":th.text3,fontSize:small?11:12,fontFamily:"inherit",fontWeight:700,transition:"all .2s"}}>{l}</button>)}
  </div>
);

function MoodCell({mood1,mood2,size=28,th,moods}){
  const allMoods=moods||DEFAULT_MOODS;
  const m1=getMoodObj(mood1,allMoods),m2=mood2?getMoodObj(mood2,allMoods):null;
  return <div style={{width:size,height:size,borderRadius:size*.25,overflow:"hidden",background:m1?"transparent":th?th.bg3:"rgba(128,128,128,0.15)",border:`1px solid ${th?th.border:"rgba(128,128,128,0.2)"}`,display:"flex",flexDirection:"column",flexShrink:0}}>
    {m1&&<div style={{flex:1,background:m1.color}}/>}
    {m2&&<div style={{flex:1,background:m2.color}}/>}
  </div>;
}

function Scale3({value,onChange,color}){
  return <div style={{display:"flex",gap:6}}>
    {["😶","😕","🙂","😄"].map((e,v)=>(
      <button key={v} onClick={()=>onChange(value===v?null:v)} style={{flex:1,padding:"8px 4px",borderRadius:10,fontSize:18,background:value===v?color+"33":"rgba(128,128,128,0.1)",border:`2px solid ${value===v?color:"transparent"}`,cursor:"pointer",transition:"all .15s"}}>{e}</button>
    ))}
  </div>;
}

// ─── MOOD MODAL ───────────────────────────────────────────────────────────────
function MoodModal({moods,setMoods,lang,accent,th,onClose}){
  const t=I18N[lang]||I18N.fr;
  const [newLabel,setNewLabel]=useState("");
  const [newColor,setNewColor]=useState("#7C9EFF");
  const PRESET_COLORS=["#4ADE80","#FACC15","#60A5FA","#A78BFA","#F87171","#F472B6","#FB923C","#34D399","#E879F9","#2DD4BF"];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:440,background:th.bg,borderRadius:"20px 20px 0 0",maxHeight:"80vh",overflowY:"auto",border:`1px solid ${th.border2}`}}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}><div style={{width:36,height:4,borderRadius:99,background:th.border2}}/></div>
        <div style={{padding:"0 16px 24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontWeight:800,fontSize:16,color:th.text}}>{t.customizeMoods}</div>
            <button onClick={onClose} style={{background:"none",border:"none",color:th.text3,cursor:"pointer",fontSize:22}}>×</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {moods.map((m,i)=>(
              <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:th.bg2,borderRadius:12,border:`1px solid ${th.border}`}}>
                <div style={{width:20,height:20,borderRadius:5,background:m.color,flexShrink:0}}/>
                <span style={{flex:1,fontSize:13,fontWeight:600,color:th.text}}>{m.label}</span>
                {moods.length>2&&<button onClick={()=>setMoods(ms=>ms.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:th.text3,cursor:"pointer",fontSize:16,padding:"0 4px"}}>×</button>}
              </div>
            ))}
          </div>
          <div style={{background:th.bg3,borderRadius:12,padding:12,border:`1px solid ${th.border}`}}>
            <div style={{fontSize:11,color:th.text3,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>{t.addMood}</div>
            <TInput th={th} value={newLabel} onChange={setNewLabel} placeholder={t.moodLabel} style={{marginBottom:10}}/>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {PRESET_COLORS.map(c=>(
                <button key={c} onClick={()=>setNewColor(c)} style={{width:26,height:26,borderRadius:6,background:c,border:newColor===c?"3px solid "+th.text:"2px solid transparent",cursor:"pointer",transition:"all .15s"}}/>
              ))}
              <input type="color" value={newColor} onChange={e=>setNewColor(e.target.value)} style={{width:26,height:26,borderRadius:6,border:`2px solid ${th.border2}`,cursor:"pointer",background:"none"}}/>
            </div>
            <Btn th={th} onClick={()=>{if(newLabel.trim()){setMoods(ms=>[...ms,{id:"custom_"+Date.now(),label:newLabel.trim(),color:newColor}]);setNewLabel("");}}} color={accent} full small disabled={!newLabel.trim()}>{t.addMood}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AD POPUP ─────────────────────────────────────────────────────────────────
function AdPopup({onClose,onUpgrade,accent,th,t}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:600,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 16px 20px"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:440,background:th.bg2,borderRadius:20,padding:24,border:`1px solid ${th.border2}`,boxShadow:"0 -4px 40px rgba(0,0,0,0.3)"}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:28,marginBottom:8}}>📢</div>
          <div style={{fontSize:11,color:th.text3,marginBottom:12}}>{t.adMsg} Espace réservé partenaire</div>
          <div style={{background:th.bg3,borderRadius:12,padding:"14px 16px",border:`1px solid ${th.border}`,marginBottom:16}}>
            <div style={{fontSize:13,color:th.text2,lineHeight:1.6,fontStyle:"italic"}}>Ici apparaîtra une publicité de nos partenaires sélectionnés.</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:12,background:th.bg3,border:`1px solid ${th.border}`,borderRadius:12,color:th.text2,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>Fermer</button>
          <button onClick={onUpgrade} style={{flex:1,padding:12,background:accent,border:"none",borderRadius:12,color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>✦ {t.adUpgrade}</button>
        </div>
      </div>
    </div>
  );
}

// ─── RICH EDITOR ──────────────────────────────────────────────────────────────
function RichEditor({value,onChange,placeholder,minHeight=120,accent,th}){
  const ref=useRef();
  const [showEmoji,setShowEmoji]=useState(false);
  const [showHL,setShowHL]=useState(false);
  const ac=accent||"#7C9EFF";
  const EMOJIS=["😊","😢","😤","😴","🥰","😰","🤒","💪","✨","🔥","💙","🌟","🙏","😮‍💨","🫂","⚡","🌱","🎯","💭","❤️","😂","🥲","🤗","😌","🫶"];
  const HLS=["#fbbf2499","#4ADE8099","#60A5FA99","#F472B699","#A78BFA99","#FB923C99"];
  const exec=(cmd,val=null)=>{document.execCommand(cmd,false,val);ref.current?.focus();};
  return(
    <div style={{border:`1px solid ${th.border2}`,borderRadius:14,overflow:"visible",background:th.inputBg,position:"relative"}}>
      <div style={{display:"flex",gap:3,padding:"7px 10px",borderBottom:`1px solid ${th.border}`,flexWrap:"wrap",alignItems:"center",background:th.bg3,borderRadius:"14px 14px 0 0"}}>
        {[{l:"G",c:"bold",s:{fontWeight:800}},{l:"I",c:"italic",s:{fontStyle:"italic"}},{l:"S",c:"underline",s:{textDecoration:"underline"}},{l:"B̶",c:"strikeThrough",s:{opacity:.7}}].map(b=>(
          <button key={b.c} onMouseDown={e=>{e.preventDefault();exec(b.c);}} style={{padding:"3px 7px",borderRadius:6,border:`1px solid ${th.border}`,background:th.bg2,color:th.text,cursor:"pointer",fontSize:12,...b.s}}>{b.l}</button>
        ))}
        <div style={{width:1,height:16,background:th.border2,margin:"0 1px"}}/>
        <div style={{position:"relative"}}>
          <button onMouseDown={e=>{e.preventDefault();setShowHL(!showHL);setShowEmoji(false);}} style={{padding:"3px 7px",borderRadius:6,border:`1px solid ${th.border}`,background:showHL?ac+"22":th.bg2,color:showHL?ac:th.text,cursor:"pointer",fontSize:12}}>M̲</button>
          {showHL&&<div style={{position:"absolute",top:"110%",left:0,zIndex:300,background:th.bg2,border:`1px solid ${th.border2}`,borderRadius:10,padding:8,display:"flex",gap:5,boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>
            {HLS.map(c=><button key={c} onMouseDown={e=>{e.preventDefault();exec("hiliteColor",c);setShowHL(false);}} style={{width:22,height:22,borderRadius:5,background:c,border:"none",cursor:"pointer"}}/>)}
            <button onMouseDown={e=>{e.preventDefault();exec("hiliteColor","transparent");setShowHL(false);}} style={{width:22,height:22,borderRadius:5,background:"transparent",border:`1px solid ${th.border2}`,cursor:"pointer",fontSize:10,color:th.text3}}>✕</button>
          </div>}
        </div>
        <div style={{width:1,height:16,background:th.border2,margin:"0 1px"}}/>
        {[{l:"•",c:"insertUnorderedList"},{l:"1.",c:"insertOrderedList"}].map(b=>(
          <button key={b.c} onMouseDown={e=>{e.preventDefault();exec(b.c);}} style={{padding:"3px 7px",borderRadius:6,border:`1px solid ${th.border}`,background:th.bg2,color:th.text2,cursor:"pointer",fontSize:12,fontWeight:700}}>{b.l}</button>
        ))}
        {[{l:"⬛",c:"justifyLeft"},{l:"▬",c:"justifyCenter"}].map(b=>(
          <button key={b.c} onMouseDown={e=>{e.preventDefault();exec(b.c);}} style={{padding:"3px 6px",borderRadius:6,border:`1px solid ${th.border}`,background:th.bg2,color:th.text2,cursor:"pointer",fontSize:10}}>{b.l}</button>
        ))}
        <div style={{width:1,height:16,background:th.border2,margin:"0 1px"}}/>
        <div style={{position:"relative"}}>
          <button onMouseDown={e=>{e.preventDefault();setShowEmoji(!showEmoji);setShowHL(false);}} style={{padding:"3px 7px",borderRadius:6,border:`1px solid ${th.border}`,background:showEmoji?ac+"22":th.bg2,color:showEmoji?ac:th.text2,cursor:"pointer",fontSize:14}}>🙂</button>
          {showEmoji&&<div style={{position:"absolute",top:"110%",left:0,zIndex:300,background:th.bg2,border:`1px solid ${th.border2}`,borderRadius:12,padding:8,display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",width:176}}>
            {EMOJIS.map(e=><button key={e} onMouseDown={ev=>{ev.preventDefault();exec("insertText",e);setShowEmoji(false);}} style={{padding:"4px",borderRadius:6,border:"none",background:th.bg3,cursor:"pointer",fontSize:15,lineHeight:1}}>{e}</button>)}
          </div>}
        </div>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning onInput={e=>onChange(e.currentTarget.innerHTML)} data-placeholder={placeholder}
        style={{minHeight,padding:"12px 14px",color:th.text,fontSize:14,lineHeight:1.8,fontFamily:"Georgia,serif",outline:"none",wordBreak:"break-word"}}/>
      <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:${th.text3};pointer-events:none;} [contenteditable] ul{padding-left:16px;margin:4px 0;list-style-type:disc;} [contenteditable] ol{padding-left:16px;margin:4px 0;list-style-type:decimal;} [contenteditable] li{margin:1px 0;padding-left:2px;display:list-item;}`}</style>
    </div>
  );
}

// ─── DAY MODAL ────────────────────────────────────────────────────────────────
function DayModal({day,month,year,dayData,trackers,moods,accent,th,lang,onSave,onClose}){
  const t=I18N[lang]||I18N.fr;
  const isToday=day===TODAY&&month===CUR_M&&year===CUR_Y;
  const [mood1,setMood1]=useState(dayData?.mood1||"");
  const [mood2,setMood2]=useState(dayData?.mood2||"");
  const [tvals,setTvals]=useState(dayData?.trackers||{});
  const [joys,setJoys]=useState(dayData?.joys||[]);
  const [newJoy,setNewJoy]=useState("");
  const [note,setNote]=useState(dayData?.note||"");
  const toggleMood=id=>{if(!mood1||mood1===id){setMood1(mood1===id?"":id);setMood2("");}else setMood2(mood2===id?"":id);};
  const addJoy=()=>{if(newJoy.trim()){setJoys(j=>[...j,newJoy.trim()]);setNewJoy("");}};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:440,background:th.bg,borderRadius:"20px 20px 0 0",maxHeight:"90vh",overflowY:"auto",border:`1px solid ${th.border2}`}}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}><div style={{width:36,height:4,borderRadius:99,background:th.border2}}/></div>
        <div style={{padding:"0 16px 24px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div>
              <div style={{fontWeight:800,fontSize:16,color:th.text}}>{isToday?t.today:fmtDate(day,month,year,lang)}</div>
              <div style={{fontSize:11,color:th.text3}}>{day}/{month+1}/{year}</div>
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",color:th.text3,cursor:"pointer",fontSize:22}}>×</button>
          </div>
          <div style={{marginBottom:14}}>
            <SLabel th={th}>{t.mood} — {t.moodHint}</SLabel>
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:8}}>
              {moods.map(m=><Pill key={m.id} active={mood1===m.id||mood2===m.id} color={m.color} th={th} onClick={()=>toggleMood(m.id)}>{m.label}</Pill>)}
            </div>
            {(mood1||mood2)&&<div style={{display:"flex",alignItems:"center",gap:8}}>
              <MoodCell mood1={mood1} mood2={mood2} size={28} th={th} moods={moods}/>
              <span style={{fontSize:12,color:th.text2}}>{getMoodObj(mood1,moods)?.label}{mood2&&` · ${getMoodObj(mood2,moods)?.label}`}</span>
              <button onClick={()=>{setMood1("");setMood2("");}} style={{marginLeft:"auto",background:"none",border:"none",color:th.text3,cursor:"pointer",fontSize:18}}>×</button>
            </div>}
          </div>
          {trackers.length>0&&<div style={{marginBottom:14}}>
            <SLabel th={th}>{t.indicators}</SLabel>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {trackers.map(tk=>(
                <div key={tk.id}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}><span>{tk.icon}</span><span style={{fontSize:13,fontWeight:700,color:tk.color}}>{tk.label}</span></div>
                  {tk.type==="scale3"&&<Scale3 value={tvals[tk.id]??null} onChange={v=>setTvals({...tvals,[tk.id]:v})} color={tk.color}/>}
                  {tk.type==="bool"&&<button onClick={()=>setTvals({...tvals,[tk.id]:!tvals[tk.id]})} style={{padding:"7px 18px",borderRadius:20,background:tvals[tk.id]?tk.color+"22":th.pillBg,border:`2px solid ${tvals[tk.id]?tk.color:"transparent"}`,color:tvals[tk.id]?tk.color:th.text3,cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit"}}>{tvals[tk.id]?`✓ ${t.yes}`:t.no}</button>}
                  {tk.type==="number"&&<input type="number" value={tvals[tk.id]||""} onChange={e=>setTvals({...tvals,[tk.id]:e.target.value===""?null:+e.target.value})} style={{width:80,background:th.inputBg,border:`1px solid ${tk.color}44`,borderRadius:10,padding:"7px 10px",color:th.text,fontSize:14,fontFamily:"inherit",textAlign:"center"}}/>}
                </div>
              ))}
            </div>
          </div>}
          <div style={{marginBottom:14}}>
            <SLabel th={th}>{t.joys}</SLabel>
            {joys.length>0&&<div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:8}}>
              {joys.map((j,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:accent+"11",borderRadius:10,border:`1px solid ${accent}22`}}>
                  <span style={{color:accent,fontSize:14}}>✦</span>
                  <span style={{flex:1,fontSize:13,color:th.text2}}>{j}</span>
                  <button onClick={()=>setJoys(js=>js.filter((_,x)=>x!==i))} style={{background:"none",border:"none",color:th.text3,cursor:"pointer",fontSize:14}}>×</button>
                </div>
              ))}
            </div>}
            <div style={{display:"flex",gap:8}}>
              <input value={newJoy} onChange={e=>setNewJoy(e.target.value)} placeholder={t.joysPlaceholder} onKeyDown={e=>e.key==="Enter"&&addJoy()}
                style={{flex:1,background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:10,padding:"8px 12px",color:th.text,fontSize:13,fontFamily:"inherit"}}/>
              <button onClick={addJoy} style={{padding:"8px 14px",background:accent,border:"none",borderRadius:10,color:"#fff",fontWeight:800,cursor:"pointer",fontSize:16}}>+</button>
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <SLabel th={th}>{t.note}</SLabel>
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder={t.notePlaceholder} rows={3}
              style={{width:"100%",background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:12,padding:"10px 14px",color:th.text,fontSize:13,fontFamily:"Georgia,serif",lineHeight:1.7,resize:"none",boxSizing:"border-box"}}/>
          </div>
          <Btn onClick={()=>onSave({mood1,mood2:mood2||null,trackers:tvals,joys,note})} color={accent} full th={th}>{t.save}</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── OBJECTIVE CARD ───────────────────────────────────────────────────────────
function ObjCard({obj,accent,onUpdate,onDelete,th,t}){
  const [open,setOpen]=useState(false);
  const [newVal,setNewVal]=useState("");
  const [newDate,setNewDate]=useState(NOW.toISOString().slice(0,10));
  const [newItem,setNewItem]=useState("");
  const [confirmDel,setConfirmDel]=useState(false);
  const pct=obj.type==="checklist"?Math.round(((obj.items?.filter(i=>i.done).length||0)/Math.max(1,obj.items?.length||1))*100):obj.type==="counter"?Math.min(100,Math.round(((obj.count||0)/Math.max(1,obj.target||1))*100)):(obj.entries||[]).length>1?(()=>{const f=obj.entries[0].val,l=obj.entries[obj.entries.length-1].val,g=f-(obj.target||0);return g===0?100:Math.min(100,Math.max(0,Math.round(((f-l)/g)*100)));})():0;
  return(
    <Card th={th} style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div style={{flex:1,marginRight:8}}><div style={{fontWeight:700,fontSize:14,color:th.text}}>{obj.title}</div><div style={{fontSize:10,color:th.text3,marginTop:2}}>{obj.type==="checklist"?"☑":obj.type==="counter"?"🔢":"📈"}{obj.unit&&` · ${obj.unit}`}</div></div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:accent,fontWeight:800,fontSize:20}}>{pct}%</span>
          {!confirmDel?<button onClick={()=>setConfirmDel(true)} style={{background:"none",border:"none",color:th.text3,cursor:"pointer",fontSize:14,padding:"2px 5px"}}>🗑</button>:<div style={{display:"flex",gap:4}}><button onClick={onDelete} style={{padding:"3px 8px",background:"#F8717122",border:"1px solid #F8717144",borderRadius:7,color:"#F87171",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>{t.yes}</button><button onClick={()=>setConfirmDel(false)} style={{padding:"3px 8px",background:th.bg3,border:`1px solid ${th.border}`,borderRadius:7,color:th.text3,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{t.no}</button></div>}
        </div>
      </div>
      <div style={{background:th.bg3,borderRadius:99,height:5,marginBottom:10}}><div style={{width:`${pct}%`,height:"100%",background:accent,borderRadius:99,transition:"width .5s"}}/></div>
      {obj.type==="checklist"&&(<div>
        {(obj.items||[]).map((item,i)=>(<button key={i} onClick={()=>{const it=[...obj.items];it[i]={...it[i],done:!it[i].done};onUpdate({...obj,items:it});}} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:item.done?accent+"12":th.bg3,border:`1px solid ${item.done?accent+"33":th.border}`,borderRadius:9,cursor:"pointer",textAlign:"left",width:"100%",marginBottom:5}}>
          <div style={{width:16,height:16,borderRadius:4,flexShrink:0,background:item.done?accent:"transparent",border:`2px solid ${item.done?accent:th.border2}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{item.done&&<span style={{color:"#fff",fontSize:10}}>✓</span>}</div>
          <span style={{fontSize:12,color:item.done?th.text3:th.text,textDecoration:item.done?"line-through":"none"}}>{item.label}</span>
        </button>))}
        <div style={{display:"flex",gap:7,marginTop:4}}>
          <input value={newItem} onChange={e=>setNewItem(e.target.value)} placeholder={t.addItem} onKeyDown={e=>{if(e.key==="Enter"&&newItem.trim()){onUpdate({...obj,items:[...(obj.items||[]),{label:newItem.trim(),done:false}]});setNewItem("");}}} style={{flex:1,background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:9,padding:"6px 10px",color:th.text,fontSize:12,fontFamily:"inherit"}}/>
          <button onClick={()=>{if(newItem.trim()){onUpdate({...obj,items:[...(obj.items||[]),{label:newItem.trim(),done:false}]});setNewItem("");}}} style={{padding:"6px 12px",background:accent,border:"none",borderRadius:9,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>+</button>
        </div>
      </div>)}
      {obj.type==="dated"&&(<div>
        {(obj.entries||[]).length>1&&(<div style={{marginBottom:8}}><ResponsiveContainer width="100%" height={80}><LineChart data={(obj.entries).map(e=>({d:e.date.slice(5),v:e.val}))} margin={{top:4,right:4,left:-32,bottom:0}}><XAxis dataKey="d" tick={{fontSize:9,fill:th.text3}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:9,fill:th.text3}} tickLine={false} axisLine={false}/>{obj.target&&<ReferenceLine y={obj.target} stroke={accent} strokeDasharray="3 3" strokeOpacity={0.5}/>}<Line type="monotone" dataKey="v" stroke={accent} dot={{r:3,fill:accent}} strokeWidth={2} connectNulls/><Tooltip contentStyle={{background:th.bg2,border:`1px solid ${th.border2}`,borderRadius:8,fontSize:11,color:th.text}}/></LineChart></ResponsiveContainer><div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:th.text3,marginTop:2}}><span>{obj.entries[0].val} {obj.unit}</span><span style={{color:accent}}>→ {obj.target} {obj.unit}</span><span>{obj.entries[obj.entries.length-1].val} {obj.unit}</span></div></div>)}
        {!open?<button onClick={()=>setOpen(true)} style={{width:"100%",padding:"8px 14px",background:"transparent",border:`1.5px solid ${accent}44`,borderRadius:10,color:accent,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>+ {t.save}</button>:<div style={{display:"flex",gap:7}}><input type="number" value={newVal} onChange={e=>setNewVal(e.target.value)} placeholder={obj.unit||"valeur"} style={{flex:1,background:th.inputBg,border:`1px solid ${accent}44`,borderRadius:9,padding:"7px 10px",color:th.text,fontSize:13,fontFamily:"inherit"}}/><input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} style={{flex:1,background:th.inputBg,border:`1px solid ${accent}44`,borderRadius:9,padding:"7px 8px",color:th.text,fontSize:11,fontFamily:"inherit"}}/><button onClick={()=>{if(newVal){onUpdate({...obj,entries:[...(obj.entries||[]),{date:newDate,val:parseFloat(newVal)}]});setNewVal("");setOpen(false);}}} style={{padding:"7px 12px",background:accent,border:"none",borderRadius:9,color:"#fff",fontWeight:700,cursor:"pointer"}}>✓</button></div>}
      </div>)}
      {obj.type==="counter"&&(<div style={{display:"flex",alignItems:"center",gap:10}}><button onClick={()=>onUpdate({...obj,count:Math.max(0,(obj.count||0)-1)})} style={{width:38,height:38,borderRadius:10,background:th.bg3,border:`1px solid ${th.border}`,color:th.text,fontSize:20,cursor:"pointer"}}>−</button><div style={{flex:1,textAlign:"center"}}><div style={{fontSize:26,fontWeight:800,color:accent}}>{obj.count||0}</div><div style={{fontSize:10,color:th.text3}}>/ {obj.target} {obj.unit}</div></div><button onClick={()=>onUpdate({...obj,count:Math.min(obj.target,(obj.count||0)+1)})} style={{width:38,height:38,borderRadius:10,background:accent+"33",border:`1px solid ${accent}44`,color:accent,fontSize:20,fontWeight:800,cursor:"pointer"}}>+</button></div>)}
    </Card>
  );
}

// ─── JOY INPUT ────────────────────────────────────────────────────────────────
function JoyInput({onAdd,accent,th,placeholder}){
  const [val,setVal]=useState("");
  const add=()=>{if(val.trim()){onAdd(val.trim());setVal("");}};
  return <div style={{display:"flex",gap:8}}><input value={val} onChange={e=>setVal(e.target.value)} placeholder={placeholder||"Un moment…"} onKeyDown={e=>e.key==="Enter"&&add()} style={{flex:1,background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:10,padding:"8px 12px",color:th.text,fontSize:13,fontFamily:"inherit"}}/><button onClick={add} style={{padding:"8px 14px",background:accent,border:"none",borderRadius:10,color:"#fff",fontWeight:800,cursor:"pointer",fontSize:16}}>+</button></div>;
}

// ─── PAGES ────────────────────────────────────────────────────────────────────
function Dashboard({data,setData,objectives,setObjectives,widgets,setWidgets,trackers,moods,accent,firstName,plan,th,lang,showAdPopup}){
  const t=I18N[lang]||I18N.fr;
  const [configOpen,setConfigOpen]=useState(false);
  const [addOpen,setAddOpen]=useState(false);
  const [form,setForm]=useState({title:"",type:"checklist",unit:"",target:"",initial:"",items:[""]});
  const [editDay,setEditDay]=useState(null);
  const last7=Array.from({length:7},(_,i)=>{const d=new Date(NOW);d.setDate(TODAY-(6-i));const wdNames={fr:["D","L","M","M","J","V","S"],en:["S","M","T","W","T","F","S"],es:["D","L","M","X","J","V","S"],de:["S","M","D","M","D","F","S"],it:["D","L","M","M","G","V","S"],pt:["D","S","T","Q","Q","S","S"]};const wd=d.getDay();return{label:(wdNames[lang]||wdNames.fr)[wd],entry:data[d.getMonth()]?.[d.getDate()],day:d.getDate(),month:d.getMonth()};});
  const sportStreak=(()=>{let s=0;for(let d=TODAY;d>=1;d--){if(data[CUR_M]?.[d]?.trackers?.sport)s++;else break;}return s;})();
  const WCAT=[{id:"objectives",l:`🎯 ${t.objectives}`},{id:"weekMoods",l:t.weekMoods},{id:"streaks",l:t.streaks},{id:"aiInsight",l:t.insight}];
  const submitObj=()=>{
    if(!form.title.trim())return;
    const base={id:Date.now(),title:form.title,type:form.type,unit:form.unit};
    let obj;
    if(form.type==="checklist")obj={...base,items:form.items.filter(Boolean).map(l=>({label:l,done:false}))};
    else if(form.type==="dated")obj={...base,target:parseFloat(form.target)||0,entries:form.initial?[{date:NOW.toISOString().slice(0,10),val:parseFloat(form.initial)}]:[]};
    else obj={...base,target:parseInt(form.target)||10,count:0};
    setObjectives(os=>[...os,obj]);setAddOpen(false);setForm({title:"",type:"checklist",unit:"",target:"",initial:"",items:[""]});
  };
  const saveDay=(day,month,d)=>{setData(prev=>({...prev,[month]:{...(prev[month]||{}),[day]:d}}));setEditDay(null);showAdPopup("save");};
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div><div style={{fontWeight:800,fontSize:17,color:th.text}}>{t.greet(NOW.getHours())}, {firstName} 👋</div><div style={{fontSize:11,color:th.text3}}>{fmtDate(TODAY,CUR_M,CUR_Y,lang)}</div></div>
      <button onClick={()=>setConfigOpen(!configOpen)} style={{background:configOpen?accent+"22":th.bg3,border:`1px solid ${configOpen?accent+"44":th.border}`,borderRadius:10,padding:"5px 11px",color:configOpen?accent:th.text3,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>⚙</button>
    </div>
    {configOpen&&<Card th={th} style={{marginBottom:12}}><SLabel th={th}>{t.widgets}</SLabel><div style={{display:"flex",flexWrap:"wrap",gap:7}}>{WCAT.map(w=><Pill key={w.id} active={widgets.includes(w.id)} color={accent} th={th} onClick={()=>setWidgets(ws=>ws.includes(w.id)?ws.filter(x=>x!==w.id):[...ws,w.id])}>{w.l}</Pill>)}</div></Card>}
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {widgets.includes("objectives")&&(<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><SLabel th={th}>🎯 {t.objectives}</SLabel><button onClick={()=>setAddOpen(!addOpen)} style={{background:"none",border:"none",color:accent,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:700}}>{t.addObj}</button></div>
        {objectives.length===0&&!addOpen&&<Card th={th} style={{textAlign:"center",padding:24}}><div style={{fontSize:32,marginBottom:8}}>🎯</div><div style={{fontSize:13,color:th.text2,marginBottom:12}}>{t.noObj}</div><button onClick={()=>setAddOpen(true)} style={{padding:"8px 18px",background:accent,border:"none",borderRadius:10,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>{t.createFirstObj}</button></Card>}
        {objectives.map(o=><ObjCard key={o.id} obj={o} accent={accent} th={th} t={t} onUpdate={upd=>setObjectives(os=>os.map(x=>x.id===upd.id?upd:x))} onDelete={()=>setObjectives(os=>os.filter(x=>x.id!==o.id))}/>)}
        {addOpen&&<Card th={th} style={{border:`1px solid ${accent}33`}}>
          <div style={{marginBottom:10}}><SLabel th={th}>{t.objTitle}</SLabel><TInput th={th} value={form.title} onChange={v=>setForm({...form,title:v})} placeholder="Ex: Lire 12 livres…"/></div>
          <div style={{marginBottom:12}}><SLabel th={th}>{t.objType}</SLabel><div style={{display:"flex",gap:7}}>{[["checklist",t.objChecklist],["dated",t.objDated],["counter",t.objCounter]].map(([v,l])=><Pill key={v} active={form.type===v} color={accent} th={th} onClick={()=>setForm({...form,type:v})} small>{l}</Pill>)}</div></div>
          {form.type==="checklist"&&<div style={{marginBottom:12}}><SLabel th={th}>{t.addItem.replace("+ ","")}</SLabel>{form.items.map((item,i)=><input key={i} value={item} onChange={e=>{const a=[...form.items];a[i]=e.target.value;setForm({...form,items:a});}} placeholder={`${i+1}.`} style={{width:"100%",background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:9,padding:"7px 10px",color:th.text,fontSize:13,fontFamily:"inherit",marginBottom:6,boxSizing:"border-box"}}/>)}<button onClick={()=>setForm({...form,items:[...form.items,""]})} style={{background:"none",border:`1px dashed ${th.border2}`,borderRadius:9,padding:"5px 12px",color:th.text3,cursor:"pointer",fontSize:12,fontFamily:"inherit",width:"100%"}}>{t.addItem}</button></div>}
          {(form.type==="dated"||form.type==="counter")&&<div style={{display:"flex",gap:8,marginBottom:12}}><div style={{flex:1}}><SLabel th={th}>{t.objUnit}</SLabel><TInput th={th} value={form.unit} onChange={v=>setForm({...form,unit:v})} placeholder="kg"/></div><div style={{flex:1}}><SLabel th={th}>{t.objTarget}</SLabel><TInput th={th} value={form.target} onChange={v=>setForm({...form,target:v})} placeholder="75" type="number"/></div>{form.type==="dated"&&<div style={{flex:1}}><SLabel th={th}>{t.objStart}</SLabel><TInput th={th} value={form.initial} onChange={v=>setForm({...form,initial:v})} placeholder="83" type="number"/></div>}</div>}
          <div style={{display:"flex",gap:8}}><Btn th={th} onClick={()=>setAddOpen(false)} outline color={accent} full small>{t.cancel}</Btn><Btn th={th} onClick={submitObj} color={accent} full small disabled={!form.title.trim()}>{t.create}</Btn></div>
        </Card>}
      </div>)}
      {widgets.includes("weekMoods")&&<Card th={th}><SLabel th={th}>{t.weekMoods} — clic ✏</SLabel><div style={{display:"flex",justifyContent:"space-between"}}>{last7.map((d,i)=>(<button key={i} onClick={()=>setEditDay({day:d.day,month:d.month})} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",padding:"4px 2px",borderRadius:10}}><span style={{fontSize:9,color:th.text3}}>{d.label}</span><MoodCell mood1={d.entry?.mood1} mood2={d.entry?.mood2} size={32} th={th} moods={moods}/></button>))}</div></Card>}
      {widgets.includes("streaks")&&<Card th={th}><SLabel th={th}>{t.streaks}</SLabel><div style={{display:"flex",gap:10}}><div style={{flex:1,background:"#4ADE8011",borderRadius:12,padding:"10px 14px",border:"1px solid #4ADE8022"}}><div style={{fontSize:24,fontWeight:800,color:"#4ADE80"}}>{sportStreak}</div><div style={{fontSize:10,color:th.text3}}>{t.sportDays}</div></div><div style={{flex:1,background:accent+"11",borderRadius:12,padding:"10px 14px",border:`1px solid ${accent}22`}}><div style={{fontSize:24,fontWeight:800,color:accent}}>{Object.keys(data[CUR_M]||{}).length}</div><div style={{fontSize:10,color:th.text3}}>{t.filledDays}</div></div></div></Card>}
      {widgets.includes("aiInsight")&&<Card th={th} style={{border:`1px solid ${accent}22`,background:accent+"08"}}><SLabel th={th}>{t.insight}</SLabel><p style={{margin:0,fontSize:13,lineHeight:1.7,color:th.text2}}>{t.insightText(firstName,sportStreak)}</p></Card>}
    </div>
    {editDay&&<DayModal day={editDay.day} month={editDay.month} year={CUR_Y} dayData={data[editDay.month]?.[editDay.day]} trackers={trackers} moods={moods} accent={accent} th={th} lang={lang} onSave={d=>saveDay(editDay.day,editDay.month,d)} onClose={()=>setEditDay(null)}/>}
  </div>);
}

function Saisie({data,setData,trackers,setTrackers,moods,accent,th,lang,showAdPopup}){
  const t=I18N[lang]||I18N.fr;
  const [editDay,setEditDay]=useState({day:TODAY,month:CUR_M});
  const dayData=data[editDay.month]?.[editDay.day]||{};
  const [catOpen,setCatOpen]=useState(false);
  const [addCustom,setAddCustom]=useState(false);
  const [customForm,setCustomForm]=useState({label:"",icon:"📌",type:"bool",color:"#7C9EFF"});
  const activeIds=trackers.map(tr=>tr.id);
  const saveDay=(day,month,d)=>{setData(prev=>({...prev,[month]:{...(prev[month]||{}),[day]:d}}));showAdPopup("save");};
  const addCustomTracker=()=>{if(!customForm.label.trim())return;setTrackers(ts=>[...ts,{...customForm,id:"custom_"+Date.now()}]);setCustomForm({label:"",icon:"📌",type:"bool",color:"#7C9EFF"});setAddCustom(false);};
  return(<div>
    <div style={{fontWeight:800,fontSize:17,color:th.text,marginBottom:2}}>{t.nav.entry}</div>
    <div style={{fontSize:11,color:th.text3,marginBottom:14}}>{fmtDate(editDay.day,editDay.month,CUR_Y,lang)}</div>
    <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
      {Array.from({length:7},(_,i)=>{const d=new Date(NOW);d.setDate(TODAY-i);const dd=d.getDate(),mm=d.getMonth();const active=editDay.day===dd&&editDay.month===mm;const wdNames={fr:["D","L","M","M","J","V","S"],en:["S","M","T","W","T","F","S"],es:["D","L","M","X","J","V","S"],de:["S","M","D","M","D","F","S"],it:["D","L","M","M","G","V","S"],pt:["D","S","T","Q","Q","S","S"]};const wd=d.getDay();
        return<button key={i} onClick={()=>setEditDay({day:dd,month:mm})} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 10px",borderRadius:12,background:active?accent+"22":th.bg3,border:`1.5px solid ${active?accent:th.border}`,cursor:"pointer",flexShrink:0}}>
          <span style={{fontSize:9,color:active?accent:th.text3}}>{(wdNames[lang]||wdNames.fr)[wd]}</span>
          <span style={{fontSize:14,fontWeight:active?800:400,color:active?accent:th.text}}>{dd}</span>
          {data[mm]?.[dd]&&<div style={{width:4,height:4,borderRadius:"50%",background:active?accent:"#4ADE80"}}/>}
        </button>;
      })}
    </div>
    <Card th={th} style={{marginBottom:12}}>
      <SLabel th={th}>{t.mood} — {t.moodHint}</SLabel>
      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:8}}>
        {moods.map(m=>{const active=dayData.mood1===m.id||dayData.mood2===m.id;
          return<Pill key={m.id} active={active} color={m.color} th={th} onClick={()=>{
            let m1=dayData.mood1||"",m2=dayData.mood2||"";
            if(!m1||m1===m.id){m1=m1===m.id?"":m.id;m2="";}else{m2=m2===m.id?"":m.id;}
            saveDay(editDay.day,editDay.month,{...dayData,mood1:m1,mood2:m2||null});
          }}>{m.label}</Pill>;
        })}
      </div>
      {(dayData.mood1||dayData.mood2)&&<div style={{display:"flex",alignItems:"center",gap:8}}>
        <MoodCell mood1={dayData.mood1} mood2={dayData.mood2} size={28} th={th} moods={moods}/>
        <span style={{fontSize:12,color:th.text2}}>{getMoodObj(dayData.mood1,moods)?.label}{dayData.mood2&&` · ${getMoodObj(dayData.mood2,moods)?.label}`}</span>
        <button onClick={()=>saveDay(editDay.day,editDay.month,{...dayData,mood1:"",mood2:null})} style={{marginLeft:"auto",background:"none",border:"none",color:th.text3,cursor:"pointer",fontSize:16}}>×</button>
      </div>}
    </Card>
    <Card th={th} style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <SLabel th={th}>{t.indicators}</SLabel>
        <button onClick={()=>setCatOpen(!catOpen)} style={{background:"none",border:"none",color:accent,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:700}}>{t.manage}</button>
      </div>
      {catOpen&&<div style={{marginBottom:14,padding:10,background:th.bg3,borderRadius:12,border:`1px solid ${th.border}`}}>
        <SLabel th={th}>{t.catalogue}</SLabel>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
          {TRACKER_CATALOGUE.map(tr=>(<button key={tr.id} onClick={()=>{if(activeIds.includes(tr.id))setTrackers(ts=>ts.filter(x=>x.id!==tr.id));else setTrackers(ts=>[...ts,tr]);}} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 10px",background:activeIds.includes(tr.id)?tr.color+"18":th.bg2,border:`1.5px solid ${activeIds.includes(tr.id)?tr.color:th.border}`,borderRadius:9,cursor:"pointer",color:activeIds.includes(tr.id)?tr.color:th.text2,fontFamily:"inherit",fontSize:11,fontWeight:activeIds.includes(tr.id)?700:400}}><span>{tr.icon}</span><span style={{flex:1,textAlign:"left"}}>{tr.label}</span>{activeIds.includes(tr.id)&&<span>✓</span>}</button>))}
        </div>
        <div style={{borderTop:`1px solid ${th.border}`,paddingTop:10}}>
          <div style={{fontSize:11,color:th.text3,marginBottom:8,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{t.customTracker}</div>
          {!addCustom?<button onClick={()=>setAddCustom(true)} style={{width:"100%",padding:"7px",background:"transparent",border:`1.5px dashed ${accent}44`,borderRadius:9,color:accent,fontSize:12,fontFamily:"inherit",fontWeight:700,cursor:"pointer"}}>{t.createTracker}</button>:<div>
            <div style={{display:"flex",gap:6,marginBottom:8}}><input value={customForm.icon} onChange={e=>setCustomForm({...customForm,icon:e.target.value})} style={{width:40,background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:9,padding:"7px",color:th.text,fontSize:18,textAlign:"center",fontFamily:"inherit"}}/><input value={customForm.label} onChange={e=>setCustomForm({...customForm,label:e.target.value})} placeholder={t.indicators} style={{flex:1,background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:9,padding:"7px 10px",color:th.text,fontSize:13,fontFamily:"inherit"}}/></div>
            <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>{[["bool",t.yes+"/"+t.no],["scale3","0→3"],["number","#"]].map(([v,l])=><Pill key={v} active={customForm.type===v} color={accent} th={th} onClick={()=>setCustomForm({...customForm,type:v})} small>{l}</Pill>)}</div>
            <div style={{display:"flex",gap:6}}><button onClick={()=>setAddCustom(false)} style={{flex:1,padding:"7px",background:th.bg3,border:`1px solid ${th.border}`,borderRadius:9,color:th.text3,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>{t.cancel}</button><button onClick={addCustomTracker} style={{flex:1,padding:"7px",background:accent,border:"none",borderRadius:9,color:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>{t.add}</button></div>
          </div>}
        </div>
      </div>}
      {trackers.length===0&&!catOpen&&<div style={{textAlign:"center",padding:16,color:th.text3,fontSize:13}}>{t.noTrackers} <button onClick={()=>setCatOpen(true)} style={{background:"none",border:"none",color:accent,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13}}>{t.add}</button></div>}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {trackers.map(tk=>(<div key={tk.id}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}><span>{tk.icon}</span><span style={{fontSize:13,fontWeight:700,color:tk.color}}>{tk.label}</span></div>
          {tk.type==="scale3"&&<Scale3 value={dayData.trackers?.[tk.id]??null} onChange={v=>saveDay(editDay.day,editDay.month,{...dayData,trackers:{...(dayData.trackers||{}),[tk.id]:v}})} color={tk.color}/>}
          {tk.type==="bool"&&<button onClick={()=>saveDay(editDay.day,editDay.month,{...dayData,trackers:{...(dayData.trackers||{}),[tk.id]:!dayData.trackers?.[tk.id]}})} style={{padding:"7px 18px",borderRadius:20,background:dayData.trackers?.[tk.id]?tk.color+"22":th.pillBg,border:`2px solid ${dayData.trackers?.[tk.id]?tk.color:"transparent"}`,color:dayData.trackers?.[tk.id]?tk.color:th.text3,cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit"}}>{dayData.trackers?.[tk.id]?`✓ ${t.yes}`:t.no}</button>}
          {tk.type==="number"&&<input type="number" value={dayData.trackers?.[tk.id]||""} onChange={e=>saveDay(editDay.day,editDay.month,{...dayData,trackers:{...(dayData.trackers||{}),[tk.id]:e.target.value===""?null:+e.target.value}})} style={{width:80,background:th.inputBg,border:`1px solid ${tk.color}44`,borderRadius:10,padding:"7px 10px",color:th.text,fontSize:14,fontFamily:"inherit",textAlign:"center"}}/>}
        </div>))}
      </div>
    </Card>
    <Card th={th} style={{marginBottom:12}}>
      <SLabel th={th}>{t.joys}</SLabel>
      {(dayData.joys||[]).length>0&&<div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:8}}>
        {(dayData.joys||[]).map((j,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:accent+"11",borderRadius:10,border:`1px solid ${accent}22`}}>
          <span style={{color:accent,fontSize:14}}>✦</span>
          <span style={{flex:1,fontSize:13,color:th.text2}}>{j}</span>
          <button onClick={()=>saveDay(editDay.day,editDay.month,{...dayData,joys:(dayData.joys||[]).filter((_,x)=>x!==i)})} style={{background:"none",border:"none",color:th.text3,cursor:"pointer",fontSize:14}}>×</button>
        </div>))}
      </div>}
      <JoyInput onAdd={j=>saveDay(editDay.day,editDay.month,{...dayData,joys:[...(dayData.joys||[]),j]})} accent={accent} th={th} placeholder={t.joysPlaceholder}/>
    </Card>
    <Card th={th} style={{marginBottom:12}}>
      <SLabel th={th}>{t.note}</SLabel>
      <textarea value={dayData.note||""} onChange={e=>saveDay(editDay.day,editDay.month,{...dayData,note:e.target.value})} placeholder={t.notePlaceholder} rows={3}
        style={{width:"100%",background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:12,padding:"10px 14px",color:th.text,fontSize:13,fontFamily:"Georgia,serif",lineHeight:1.7,resize:"none",boxSizing:"border-box"}}/>
    </Card>
  </div>);
}

function Suivi({data,setData,trackers,moods,accent,th,lang}){
  const t=I18N[lang]||I18N.fr;
  const [view,setView]=useState("month");
  const [subview,setSubview]=useState("heatmap");
  const [month,setMonth]=useState(CUR_M);
  const [selT,setSelT]=useState([]);
  const [editDay,setEditDay]=useState(null);
  const days=dIM(month,CUR_Y),firstD=fDOM(month,CUR_Y),monthData=data[month]||{};
  const validSelT=selT.filter(id=>trackers.some(tr=>tr.id===id));
  const chartData=Array.from({length:days},(_,i)=>{const d=i+1,e=monthData[d],row={day:d};trackers.forEach(tk=>{const raw=e?.trackers?.[tk.id];row[tk.id]=tk.type==="bool"?(raw===true?1:raw===false?0:null):(raw??null);});return row;});
  const saveDay=(day,month,d)=>setData(prev=>({...prev,[month]:{...(prev[month]||{}),[day]:d}}));
  return(<div>
    <ToggleBar th={th} options={[["month",t.month],["year",t.year]]} value={view} onChange={setView} accent={accent}/>
    <div style={{height:14}}/>
    {view==="month"&&<>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <button onClick={()=>setMonth(m=>Math.max(0,m-1))} style={{background:th.bg3,border:`1px solid ${th.border}`,borderRadius:10,padding:"7px 14px",color:th.text,cursor:"pointer",fontSize:16}}>‹</button>
        <div style={{flex:1,textAlign:"center",fontWeight:700,color:th.text}}>{t.months[month]} {CUR_Y}</div>
        <button onClick={()=>setMonth(m=>Math.min(11,m+1))} style={{background:th.bg3,border:`1px solid ${th.border}`,borderRadius:10,padding:"7px 14px",color:th.text,cursor:"pointer",fontSize:16}}>›</button>
      </div>
      <ToggleBar th={th} options={[["heatmap",t.states],["curves",t.curves]]} value={subview} onChange={setSubview} accent={accent} small/>
      <div style={{height:14}}/>
      {subview==="heatmap"&&<>
        <div style={{fontSize:11,color:th.text3,marginBottom:8}}>{t.clickToEdit}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:10}}>
          {t.days.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:9,color:th.text3,paddingBottom:4}}>{d}</div>)}
          {Array.from({length:firstD},(_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:days},(_,i)=>{const d=i+1,entry=monthData[d],isToday=d===TODAY&&month===CUR_M;
            return<button key={d} onClick={()=>setEditDay({day:d,month})} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"2px 0",borderRadius:8}}>
              <div style={{fontSize:8,color:isToday?accent:th.text3,fontWeight:isToday?800:400}}>{d}</div>
              <MoodCell mood1={entry?.mood1} mood2={entry?.mood2} size={34} th={th} moods={moods}/>
              {(entry?.joys||[]).length>0&&<div style={{width:4,height:4,borderRadius:"50%",background:accent}}/>}
            </button>;
          })}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {moods.map(m=><div key={m.id} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:m.color}}/><span style={{fontSize:10,color:th.text3}}>{m.label}</span></div>)}
        </div>
      </>}
      {subview==="curves"&&<>
        <Card th={th} style={{marginBottom:12}}>
          <SLabel th={th}>{t.selectData}</SLabel>
          {trackers.length===0?<div style={{fontSize:12,color:th.text3}}>{t.noTrackers}</div>:<div style={{display:"flex",flexWrap:"wrap",gap:7}}>{trackers.map(tk=><Pill key={tk.id} active={validSelT.includes(tk.id)} color={tk.color} th={th} onClick={()=>setSelT(s=>s.includes(tk.id)?s.filter(x=>x!==tk.id):[...s,tk.id])} small>{tk.icon} {tk.label}</Pill>)}</div>}
        </Card>
        {validSelT.length===0&&trackers.length>0&&<div style={{textAlign:"center",padding:24,color:th.text3,fontSize:13}}>{t.selectData}</div>}
        {trackers.filter(tk=>validSelT.includes(tk.id)).map(tk=>(
          <Card key={tk.id} th={th} style={{marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><span>{tk.icon}</span><span style={{fontSize:12,fontWeight:700,color:tk.color}}>{tk.label}</span></div>
            <ResponsiveContainer width="100%" height={100}><LineChart data={chartData} margin={{top:4,right:4,left:-32,bottom:0}}><XAxis dataKey="day" tick={{fontSize:9,fill:th.text3}} tickLine={false} axisLine={false} interval={4}/><YAxis tick={{fontSize:9,fill:th.text3}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{background:th.bg2,border:`1px solid ${th.border2}`,borderRadius:8,fontSize:11,color:th.text}}/><Line type="monotone" dataKey={tk.id} stroke={tk.color} dot={{r:3,fill:tk.color}} strokeWidth={2.5} connectNulls/></LineChart></ResponsiveContainer>
          </Card>
        ))}
      </>}
    </>}
    {view==="year"&&<>
      <div style={{fontWeight:700,fontSize:15,color:th.text,marginBottom:6}}>{t.clickToEdit}</div>
      <div style={{fontSize:11,color:th.text3,marginBottom:12}}>{CUR_Y}</div>
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        <table style={{borderCollapse:"separate",borderSpacing:"2px 2px",minWidth:300}}>
          <thead><tr><th style={{width:18,fontSize:8,color:th.text3,fontWeight:400,paddingRight:3}}></th>{t.monthsShort.map((m,i)=><th key={i} style={{textAlign:"center",fontSize:9,color:th.text3,fontWeight:700,paddingBottom:4,width:22}}>{m}</th>)}</tr></thead>
          <tbody>{Array.from({length:31},(_,di)=>{const day=di+1;return<tr key={day}><td style={{fontSize:8,color:th.text3,textAlign:"right",paddingRight:3,lineHeight:"22px",verticalAlign:"middle"}}>{day}</td>{Array.from({length:12},(_,mi)=>{if(day>dIM(mi,CUR_Y))return<td key={mi} style={{padding:0}}/>;const entry=data[mi]?.[day];const m1=entry?getMoodObj(entry.mood1,moods):null,m2=entry?.mood2?getMoodObj(entry.mood2,moods):null;return<td key={mi} style={{padding:0,verticalAlign:"middle"}}><button onClick={()=>setEditDay({day,month:mi})} style={{display:"block",width:20,height:20,borderRadius:3,overflow:"hidden",background:m1?"transparent":th.bg3,border:`1px solid ${th.border}`,padding:0,cursor:"pointer"}}>{m1&&<div style={{display:"flex",flexDirection:"column",height:"100%"}}><div style={{flex:1,background:m1.color}}/>{m2&&<div style={{flex:1,background:m2.color}}/>}</div>}</button></td>;})};</tr>;})}</tbody>
        </table>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:12}}>{moods.map(m=><div key={m.id} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:m.color}}/><span style={{fontSize:10,color:th.text3}}>{m.label}</span></div>)}</div>
    </>}
    {editDay&&<DayModal day={editDay.day} month={editDay.month} year={CUR_Y} dayData={data[editDay.month]?.[editDay.day]} trackers={trackers} moods={moods} accent={accent} th={th} lang={lang} onSave={d=>{saveDay(editDay.day,editDay.month,d);setEditDay(null);}} onClose={()=>setEditDay(null)}/>}
  </div>);
}

function Decharge({accent,th,lang,userId}){
  const t=I18N[lang]||I18N.fr;
  const [mode,setMode]=useState("journal");
  const [html,setHtml]=useState("");
  const [entries,setEntries]=useState([]);
  const [editContent,setEditContent]=useState({});

  useEffect(()=>{
    if(!userId) return;
    (async()=>{
      try{
        const q=query(collection(db,"users",userId,"journal"),orderBy("createdAt","desc"));
        const snap=await getDocs(q);
        setEntries(snap.docs.map(d=>({id:d.id,...d.data()})));
      }catch(e){console.error("Error loading journal:",e);}
    })();
  },[userId]);

  const add=async()=>{
    if(!html||html==="<br>")return;
    const date=NOW.toLocaleDateString(lang==="pt"?"pt-BR":lang,{day:"numeric",month:"long",year:"numeric"});
    if(userId){
      try{
        const ref=await addDoc(collection(db,"users",userId,"journal"),{date,html,createdAt:serverTimestamp()});
        setEntries(es=>[{id:ref.id,date,html},...es]);
      }catch(e){console.error("Error saving journal entry:",e);}
    }else{
      setEntries(es=>[{id:Date.now(),date,html},...es]);
    }
    setHtml("");
  };

  const saveEdit=async(entryId,newHtml)=>{
    if(userId){
      try{
        await updateDoc(doc(db,"users",userId,"journal",entryId),{html:newHtml});
      }catch(e){console.error("Error updating journal entry:",e);}
    }
    setEntries(es=>es.map(x=>x.id===entryId?{...x,html:newHtml}:x));
    setEditContent(ec=>{const n={...ec};delete n[entryId];return n;});
  };

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div style={{fontWeight:800,fontSize:17,color:th.text}}>{t.journal}</div>
      <ToggleBar th={th} options={[["journal",t.journalMode],["stream",t.streamMode]]} value={mode} onChange={setMode} accent={accent} small/>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:mode==="journal"?12:8,marginBottom:16}}>
      {entries.map(e=>{const isEditing=editContent.hasOwnProperty(e.id);return mode==="journal"?(
        <Card key={e.id} th={th} style={{borderLeft:`3px solid ${accent}44`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,color:accent,fontWeight:700}}>{e.date}</div>
            {!isEditing?<button onClick={()=>setEditContent({...editContent,[e.id]:e.html})} style={{background:"none",border:"none",color:th.text3,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{t.edit}</button>:<div style={{display:"flex",gap:8}}><button onClick={()=>saveEdit(e.id,editContent[e.id])} style={{background:"none",border:"none",color:accent,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:700}}>{t.savEdit}</button><button onClick={()=>{const ec={...editContent};delete ec[e.id];setEditContent(ec);}} style={{background:"none",border:"none",color:th.text3,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{t.cancel}</button></div>}
          </div>
          {isEditing?<RichEditor value={editContent[e.id]} onChange={v=>setEditContent({...editContent,[e.id]:v})} placeholder="…" minHeight={80} accent={accent} th={th}/>:<div style={{fontSize:13,fontFamily:"Georgia,serif",lineHeight:1.8,color:th.text2}} dangerouslySetInnerHTML={{__html:e.html}}/>}
        </Card>
      ):(
        <div key={e.id} style={{display:"flex",gap:10,alignItems:"baseline"}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:accent,flexShrink:0,marginTop:7}}/>
          <span style={{fontSize:10,color:th.text3,flexShrink:0}}>{e.date} —</span>
          <div style={{fontSize:12,color:th.text2,lineHeight:1.6}} dangerouslySetInnerHTML={{__html:e.html}}/>
        </div>
      );})}
    </div>
    <RichEditor value={html} onChange={setHtml} placeholder={t.depositPlaceholder} minHeight={100} accent={accent} th={th}/>
    <Btn th={th} onClick={add} color={accent} full style={{marginTop:10}}>{t.deposit}</Btn>
  </div>);
}

function Parametres({accent,setAccent,lang,setLang,gender,setGender,themeName,setThemeName,notif,setNotif,notifTime,setNotifTime,roadmap,onVote,votedIds,moods,setMoods,th,onLogout,userId,displayName,userEmail}){
  const t=I18N[lang]||I18N.fr;
  const [tab,setTab]=useState("general");
  const [feedbackType,setFeedbackType]=useState("bug");
  const [feedbackText,setFeedbackText]=useState("");
  const [feedbackSent,setFeedbackSent]=useState(false);
  const [showMoodModal,setShowMoodModal]=useState(false);
  const [myFeedbacks,setMyFeedbacks]=useState([]);
  const LANG_FLAGS_MAP={fr:"🇫🇷",en:"🇬🇧",es:"🇪🇸",de:"🇩🇪",it:"🇮🇹",pt:"🇧🇷"};

  useEffect(()=>{
    if(!userId)return;
    const q=query(collection(db,"feedbacks"),where("userId","==",userId),orderBy("createdAt","desc"));
    getDocs(q).then(snap=>setMyFeedbacks(snap.docs.map(d=>({id:d.id,...d.data()})))).catch(console.error);
  },[userId]);
  const sendFeedback=async()=>{
    if(!feedbackText.trim())return;
    const fbData={type:feedbackType,text:feedbackText.trim(),userId,userName:displayName||userEmail?.split("@")[0]||"Utilisateur",userFlag:LANG_FLAGS_MAP[lang]||"🌍",status:"open",createdAt:serverTimestamp()};
    if(userId){
      try{
        const docRef=await addDoc(collection(db,"feedbacks"),fbData);
        setMyFeedbacks(fbs=>[{...fbData,id:docRef.id,createdAt:new Date()},...fbs]);
      }catch(e){console.error(e);}
    }
    setFeedbackSent(true);
    setFeedbackText("");
    setTimeout(()=>setFeedbackSent(false),2500);
  };
  const PRESETS=["#7C9EFF","#F472B6","#34D399","#FBBF24","#A78BFA","#FB923C","#60A5FA","#F87171","#E879F9","#2DD4BF"];
  const STATUS_MAP={building:"🔨 En développement",soon:"📋 Prévu",later:"💡 En réflexion"};
  const themeNames={dark:t.themeDark,light:t.themeLight,warm:t.themeWarm};
  return(<div>
    <div style={{fontWeight:800,fontSize:17,color:th.text,marginBottom:16}}>{t.settings}</div>
    <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto"}}>
      {[["general",t.general],["roadmap",t.roadmap],["feedback",t.feedback]].map(([v,l])=>(
        <button key={v} onClick={()=>setTab(v)} style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",whiteSpace:"nowrap",background:tab===v?accent:accent+"18",color:tab===v?"#fff":accent,fontFamily:"inherit",fontWeight:700,fontSize:12,flexShrink:0}}>{l}</button>
      ))}
    </div>
    {tab==="general"&&<>
      <Card th={th} style={{marginBottom:12}}><SLabel th={th}>{t.theme}</SLabel><div style={{display:"flex",gap:8}}>{Object.entries(THEMES).map(([key,th2])=>(<button key={key} onClick={()=>setThemeName(key)} style={{flex:1,padding:"12px 8px",borderRadius:14,background:themeName===key?accent+"22":th.bg3,border:`2px solid ${themeName===key?accent:th.border}`,color:themeName===key?accent:th.text2,cursor:"pointer",fontFamily:"inherit",fontWeight:themeName===key?700:400,fontSize:12,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:22}}>{th2.icon}</span><span>{themeNames[key]}</span></button>))}</div></Card>
      <Card th={th} style={{marginBottom:12}}><SLabel th={th}>{t.accentColor}</SLabel><div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{PRESETS.map(c=><button key={c} onClick={()=>setAccent(c)} style={{width:28,height:28,borderRadius:7,background:c,border:accent===c?"3px solid "+th.text:"3px solid transparent",cursor:"pointer",transition:"all .15s"}}/>)}</div><div style={{display:"flex",alignItems:"center",gap:8}}><input type="color" value={accent} onChange={e=>setAccent(e.target.value)} style={{width:28,height:28,borderRadius:7,border:"none",cursor:"pointer",background:"none"}}/><input value={accent} onChange={e=>setAccent(e.target.value)} style={{flex:1,background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:10,padding:"6px 10px",color:th.text,fontSize:12,fontFamily:"monospace"}}/></div></Card>
      <Card th={th} style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <SLabel th={th}>{t.mood}</SLabel>
          <button onClick={()=>setShowMoodModal(true)} style={{background:"none",border:"none",color:accent,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:700}}>{t.customizeMoods}</button>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {moods.map(m=><div key={m.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",background:m.color+"18",borderRadius:20,border:`1px solid ${m.color}44`}}><div style={{width:10,height:10,borderRadius:3,background:m.color}}/><span style={{fontSize:12,color:th.text,fontWeight:600}}>{m.label}</span></div>)}
        </div>
      </Card>
      <Card th={th} style={{marginBottom:12}}><SLabel th={th}>{t.language}</SLabel><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>{LANG_FLAGS.map(l=>(<button key={l.code} onClick={()=>setLang(l.code)} style={{padding:"8px 12px",borderRadius:12,display:"flex",alignItems:"center",gap:7,background:lang===l.code?accent+"22":th.bg3,border:`2px solid ${lang===l.code?accent:th.border}`,color:lang===l.code?accent:th.text2,cursor:"pointer",fontFamily:"inherit",fontWeight:lang===l.code?700:400,fontSize:12}}><span style={{fontSize:16}}>{l.flag}</span>{l.label}</button>))}</div></Card>
      <Card th={th} style={{marginBottom:12}}><SLabel th={th}>{t.gender}</SLabel><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>{[["H",t.maleG],["F",t.femaleG],["NB",t.nbG],["X",t.noG]].map(([v,l])=>(<button key={v} onClick={()=>setGender(v)} style={{padding:"9px 10px",borderRadius:12,background:gender===v?accent+"22":th.bg3,border:`2px solid ${gender===v?accent:th.border}`,color:gender===v?accent:th.text2,cursor:"pointer",fontFamily:"inherit",fontWeight:gender===v?700:400,fontSize:12}}>{l}</button>))}</div></Card>
      <Card th={th} style={{marginBottom:12}}><SLabel th={th}>{t.notifications}</SLabel><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:notif?10:0}}><span style={{fontSize:14,color:th.text}}>{t.dailyReminder}</span><Toggle value={notif} onChange={setNotif} accent={accent}/></div>{notif&&<div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:13,color:th.text2}}>{t.time}</span><input type="time" value={notifTime} onChange={e=>setNotifTime(e.target.value)} style={{background:th.inputBg,border:`1px solid ${accent}44`,borderRadius:10,padding:"6px 10px",color:th.text,fontSize:14,fontFamily:"inherit"}}/></div>}</Card>
      {onLogout&&<Card th={th} style={{marginBottom:12}}>
        <button onClick={onLogout} style={{width:"100%",padding:"12px",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:12,color:"#F87171",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>⎋ {t.logout}</button>
      </Card>}
    </>}
    {tab==="roadmap"&&<><div style={{fontSize:13,color:th.text2,marginBottom:14,lineHeight:1.6}}>{t.voteHint}</div>{["building","soon","later"].map(status=>{const items=roadmap.filter(r=>r.status===status);if(!items.length)return null;return<div key={status} style={{marginBottom:16}}><SLabel th={th}>{STATUS_MAP[status]}</SLabel>{items.map(r=>(<Card key={r.id} th={th} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div style={{flex:1,marginRight:10}}><div style={{fontWeight:700,fontSize:13,color:th.text,marginBottom:2}}>{r.title}</div><div style={{fontSize:11,color:th.text3}}>{r.desc}</div></div><button onClick={()=>onVote(r.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 10px",borderRadius:10,cursor:"pointer",background:votedIds.includes(r.id)?accent+"22":th.bg3,border:`1.5px solid ${votedIds.includes(r.id)?accent:th.border}`,color:votedIds.includes(r.id)?accent:th.text3,flexShrink:0}}><span style={{fontSize:13}}>{votedIds.includes(r.id)?"▲":"△"}</span><span style={{fontSize:11,fontWeight:700}}>{r.votes}</span></button></div></Card>))}</div>;})}  </>}
    {tab==="feedback"&&<>
      <div style={{fontSize:13,color:th.text2,marginBottom:14}}>Un bug ou une idée ?</div>
      <Card th={th} style={{marginBottom:16}}>
        <SLabel th={th}>Type</SLabel>
        <div style={{display:"flex",gap:8,marginBottom:14}}><Pill active={feedbackType==="bug"} color="#F87171" th={th} onClick={()=>setFeedbackType("bug")}>{t.bugType}</Pill><Pill active={feedbackType==="idea"} color={accent} th={th} onClick={()=>setFeedbackType("idea")}>{t.ideaType}</Pill></div>
        <SLabel th={th}>Description</SLabel>
        <textarea value={feedbackText} onChange={e=>setFeedbackText(e.target.value)} rows={4} placeholder={feedbackType==="bug"?t.bugPlaceholder:t.ideaPlaceholder} style={{width:"100%",background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:12,padding:"10px 14px",color:th.text,fontSize:13,fontFamily:"inherit",lineHeight:1.6,resize:"none",boxSizing:"border-box",marginBottom:12}}/>
        {feedbackSent?<div style={{textAlign:"center",padding:12,color:"#4ADE80",fontWeight:700,fontSize:14}}>{t.sent}</div>:<Btn th={th} onClick={sendFeedback} color={feedbackType==="bug"?"#F87171":accent} full disabled={!feedbackText.trim()}>{t.send}</Btn>}
      </Card>
      {myFeedbacks.length>0&&<>
        <SLabel th={th}>Mes envois</SLabel>
        {myFeedbacks.map(fb=>{
          const statusColor=fb.status==="done"?"#4ADE80":fb.status==="progress"?"#FBBF24":th.text3;
          const statusLabel=fb.status==="done"?"Répondu":fb.status==="progress"?"En cours":"En attente";
          return(<Card key={fb.id} th={th} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:11,padding:"2px 9px",borderRadius:20,fontWeight:700,background:fb.type==="bug"?"rgba(248,113,113,0.12)":"rgba(124,158,255,0.12)",color:fb.type==="bug"?"#F87171":"#7C9EFF"}}>{fb.type==="bug"?"🐛 Bug":"💡 Idée"}</span>
              <span style={{fontSize:11,color:statusColor,fontWeight:700}}>{statusLabel}</span>
            </div>
            <div style={{fontSize:13,color:th.text,marginBottom:fb.response?8:0}}>{fb.text}</div>
            {fb.response&&<div style={{fontSize:12,color:accent,background:accent+"11",borderRadius:8,padding:"6px 10px"}}>↳ {fb.response}</div>}
          </Card>);
        })}
      </>}
    </>}
    {showMoodModal&&<MoodModal moods={moods} setMoods={setMoods} lang={lang} accent={accent} th={th} onClose={()=>setShowMoodModal(false)}/>}
  </div>);
}

function Admin({onBack,roadmap,setRoadmap,th,accent,lang,userId}){
  const t=I18N[lang]||I18N.fr;
  const [tab,setTab]=useState("stats");
  const [comment,setComment]=useState({});
  const [editRoad,setEditRoad]=useState(null);
  const [editTitle,setEditTitle]=useState({});
  const [editDesc,setEditDesc]=useState({});
  const [showAddForm,setShowAddForm]=useState(false);
  const [newItemTitle,setNewItemTitle]=useState("");
  const [newItemDesc,setNewItemDesc]=useState("");
  const [newItemStatus,setNewItemStatus]=useState("soon");
  const [adminUsers,setAdminUsers]=useState([]);
  const [adminFeedbacks,setAdminFeedbacks]=useState([]);
  const [adminStats,setAdminStats]=useState({total:0,premium:0});
  const [adminLoading,setAdminLoading]=useState(true);
  const STATUS_OPTS=[["building","🔨 En dev"],["soon","📋 Prévu"],["later","💡 Réflexion"],["done","✅ Dispo"]];

  useEffect(()=>{
    if(!userId) return;
    (async()=>{
      setAdminLoading(true);
      try{
        const usersSnap=await getDocs(collection(db,"users"));
        const users=usersSnap.docs.map(d=>({id:d.id,...d.data()}));
        const premium=users.filter(u=>u.role==="paid"||u.role==="admin").length;
        setAdminStats({total:users.length,premium});
        setAdminUsers([...users].sort((a,b)=>(b.createdAt?.toMillis?.()??0)-(a.createdAt?.toMillis?.()??0)).slice(0,10));
        const fbQ=query(collection(db,"feedbacks"),orderBy("createdAt","desc"));
        const fbSnap=await getDocs(fbQ);
        setAdminFeedbacks(fbSnap.docs.map(d=>({id:d.id,...d.data()})));
      }catch(e){console.error("Admin load error:",e);}
      finally{setAdminLoading(false);}
    })();
  },[userId]);

  const updateFbStatus=async(fbId,status)=>{
    try{
      await updateDoc(doc(db,"feedbacks",fbId),{status});
      setAdminFeedbacks(fbs=>fbs.map(f=>f.id===fbId?{...f,status}:f));
    }catch(e){console.error(e);}
  };

  const sendComment=async(fbId)=>{
    const resp=comment[fbId];
    if(!resp?.trim())return;
    try{
      await updateDoc(doc(db,"feedbacks",fbId),{response:resp.trim(),status:"done"});
      setAdminFeedbacks(fbs=>fbs.map(f=>f.id===fbId?{...f,response:resp.trim(),status:"done"}:f));
      setComment(c=>{const n={...c};delete n[fbId];return n;});
    }catch(e){console.error(e);}
  };

  const addRoadmapItem=async()=>{
    if(!newItemTitle.trim())return;
    try{
      const docRef=await addDoc(collection(db,"roadmap"),{title:newItemTitle.trim(),desc:newItemDesc.trim(),status:newItemStatus,votes:0,createdAt:serverTimestamp()});
      setRoadmap(r=>[...r,{id:docRef.id,title:newItemTitle.trim(),desc:newItemDesc.trim(),status:newItemStatus,votes:0}]);
      setNewItemTitle("");setNewItemDesc("");setNewItemStatus("soon");setShowAddForm(false);
    }catch(e){console.error(e);}
  };

  const saveRoadmapItem=async(id)=>{
    const title=editTitle[id];const desc=editDesc[id];
    const updates={};
    if(title!==undefined)updates.title=title;
    if(desc!==undefined)updates.desc=desc;
    setRoadmap(r=>r.map(x=>x.id===id?{...x,...updates}:x));
    setEditTitle(t=>{const n={...t};delete n[id];return n;});
    setEditDesc(d=>{const n={...d};delete n[id];return n;});
    setEditRoad(null);
    if(Object.keys(updates).length){
      setDoc(doc(db,"roadmap",String(id)),updates,{merge:true}).catch(console.error);
    }
  };

  const deleteRoadmapItem=async(id)=>{
    setRoadmap(r=>r.filter(x=>x.id!==id));
    setEditRoad(null);
    deleteDoc(doc(db,"roadmap",String(id))).catch(console.error);
  };

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
      <button onClick={onBack} style={{background:th.bg3,border:`1px solid ${th.border}`,borderRadius:10,padding:"7px 14px",color:th.text,cursor:"pointer"}}>←</button>
      <div style={{fontWeight:800,fontSize:17,color:th.text}}>🔐 Admin</div>
      <div style={{fontSize:10,color:th.text3,marginLeft:"auto"}}>{APP_VERSION}</div>
    </div>
    <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto"}}>
      {[["stats","📊 Stats"],["users","👥 Users"],["roadmap","🗺 Roadmap"],["feedbacks","💬 Feedbacks"]].map(([v,l])=>(
        <button key={v} onClick={()=>setTab(v)} style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",whiteSpace:"nowrap",background:tab===v?accent:accent+"18",color:tab===v?"#fff":accent,fontFamily:"inherit",fontWeight:700,fontSize:12,flexShrink:0}}>{l}</button>
      ))}
    </div>
    {tab==="stats"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {adminLoading?<Card th={th} style={{gridColumn:"1/-1",textAlign:"center"}}><div style={{color:th.text3,fontSize:13}}>Chargement…</div></Card>:<>
        <Card th={th} style={{border:"1px solid #7C9EFF22",textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:"#7C9EFF",marginBottom:2}}>{adminStats.total}</div><div style={{fontSize:10,color:th.text3}}>👥 {t.plan}</div></Card>
        <Card th={th} style={{border:"1px solid #A78BFA22",textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:"#A78BFA",marginBottom:2}}>{adminStats.premium}</div><div style={{fontSize:10,color:th.text3}}>✦ Premium</div></Card>
        <Card th={th} style={{gridColumn:"1/-1"}}><div style={{fontSize:11,color:th.text3,marginBottom:4}}>💳 {t.revenuecat}</div><div style={{fontSize:13,color:th.text2}}>Les modifications de prix ne s'appliquent qu'aux nouveaux abonnés.</div></Card>
      </>}
    </div>}
    {tab==="users"&&<Card th={th}><SLabel th={th}>Derniers inscrits</SLabel>
      {adminLoading?<div style={{color:th.text3,fontSize:13}}>Chargement…</div>:adminUsers.length===0?<div style={{color:th.text3,fontSize:13}}>Aucun utilisateur</div>:
        adminUsers.map(u=>{const name=u.displayName||(u.email?.split("@")[0])||"Utilisateur";const isPrem=u.role==="paid"||u.role==="admin";return(
          <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${th.border}`}}>
            <div style={{fontSize:12,color:th.text}}>{name}</div>
            <span style={{fontSize:11,padding:"2px 9px",borderRadius:20,background:isPrem?accent+"22":th.bg3,color:isPrem?accent:th.text3,fontWeight:700}}>{isPrem?"Premium":"Gratuit"}</span>
          </div>);})
      }
    </Card>}
    {tab==="roadmap"&&<>
      {roadmap.map(r=>(<Card key={r.id} th={th} style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div><div style={{fontWeight:700,fontSize:13,color:th.text}}>{r.title}</div><div style={{fontSize:10,color:th.text3}}>{r.votes} vote{r.votes!==1?"s":""}</div></div>
          <button onClick={()=>{const opening=editRoad!==r.id;setEditRoad(opening?r.id:null);if(opening){setEditTitle(t=>({...t,[r.id]:r.title}));setEditDesc(d=>({...d,[r.id]:r.desc||""}));}}} style={{background:"none",border:"none",color:accent,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:700}}>{editRoad===r.id?"✕":"Modifier"}</button>
        </div>
        {editRoad===r.id&&<div style={{marginTop:8}}>
          <input value={editTitle[r.id]??r.title} onChange={e=>setEditTitle(t=>({...t,[r.id]:e.target.value}))} placeholder="Titre" style={{width:"100%",background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:9,padding:"6px 10px",color:th.text,fontSize:12,fontFamily:"inherit",marginBottom:6,boxSizing:"border-box"}}/>
          <input value={editDesc[r.id]??r.desc??""} onChange={e=>setEditDesc(d=>({...d,[r.id]:e.target.value}))} placeholder="Description" style={{width:"100%",background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:9,padding:"6px 10px",color:th.text,fontSize:12,fontFamily:"inherit",marginBottom:8,boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
            {STATUS_OPTS.map(([v,l])=><Pill key={v} active={r.status===v} color={accent} th={th} onClick={()=>{setDoc(doc(db,"roadmap",String(r.id)),{status:v},{merge:true}).catch(console.error);setRoadmap(rm=>rm.map(x=>x.id===r.id?{...x,status:v}:x));}} small>{l}</Pill>)}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>saveRoadmapItem(r.id)} style={{flex:1,padding:"6px 12px",background:accent,border:"none",borderRadius:9,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>✓ Enregistrer</button>
            <button onClick={()=>deleteRoadmapItem(r.id)} style={{padding:"6px 12px",background:"rgba(248,113,113,0.12)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:9,color:"#F87171",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>🗑 Supprimer</button>
          </div>
        </div>}
      </Card>))}
      {showAddForm
        ?<Card th={th} style={{marginBottom:10}}>
          <div style={{fontWeight:700,fontSize:12,color:th.text,marginBottom:8}}>Nouvel élément</div>
          <input value={newItemTitle} onChange={e=>setNewItemTitle(e.target.value)} placeholder="Titre *" style={{width:"100%",background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:9,padding:"6px 10px",color:th.text,fontSize:12,fontFamily:"inherit",marginBottom:6,boxSizing:"border-box"}}/>
          <input value={newItemDesc} onChange={e=>setNewItemDesc(e.target.value)} placeholder="Description" style={{width:"100%",background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:9,padding:"6px 10px",color:th.text,fontSize:12,fontFamily:"inherit",marginBottom:8,boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
            {STATUS_OPTS.map(([v,l])=><Pill key={v} active={newItemStatus===v} color={accent} th={th} onClick={()=>setNewItemStatus(v)} small>{l}</Pill>)}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={addRoadmapItem} disabled={!newItemTitle.trim()} style={{flex:1,padding:"6px 12px",background:accent,border:"none",borderRadius:9,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit",opacity:newItemTitle.trim()?1:0.5}}>+ Ajouter</button>
            <button onClick={()=>{setShowAddForm(false);setNewItemTitle("");setNewItemDesc("");}} style={{padding:"6px 12px",background:th.bg3,border:`1px solid ${th.border}`,borderRadius:9,color:th.text,fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>✕</button>
          </div>
        </Card>
        :<button onClick={()=>setShowAddForm(true)} style={{width:"100%",padding:"10px",background:accent+"18",border:`1px dashed ${accent}55`,borderRadius:12,color:accent,fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>+ Nouvel élément</button>
      }
    </>}
    {tab==="feedbacks"&&<>
      {adminLoading?<Card th={th}><div style={{color:th.text3,fontSize:13}}>Chargement…</div></Card>:adminFeedbacks.length===0?<Card th={th}><div style={{color:th.text3,fontSize:13}}>Aucun feedback</div></Card>:
        adminFeedbacks.map(fb=>(<Card key={fb.id} th={th} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {fb.userFlag&&<span>{fb.userFlag}</span>}
              <span style={{fontSize:11,padding:"2px 9px",borderRadius:20,fontWeight:700,background:fb.type==="bug"?"rgba(248,113,113,0.12)":"rgba(124,158,255,0.12)",color:fb.type==="bug"?"#F87171":"#7C9EFF"}}>{fb.type==="bug"?"🐛 Bug":"💡"}</span>
              <span style={{fontSize:11,color:th.text3}}>{fb.userName||fb.user||""}</span>
            </div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              {["open","progress","done"].map(s=><button key={s} title={s==="done"?"Traité":s==="progress"?"En cours":"En attente"} onClick={()=>updateFbStatus(fb.id,s)} style={{fontSize:10,padding:"2px 7px",borderRadius:20,fontWeight:700,cursor:"pointer",border:"none",background:fb.status===s?(s==="done"?"#4ADE8022":s==="progress"?"#FBBF2422":"rgba(100,100,100,0.2)"):th.bg3,color:fb.status===s?(s==="done"?"#4ADE80":s==="progress"?"#FBBF24":th.text):th.text3}}>{s==="done"?"✓ Traité":s==="progress"?"⚡ En cours":"● Attente"}</button>)}
            </div>
          </div>
          <div style={{fontSize:13,color:th.text,marginBottom:10}}>{fb.text}</div>
          {fb.response&&<div style={{fontSize:12,color:accent,background:accent+"11",borderRadius:8,padding:"6px 10px",marginBottom:8}}>↳ {fb.response}</div>}
          <div style={{display:"flex",gap:8}}>
            <input placeholder="Répondre…" value={comment[fb.id]||""} onChange={e=>setComment({...comment,[fb.id]:e.target.value})} style={{flex:1,background:th.inputBg,border:`1px solid ${th.border2}`,borderRadius:9,padding:"6px 10px",color:th.text,fontSize:12,fontFamily:"inherit"}}/>
            <button onClick={()=>sendComment(fb.id)} style={{padding:"6px 12px",background:accent,border:"none",borderRadius:9,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:12}}>→</button>
          </div>
        </Card>))
      }
    </>}
  </div>);
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App({
  userId = "",
  userEmail = "",
  displayName = "",
  role = "free",
  onLogout,
  badgeLabel = "Gratuit",
  badgeColor = "#6b7280"
}) {
  const [screen, setScreen] = useState("app");
  const [userInfo, setUserInfo] = useState({
    firstName: displayName || "Toi",
    lang: "fr",
    gender: "",
    email: userEmail,
  });
  const [accent, setAccent] = useState("#7C9EFF");
  const [themeName, setThemeName] = useState("light");
  const [page, setPage] = useState("home");
  const [plan, setPlan] = useState(role === "paid" || role === "admin" ? "plus" : "free");
  const [widgets, setWidgets] = useState(["objectives","weekMoods","streaks","aiInsight"]);
  const [notif, setNotif] = useState(true);
  const [notifTime, setNotifTime] = useState("21:00");
  const dataLoadedRef = useRef(false);
  const [data, setDataRaw] = useState({});
  const setData = useCallback((updater) => {
    setDataRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (userId && dataLoadedRef.current) {
        Object.keys(next).forEach(m => {
          if (next[m] !== prev[m]) {
            setDoc(doc(db, "users", userId, "days", `${CUR_Y}_${m}`), next[m] || {}).catch(console.error);
          }
        });
      }
      return next;
    });
  }, [userId]);
  useEffect(() => {
    if (!userId) { dataLoadedRef.current = true; return; }
    (async () => {
      try {
        const snap = await getDocs(collection(db, "users", userId, "days"));
        const loaded = {};
        snap.forEach(docSnap => {
          const parts = docSnap.id.split("_");
          if (parts.length === 2 && parseInt(parts[0]) === CUR_Y) {
            loaded[parseInt(parts[1])] = docSnap.data();
          }
        });
        setDataRaw(loaded);
      } catch(e) { console.error("Error loading days:", e); }
      finally { dataLoadedRef.current = true; }
    })();
  }, [userId]);
  const [trackers, setTrackers] = useState([TRACKER_CATALOGUE[0],TRACKER_CATALOGUE[1],TRACKER_CATALOGUE[2]]);
  const [objectives, setObjectives] = useState([]);
  const [roadmap, setRoadmap] = useState(INIT_ROADMAP);
  const [votedIds, setVotedIds] = useState([]);

  // Load roadmap from Firestore (fallback to INIT_ROADMAP if empty)
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "roadmap"));
        if (!snap.empty) {
          setRoadmap(snap.docs.map(d => ({...d.data(), id: d.id})));
        }
      } catch(e) { console.error("Roadmap load error:", e); }
    })();
  }, []);

  // Persist votedIds per user in localStorage
  useEffect(() => {
    if (!userId) return;
    try {
      const saved = localStorage.getItem(`lumio_votes_${userId}`);
      if (saved) setVotedIds(JSON.parse(saved));
    } catch(e) {}
  }, [userId]);
  const [adVisible, setAdVisible] = useState(false);
  const [moods, setMoods] = useState(()=>DEFAULT_MOODS.map(m=>({...m,label:I18N.fr.moods[m.id]})));

  const setLang = useCallback(l => {
    setUserInfo(u=>({...u,lang:l}));
    setMoods(ms=>ms.map(m=>{
      const def=DEFAULT_MOODS.find(d=>d.id===m.id);
      if(def&&I18N[l]?.moods[m.id]) return {...m,label:I18N[l].moods[m.id]};
      return m;
    }));
  },[]);

  const th = THEMES[themeName] || THEMES.light;
  const t = I18N[userInfo.lang] || I18N.fr;
  const isAdmin = role === "admin";

  const adCountRef = useRef(0);
  const lastAdRef = useRef(0);
  const sessionSavesRef = useRef(0);
  const showAdPopup = useCallback((trigger) => {
    if(plan !== "free") return;
    const now = Date.now();
    if(now - lastAdRef.current < 120000) return;
    sessionSavesRef.current++;
    adCountRef.current++;
    const show = (trigger === "save" && sessionSavesRef.current % 3 === 0) || (now - lastAdRef.current > 300000);
    if(show){ lastAdRef.current = now; setAdVisible(true); }
  },[plan]);

  const handleVote = id => {
    const alreadyVoted = votedIds.includes(id);
    const newVoted = alreadyVoted ? votedIds.filter(x => x !== id) : [...votedIds, id];
    setVotedIds(newVoted);
    if (userId) localStorage.setItem(`lumio_votes_${userId}`, JSON.stringify(newVoted));
    setRoadmap(r => {
      const newR = r.map(x => x.id === id ? {...x, votes: alreadyVoted ? Math.max(0, x.votes-1) : x.votes+1} : x);
      const item = newR.find(x => x.id === id);
      if (item) setDoc(doc(db, "roadmap", String(id)), {votes: item.votes}, {merge:true}).catch(console.error);
      return newR;
    });
  };

  const NAV = [
    {id:"home",   icon:"✦", label:t.nav.home},
    {id:"entry",  icon:"＋", label:t.nav.entry},
    {id:"track",  icon:"📅", label:t.nav.track},
    {id:"journal",icon:"💭", label:t.nav.journal},
    {id:"settings",icon:"⚙", label:t.nav.settings},
  ];

  if(screen === "admin") return (
    <div style={{minHeight:"100vh",background:th.bg,color:th.text,fontFamily:"'Nunito',-apple-system,sans-serif",display:"flex",justifyContent:"center",padding:"20px 16px 30px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;}button:active{transform:scale(0.96);}`}</style>
      <div style={{width:"100%",maxWidth:440}}><Admin th={th} accent={accent} lang={userInfo.lang} onBack={()=>setScreen("app")} roadmap={roadmap} setRoadmap={setRoadmap} userId={userId}/></div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:th.bg,color:th.text,fontFamily:"'Nunito',-apple-system,sans-serif",display:"flex",justifyContent:"center",padding:"18px 16px 90px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap'); *{box-sizing:border-box;}input,textarea{outline:none;} input::placeholder,textarea::placeholder{color:${th.label};} button:active{transform:scale(0.96);} input[type=number]::-webkit-inner-spin-button{opacity:.3;} @keyframes fadeIn{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}`}</style>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{display:"flex",alignItems:"baseline",gap:6}}>
            <div style={{fontSize:20,fontWeight:900,color:accent,letterSpacing:-0.5}}>Lumio ✦</div>
            <div style={{fontSize:9,color:th.text3,fontWeight:600}}>{APP_VERSION}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {!isAdmin && <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,fontWeight:700,background:badgeColor+"22",border:`1px solid ${badgeColor}44`,color:badgeColor}}>{badgeLabel}</span>}
            {isAdmin && (
              <button onClick={()=>setScreen("admin")} style={{background:"rgba(255,80,80,0.1)",border:"1px solid rgba(255,80,80,0.2)",borderRadius:8,padding:"3px 8px",color:"#ff9999",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>🔐 Admin</button>
            )}
            <MoodCell mood1={data[CUR_M]?.[TODAY]?.mood1} mood2={data[CUR_M]?.[TODAY]?.mood2} size={26} th={th} moods={moods}/>
          </div>
        </div>
        <div key={page} style={{animation:"fadeIn .2s ease"}}>
          {page==="home"    && <Dashboard data={data} setData={setData} objectives={objectives} setObjectives={setObjectives} widgets={widgets} setWidgets={setWidgets} trackers={trackers} moods={moods} accent={accent} firstName={userInfo.firstName} plan={plan} th={th} lang={userInfo.lang} showAdPopup={showAdPopup}/>}
          {page==="entry"   && <Saisie data={data} setData={setData} trackers={trackers} setTrackers={setTrackers} moods={moods} accent={accent} th={th} lang={userInfo.lang} showAdPopup={showAdPopup}/>}
          {page==="track"   && <Suivi data={data} setData={setData} trackers={trackers} moods={moods} accent={accent} th={th} lang={userInfo.lang}/>}
          {page==="journal" && <Decharge accent={accent} th={th} lang={userInfo.lang} userId={userId}/>}
          {page==="settings"&& <Parametres accent={accent} setAccent={setAccent} lang={userInfo.lang} setLang={setLang} gender={userInfo.gender} setGender={g=>setUserInfo(u=>({...u,gender:g}))} themeName={themeName} setThemeName={setThemeName} notif={notif} setNotif={setNotif} notifTime={notifTime} setNotifTime={setNotifTime} roadmap={roadmap} onVote={handleVote} votedIds={votedIds} moods={moods} setMoods={setMoods} th={th} onLogout={onLogout} userId={userId} displayName={displayName} userEmail={userEmail}/>}
        </div>
      </div>
      <nav style={{position:"fixed",bottom:0,left:0,right:0,background:th.navBg,backdropFilter:"blur(20px)",borderTop:`1px solid ${th.border}`,display:"flex",justifyContent:"center",padding:"8px 0 18px"}}>
        {NAV.map(n=>(<button key={n.id} onClick={()=>setPage(n.id)} style={{flex:1,maxWidth:80,display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"5px 0",color:page===n.id?accent:th.text3,fontFamily:"inherit",transition:"color .2s"}}>
          <span style={{fontSize:15,filter:page===n.id?"none":"grayscale(1) opacity(.4)"}}>{n.icon}</span>
          <span style={{fontSize:9,fontWeight:page===n.id?800:400}}>{n.label}</span>
          {page===n.id&&<span style={{width:3,height:3,borderRadius:"50%",background:accent}}/>}
        </button>))}
      </nav>
      {adVisible && <AdPopup th={th} accent={accent} t={t} onClose={()=>setAdVisible(false)} onUpgrade={()=>{setPlan("plus");setAdVisible(false);}}/>}
    </div>
  );
}
