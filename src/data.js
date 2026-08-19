import { TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";

export function useTexture(url) {
  return useLoader(TextureLoader, url);
}

export const TEXTURES = {
  metalRusty: "https://threejs.org/examples/textures/hardwood2_diffuse.jpg",
  concrete: "https://threejs.org/examples/textures/concrete_diffuse.jpg",
  grass: "https://threejs.org/examples/textures/grass.jpg",
  epdm: "https://threejs.org/examples/textures/rubber.jpg",
  wood: "https://threejs.org/examples/textures/wood.jpg",
};

export const STAGES = [
  { id: "collecte", label: "01 · Collecte", title: "Collecte des déchets", text: "Les déchets organiques sont réunis comme matière première du processus.", color: "#B88955", position: [-20, 0, 0] },
  { id: "tri", label: "02 · Réception / Tri", title: "Réception et tri", text: "Les éléments indésirables (pierres, sable, produits chimiques) sont retirés avant d'entrer dans le processus.", color: "#B88955", position: [-12, 0, 0] },
  { id: "pretraitement", label: "03 · Prétraitement", title: "Prétraitement", text: "Le substrat est broyé, mélangé et homogénéisé pour faciliter la digestion.", color: "#C99A61", position: [-4, 0, 0] },
  { id: "methaniseur", label: "04 · Méthaniseur", title: "Digestion anaérobie", text: "Cœur du système : les micro-organismes décomposent la matière organique en absence d'oxygène.", color: "#68B58C", position: [4, 0, 0] },
  { id: "hydrolyse", label: "04a · Hydrolyse", title: "Hydrolyse", text: "Décomposition des glucides, protéines et lipides en molécules simples.", color: "#C99A61", position: [4, 0, 0] },
  { id: "acidogenese", label: "04b · Acidogenèse", title: "Acidogenèse", text: "Transformation des molécules simples en acides organiques, alcools, CO₂ et H₂.", color: "#D88961", position: [4, 0, 0] },
  { id: "acetogenese", label: "04c · Acétogenèse", title: "Acétogenèse", text: "Conversion des acides et alcools en acétate, H₂ et CO₂.", color: "#B7C66D", position: [4, 0, 0] },
  { id: "methanogenese", label: "04d · Méthanogenèse", title: "Méthanogenèse", text: "Production de CH₄ (biogaz) à partir d'acétate, H₂ et CO₂.", color: "#D8A93E", position: [4, 0, 0] },
  { id: "traitement_biogaz", label: "05 · Traitement du biogaz", title: "Épuration et stockage", text: "Le biogaz est épuré (H₂S, CO₂, humidité) puis stocké sous un dôme EPDM.", color: "#D8A93E", position: [12, 0, 0] },
  { id: "cogeneration", label: "06 · Cogénération", title: "Production d'énergie", text: "Le biogaz alimente un moteur de cogénération (35% électricité, 65% chaleur).", color: "#DE7248", position: [20, 0, 0] },
  { id: "separation_phases", label: "07 · Séparation de phases", title: "Traitement du digestat", text: "Le digestat est séparé en phase solide et liquide pour épandage agronomique.", color: "#58C993", position: [28, 0, 0] },
  { id: "torchere", label: "08 · Torchère", title: "Sécurité", text: "La torchère brûle l'excédent de biogaz en cas de surproduction.", color: "#FF5722", position: [36, 0, 0] },
];
