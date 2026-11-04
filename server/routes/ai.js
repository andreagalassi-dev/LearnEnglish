const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();

const API_KEY =
  process.env.VITE_GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

function generateFallbackResponse(message, level, isError = false) {
  const cleanMsg = (message || "").trim();
  const words = cleanMsg
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 4)
    .slice(0, 5);

  const greetings = ["hi", "hello", "hey", "good morning", "good evening", "how are you"];
  const isGreeting = greetings.some((g) => cleanMsg.toLowerCase().startsWith(g));

  let text = "";
  let translation = "";
  let praise = "Good effort in forming your sentence!";
  let suggestion = "Try using a full sentence with a subject and verb.";

  if (isGreeting || cleanMsg.length < 5) {
    text = `Hello! 🌟 It's wonderful to practice English with you. What topic would you like to discuss today? We can practice **daily conversations**, **travel vocabulary**, or **grammar basics**!`;
    translation = `Ciao! 🌟 È fantastico fare pratica di inglese con te. Di quale argomento vorresti parlare oggi? Possiamo fare pratica con **conversazioni quotidiane**, **vocaboli di viaggio** o **basi di grammatica**!`;
    suggestion = "Answer with a complete sentence describing your favorite hobbies or daily routine.";
  } else {
    text = `Great job! 👏 You wrote: "${cleanMsg}". To continue our practice, can you tell me a little more, or try forming another sentence with the word **${words[0] || "practice"}**?`;
    translation = `Ottimo lavoro! 👏 Hai scritto: "${cleanMsg}". Per continuare la nostra pratica, potresti dirmi qualcosa in più, o provare a formare un'altra frase con la parola **${words[0] || "practice"}**?`;
    praise = "Clear message structure and natural expression!";
    suggestion = "Try adding a descriptive adjective or connector like 'because' or 'although'.";
  }

  const note = isError
    ? "\n\n*(Nota del sistema: la chiave API Gemini in .env non è valida o non ha quota. Il tutor è attualmente in modalità locale dimostrativa.)*"
    : "\n\n*(Nota del sistema: nessuna chiave API configurata in .env. È attiva la modalità locale dimostrativa.)*";

  return {
    text: text + note,
    translation,
    feedback: {
      correction: null,
      praise,
      suggestion,
    },
    detectedLevel: level || "Principiante",
    grammarScore: 85,
    vocabularyWords: words.length > 0 ? words : ["conversation", "practice", "English"],
  };
}

router.post("/chat", async (req, res) => {
  const { message, history, level, recentMistakes } = req.body;

  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    console.warn("Nessuna chiave API Gemini configurata. Utilizzo fallback locale.");
    return res.json(generateFallbackResponse(message, level, false));
  }

  try {
    const cleanKey = API_KEY.trim();
    const genAI = new GoogleGenerativeAI(cleanKey);

    const mistakesContext =
      recentMistakes && recentMistakes.length > 0
        ? `
      User's recent areas for improvement (Focus on helping with these):
      ${recentMistakes
        .map(
          (m) => `- Mistake: "${m.original}" -> Correction: "${m.correction}"`
        )
        .join("\n")}
      `
        : "";

    const prompt = `
      You are an expert English Tutor AI for an Italian speaker.
      User Level: ${level || "Beginner"}
      ${mistakesContext}
      
      CORE IDENTITY & BEHAVIOR:
      1. **Adaptive Tutor**: You MUST adjust your vocabulary and grammar complexity based on the User Level.
         - **Beginner**: Use simple words, present tense, basic sentence structures. Proactively suggest simple exercises (verbs, basic vocab).
         - **Intermediate**: Use phrasal verbs, more complex tenses (present perfect, conditionals).
         - **Advanced/Expert**: Use sophisticated vocabulary, idioms, nuances.
      2. **Proactive Teacher**: Do not just wait for the user. If the conversation stalls, propose a topic or an exercise relevant to their level.
      3. **Engaging Personality & Formatting**:
         - Use **bold text** to highlight key vocabulary, important grammar rules, and corrections.
         - Use emojis 🌟 naturally to make the conversation warm and human-like.
         - Use **Markdown Titles** (e.g., "### Correction", "### Explanation", "### Exercise") to structure longer responses.
         - Use **Bullet Points** for lists of words or steps.
         - Be encouraging and lively!

      LEARNING MODES:

      A. **ON-DEMAND PRACTICE (The "5-Step Rule")**:
         - If the user asks to practice a topic (e.g., "phrasal verbs", "cooking words"):
           - You MUST provide a series of **at least 5 exercises/questions**.
           - Do NOT give them all at once. Present them one by one or in small batches (max 2).
           - **Progression**: Start with an easy example, then increase difficulty.
           - **Vocabulary**: If teaching words, introduce 3-5 words, then IMMEDIATELY ask the user to translate them or use them in a sentence.

      B. **COMPLETE TEST MODE**:
         - Occasionally (or if requested), propose a "Complete Test" on a topic (approx. 15 questions).
         - **Initialization**: Before starting, you MUST say: "OK, I will start a test. Please answer the questions/exercises I will give you in blocks, so we can proceed step by step through the test."
         - **Execution**: Present questions in blocks (e.g., 3 blocks of 5 questions).
         - **Scoring & Completion (CRITICAL)**: 
           - **IF THE USER FINISHES THE TEST** OR **IF THE USER ASKS TO STOP/END THE TEST**:
             - You **MUST** immediately provide a final summary.
             - You **MUST** explicitly include the phrase "**TEST COMPLETED**".
             - You **MUST** provide a final score in the format "**Score: X/Y**" or "**Score: X%**" (calculate based on questions answered so far).
             - Provide a brief summary of performance.
             - Example final message: "### TEST COMPLETED\n\n**Score: 8/10 (80%)**\n\nGreat job! You showed good understanding of..."
           - **NEVER** just say "Okay, we can stop". You **MUST** give the score first.

      C. **CORRECTION LOOP**:
         - If the user makes a mistake in an exercise, your "feedback" object MUST contain the correction and a brief explanation.
         - You can ask them to try again if the error is significant.

      Task:
      1. Respond to the user's message in **ENGLISH ONLY**. Do NOT use Italian in the main response text.
      2. ALWAYS end with a relevant question or the next exercise step.
      3. Provide an Italian translation of your response in the 'translation' field ONLY.
      4. Analyze their message for grammar/vocabulary errors and provide feedback.
      5. Rate the user's grammar accuracy (0-100) for this specific message.
      6. Extract ALL correctly used nouns, verbs, adjectives, and adverbs.
      
      History:
      ${history.map((m) => `${m.role}: ${m.content}`).join("\n")}
      User: ${message}
      
      Output JSON format ONLY:
      {
        "text": "Your response in English",
        "translation": "Italian translation",
        "feedback": {
          "correction": "Correction if needed (optional, null if correct)",
          "praise": "Praise for good usage (REQUIRED if no correction)",
          "suggestion": "Suggestion for improvement (REQUIRED if no error and level != Native)"
        },
        "detectedLevel": "${level}",
        "grammarScore": 85,
        "vocabularyWords": ["word1", "word2", "word3", "word4"]
      }
    `;

    // Elenco modelli Flash prioritari per velocità ed efficienza:
    // Supporta le generazioni Gemini 3.8, 3.7, 3.6, 3.5 e 2.5
    const preferredModel = req.body.model || process.env.GEMINI_MODEL;
    const defaultModels = [
      "gemini-3.8-flash",       // Modello di punta ultra-veloce Gemini 3.8
      "gemini-3.7-flash",       // Gemini 3.7 Flash (instradato automaticamente a 3.8)
      "gemini-3.6-flash",       // Gemini 3.6 Flash
      "gemini-3.5-flash-lite",  // Gemini 3.5 Flash-Lite (bassissima latenza)
      "gemini-3.5-flash",       // Gemini 3.5 Flash
      "gemini-2.5-flash",       // Gemini 2.5 Flash
      "gemini-2.5-flash-lite",  // Gemini 2.5 Flash-Lite
      "gemini-1.5-flash",       // Fallback stabile precedente generazione
      "gemini-1.5-pro",
    ];

    const modelsToTry = preferredModel 
      ? [preferredModel, ...defaultModels.filter(m => m !== preferredModel)]
      : defaultModels;

    let result;
    let successfulModel = null;
    let lastError;

    console.log(
      `Using API Key: ${cleanKey.substring(0, 4)}...${cleanKey.substring(
        cleanKey.length - 4
      )}`
    );

    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        if (result) {
          successfulModel = modelName;
          console.log(`Successfully generated content with: ${modelName}`);
          break; // Success
        }
      } catch (e) {
        console.warn(`Model ${modelName} failed:`, e.message || e);
        lastError = e;
        continue; // Try next model
      }
    }

    if (!result) {
      throw lastError || new Error("All models failed");
    }

    const response = await result.response;
    const text = response.text();

    console.log("Raw AI response:", text); // Debug log

    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const jsonStr = jsonMatch[0];

    try {
      const parsedResponse = JSON.parse(jsonStr);
      if (successfulModel) {
        parsedResponse.modelUsed = successfulModel;
      }
      res.json(parsedResponse);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Failed JSON string:", jsonStr);
      res.status(500).json({ error: "Invalid JSON format from AI" });
    }
  } catch (error) {
    console.warn("Chiamata a Gemini API fallita (" + (error.message || "Errore sconosciuto") + "). Attivazione fallback locale.");
    res.json(generateFallbackResponse(message, level, true));
  }
});

module.exports = router;
