import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { WeatherData, AIWeatherAdvisory, PersonalizedAdvisory, User, Crop, MarketPrice } from "../types";

export const getGeminiAdvisor = async (prompt: string, history: { role: string; parts: { text: string }[] }[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: "You are an expert Climate-Smart Agriculture (CSA) consultant. Provide concise, actionable advice. If the user asks for technical help, be very specific.",
    },
  });
  return response.text;
};

export const generateSpeech = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Speak in a professional, helpful tone: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};

export const generateWeatherAdvisory = async (weather: WeatherData, language: 'en' | 'hi' | 'mr'): Promise<AIWeatherAdvisory> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const langNames = { en: 'English', hi: 'Hindi', mr: 'Marathi' };
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          text: `Interpret this raw weather data into a simple, farmer-friendly daily summary and actionable recommendations.
          Weather Data: ${JSON.stringify(weather)}
          User's Preferred Language: ${langNames[language]}
          
          Guidelines:
          1. Use the selected language (${langNames[language]}).
          2. Avoid meteorological jargon. Use terms like 'moderate rain' or 'dry heat'.
          3. Mention specific impacts on farming activities (irrigation, fertilization, spraying).
          4. If temperature exceeds 35°C, advise on heat stress for crops.
          5. Respond strictly in JSON format.`,
        }
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Daily weather summary in the target language" },
          recommendations: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of actionable steps for the farmer"
          },
          confidenceScore: { type: Type.NUMBER, description: "AI confidence from 0 to 1" }
        },
        required: ["summary", "recommendations", "confidenceScore"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse weather advisory JSON", e);
    return {
      summary: "Weather patterns are shifting. Stay updated with local alerts.",
      recommendations: ["Monitor soil moisture closely", "Keep harvest protected"],
      confidenceScore: 0.5
    };
  }
};

export const analyzeCropImage = async (base64Image: string, cropType: string, location: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: `Act as a senior agronomist for the Nashik agricultural belt. Analyze this image of a ${cropType} from ${location}. 
          Identify any pests or diseases. Provide diagnostic data in both English and Marathi.
          Guidelines:
          - Diagnosis must be specific (e.g., 'Downy Mildew' not just 'Fungus').
          - Marathi translation should use local agricultural terminology.
          - Categorize severity as Low, Moderate, High, or Critical.
          - List 3 specific symptoms.
          - Provide distinct Organic and Chemical treatment options.
          - Suggest one preventive measure for the next cycle.
          Respond strictly in JSON format.`,
        }
      ],
    },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                diagnosis_en: { type: Type.STRING },
                diagnosis_mr: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                severity: { type: Type.STRING, enum: ["Low", "Moderate", "High", "Critical"] },
                symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
                organic_treatment: { type: Type.STRING },
                chemical_treatment: { type: Type.STRING },
                prevention: { type: Type.STRING }
            },
            required: ["diagnosis_en", "diagnosis_mr", "confidence", "severity", "symptoms", "organic_treatment", "chemical_treatment", "prevention"]
        }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getClimateImpactProjection = async (location: string, cropType: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Simulate the climate impact for ${cropType} in ${location} over the next 5 years.`,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });
    
    return {
        text: response.text,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
};

export const generatePersonalizedAdvisory = async (user: User, crop: Crop, weather: WeatherData, market: MarketPrice[]): Promise<PersonalizedAdvisory> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langNames = { en: 'English', hi: 'Hindi', mr: 'Marathi' };
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          text: `Generate a daily agricultural advisory for a farmer in ${user.location.village}, Nashik.
          Crop: ${crop.cropType} (${crop.variety})
          Growth Stage: ${crop.currentStage}
          Weather: ${JSON.stringify(weather.hourlyForecast.slice(0, 8))}
          Market Price: ${JSON.stringify(market)}
          Language: ${langNames[user.language]}
          
          Include strictly in JSON format:
          1. title: An engaging title in ${langNames[user.language]}
          2. greeting: A friendly, conversational greeting
          3. weatherSummary: 2-3 simple sentences about today's forecast
          4. todayTasks: 3-4 specific actionable items (irrigation, fertilization, spraying, etc.)
          5. pestWatch: Key points to monitor for pests/disease based on current humidity and temp
          6. marketOutlook: Guidance on selling vs storage based on price trends in Nashik Mandi
          7. precautions: List of 2-3 precautions (heat, residue, wind, etc.)
          8. safetyTip: One safety tip for the day
          9. confidenceScore: A number between 0 and 1
          
          Keep language simple, conversational, and actionable. Use local agricultural terminology where relevant.`,
        }
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          greeting: { type: Type.STRING },
          weatherSummary: { type: Type.STRING },
          todayTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
          pestWatch: { type: Type.STRING },
          marketOutlook: { type: Type.STRING },
          precautions: { type: Type.ARRAY, items: { type: Type.STRING } },
          safetyTip: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER }
        },
        required: ["title", "greeting", "weatherSummary", "todayTasks", "pestWatch", "marketOutlook", "precautions", "safetyTip", "confidenceScore"]
      }
    }
  });

  const content = JSON.parse(response.text || "{}");
  return {
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString().split('T')[0],
    language: user.language,
    ...content
  };
};