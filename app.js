const STORAGE_KEY = "winefest-passport-v0-3-2";
const SCHEMA_VERSION = "0.3.3";
const SUPABASE_URL = "https://tnqqdnprddbhdiauvcjj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRucXFkbnByZGRiaGRpYXV2Y2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNDQ0ODcsImV4cCI6MjA5NzgyMDQ4N30.p0U8BQJbybW9aRNmsV5lCzCKXStCpe_7tWheRR0zg-k";

function createVisitorId() {
  return `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultState() {
  const visitorId = createVisitorId();
  return {
    schemaVersion: SCHEMA_VERSION,
    language: "en",
    hasEntered: false,
    visitorId,
    guest: {
      id: `guest_${visitorId}`,
      remoteId: "",
      name: "",
      email: "",
      phone: ""
    },
    currentTableId: "t1",
    currentWineId: "w1",
    currentDistributor: "",
    currentSubInfo: "top10",
    currentWineOrigin: {
      type: "table",
      tableId: "t1",
      distributorId: ""
    },
    ratings: {},
    interests: [],
    badgeLevel: 0
  };
}

function loadSavedState() {
  const base = createDefaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    const visitorId = saved.visitorId || base.visitorId;
    return {
      ...base,
      ...saved,
      schemaVersion: saved.schemaVersion || SCHEMA_VERSION,
      visitorId,
      guest: {
        ...base.guest,
        id: saved.guest?.id || `guest_${visitorId}`,
        remoteId: saved.guest?.remoteId || "",
        name: saved.guest?.name || "",
        email: saved.guest?.email || "",
        phone: saved.guest?.phone || ""
      },
      currentWineOrigin: {
        ...base.currentWineOrigin,
        ...(saved.currentWineOrigin || {}),
        distributorId: saved.currentWineOrigin?.distributorId || saved.currentWineOrigin?.distributor || ""
      },
      ratings: saved.ratings || {},
      interests: Array.isArray(saved.interests) ? saved.interests : [],
      badgeLevel: saved.badgeLevel || 0
    };
  } catch {
    return base;
  }
}

const state = loadSavedState();

const badgeAssets = {
  en: {
    "badge-first": "./assets/badges/EN/First_Stamp.png",
    "badge-explorer": "./assets/badges/EN/Tasting_Explorer.png",
    "badge-scout": "./assets/badges/EN/Cellar_Scout.png",
    "badge-tour": "./assets/badges/EN/Grand_Tasting_Tour.png",
    "badge-legend": "./assets/badges/EN/Winefest_Legend.png"
  },
  es: {
    "badge-first": "./assets/badges/ES/Primer_Sello.png",
    "badge-explorer": "./assets/badges/ES/Explorador_de_Cata.png",
    "badge-scout": "./assets/badges/ES/Explorador_de_Bodega.png",
    "badge-tour": "./assets/badges/ES/Gran_Tour-de_Cata.png",
    "badge-legend": "./assets/badges/ES/Leyenda_de_Winefest.png"
  }
};

let tables = [
  {
    id: "t1",
    number: "01",
    name: "Panama Cellars",
    distributorIds: ["d1"],
    wines: ["w1", "w2", "w3"]
  },
  {
    id: "t2",
    number: "02",
    name: "Altos del Sur",
    distributorIds: ["d2"],
    wines: ["w4", "w5"]
  },
  {
    id: "t3",
    number: "03",
    name: "Casa Espumante",
    distributorIds: ["d3"],
    wines: ["w6", "w7"]
  },
  {
    id: "t4",
    number: "04",
    name: "Valle Imports",
    distributorIds: ["d4"],
    wines: ["w8", "w9", "w10"]
  }
];

let wines = {
  w1: {
    name: "Brut Reserva",
    type: "Sparkling",
    country: "Spain",
    region: "Penedes",
    tableId: "t1",
    distributorId: "d1",
    notes: "Bright citrus, green apple, fine bubbles, clean finish.",
    sweetness: "Dry",
    acidity: "High",
    body: "Light",
    pairing: "Seafood, soft cheeses, fried appetizers",
    es: {
      type: "Espumante",
      country: "España",
      notes: "Cítricos brillantes, manzana verde, burbujas finas y final limpio.",
      sweetness: "Seco",
      acidity: "Alta",
      body: "Ligero",
      pairing: "Mariscos, quesos suaves, aperitivos fritos"
    }
  },
  w2: {
    name: "Chardonnay Valle Claro",
    type: "White",
    country: "Chile",
    region: "Casablanca Valley",
    tableId: "t1",
    distributorId: "d1",
    notes: "Tropical fruit, light oak, round texture.",
    sweetness: "Dry",
    acidity: "Medium",
    body: "Medium",
    pairing: "Chicken, creamy pasta, grilled fish",
    es: {
      type: "Blanco",
      country: "Chile",
      notes: "Fruta tropical, roble ligero y textura redonda.",
      sweetness: "Seco",
      acidity: "Media",
      body: "Medio",
      pairing: "Pollo, pasta cremosa, pescado a la parrilla"
    }
  },
  w3: {
    name: "Malbec Finca Norte",
    type: "Red",
    country: "Argentina",
    region: "Mendoza",
    tableId: "t1",
    distributorId: "d1",
    notes: "Black plum, cocoa, smooth tannins.",
    sweetness: "Dry",
    acidity: "Medium",
    body: "Full",
    pairing: "Steak, burgers, roasted vegetables",
    es: {
      type: "Tinto",
      country: "Argentina",
      notes: "Ciruela negra, cacao y taninos suaves.",
      sweetness: "Seco",
      acidity: "Media",
      body: "Con cuerpo",
      pairing: "Carne, hamburguesas, vegetales asados"
    }
  },
  w4: {
    name: "Rose de Verano",
    type: "Rose",
    country: "France",
    region: "Provence",
    tableId: "t2",
    distributorId: "d2",
    notes: "Strawberry, citrus peel, crisp mineral finish.",
    sweetness: "Dry",
    acidity: "Medium-high",
    body: "Light",
    pairing: "Salads, seafood, tapas",
    es: {
      type: "Rosado",
      country: "Francia",
      notes: "Fresa, piel de cítrico y final mineral fresco.",
      sweetness: "Seco",
      acidity: "Media-alta",
      body: "Ligero",
      pairing: "Ensaladas, mariscos, tapas"
    }
  },
  w5: {
    name: "Cabernet Andino",
    type: "Red",
    country: "Chile",
    region: "Maipo Valley",
    tableId: "t2",
    distributorId: "d2",
    notes: "Blackcurrant, cedar, firm structure.",
    sweetness: "Dry",
    acidity: "Medium",
    body: "Full",
    pairing: "Grilled meats, mature cheese",
    es: {
      type: "Tinto",
      country: "Chile",
      notes: "Grosella negra, cedro y estructura firme.",
      sweetness: "Seco",
      acidity: "Media",
      body: "Con cuerpo",
      pairing: "Carnes a la parrilla, queso maduro"
    }
  },
  w6: {
    name: "Prosecco Millesimato",
    type: "Sparkling",
    country: "Italy",
    region: "Veneto",
    tableId: "t3",
    distributorId: "d3",
    notes: "Pear, white flowers, soft bubbles.",
    sweetness: "Extra dry",
    acidity: "Medium",
    body: "Light",
    pairing: "Brunch, fruit, light appetizers",
    es: {
      type: "Espumante",
      country: "Italia",
      notes: "Pera, flores blancas y burbujas suaves.",
      sweetness: "Extra seco",
      acidity: "Media",
      body: "Ligero",
      pairing: "Brunch, frutas, aperitivos ligeros"
    }
  },
  w7: {
    name: "Sauvignon Blanc Alto",
    type: "White",
    country: "New Zealand",
    region: "Marlborough",
    tableId: "t3",
    distributorId: "d3",
    notes: "Passion fruit, lime, herbal freshness.",
    sweetness: "Dry",
    acidity: "High",
    body: "Light",
    pairing: "Ceviche, goat cheese, greens",
    es: {
      type: "Blanco",
      country: "Nueva Zelanda",
      notes: "Maracuyá, lima y frescura herbal.",
      sweetness: "Seco",
      acidity: "Alta",
      body: "Ligero",
      pairing: "Ceviche, queso de cabra, hojas verdes"
    }
  },
  w8: {
    name: "Tempranillo Crianza",
    type: "Red",
    country: "Spain",
    region: "Rioja",
    tableId: "t4",
    distributorId: "d4",
    notes: "Cherry, vanilla, leather, balanced finish.",
    sweetness: "Dry",
    acidity: "Medium",
    body: "Medium",
    pairing: "Pork, paella, roasted mushrooms",
    es: {
      type: "Tinto",
      country: "España",
      notes: "Cereza, vainilla, cuero y final balanceado.",
      sweetness: "Seco",
      acidity: "Media",
      body: "Medio",
      pairing: "Cerdo, paella, hongos asados"
    }
  },
  w9: {
    name: "Moscato Dolce",
    type: "Sweet",
    country: "Italy",
    region: "Piedmont",
    tableId: "t4",
    distributorId: "d4",
    notes: "Peach, orange blossom, gentle fizz.",
    sweetness: "Sweet",
    acidity: "Medium",
    body: "Light",
    pairing: "Dessert, fruit, spicy bites",
    es: {
      type: "Dulce",
      country: "Italia",
      notes: "Durazno, flor de azahar y burbuja suave.",
      sweetness: "Dulce",
      acidity: "Media",
      body: "Ligero",
      pairing: "Postres, frutas, bocados picantes"
    }
  },
  w10: {
    name: "Pinot Noir Reserva",
    type: "Red",
    country: "United States",
    region: "Willamette Valley",
    tableId: "t4",
    distributorId: "d4",
    notes: "Red cherry, tea leaf, silky texture, elegant finish.",
    sweetness: "Dry",
    acidity: "Medium-high",
    body: "Medium",
    pairing: "Mushrooms, salmon, roasted chicken",
    es: {
      type: "Tinto",
      country: "Estados Unidos",
      notes: "Cereza roja, hoja de té, textura sedosa y final elegante.",
      sweetness: "Seco",
      acidity: "Media-alta",
      body: "Medio",
      pairing: "Hongos, salmón, pollo asado"
    }
  }
};

let distributors = {
  d1: {
    id: "d1",
    name: "Panama Cellars",
    tableIds: ["t1"],
    description: "Curated international wines with a focus on approachable bottles for restaurants, gifts, and home cellars.",
    descriptionEs: "Selección de vinos internacionales con enfoque en botellas accesibles para restaurantes, regalos y cavas personales.",
    contact: "panamacellars@example.com"
  },
  d2: {
    id: "d2",
    name: "Altos del Sur",
    tableIds: ["t2"],
    description: "South American selections from fresh coastal whites to expressive reds built for food pairing.",
    descriptionEs: "Selecciones sudamericanas, desde blancos costeros frescos hasta tintos expresivos pensados para maridar.",
    contact: "altosdelsur@example.com"
  },
  d3: {
    id: "d3",
    name: "Casa Espumante",
    tableIds: ["t3"],
    description: "Sparkling-focused distributor featuring celebratory bottles and crisp warm-weather selections.",
    descriptionEs: "Distribuidor enfocado en espumantes, con botellas celebratorias y selecciones frescas para clima cálido.",
    contact: "casaespumante@example.com"
  },
  d4: {
    id: "d4",
    name: "Valle Imports",
    tableIds: ["t4"],
    description: "Classic European imports for guests looking for structured reds, sweet finishes, and event favorites.",
    descriptionEs: "Importaciones europeas clásicas para visitantes que buscan tintos estructurados, finales dulces y favoritos del evento.",
    contact: "valleimports@example.com"
  }
};

let menuItems = [];
let scheduleItems = [];
let eventTop10 = [];

const copy = {
  en: {
    contactTitle: "Make your passport yours",
    contactBody: "Share your contact info now, or skip and add it later if you want a distributor to contact you.",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    phoneLabel: "Phone / WhatsApp",
    enter: "Enter WineFest",
    skip: "Enter without sharing info",
    nav: ["Passport", "Taste", "Info"],
    passportKicker: "My Passport",
    passportTitle: "Your WineFest",
    passportHeadline: "Your passport is taking shape",
    passportSummary: "Taste selections to collect stamps and build your WineFest list.",
    emptyTitle: "Your passport is waiting for its first stamp.",
    emptyBody: "Taste your first selection to get started.",
    stampGuideTitle: "How to collect stamps",
    stampGuideBody: "Visit a table, choose a selection, and rate it to collect stamps. If you want a distributor to contact you about a wine, tap “I’m interested.”",
    startTasting: "Start tasting",
    topSelections: "My top 5",
    noTopSelections: "Your top rated tastings will appear here after you rate them.",
    tablesVisited: "Tables tasted",
    tastingsRated: "Tastings rated",
    interestsSaved: "Interests saved",
    tasteKicker: "",
    tasteTitle: "Choose a table",
    tasteIntro: "Open a table to see its wines, sparkling selections, and other featured beverages.",
    infoKicker: "",
    infoTitle: "Event Info",
    backTables: "Back to tables",
    backTable: "Back to table",
    backInfo: "Back to info",
    backDistributors: "Back to distributors",
    backDistributor: "Back to distributor",
    interested: "I'm interested",
    onList: "You're on the list",
    shareTitle: "Share your information?",
    shareBody: "We’ll share your information with the distributor so they can contact you about this selection.",
    connectTitle: "Connect with the distributor",
    connectBody: "To connect you with the distributor, please share your name and email or WhatsApp.",
    saveInterest: "Save interest",
    successTitle: "You're on the list",
    successBody: "Your selection has been saved for distributor follow-up.",
    confirm: "Confirm",
    cancel: "Cancel",
    done: "Done",
    details: "Details",
    tableSelections: "Table selections",
    selectionDetail: "Selection detail",
    sampleData: "",
    table: "Table",
    selection: "selection",
    selections: "selections",
    featuredSelections: "featured selections",
    pouringText: "is pouring",
    yourRating: "Your rating",
    sweetness: "Sweetness",
    acidity: "Acidity",
    body: "Body",
    pairsWith: "Pairs with",
    typeLabel: "Type",
    grapeLabel: "Grape",
    countryLabel: "Country",
    brandLabel: "Brand",
    starsAria: "stars",
    noTopYet: "Event favorites will appear here after guests start rating selections.",
    ratingCountSingular: "rating",
    ratingCountPlural: "ratings",
    selectionsTitle: "Selections",
    seafoodDesc: "Crisp toast topped with fresh seafood, herbs, and a bright citrus finish.",
    mushroomDesc: "Warm mushroom bites with a light truffle aroma and savory finish.",
    charcuterieDesc: "A shareable board with cheeses, cured meats, olives, and seasonal accents.",
    empanadaDesc: "Golden pastry filled with slow-cooked beef and a lightly spiced sauce.",
    tartDesc: "Small tropical fruit tart with a creamy filling and crisp shell.",
    pairsRed: "Pairs with red wines",
    pairsSparkling: "Pairs with sparkling and whites",
    doorsOpen: "Doors open",
    guidedTasting: "Guided tasting moment",
    chefPairing: "Chef pairing feature",
    lastCall: "Last call for ratings",
    top10: "Event Top 10",
    guestFavorites: "Guest favorites",
    distributors: "Distributors",
    pouring: "Who is pouring",
    schedule: "Schedule",
    happening: "What is happening",
    menu: "Food & menu",
    foodBy: "Food provided by Panamonte",
    menuLocation: "Location: Panamonte food station",
    badgeNo: "No",
    badgeStamp: "Stamp",
    badgeFirst: ["First", "Stamp"],
    badgeExplorer: ["Tasting", "Explorer"],
    badgeScout: ["Cellar", "Scout"],
    badgeTour: ["Grand Tasting", "Tour"],
    badgeLegend: ["WineFest", "Legend"],
    badgeEarnedCopy: "You earned a new WineFest passport stamp.",
    badgeNice: "Nice",
    brandConnectTitle: "Connect with BEGASA",
    brandConnectBody: "Share your contact info and BEGASA Soluciones Inteligentes can follow up with more information.",
    brandShare: "Share my info",
    brandSavedTitle: "Information saved",
    brandSavedBody: "BEGASA will be able to follow up with you after the event.",
    brandDirectSavedBody: "BEGASA will use the contact information already saved in your WineFest passport.",
    brandMark: "Designed by",
    brandInfoTitle: "Designed by BEGASA Soluciones Inteligentes",
    brandInfoBody: "This digital experience was created to help WineFest visitors discover, rate, and connect with the wines and distributors at the event.",
    moreInfo: "For more information",
    distributorNote: "Note: distributors may have more than one table once real event data is loaded.",
    menuItems: [
      "Seafood crostini",
      "Truffle mushroom bites",
      "Cheese & charcuterie board",
      "Beef empanaditas",
      "Tropical fruit tart"
    ],
    back: "Back"
  },
  es: {
    contactTitle: "Haz tuyo tu pasaporte",
    contactBody: "Comparte tu información ahora, o agrega tus datos después si quieres que un distribuidor te contacte.",
    nameLabel: "Nombre",
    namePlaceholder: "Tu nombre",
    emailLabel: "Correo",
    emailPlaceholder: "tu@ejemplo.com",
    phoneLabel: "Teléfono / WhatsApp",
    enter: "Entrar a WineFest",
    skip: "Entrar sin compartir datos",
    nav: ["Pasaporte", "Degustar", "Info"],
    passportKicker: "Mi Pasaporte",
    passportTitle: "Tu WineFest",
    passportHeadline: "Tu pasaporte está tomando forma",
    passportSummary: "Degusta selecciones para coleccionar sellos y crear tu lista de WineFest.",
    emptyTitle: "Tu pasaporte espera su primer sello.",
    emptyBody: "Degusta tu primera selección para comenzar.",
    stampGuideTitle: "Cómo coleccionar sellos",
    stampGuideBody: "Visita una mesa, elige una selección y califícala para coleccionar sellos. Si quieres que un distribuidor te contacte sobre un vino, toca “Me interesa.”",
    startTasting: "Comenzar cata",
    topSelections: "Mi top 5",
    noTopSelections: "Tus catas mejor calificadas aparecerán aquí después de calificarlas.",
    tablesVisited: "Mesas degustadas",
    tastingsRated: "Catas calificadas",
    interestsSaved: "Intereses guardados",
    tasteKicker: "",
    tasteTitle: "Elige una mesa",
    tasteIntro: "Abre una mesa para ver sus vinos, espumantes y otras bebidas destacadas.",
    infoKicker: "",
    infoTitle: "Info del evento",
    backTables: "Volver a mesas",
    backTable: "Volver a la mesa",
    backInfo: "Volver a info",
    backDistributors: "Volver a distribuidores",
    backDistributor: "Volver al distribuidor",
    interested: "Me interesa",
    onList: "Estás en la lista",
    shareTitle: "¿Compartir tu información?",
    shareBody: "Compartiremos tu información con el distribuidor para que pueda contactarte sobre esta selección.",
    connectTitle: "Conectar con el distribuidor",
    connectBody: "Para conectarte con el distribuidor, comparte tu nombre y correo o WhatsApp.",
    saveInterest: "Guardar interés",
    successTitle: "Estás en la lista",
    successBody: "Tu selección fue guardada para seguimiento del distribuidor.",
    confirm: "Confirmar",
    cancel: "Cancelar",
    done: "Listo",
    details: "Detalles",
    tableSelections: "Selecciones de mesa",
    selectionDetail: "Detalle de selección",
    sampleData: "",
    table: "Mesa",
    selection: "selección",
    selections: "selecciones",
    featuredSelections: "selecciones destacadas",
    pouringText: "está sirviendo",
    yourRating: "Tu calificación",
    sweetness: "Dulzura",
    acidity: "Acidez",
    body: "Cuerpo",
    pairsWith: "Maridaje",
    typeLabel: "Tipo",
    grapeLabel: "Uva",
    countryLabel: "País",
    brandLabel: "Marca",
    starsAria: "estrellas",
    noTopYet: "Los favoritos del evento aparecerán aquí cuando los invitados empiecen a calificar selecciones.",
    ratingCountSingular: "calificación",
    ratingCountPlural: "calificaciones",
    selectionsTitle: "Selecciones",
    seafoodDesc: "Tostada crujiente con mariscos frescos, hierbas y un toque cítrico.",
    mushroomDesc: "Bocados calientes de hongos con aroma suave de trufa y final salado.",
    charcuterieDesc: "Tabla para compartir con quesos, carnes curadas, aceitunas y acentos de temporada.",
    empanadaDesc: "Empanada dorada rellena de carne cocida lentamente y salsa suavemente especiada.",
    tartDesc: "Tartaleta pequeña de fruta tropical con relleno cremoso y base crujiente.",
    pairsRed: "Marida con vinos tintos",
    pairsSparkling: "Marida con espumantes y blancos",
    doorsOpen: "Apertura de puertas",
    guidedTasting: "Momento de cata guiada",
    chefPairing: "Maridaje del chef",
    lastCall: "Última llamada para calificaciones",
    top10: "Top 10 del Evento",
    guestFavorites: "Favoritos de visitantes",
    distributors: "Distribuidores",
    pouring: "Quiénes están sirviendo",
    schedule: "Agenda",
    happening: "Qué está pasando",
    menu: "Comida y menú",
    foodBy: "Comida por Panamonte",
    menuLocation: "Ubicación: estación de comida Panamonte",
    badgeNo: "Sin",
    badgeStamp: "Sello",
    badgeFirst: ["Primer", "Sello"],
    badgeExplorer: ["Explorador", "de Cata"],
    badgeScout: ["Explorador", "de Bodega"],
    badgeTour: ["Gran Tour", "de Cata"],
    badgeLegend: ["Leyenda", "WineFest"],
    badgeEarnedCopy: "Ganaste un nuevo sello para tu pasaporte WineFest.",
    badgeNice: "Qué bien",
    brandConnectTitle: "Conecta con BEGASA",
    brandConnectBody: "Comparte tu información para que BEGASA Soluciones Inteligentes pueda darte seguimiento.",
    brandShare: "Compartir mis datos",
    brandSavedTitle: "Información guardada",
    brandSavedBody: "BEGASA podrá darte seguimiento después del evento.",
    brandDirectSavedBody: "BEGASA usará la información de contacto que ya guardaste en tu pasaporte WineFest.",
    brandMark: "Diseñado por",
    brandInfoTitle: "Diseñado por BEGASA Soluciones Inteligentes",
    brandInfoBody: "Esta experiencia digital fue creada para ayudar a los visitantes de WineFest a descubrir, calificar y conectar con los vinos y distribuidores del evento.",
    moreInfo: "Para más información",
    distributorNote: "Nota: los distribuidores pueden tener más de una mesa cuando se carguen los datos reales del evento.",
    menuItems: [
      "Crostini de mariscos",
      "Bocados de hongos con trufa",
      "Tabla de quesos y charcutería",
      "Empanaditas de carne",
      "Tartaleta de fruta tropical"
    ],
    back: "Volver"
  }
};

const screens = document.querySelectorAll(".screen");
const views = document.querySelectorAll(".view");
const interestDialog = document.getElementById("interest-dialog");
const brandDialog = document.getElementById("brand-dialog");
const badgeDialog = document.getElementById("badge-dialog");
const utilityBack = document.getElementById("utility-back");
const languageSwitch = document.getElementById("language-switch");

let activeViewName = document.querySelector(".view.is-active")?.dataset.view || "passport";
let interestReturnView = "wine";

function showScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });
}

function showView(name) {
  activeViewName = name;
  views.forEach((view) => {
    view.classList.toggle("is-active", view.dataset.view === name);
  });
  updateUtilityRow();
}

function setActiveTab(tab) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.tab === tab);
  });
}

function setLabelAndPlaceholder(inputId, label, placeholder) {
  const input = document.getElementById(inputId);
  const labelEl = input.closest("label");
  labelEl.childNodes[0].textContent = `\n          ${label}\n          `;
  input.placeholder = placeholder;
}

function getBackActionForView() {
  if (activeViewName === "table") return "back-to-taste";
  if (activeViewName === "wine") return "back-to-table";
  if (activeViewName === "subinfo") return "back-to-info";
  if (activeViewName === "distributor") return "back-to-distributors";
  return "";
}

function getBackLabelForView() {
  const lang = copy[state.language];
  if (activeViewName === "table") return lang.backTables;
  if (activeViewName === "wine") {
    return state.currentWineOrigin.type === "distributor" ? lang.backDistributor : lang.backTable;
  }
  if (activeViewName === "subinfo") return lang.backInfo;
  if (activeViewName === "distributor") return lang.backDistributors;
  return lang.back;
}

function updateUtilityRow() {
  const backAction = getBackActionForView();
  utilityBack.dataset.backAction = backAction;
  utilityBack.textContent = getBackLabelForView();
  utilityBack.classList.toggle("is-placeholder", !backAction);
  languageSwitch.textContent = state.language === "en" ? "ES" : "EN";
}

function panelBackButton(action, label = getBackLabelForView()) {
  return `<button class="panel-back-button" data-action="${action}">${label}</button>`;
}

function runBackAction(backAction) {
  if (backAction === "back-to-taste") {
    showView("taste");
    setActiveTab("taste");
    return true;
  }
  if (backAction === "back-to-table") {
    if (state.currentWineOrigin.type === "distributor") {
      renderDistributor(state.currentWineOrigin.distributorId || state.currentDistributor);
    } else {
      renderTableDetail(state.currentWineOrigin.tableId || state.currentTableId);
    }
    return true;
  }
  if (backAction === "back-to-info") {
    showView("info");
    setActiveTab("info");
    return true;
  }
  if (backAction === "back-to-distributors") {
    renderSubInfo("distributors");
    return true;
  }
  return false;
}

function stars(value = 0) {
  return "★★★★★".slice(0, value) + "☆☆☆☆☆".slice(0, 5 - value);
}

function localizedWine(wine) {
  if (state.language !== "es" || !wine.es) return wine;
  return {
    ...wine,
    ...wine.es
  };
}

function localizedTable(table) {
  if (state.language !== "es" || !table.nameEs) return table;
  return {
    ...table,
    name: table.nameEs
  };
}

function localizedMenuItem(item) {
  if (state.language !== "es" || !item.es) return item;
  return {
    ...item,
    ...item.es
  };
}

function cleanGrape(value = "") {
  return String(value)
    .replace(/^100%\s*/i, "")
    .split(",")[0]
    .trim();
}

function localizedDistributor(distributor) {
  if (state.language !== "es") return distributor;
  return {
    ...distributor,
    description: distributor.descriptionEs || distributor.description
  };
}

function getTable(tableId) {
  return tables.find((table) => table.id === tableId);
}

function resolveDistributorId(value) {
  if (distributors[value]) return value;
  return Object.values(distributors).find((distributor) => distributor.name === value)?.id || value;
}

function getDistributor(distributorId) {
  return distributors[resolveDistributorId(distributorId)];
}

function tableNumber(tableId) {
  return getTable(tableId)?.number || tableId;
}

function tableDistributorNames(table) {
  const ids = table.distributorIds?.length
    ? table.distributorIds
    : [...new Set(table.wines.map((id) => wines[id].distributorId))];
  return ids.map((id) => getDistributor(id)?.name).filter(Boolean).join(" / ");
}

function normalizeLabel(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

function isRedundantDistributorLabel(tableName = "", distributorLabel = "") {
  const normalizedTable = normalizeLabel(tableName);
  const normalizedDistributor = normalizeLabel(distributorLabel);
  if (!normalizedTable || !normalizedDistributor) return false;
  return normalizedTable.includes(normalizedDistributor) || normalizedDistributor.includes(normalizedTable);
}

function tableCardMeta(table, lang) {
  const countLabel = table.wines.length === 1 ? lang.selection : lang.selections;
  const distributorLabel = tableDistributorNames(table);
  const selectionText = `${table.wines.length} ${countLabel}`;
  if (!distributorLabel || isRedundantDistributorLabel(table.name, distributorLabel)) return selectionText;
  return `${selectionText} · ${distributorLabel}`;
}

function tableDetailHeading(table) {
  const distributorLabel = tableDistributorNames(table);
  if (!distributorLabel || !table.name.startsWith(distributorLabel)) {
    return `<h2 class="table-detail-title">${table.name}</h2>`;
  }

  const descriptor = table.name.slice(distributorLabel.length).trim();
  if (!descriptor) return `<h2 class="table-detail-title">${table.name}</h2>`;

  return `
    <h2 class="table-detail-title is-split">
      <span>${distributorLabel}</span>
      <small>${descriptor.replaceAll("/", " / ")}</small>
    </h2>
  `;
}

function distributorLogoClass(distributor) {
  if (["felipe_motta", "vinos_garbor"].includes(distributor.id)) return "is-wide";
  if (distributor.id === "global_brands") return "is-square is-global";
  return "is-square";
}

function distributorCardClass(distributor) {
  return ["felipe_motta", "millennial", "vinos_garbor"].includes(distributor.id) ? "is-stacked" : "";
}

function distributorContacts(distributor) {
  const names = (distributor.contactName || "").split("/").map((value) => value.trim()).filter(Boolean);
  const emails = (distributor.contactEmail || "").split("/").map((value) => value.trim()).filter(Boolean);
  const count = Math.max(names.length, emails.length);
  return Array.from({ length: count }, (_, index) => ({
    name: names[index] || "",
    email: emails[index] || ""
  }));
}

function saveState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Local storage can fail in private browsing. The prototype still works in-session.
  }
}

async function supabaseRequest(path, options = {}) {
  const headers = {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase ${response.status}: ${message}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function supabaseRpc(functionName, payload) {
  return supabaseRequest(`rpc/${functionName}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

function mapSupabaseData({ appTables, appTastings, dbDistributors, dbMenuItems, dbScheduleItems, dbEventTop10 }) {
  const nextDistributors = {};
  dbDistributors.forEach((item) => {
    nextDistributors[item.id] = {
      id: item.id,
      name: item.name,
      tableIds: appTables.filter((table) => table.distributor_id === item.id).map((table) => table.id),
      description: item.description || "",
      descriptionEs: item.description || "",
      contact: item.contact_email || item.contact_phone || "Contacto por confirmar",
      contactName: item.contact_name || "",
      contactEmail: item.contact_email || "",
      logoPath: item.logo_path || ""
    };
  });

  const nextWines = {};
  appTastings.forEach((item) => {
    nextWines[item.id] = {
      name: item.name_en || item.name,
      type: item.beverage_type_en || item.beverage_type || "",
      country: item.country_en || item.country || "",
      region: item.brand || "",
      tableId: item.table_id,
      distributorId: item.distributor_id,
      notes: item.notes_en || item.notes || "",
      brand: item.brand || "",
      grape: item.grape_en || item.grape || "",
      es: {
        name: item.name,
        type: item.beverage_type || "",
        country: item.country || "",
        notes: item.notes || "",
        brand: item.brand || "",
        grape: item.grape || ""
      }
    };
  });

  const nextTables = appTables.map((item) => ({
    id: item.id,
    number: item.number || item.code,
    name: item.table_name_en || item.table_name || `${item.distributor_name} ${item.code}`,
    nameEs: item.table_name || `${item.distributor_name} ${item.code}`,
    distributorIds: [item.distributor_id],
    wines: appTastings
      .filter((tasting) => tasting.table_id === item.id)
      .sort((a, b) => (a.source_row || 0) - (b.source_row || 0))
      .map((tasting) => tasting.id)
  }));

  distributors = nextDistributors;
  wines = nextWines;
  tables = nextTables;
  menuItems = (dbMenuItems || []).map((item) => ({
    ...item,
    name: item.name_en || item.name,
    description: item.description_en || item.description || "",
    pairing_note: item.pairing_note_en || item.pairing_note || "",
    es: {
      name: item.name,
      description: item.description || "",
      pairing_note: item.pairing_note || ""
    }
  }));
  scheduleItems = dbScheduleItems || [];
  eventTop10 = dbEventTop10 || [];

  if (!wines[state.currentWineId]) {
    state.currentWineId = Object.keys(wines)[0] || state.currentWineId;
  }
  if (!tables.find((table) => table.id === state.currentTableId)) {
    state.currentTableId = tables[0]?.id || state.currentTableId;
  }
  saveState();
}

async function loadSupabaseData() {
  const [appTables, appTastings, dbDistributors, dbMenuItems, dbScheduleItems, dbEventTop10] = await Promise.all([
    supabaseRequest("app_tables?select=*&order=code.asc"),
    supabaseRequest("app_tastings?select=*&order=source_row.asc"),
    supabaseRequest("distributors?select=*&active=eq.true&order=code.asc"),
    supabaseRequest("menu_items?select=*&active=eq.true&order=sort_order.asc"),
    supabaseRequest("schedule_items?select=*&active=eq.true&order=sort_order.asc"),
    supabaseRpc("get_event_top10", {})
  ]);
  mapSupabaseData({ appTables, appTastings, dbDistributors, dbMenuItems, dbScheduleItems, dbEventTop10 });
  renderAll();
}

async function refreshEventTop10() {
  try {
    eventTop10 = await supabaseRpc("get_event_top10", {});
    if (activeViewName === "subinfo" && state.currentSubInfo === "top10") {
      renderSubInfo("top10");
    }
  } catch (error) {
    console.warn("Event Top 10 refresh failed", error);
  }
}

function openSubInfo(type) {
  renderSubInfo(type);
  if (type === "top10") {
    refreshEventTop10();
  }
}

function hasSavedContact() {
  return Boolean(state.guest.name && (state.guest.email || state.guest.phone));
}

function getFormValues(prefix) {
  return {
    name: document.getElementById(`${prefix}-name`).value.trim(),
    email: document.getElementById(`${prefix}-email`).value.trim(),
    phone: document.getElementById(`${prefix}-phone`).value.trim()
  };
}

function storeGuest(values) {
  state.guest = {
    ...state.guest,
    name: values.name,
    email: values.email,
    phone: values.phone,
    updatedAt: new Date().toISOString()
  };
  saveState();
  syncGuest();
}

function populateGuestForms() {
  ["guest", "interest", "brand"].forEach((prefix) => {
    document.getElementById(`${prefix}-name`).value = state.guest.name || "";
    document.getElementById(`${prefix}-email`).value = state.guest.email || "";
    document.getElementById(`${prefix}-phone`).value = state.guest.phone || "";
  });
}

function getInterest(tastingId) {
  return state.interests.find((interest) => interest.tastingId === tastingId);
}

function hasInterest(tastingId) {
  return Boolean(getInterest(tastingId));
}

function saveInterest(tastingId, consentMethod = "interest_confirm_modal") {
  const wine = wines[tastingId];
  const existing = getInterest(tastingId);
  const now = new Date().toISOString();
  const table = getTable(wine.tableId);
  const distributor = getDistributor(wine.distributorId);
  const ratingSnapshot = state.ratings[tastingId] || null;
  const interest = {
    id: existing?.id || `lead_${state.visitorId}_${tastingId}`,
    schemaVersion: SCHEMA_VERSION,
    visitorId: state.visitorId,
    guestId: state.guest.id,
    guestName: state.guest.name,
    guestEmail: state.guest.email,
    guestPhone: state.guest.phone,
    tastingId,
    tastingName: wine.name,
    tableId: wine.tableId,
    tableNumber: table?.number || "",
    distributorId: wine.distributorId,
    distributorName: distributor?.name || "",
    ratingSnapshot,
    consentToShare: true,
    consentAt: now,
    consentMethod,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };
  state.interests = [
    ...state.interests.filter((item) => item.tastingId !== tastingId),
    interest
  ];
  saveState();
  syncLead(interest);
}

function saveBrandLeadFromGuest(consentMethod = "begasa_contact_button") {
  const now = new Date().toISOString();
  state.brandLead = {
    id: state.brandLead?.id || `brand_${state.visitorId}`,
    schemaVersion: SCHEMA_VERSION,
    visitorId: state.visitorId,
    guestId: state.guest.id,
    guestName: state.guest.name,
    guestEmail: state.guest.email,
    guestPhone: state.guest.phone,
    requestedContact: true,
    consentToShare: true,
    consentAt: now,
    consentMethod,
    contactEmail: "info@begasapa.com",
    contactPhone: "+507 6236-5678",
    createdAt: state.brandLead?.createdAt || now,
    updatedAt: now
  };
  saveState();
  syncGuest();
}

async function syncGuest() {
  if (!hasSavedContact()) return;
  try {
    const remoteId = await supabaseRpc("submit_guest", {
      p_local_visitor_id: state.visitorId,
      p_name: state.guest.name,
      p_email: state.guest.email,
      p_phone: state.guest.phone,
      p_preferred_language: state.language,
      p_schema_version: SCHEMA_VERSION
    });
    if (remoteId) {
      state.guest.remoteId = remoteId;
      saveState();
    }
  } catch (error) {
    console.warn("Guest sync failed", error);
  }
}

async function syncRating(tastingId) {
  if (!wines[tastingId] || !state.ratings[tastingId]) return;
  await syncGuest();
  try {
    await supabaseRpc("submit_rating", {
      p_local_visitor_id: state.visitorId,
      p_tasting_id: tastingId,
      p_rating: state.ratings[tastingId]
    });
    await refreshEventTop10();
  } catch (error) {
    console.warn("Rating sync failed", error);
  }
}

async function syncLead(interest) {
  if (!interest || !wines[interest.tastingId]) return;
  await syncGuest();
  try {
    await supabaseRpc("submit_lead", {
      p_local_visitor_id: state.visitorId,
      p_tasting_id: interest.tastingId,
      p_distributor_id: interest.distributorId,
      p_table_id: interest.tableId,
      p_guest_name_snapshot: interest.guestName,
      p_guest_email_snapshot: interest.guestEmail,
      p_guest_phone_snapshot: interest.guestPhone,
      p_tasting_name_snapshot: interest.tastingName,
      p_distributor_name_snapshot: interest.distributorName,
      p_table_code_snapshot: interest.tableNumber,
      p_rating_snapshot: interest.ratingSnapshot,
      p_consent_method: interest.consentMethod,
      p_schema_version: interest.schemaVersion
    });
  } catch (error) {
    console.warn("Lead sync failed", error);
  }
}

function getPassportStats() {
  const ratedIds = Object.keys(state.ratings).filter((id) => wines[id] && state.ratings[id] > 0);
  const visitedTables = new Set(ratedIds.map((id) => wines[id].tableId));
  return {
    tables: visitedTables.size,
    tastings: ratedIds.length,
    interests: state.interests.length
  };
}

function getBadge(tastings) {
  const lang = copy[state.language];
  if (tastings >= 20) return { className: "badge-legend", text: lang.badgeLegend };
  if (tastings >= 15) return { className: "badge-tour", text: lang.badgeTour };
  if (tastings >= 10) return { className: "badge-scout", text: lang.badgeScout };
  if (tastings >= 5) return { className: "badge-explorer", text: lang.badgeExplorer };
  if (tastings >= 1) return { className: "badge-first", text: lang.badgeFirst };
  return { className: "badge-empty", text: [lang.badgeNo, lang.badgeStamp] };
}

function getEarnedBadges(tastings) {
  const lang = copy[state.language];
  return [
    { level: 1, className: "badge-first", text: lang.badgeFirst },
    { level: 5, className: "badge-explorer", text: lang.badgeExplorer },
    { level: 10, className: "badge-scout", text: lang.badgeScout },
    { level: 15, className: "badge-tour", text: lang.badgeTour },
    { level: 20, className: "badge-legend", text: lang.badgeLegend }
  ].filter((badge) => tastings >= badge.level);
}

function badgeLabel(badge) {
  return badge.text.join(" ");
}

function badgeArtwork(badge) {
  const src = badgeAssets[state.language]?.[badge.className] || badgeAssets.en[badge.className];
  if (!src) return "";
  return `<img src="${src}" alt="" loading="lazy" decoding="async" onerror="this.hidden=true">`;
}

function getBadgeLevel(tastings) {
  if (tastings >= 20) return 20;
  if (tastings >= 15) return 15;
  if (tastings >= 10) return 10;
  if (tastings >= 5) return 5;
  if (tastings >= 1) return 1;
  return 0;
}

function renderAll() {
  renderPassport();
  renderTopPicks();
  renderTables();
  if (activeViewName === "table") renderTableDetail(state.currentTableId);
  if (activeViewName === "wine") renderWineDetail(state.currentWineId);
  if (activeViewName === "subinfo") renderSubInfo(state.currentSubInfo);
  if (activeViewName === "distributor") renderDistributor(state.currentDistributor);
}

function renderPassport() {
  const lang = copy[state.language];
  const stats = getPassportStats();
  const earnedBadges = getEarnedBadges(stats.tastings);
  const badge = earnedBadges.at(-1) || getBadge(stats.tastings);
  const smallBadges = earnedBadges.slice(0, -1);
  const badgeEl = document.getElementById("current-badge");
  badgeEl.closest(".hero-card").classList.toggle("is-empty", stats.tastings === 0);
  badgeEl.className = `badge-stamp ${badge.className}`;
  badgeEl.classList.remove("is-hidden");
  badgeEl.setAttribute("aria-label", badgeLabel(badge));
  badgeEl.innerHTML = stats.tastings
    ? `
      ${badgeArtwork(badge)}
      <div class="badge-collection" aria-label="${lang.passportSummary}">
        ${smallBadges.map((smallBadge, index) => `
          <span class="mini-badge mini-badge-${index + 1} ${smallBadge.className}" aria-label="${badgeLabel(smallBadge)}">
            ${badgeArtwork(smallBadge)}
          </span>
        `).join("")}
      </div>
    `
    : `<span>?</span><strong>${lang.emptyTitle}</strong>`;
  document.getElementById("passport-label").textContent = lang.passportKicker;
  document.getElementById("passport-headline").textContent = stats.tastings ? lang.passportHeadline : lang.emptyTitle;
  document.getElementById("passport-summary").textContent = stats.tastings ? lang.passportSummary : lang.emptyBody;
  document.querySelector("#empty-passport h3").textContent = lang.stampGuideTitle;
  document.querySelector("#empty-passport p").textContent = lang.stampGuideBody;
  document.getElementById("tables-visited").textContent = stats.tables;
  document.getElementById("tastings-rated").textContent = stats.tastings;
  document.getElementById("interests-saved").textContent = stats.interests;
  document.getElementById("empty-passport").classList.toggle("is-active", stats.tastings === 0);
  document.getElementById("top-picks-title").textContent = lang.topSelections;
  document.getElementById("top-picks-title").classList.toggle("is-hidden", stats.tastings === 0);
  document.querySelectorAll("[data-i18n='tablesVisited']").forEach((el) => el.textContent = lang.tablesVisited);
  document.querySelectorAll("[data-i18n='tastingsRated']").forEach((el) => el.textContent = lang.tastingsRated);
  document.querySelectorAll("[data-i18n='interestsSaved']").forEach((el) => el.textContent = lang.interestsSaved);
}

function renderTopPicks() {
  const lang = copy[state.language];
  const picks = Object.entries(state.ratings)
    .filter(([id, rating]) => wines[id] && rating > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);
  const container = document.getElementById("top-picks");
  if (getPassportStats().tastings === 0) {
    container.innerHTML = "";
    return;
  }
  if (!picks.length) {
    container.innerHTML = `<div class="empty-inline">${lang.noTopSelections}</div>`;
    return;
  }
  container.innerHTML = picks.map((id) => {
    const wine = localizedWine(wines[id]);
    const table = getTable(wine.tableId);
    const distributor = getDistributor(wine.distributorId);
    const saved = hasInterest(id);
    return `
      <article class="pick-card">
        <div>
          <h4>${wine.name}</h4>
          <div class="wine-meta">${lang.table} ${table?.number || ""} · ${distributor?.name || ""}</div>
          <div class="stars">${stars(state.ratings[id] || 0)}</div>
        </div>
        <button class="small-button ${saved ? "is-saved" : ""}" data-interest="${id}" data-interest-return="passport" ${saved ? "disabled" : ""}>${saved ? lang.onList : lang.interested}</button>
      </article>
    `;
  }).join("");
}

function renderTables() {
  const lang = copy[state.language];
  document.querySelector("#view-taste .section-intro").innerHTML = `
    <h2>${lang.tasteTitle}</h2>
    <p>${lang.tasteIntro}</p>
  `;
  const container = document.getElementById("tables-list");
  container.innerHTML = tables.map((table) => {
    const localized = localizedTable(table);
    return `
      <button class="table-card" data-table="${table.id}">
        <span class="table-number">${localized.number}</span>
        <span>
          <h3>${localized.name}</h3>
          <span class="wine-meta">${tableCardMeta(localized, lang)}</span>
        </span>
        <span class="chevron">›</span>
      </button>
    `;
  }).join("");
}

function renderTableDetail(tableId) {
  state.currentTableId = tableId;
  saveState();
  const lang = copy[state.language];
  const table = localizedTable(tables.find((item) => item.id === tableId));
  const container = document.getElementById("table-detail");
  container.innerHTML = `
    <div class="detail-panel">
      ${tableDetailHeading(table)}
      <div class="list-stack">
        ${table.wines.map((id) => {
          const wine = localizedWine(wines[id]);
          return `
            <button class="wine-row" data-wine="${id}">
              <span>
                <h4>${wine.name}</h4>
                <span class="wine-meta">${wine.type} · ${wine.country}</span>
              </span>
              <span class="stars">${stars(state.ratings[id] || 0)}</span>
            </button>
          `;
        }).join("")}
      </div>
      ${panelBackButton("back-to-taste", lang.backTables)}
    </div>
  `;
  showView("table");
}

function renderWineDetail(wineId) {
  state.currentWineId = wineId;
  const lang = copy[state.language];
  const wine = localizedWine(wines[wineId]);
  const table = getTable(wine.tableId);
  const distributor = getDistributor(wine.distributorId);
  const rating = state.ratings[wineId] || 0;
  const saved = hasInterest(wineId);
  const grape = cleanGrape(wine.grape);
  const container = document.getElementById("wine-detail");
  container.innerHTML = `
    <div class="detail-panel">
      <h2>${wine.name}</h2>
      <p class="wine-notes">${wine.notes}</p>
      <div class="stats-grid">
        <div class="stat-card"><span>${lang.typeLabel}</span><strong>${wine.type || "-"}</strong></div>
        <div class="stat-card"><span>${lang.grapeLabel}</span><strong>${grape || wine.pairing || "-"}</strong></div>
        <div class="stat-card"><span>${lang.countryLabel}</span><strong>${wine.country || "-"}</strong></div>
        <div class="stat-card"><span>${lang.brandLabel}</span><strong>${wine.brand || wine.region || "-"}</strong></div>
      </div>
      <div class="wine-action-row">
        <div>
          <h3 class="section-title">${lang.yourRating}</h3>
          <div class="rating-row">
            ${[1, 2, 3, 4, 5].map((value) => `
              <button class="${value <= rating ? "is-selected" : ""}" data-rate="${value}" aria-label="${value} ${lang.starsAria}">★</button>
            `).join("")}
          </div>
        </div>
        <button class="small-button interest-inline ${saved ? "is-saved" : ""}" data-interest="${wineId}" ${saved ? "disabled" : ""}>${saved ? copy[state.language].onList : copy[state.language].interested}</button>
      </div>
      ${panelBackButton("back-to-table", getBackLabelForView())}
    </div>
  `;
  saveState();
  showView("wine");
}

function renderSubInfo(type) {
  const lang = copy[state.language];
  state.currentSubInfo = type;
  saveState();
  const top10Rows = eventTop10
    .filter((item) => wines[item.tasting_id])
    .map((item, index) => {
      const wine = localizedWine(wines[item.tasting_id]);
      const average = Number(item.average_rating || 0);
      const count = Number(item.rating_count || 0);
      const countLabel = count === 1 ? lang.ratingCountSingular : lang.ratingCountPlural;
      return `
            <article class="pick-card">
              <div>
                <h4>${index + 1}. ${wine.name}</h4>
                <div class="wine-meta">${wine.type} · ${lang.table} ${tableNumber(wines[item.tasting_id].tableId)}</div>
                <div class="wine-meta">${average.toFixed(1)} ★ · ${count} ${countLabel}</div>
              </div>
              <span class="stars">${stars(Math.round(average))}</span>
            </article>
          `;
    })
    .join("");
  const content = {
    top10: `
      <div class="detail-panel">
        <h2>${lang.guestFavorites}</h2>
        ${top10Rows ? `<div class="list-stack">${top10Rows}</div>` : `<p>${lang.noTopYet}</p>`}
        ${panelBackButton("back-to-info", lang.backInfo)}
      </div>
    `,
    distributors: `
      <div class="detail-panel">
        <h2>${lang.pouring}</h2>
        <div class="distributor-grid">
          ${Object.values(distributors).map((distributor) => {
            const contacts = distributorContacts(distributor);
            return `
            <article class="distributor-card ${distributorCardClass(distributor)}">
              ${distributor.logoPath ? `
                <span class="distributor-logo-frame">
                  <img class="distributor-logo ${distributorLogoClass(distributor)}" src="${distributor.logoPath}" alt="${distributor.name}">
                </span>
              ` : ""}
              <div class="distributor-copy">
                <h4>${distributor.name}</h4>
                <div class="distributor-contacts">
                  ${contacts.map((contact) => `
                    <div class="distributor-person">
                      ${contact.name ? `<div class="distributor-contact">${contact.name}</div>` : ""}
                      ${contact.email ? `<a class="distributor-email" href="mailto:${contact.email}">${contact.email}</a>` : ""}
                    </div>
                  `).join("")}
                </div>
              </div>
            </article>
          `}).join("")}
        </div>
        ${panelBackButton("back-to-info", lang.backInfo)}
      </div>
    `,
    schedule: `
      <div class="detail-panel">
        <h2>${lang.happening}</h2>
        <div class="list-stack">
          ${(scheduleItems.length ? scheduleItems : [
            { time_label: "4:00 PM", title: lang.doorsOpen },
            { time_label: "5:30 PM", title: lang.guidedTasting },
            { time_label: "7:00 PM", title: lang.chefPairing },
            { time_label: "9:00 PM", title: lang.lastCall }
          ]).map((item) => `
            <article class="pick-card"><div><h4>${item.time_label}</h4><div class="wine-meta">${item.title}</div></div></article>
          `).join("")}
        </div>
        ${panelBackButton("back-to-info", lang.backInfo)}
      </div>
    `,
    menu: `
      <div class="detail-panel">
        <div class="menu-heading">
          <img src="./assets/panamonte-logo.svg" alt="Hotel Panamonte">
        </div>
        <h2>${lang.menu}</h2>
        <div class="list-stack">
          ${(menuItems.length ? menuItems : []).map((item) => {
            const localized = localizedMenuItem(item);
            return `
              <article class="menu-item">
                <div>
                  <h4>${localized.name}</h4>
                  <p>${localized.description || ""}</p>
                  <div class="wine-meta">${localized.pairing_note || ""}</div>
                </div>
                <strong>${localized.price_label || ""}</strong>
              </article>
            `;
          }).join("")}
        </div>
        ${panelBackButton("back-to-info", lang.backInfo)}
      </div>
    `
  };
  document.getElementById("subinfo-detail").innerHTML = content[type] || content.top10;
  showView("subinfo");
}

function renderDistributor(distributorId) {
  const resolvedDistributorId = resolveDistributorId(distributorId);
  state.currentDistributor = resolvedDistributorId;
  saveState();
  const lang = copy[state.language];
  const distributor = localizedDistributor(getDistributor(resolvedDistributorId));
  const primaryEmail = (distributor.contactEmail || distributor.contact || "").split("/")[0].trim();
  document.getElementById("distributor-detail").innerHTML = `
    <div class="detail-panel">
      <div class="distributor-profile">
        ${distributor.logoPath ? `<img class="distributor-logo distributor-logo-large" src="${distributor.logoPath}" alt="${distributor.name}">` : ""}
        <h2>${distributor.name}</h2>
        ${distributor.contactName ? `<div class="distributor-contact">${distributor.contactName}</div>` : ""}
        ${distributor.contactEmail ? `<a class="distributor-email" href="mailto:${primaryEmail}">${distributor.contactEmail}</a>` : `<span class="tag">${distributor.contact}</span>`}
      </div>
      ${panelBackButton("back-to-distributors", lang.backDistributors)}
    </div>
  `;
  showView("distributor");
}

function hasMinimumContact() {
  return hasSavedContact();
}

function hasMinimumValues(name, email, phone) {
  return Boolean(name.trim() && (email.trim() || phone.trim()));
}

function updateContactSubmitState() {
  const canEnter = hasMinimumValues(
    document.getElementById("guest-name").value,
    document.getElementById("guest-email").value,
    document.getElementById("guest-phone").value
  );
  document.querySelector("#contact-form .primary-action").disabled = !canEnter;
}

function updateBrandSubmitState() {
  const canShare = hasMinimumValues(
    document.getElementById("brand-name").value,
    document.getElementById("brand-email").value,
    document.getElementById("brand-phone").value
  );
  document.querySelector("#brand-lead-form .primary-action").disabled = !canShare;
}

function updateInterestSubmitState() {
  const canSave = hasMinimumValues(
    document.getElementById("interest-name").value,
    document.getElementById("interest-email").value,
    document.getElementById("interest-phone").value
  );
  document.querySelector("#interest-form .primary-action").disabled = !canSave;
}

function setModalState(name) {
  document.querySelectorAll(".modal-state").forEach((item) => {
    item.classList.toggle("is-active", item.id === name);
  });
}

function setBrandState(name) {
  document.querySelectorAll(".brand-state").forEach((item) => {
    item.classList.toggle("is-active", item.id === name);
  });
}

function showBadgeEarned(level) {
  const lang = copy[state.language];
  const badge = getBadge(level);
  document.getElementById("badge-earned-art").className = `badge-preview ${badge.className}`;
  document.getElementById("badge-earned-art").setAttribute("aria-label", badgeLabel(badge));
  document.getElementById("badge-earned-art").innerHTML = badgeArtwork(badge);
  document.getElementById("badge-earned-title").textContent = badgeLabel(badge);
  document.getElementById("badge-earned-copy").textContent = lang.badgeEarnedCopy;
  document.querySelector("#badge-dialog [data-action='close-badge']").textContent = lang.badgeNice;
  badgeDialog.showModal();
}

function finishInterestFlow() {
  renderTopPicks();
  renderPassport();
  if (interestReturnView === "passport") {
    setActiveTab("passport");
    showView("passport");
    return;
  }
  renderWineDetail(state.currentWineId);
}

function openInterest(wineId, returnView = "wine") {
  state.currentWineId = wineId;
  interestReturnView = returnView;
  populateGuestForms();
  updateInterestSubmitState();
  if (hasMinimumContact()) {
    setModalState("interest-ready");
  } else {
    setModalState("interest-contact");
  }
  interestDialog.showModal();
}

function updateLanguage(lang) {
  state.language = lang;
  saveState();
  const selectedCopy = copy[lang];
  document.documentElement.lang = lang;
  document.querySelector(".contact-panel h1").textContent = selectedCopy.contactTitle;
  document.querySelector(".contact-panel p").textContent = selectedCopy.contactBody;
  document.querySelector("#contact-form .primary-action").textContent = selectedCopy.enter;
  document.querySelector('[data-action="skip-contact"]').textContent = selectedCopy.skip;
  document.querySelectorAll(".designed-mark").forEach((mark) => {
    mark.innerHTML = `${selectedCopy.brandMark} <strong>BEGASA</strong>`;
  });
  ["guest", "interest", "brand"].forEach((prefix) => {
    setLabelAndPlaceholder(`${prefix}-name`, selectedCopy.nameLabel, selectedCopy.namePlaceholder);
    setLabelAndPlaceholder(`${prefix}-email`, selectedCopy.emailLabel, selectedCopy.emailPlaceholder);
    setLabelAndPlaceholder(`${prefix}-phone`, selectedCopy.phoneLabel, "+507 ...");
  });
  document.querySelectorAll(".nav-item").forEach((item, index) => {
    item.querySelector("span:last-child").textContent = selectedCopy.nav[index];
  });
  document.querySelector("#view-info .mini-label").textContent = selectedCopy.infoKicker;
  document.querySelector("#view-info .section-intro h2").textContent = selectedCopy.infoTitle;
  document.querySelector("#empty-passport h3").textContent = selectedCopy.emptyTitle;
  document.querySelector("#empty-passport p").textContent = selectedCopy.emptyBody;
  document.querySelector("#empty-passport .primary-action").textContent = selectedCopy.startTasting;
  document.querySelector("#interest-ready h2").textContent = selectedCopy.shareTitle;
  document.querySelector("#interest-ready p").textContent = selectedCopy.shareBody;
  document.querySelector("#interest-ready [data-action='close-modal']").textContent = selectedCopy.cancel;
  document.querySelector("#interest-ready [data-action='confirm-interest']").textContent = selectedCopy.confirm;
  document.querySelector("#interest-contact h2").textContent = selectedCopy.connectTitle;
  document.querySelector("#interest-contact p").textContent = selectedCopy.connectBody;
  document.querySelector("#interest-form .primary-action").textContent = selectedCopy.saveInterest;
  document.querySelector("#interest-contact [data-action='close-modal']").textContent = selectedCopy.cancel;
  document.querySelector("#interest-success h2").textContent = selectedCopy.successTitle;
  document.querySelector("#interest-success p").textContent = selectedCopy.successBody;
  document.querySelector("#interest-success [data-action='close-modal']").textContent = selectedCopy.done;
  document.querySelectorAll("[data-action='back-to-taste']").forEach((el) => el.textContent = selectedCopy.backTables);
  document.querySelectorAll("[data-action='back-to-table']").forEach((el) => el.textContent = selectedCopy.backTable);
  document.querySelectorAll("[data-action='back-to-info']").forEach((el) => el.textContent = selectedCopy.backInfo);
  document.querySelectorAll("[data-action='back-to-distributors']").forEach((el) => el.textContent = selectedCopy.backDistributors);
  document.getElementById("info-top10-label").textContent = selectedCopy.top10;
  document.getElementById("info-top10-title").textContent = selectedCopy.guestFavorites;
  document.getElementById("info-distributors-label").textContent = selectedCopy.distributors;
  document.getElementById("info-distributors-title").textContent = selectedCopy.pouring;
  document.getElementById("info-schedule-label").textContent = selectedCopy.schedule;
  document.getElementById("info-schedule-title").textContent = selectedCopy.happening;
  document.getElementById("info-menu-title").textContent = selectedCopy.menu;
  document.querySelector("#brand-info-state .begasa-kicker").textContent = selectedCopy.brandMark;
  document.querySelector("#brand-info-state > p:not(.begasa-sub)").textContent = selectedCopy.brandInfoBody;
  document.querySelector(".brand-contact span").textContent = selectedCopy.moreInfo;
  document.querySelector("#brand-lead-state h2").textContent = selectedCopy.brandConnectTitle;
  document.querySelector("#brand-lead-state p").textContent = selectedCopy.brandConnectBody;
  document.querySelector("#brand-lead-form .primary-action").textContent = selectedCopy.brandShare;
  document.querySelector("#brand-lead-state [data-action='brand-back']").textContent = selectedCopy.back;
  document.querySelector("#brand-success-state h2").textContent = selectedCopy.brandSavedTitle;
  document.querySelector("#brand-success-state p").textContent = selectedCopy.brandSavedBody;
  document.querySelector("#brand-success-state .primary-action").textContent = selectedCopy.done;
  renderTopPicks();
  renderPassport();
  renderTables();
  const activeView = document.querySelector(".view.is-active")?.dataset.view;
  if (activeView === "table") renderTableDetail(state.currentTableId);
  if (activeView === "wine") renderWineDetail(state.currentWineId);
  if (activeView === "subinfo") renderSubInfo(state.currentSubInfo);
  if (activeView === "distributor") renderDistributor(state.currentDistributor);
  updateUtilityRow();
}

document.addEventListener("click", (event) => {
  const langButton = event.target.closest("[data-lang]");
  if (langButton) {
    updateLanguage(langButton.dataset.lang);
    showScreen("contact");
    return;
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "switch-language") {
    updateLanguage(state.language === "en" ? "es" : "en");
    return;
  }
  if (action === "utility-back") {
    runBackAction(utilityBack.dataset.backAction);
    return;
  }
  if (action === "skip-contact") {
    state.hasEntered = true;
    saveState();
    showScreen("app");
    return;
  }
  if (action === "back-to-taste") {
    runBackAction(action);
    return;
  }
  if (action === "back-to-table") {
    runBackAction(action);
    return;
  }
  if (action === "back-to-info") {
    runBackAction(action);
    return;
  }
  if (action === "back-to-distributors") {
    runBackAction(action);
    return;
  }
  if (action === "close-modal") {
    interestDialog.close();
    return;
  }
  if (action === "confirm-interest") {
    saveInterest(state.currentWineId, "interest_confirm_modal");
    finishInterestFlow();
    interestDialog.close();
    return;
  }
  if (action === "brand") {
    setBrandState("brand-info-state");
    brandDialog.showModal();
    return;
  }
  if (action === "close-brand") {
    brandDialog.close();
    return;
  }
  if (action === "brand-back") {
    setBrandState("brand-info-state");
    return;
  }
  if (action === "close-badge") {
    badgeDialog.close();
    return;
  }

  const nav = event.target.closest("[data-tab]");
  if (nav) {
    const tab = nav.dataset.tab;
    setActiveTab(tab);
    showView(tab);
    if (tab === "passport") {
      renderPassport();
      renderTopPicks();
    }
    if (tab === "taste") renderTables();
    return;
  }

  const table = event.target.closest("[data-table]");
  if (table) {
    renderTableDetail(table.dataset.table);
    return;
  }

  const wine = event.target.closest("[data-wine]");
  if (wine) {
    const selectedWine = wines[wine.dataset.wine];
    const activeView = document.querySelector(".view.is-active")?.dataset.view;
    state.currentWineOrigin = activeView === "distributor"
      ? { type: "distributor", tableId: selectedWine.tableId, distributorId: state.currentDistributor }
      : { type: "table", tableId: selectedWine.tableId, distributorId: "" };
    renderWineDetail(wine.dataset.wine);
    return;
  }

  const rate = event.target.closest("[data-rate]");
  if (rate) {
    const beforeLevel = getBadgeLevel(getPassportStats().tastings);
    state.ratings[state.currentWineId] = Number(rate.dataset.rate);
    const afterLevel = getBadgeLevel(getPassportStats().tastings);
    saveState();
    syncRating(state.currentWineId);
    renderWineDetail(state.currentWineId);
    renderTopPicks();
    renderPassport();
    if (afterLevel > beforeLevel && afterLevel > state.badgeLevel) {
      state.badgeLevel = afterLevel;
      showBadgeEarned(afterLevel);
    }
    return;
  }

  const interest = event.target.closest("[data-interest]");
  if (interest) {
    openInterest(interest.dataset.interest, interest.dataset.interestReturn || "wine");
    return;
  }

  const subview = event.target.closest("[data-subview]");
  if (subview) {
    openSubInfo(subview.dataset.subview);
    return;
  }

  const distributor = event.target.closest("[data-distributor]");
  if (distributor) {
    renderDistributor(distributor.dataset.distributor);
  }
});

document.getElementById("contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  updateContactSubmitState();
  if (document.querySelector("#contact-form .primary-action").disabled) return;
  storeGuest(getFormValues("guest"));
  state.hasEntered = true;
  saveState();
  showScreen("app");
});

document.getElementById("interest-form").addEventListener("submit", (event) => {
  event.preventDefault();
  updateInterestSubmitState();
  if (document.querySelector("#interest-form .primary-action").disabled) return;
  storeGuest(getFormValues("interest"));
  saveInterest(state.currentWineId, "interest_contact_form");
  finishInterestFlow();
  interestDialog.close();
});

document.getElementById("brand-lead-form").addEventListener("submit", (event) => {
  event.preventDefault();
  updateBrandSubmitState();
  if (document.querySelector("#brand-lead-form .primary-action").disabled) return;
  storeGuest(getFormValues("brand"));
  saveBrandLeadFromGuest("begasa_contact_form");
  document.querySelector("#brand-success-state p").textContent = copy[state.language].brandSavedBody;
  setBrandState("brand-success-state");
});

["guest-name", "guest-email", "guest-phone"].forEach((id) => {
  document.getElementById(id).addEventListener("input", updateContactSubmitState);
});

["interest-name", "interest-email", "interest-phone"].forEach((id) => {
  document.getElementById(id).addEventListener("input", updateInterestSubmitState);
});

["brand-name", "brand-email", "brand-phone"].forEach((id) => {
  document.getElementById(id).addEventListener("input", updateBrandSubmitState);
});

populateGuestForms();
renderPassport();
renderTopPicks();
renderTables();
updateLanguage(state.language);
updateContactSubmitState();
updateInterestSubmitState();
updateBrandSubmitState();
if (state.hasEntered) {
  showScreen("app");
}

loadSupabaseData().catch((error) => {
  console.warn("Supabase data load failed", error);
});
