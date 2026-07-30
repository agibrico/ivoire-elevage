import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // API Route for Gemini Agro-Pastoral Advisor
  app.post("/api/ai/advisor", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "Clé API Gemini non configurée. Veuillez définir GEMINI_API_KEY dans vos secrets.",
        });
      }

      const { prompt, context, analysisType } = req.body;
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      let systemInstruction = `
Tu es un Expert Conseiller Agro-Pastoral, Vétérinaire Auditeur et Directeur Financier spécialisé pour la holding "IVOIRE ÉLEVAGE".
Voici le contexte de l'entreprise :
- Projet d'élevage intégré en Côte d'Ivoire (Aviculture de chair + Porciculture).
- Volatile : Poulets de chair en rotation échelonnée (tous les 10 jours). Vente à 2,2 kg vif (30% entier à 3500 FCFA/unité, 70% découpe : escalopes, cuisses, ailes, tête-cou-dos, pattes, gésier, foie). Recette moyenne 4 350 FCFA/poulet.
- Porcin : Engraissement initial (30 porcelets achetés à 25 000 FCFA), revente à 75 kg carcasse à 2 100 FCFA/kg (157 500 FCFA/tête). Puis phase de reproduction (truies 180k FCFA, verrats 200k FCFA).
- Charges salariales : Volailler (60k FCFA/mois dès août 2026), Porcher 1 (60k FCFA/mois dès sept 2026), Porcher 2 (mars 2027), Porcher 3 (juin 2027).
- Expansion 5 ans : CA passe de 109M FCFA (2027) à 170M FCFA (2031), Bénéfice net passe de 52,38M FCFA à 89,54M FCFA.

Réponds en français, avec un ton professionnel, pragmatique, direct, encourageant et très clair pour le gestionnaire d'élevage. Donne des conseils chiffrés, précis et des étapes actionnables.
`;

      if (analysisType === "sanitary_preventive_audit") {
        systemInstruction += `
RÔLE SPÉCIFIQUE POUR CETTE DEMANDE :
Tu dois réaliser une ANALYSE PRÉVENTIVE CROISÉE DES CYCLES SANITAIRES ET DU REGISTRE D'AUDIT (Traçabilité).
Analyse l'ensemble des données fournies dans le contexte :
1. Les entrées du Journal d'Audit (Audit Log entries, ajustements sanitaires, mouvements de stock, observations vocales terrain).
2. Le calendrier des vaccins (Vaccine schedules, rappels J-5, retards, statut).
3. Les tâches de suivi sanitaire quotidiennes (Daily tasks, tâches nettoyages, désinfections, purges, acidifiants).
4. La pharmacie & stocks de médicaments/vaccins (Lots périssables, dates d'expiration proches, quantités disponibles).

Fais une synthèse structurée et esthétique avec des titres en majuscule et emojis :
- 🛡️ DIAGNOSTIC GLOBAL & ALERTES SANITAIRES CRITIQUES (synthétise les vaccins urgents J-5, lots périssables en pharmacie, et observations terrain récentes)
- 🔄 ANALYSE CROISÉE TRAÇABILITÉ (AUDIT LOG) vs SUIVI SANITAIRE (corrélation entre événements du journal d'audit et la santé des bandes)
- 💡 RECOMMANDATIONS D'OPTIMISATION PRÉVENTIVE DES CYCLES SANITAIRES (prophylaxie ajustée, biosécurité, prévention des pertes/mortalités, gestion de la chaîne du froid)
- 📅 PLAN D'ACTION SÉQUENCÉ (J+1 À J+30) (priorités avec rôles attribués: Vétérinaire, Technicien Chef, Soigneurs)
`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemInstruction}\n\nContexte additionnel fourni par l'utilisateur: ${JSON.stringify(context || {})}\n\nQuestion / Demande de l'utilisateur: ${prompt}`,
              },
            ],
          },
        ],
      });

      res.json({ answer: response.text });
    } catch (err: any) {
      console.error("Erreur serveur Gemini:", err);
      res.status(500).json({
        error: "Erreur lors de la génération du conseil : " + (err.message || "Erreur inconnue"),
      });
    }
  });

  // API Route for Gemini APK Feature & Module Generator
  app.post("/api/ai/feature-builder", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "Clé API Gemini non configurée. Veuillez définir GEMINI_API_KEY dans vos secrets.",
        });
      }

      const { prompt, apkMode, userRole } = req.body;
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = `
Tu es un Architecte Logiciel Agro-Pastoral et Générateur de Fonctionnalités IA pour l'application mobile (APK) "IVOIRE ÉLEVAGE".
L'utilisateur veut ajouter une NOUVELLE FONCTIONNALITÉ ou un NOUVEL OUTIL INTERACTIF sur-mesure dans son APK.

TU DOIS RÉPONDRE EXCLUSIVEMENT PAR UN OBJET JSON VALIDE respectant la structure suivante (SANS MARKDOWN AUTOUR, UNIQUEMENT LE CODE JSON) :

{
  "title": "Nom clair de la fonctionnalité (ex: Calculateur Ratio Eau/Aliment & Alerte Déviation)",
  "category": "Aviculture" | "Porciculture" | "Gestion & Finance" | "Santé & Biosécurité" | "Logistique & Ventes",
  "iconName": "Calculator" | "ClipboardList" | "HeartPulse" | "Boxes" | "TrendingUp" | "Zap" | "Sparkles" | "Layers",
  "description": "Explication claire de l'utilité terrain pour l'éleveur et le gestionnaire.",
  "targetApkMode": "TOUS" | "AVIVOIRE" | "PORCIVOIRE" | "ADMINISTRATION_GENERALE",
  "fields": [
    {
      "id": "champ_id_1",
      "label": "Libellé du champ (ex: Nombre de sujets)",
      "type": "number" | "text" | "select" | "checkbox",
      "defaultValue": 1000,
      "options": ["Option 1", "Option 2"],
      "unit": "unités / kg / FCFA / jours",
      "helpText": "Consigne pour l'utilisateur"
    }
  ],
  "calculationLogicDescription": "Explication de la logique mathématique ou du barème d'analyse utilisé.",
  "defaultOutputs": [
    {
      "id": "output_1",
      "label": "Besoin Théorique Quotidien",
      "value": "220 Litres / jour",
      "unit": "Litres",
      "note": "Basé sur 1000 poulets à J21 à 28°C",
      "status": "OK" | "WARNING" | "CRITICAL" | "INFO"
    }
  ],
  "recommendations": [
    "Recommandation 1 actionnable sur le terrain",
    "Recommandation 2 en cas de dépassement des seuils"
  ]
}

Assure-toi que les valeurs par défaut, les calculs et les conseils soient parfaitement réalistes pour le contexte de l'élevage en Côte d'Ivoire (FCFA, conditions tropicales, poulets de chair 10-jours, élevage porcin).
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemInstruction}\n\nMode APK Actuel: ${apkMode || "ADMINISTRATION_GENERALE"}\nRôle Utilisateur: ${userRole || "Gestionnaire"}\n\nDemande de nouvelle fonctionnalité APK: ${prompt}`,
              },
            ],
          },
        ],
      });

      let responseText = response.text || "";
      // Clean up markdown code blocks if any
      responseText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();

      try {
        const featureJson = JSON.parse(responseText);
        res.json({ success: true, feature: featureJson });
      } catch (parseErr) {
        console.error("JSON Parse Error on Gemini feature builder output:", parseErr, responseText);
        // Fallback structure if Gemini output wasn't strict JSON
        res.json({
          success: true,
          feature: {
            title: `Module Personnalisé : ${prompt.slice(0, 40)}`,
            category: "Gestion & Finance",
            iconName: "Sparkles",
            description: responseText,
            targetApkMode: "TOUS",
            fields: [
              {
                id: "valeur_saisie",
                label: "Donnée de mesure terrain",
                type: "number",
                defaultValue: 100,
                unit: "unités",
                helpText: "Entrez la valeur à analyser",
              },
            ],
            calculationLogicDescription: "Analyse intelligente basée sur les barèmes Ivoire Élevage.",
            defaultOutputs: [
              {
                id: "resultat_analyse",
                label: "Synthèse d'Analyse IA",
                value: "Analyse effectuée avec succès",
                status: "OK",
              },
            ],
            recommendations: [
              "Vérifiez l'exactitude des saisies sur le registre papier avant validation.",
              "Consultez le technicien en chef pour validation des seuils.",
            ],
          },
        });
      }
    } catch (err: any) {
      console.error("Erreur serveur Gemini Feature Builder:", err);
      res.status(500).json({
        error: "Erreur lors de la génération de la fonctionnalité APK : " + (err.message || "Erreur inconnue"),
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ivoire Élevage Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
