export const GLOSSARY = {
  "EPDM": {
    term: "EPDM",
    shortDef: "Élastomère thermodurable utilisé pour les dômes de stockage de biogaz",
    definition: "Éthylène-Propylène-Diène Monomère. polymère synthétique utilisé pour les membranes étanches de stockage de biogaz. Le dôme EPDM permet de stocker le biogaz à faible pression (5–30 mbar) tout en assurant l'étanchéité à l'air et au méthane.",
  },
  "SCADA": {
    term: "SCADA",
    shortDef: "Système de supervision et contrôle automatisé de l'installation",
    definition: "Supervisory Control and Data Acquisition. Système informatisé de pilotage centralisé qui surveille et contrôle l'ensemble des équipements de l'installation en temps réel. Il collecte les données de 50–200 capteurs (température, pression, pH, débit, composition du biogaz) et permet l'automatisation des regulateurs PID.",
  },
  "ATEX": {
    term: "ATEX",
    shortDef: "Norme de sécurité pour les atmosphères explosives",
    definition: "ATmosphères EXplosibles. Cadre réglementaire européen (directive 2014/34/UE) définissant les exigences de sécurité pour les équipements installés dans des zones où des atmosphères explosives peuvent survenir (présence de méthane, d'hydrogène). L'ensemble de l'installation de méthanisation est classée en zone ATEX.",
  },
  "digestat": {
    term: "digestat",
    shortDef: "Résidu liquide de la digestion anaérobie, riche en nutriments",
    definition: "Produit résiduel de la méthanisation, composé de matière organique partiellement dégradée, d'eau et de minéraux. Il est séparé en phase solide (compost, paillage) et phase liquide (engrais azoté). Le digestat contient l'azote, le phosphore et le potassium présents dans le substrat d'origine, sous forme plus assimilable par les plantes.",
  },
  "biogaz": {
    term: "biogaz",
    shortDef: "Mélange gazeux (CH₄ + CO₂) produit par la digestion anaérobie",
    definition: "Mélange de gaz principalement composé de méthane (CH₄, 50–75%) et de dioxyde de carbone (CO₂, 25–50%), avec des traces de sulfure d'hydrogène (H₂S), d'azote et de vapeur d'eau. C'est un combustible renouvelable utilisé pour la production d'électricité et de chaleur via cogénération, ou traité en biométhane pour injection dans le réseau de gaz naturel.",
  },
  "cogénération": {
    term: "cogénération",
    shortDef: "Production simultanée d'électricité et de chaleur à partir du biogaz",
    definition: "Technologie de production combinée d'énergie : le biogaz est brûlé dans un moteur à combustion interne couplé à un alternateur, produisant simultanément de l'électricité (35% de l'énergie) et de la chaleur (65%) récupérée via des échangeurs pour le chauffage, le séchage des produits agricoles ou le maintien de la température du méthaniseur.",
  },
  "méthane": {
    term: "CH₄ (Méthane)",
    shortDef: "Principal constituant du biogaz, gaz à effet de serre puissant",
    definition: "Le méthane (CH₄) est le composant principal du biogaz (50–75%). C'est un puissant gaz à effet de serre (GWP = 28 fois le CO₂ sur 100 ans). Sa combustion produit de l'énergie et du CO₂ (biogénique, neutre en carbone). Sa valorisation évite les émissions directes dans l'atmosphère.",
  },
  "H₂S": {
    term: "H₂S",
    shortDef: "Sulfure d'hydrogène, gaz toxique et corrosif présent dans le biogaz",
    definition: "Sulfure d'hydrogène. Gaz toxique, corrosif et malodorant présent en traces dans le biogaz brut (50–5 000 ppm). Il doit être éliminé par épuration (filtration ferrique, bioréparation chimique ou biologique) avant l'utilisation du biogaz dans un moteur ou une chaîne de gaz pour éviter la corrosion des équipements.",
  },
  "mésophile": {
    term: "mésophile",
    shortDef: "Régime de digestion à 35–37°C, le plus couramment utilisé",
    definition: "Régime de température de digestion anaérobie entre 35 et 37°C, le plus utilisé en France. Les bactéries mésophiles sont plus stables et plus faciles à piloter que les thermophiles. Le temps de rétention est de 20–40 jours. Alternatives : thermophile (52–55°C, plus rapide mais plus sensible) ou psychrophile (< 25°C, très lent).",
  },
  "thermophile": {
    term: "thermophile",
    shortDef: "Régime de digestion à 52–55°C, plus rapide mais plus instable",
    definition: "Régime de température de digestion anaérobie entre 52 et 55°C. Plus rapide que le mésophile (temps de rétention réduit à 12–20 jours) et meilleure destruction des pathogènes. Cependant, le pilotage est plus sensible aux perturbations et les rendements sont parfois légèrement inférieurs.",
  },
  "digestion anaérobie": {
    term: "digestion anaérobie",
    shortDef: "Décomposition de la matière organique en absence d'oxygène",
    definition: "Processus biologique naturel dans lequel des micro-organismes (bactéries et archées) décomposent la matière organique en absence d'oxygène. Elle se déroule en 4 étapes successives : hydrolyse, acidogenèse, acétogenèse et méthanogenèse. Le produit principal est le biogaz (CH₄ + CO₂).",
  },
  "digestat": {
    term: "digestat",
    shortDef: "Produit liquide sortant du méthaniseur, riche en nutriments",
    definition: "Résidu de la digestion anaérobie, constitué de matière organique partiellement minéralisée, d'eau et de nutriments (N, P, K). Le digestat est séparé en phase solide (compost, paillage) et phase liquide (engrais azoté concentré). Sa fertilisation est valorisée en agriculture durable.",
  },
  "hydrolyse": {
    term: "hydrolyse",
    shortDef: "Première étape : décomposition des polymères en monomères",
    definition: "Première étape de la digestion anaérobie, catalysée par des enzymes extracellulaires (cellulases, protéases, lipases). Les polymères complexes (cellulose, protéines, lipides) sont dégradés en monomères assimilables : sucres, acides aminés, acides gras. C'est l'étape limitante du processus.",
  },
  "acidogenèse": {
    term: "acidogenèse",
    shortDef: "Deuxième étape : production d'acides gras volatils",
    definition: "Deuxième étape de la digestion anaérobie, réalisée par des bactéries fermentaires (Clostridium, E. coli). Les monomères sont transformés en acides gras volatils (propionique, butyrique), alcools, CO₂ et H₂. Le pH chute à 5.5–6.5 pendant cette phase de production acide intense.",
  },
  "acétogenèse": {
    term: "acétogenèse",
    shortDef: "Troisième étape : conversion en acétate (précurseur du méthane)",
    definition: "Troisième étape, réalisée par des bactéries acétogènes en symbiose obligatoire avec les méthanogènes. Les AGV et alcools sont convertis en acétate, H₂ et CO₂. Cette étape nécessite une faible pression partielle de H₂ (< 10⁻⁴ atm) pour être thermodynamiquement favorable.",
  },
  "méthanogenèse": {
    term: "méthanogenèse",
    shortDef: "Dernière étape : production de méthane (CH₄) par les archées",
    definition: "Dernière étape de la digestion anaérobie, réalisée par des archées méthanogènes (Methanosarcina, Methanosaeta). Deux voies : acétoclastique (CH₃COOH → CH₄ + CO₂, 70%) et hydrogénotrope (CO₂ + 4H₂ → CH₄ + 2H₂O, 30%). Le méthane est le composant principal du biogaz.",
  },
  "séparateur à vis": {
    term: "séparateur à vis",
    shortDef: "Machine qui sépare le digestat en phase solide et liquide",
    definition: "Séparateur mécanique utilisant une vis sans fin (screw press) pour extraire la phase solide du digestat par filtration et compression. La phase solide (30–40% de matière sèche) est valorisée en compost ou paillage. La phase liquide (60–70%) est utilisée comme engrais azoté liquide en agriculture.",
  },
  "Biométhane": {
    term: "biométhane",
    shortDef: "Biogaz épuré injectable dans le réseau de gaz naturel",
    definition: "Biogaz épuré jusqu'à obtenir > 95% de CH₄, compatible avec les standards du gaz naturel. Il peut être injecté dans le réseau de distribution gaz ou utilisé comme carburant (bio-GNC/bio-GNL). L'épuration élimine le CO₂, l'H₂S et la vapeur d'eau.",
  },
  "MAS": {
    term: "MAS",
    shortDef: "Matières Agricoles Séchées, substrat courant en méthanisation",
    definition: "Matières Agricoles Séchées : résidus de culture (maïs, céréales, tournesol) récoltés à maturité et séchés. Substrat très riche en fibres et en matière organique, avec un rendement en biogaz de ~300–400 m³/t MS. C'est le principal substrat utilisé dans les méthaniseurs agricoles en France.",
  },
  "MAR": {
    term: "MAR",
    shortDef: "Matières Alternatives Renouvelables (déchets agro-industriels)",
    definition: "Matières Alternatives Renouvelables : catégorie regroupant les sous-produits agro-industriels (pépinières, jus de pomme, issues de lavage, plus de lait, glycérol brut, etc.). Elles complètent les MAS et lisiers pour diversifier les substrats et améliorer la biodiversité microbienne du digesteur.",
  },
  "Rétention hydraulique": {
    term: "TRH",
    shortDef: "Temps moyen de rétention du substrat dans le digesteur",
    definition: "Temps de Rétention Hydraulique : durée moyenne de séjour du substrat dans le méthaniseur, exprimée en jours. Il dépend du volume du digesteur et du débit d'alimentation. En mésophile, le TRH est de 20–40 jours. Un TRH trop court réduit le rendement, trop long sous-utilise le réacteur.",
  },
  "biogaz yield": {
    term: "Rendement biogaz",
    shortDef: "Volume de biogaz produit par tonne de matière sèche introduite",
    definition: "Volume de biogaz produit par unité de masse de matière sèche (MS) ou de matière volatile (MV) introduite dans le digesteur. Varie selon le substrat : fumier ~100–150 m³/t MS, maïs ~300–400 m³/t MS,MES ~400–500 m³/t MV. C'est un indicateur clé de performance de l'installation.",
  },
};
