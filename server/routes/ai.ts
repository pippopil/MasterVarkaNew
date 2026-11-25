import { Router, Request, Response } from 'express';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  GenerateLabelRequest,
  AuditRecipeRequest,
  GenerateStyleDescriptionRequest,
  BjcpAnalysisRequest
} from '../types/api.js';
import {
  buildLabelPrompt,
  buildAuditPrompt,
  buildStyleDescriptionPrompt,
  generateOfflineStyleDescription,
  buildBjcpAnalysisPrompt,
  generateOfflineBjcpAnalysis,
  OFFLINE_THEMES
} from '../services/prompts.js';
import { safeParseAiJson } from '../services/jsonRepair.js';

// ======================== SCHEMAS FOR STRUCTURED JSON OUTPUT ========================

const labelResponseSchema = {
  type: Type.OBJECT,
  properties: {
    names: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 креативных названия'
    },
    slogan: { type: Type.STRING },
    story: { type: Type.STRING },
    themeStyle: { type: Type.STRING },
    palette: {
      type: Type.OBJECT,
      properties: {
        background: { type: Type.STRING },
        text: { type: Type.STRING },
        accent: { type: Type.STRING },
        border: { type: Type.STRING }
      },
      required: ['background', 'text', 'accent', 'border']
    },
    artworkType: { type: Type.STRING },
    brewerTip: { type: Type.STRING }
  },
  required: ['names', 'slogan', 'story', 'themeStyle', 'palette', 'artworkType', 'brewerTip']
};

const auditResponseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    foodPairings: { type: Type.ARRAY, items: { type: Type.STRING } },
    servingTemp: { type: Type.STRING },
    glassType: { type: Type.STRING }
  },
  required: ['summary', 'strengths', 'suggestions', 'foodPairings', 'servingTemp', 'glassType']
};

const styleDescriptionResponseSchema = {
  type: Type.OBJECT,
  properties: {
    styleName: { type: Type.STRING },
    bjcpCategory: { type: Type.STRING },
    description: { type: Type.STRING },
    sensoryProfile: {
      type: Type.OBJECT,
      properties: {
        aroma: { type: Type.STRING },
        appearance: { type: Type.STRING },
        flavor: { type: Type.STRING },
        mouthfeel: { type: Type.STRING }
      },
      required: ['aroma', 'appearance', 'flavor', 'mouthfeel']
    },
    highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
    commercialExamples: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['styleName', 'bjcpCategory', 'description', 'sensoryProfile', 'highlights', 'commercialExamples']
};

const bjcpAnalysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    styleName: { type: Type.STRING },
    category: { type: Type.STRING },
    overallScore: { type: Type.NUMBER },
    verdict: { type: Type.STRING },
    vitalStats: {
      type: Type.OBJECT,
      properties: {
        og: {
          type: Type.OBJECT,
          properties: {
            actual: { type: Type.NUMBER },
            target: { type: Type.STRING },
            inRange: { type: Type.BOOLEAN }
          },
          required: ['actual', 'target', 'inRange']
        },
        fg: {
          type: Type.OBJECT,
          properties: {
            actual: { type: Type.NUMBER },
            target: { type: Type.STRING },
            inRange: { type: Type.BOOLEAN }
          },
          required: ['actual', 'target', 'inRange']
        },
        abv: {
          type: Type.OBJECT,
          properties: {
            actual: { type: Type.NUMBER },
            target: { type: Type.STRING },
            inRange: { type: Type.BOOLEAN }
          },
          required: ['actual', 'target', 'inRange']
        },
        ibu: {
          type: Type.OBJECT,
          properties: {
            actual: { type: Type.NUMBER },
            target: { type: Type.STRING },
            inRange: { type: Type.BOOLEAN }
          },
          required: ['actual', 'target', 'inRange']
        },
        colorEbc: {
          type: Type.OBJECT,
          properties: {
            actual: { type: Type.NUMBER },
            target: { type: Type.STRING },
            inRange: { type: Type.BOOLEAN }
          },
          required: ['actual', 'target', 'inRange']
        },
        buGuRatio: {
          type: Type.OBJECT,
          properties: {
            actual: { type: Type.NUMBER },
            target: { type: Type.STRING },
            comment: { type: Type.STRING }
          },
          required: ['actual', 'target', 'comment']
        }
      },
      required: ['og', 'fg', 'abv', 'ibu', 'colorEbc', 'buGuRatio']
    },
    grainBillAnalysis: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        suggestedAdjustments: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['summary', 'strengths', 'recommendations', 'suggestedAdjustments']
    },
    hopScheduleAnalysis: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        bitternessComment: { type: Type.STRING },
        aromaComment: { type: Type.STRING },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        suggestedVarieties: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['summary', 'bitternessComment', 'aromaComment', 'recommendations', 'suggestedVarieties']
    },
    mashAndYeastAdvice: {
      type: Type.OBJECT,
      properties: {
        mashRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        yeastRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        fermentationTemp: { type: Type.STRING }
      },
      required: ['mashRecommendations', 'yeastRecommendations', 'fermentationTemp']
    },
    actionableSummary: { type: Type.STRING }
  },
  required: [
    'styleName',
    'category',
    'overallScore',
    'verdict',
    'vitalStats',
    'grainBillAnalysis',
    'hopScheduleAnalysis',
    'mashAndYeastAdvice',
    'actionableSummary'
  ]
};

export function createAiRouter(getAiClient: () => GoogleGenAI | null): Router {
  const router = Router();

  // 1. ИИ Генератор названия, истории и концепта этикетки
  router.post('/generate-name-and-label', async (req: Request<{}, {}, GenerateLabelRequest>, res: Response) => {
    const fallback = OFFLINE_THEMES[0];
    try {
      const data = req.body;
      const mode = data.tokenSettings?.mode || 'eco';
      const aiClient = getAiClient();
      const isOffline = mode === 'offline' || !aiClient;
      const isEco = mode === 'eco';
      const maxTokens = Math.max(500, Math.min(Number(data.tokenSettings?.maxOutputTokens) || (isEco ? 800 : 1200), 2000));
      const disableThinking = data.tokenSettings?.disableThinking !== false;
      const compressPrompt = data.tokenSettings?.compressPrompt !== false;

      if (isOffline || !aiClient) {
        const pick = OFFLINE_THEMES[Math.floor(Math.random() * OFFLINE_THEMES.length)];
        return res.json({
          success: true,
          names: pick.names.map(n => `${n} ${data.style || ''}`.trim()),
          slogan: pick.slogan,
          story: `${pick.story} Оптимально для плотности ${data.og || 1.050} и горечи ${data.ibu || 25} IBU.`,
          themeStyle: pick.themeStyle,
          palette: pick.palette,
          artworkType: pick.artworkType,
          brewerTip: pick.brewerTip,
          usage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
          isOfflineMode: true
        });
      }

      const prompt = buildLabelPrompt(data, compressPrompt);
      const selectedModel = isEco ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

      const response = await aiClient.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: labelResponseSchema,
          maxOutputTokens: maxTokens,
          thinkingConfig: {
            thinkingLevel: disableThinking ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW
          }
        }
      });

      const parsed = safeParseAiJson(response.text || '', fallback);
      return res.json({
        success: true,
        ...parsed,
        usage: response.usageMetadata,
        modelUsed: selectedModel
      });
    } catch (error: any) {
      console.warn('[Gemini Label] Fallback activated:', error?.message || error);
      return res.json({
        success: true,
        names: fallback.names,
        slogan: fallback.slogan,
        story: fallback.story,
        themeStyle: fallback.themeStyle,
        palette: fallback.palette,
        artworkType: fallback.artworkType,
        brewerTip: fallback.brewerTip,
        usage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
        isFallback: true
      });
    }
  });

  // 2. ИИ Экспертный аудит рецепта и гастрономические пары
  router.post('/audit-recipe', async (req: Request<{}, {}, AuditRecipeRequest>, res: Response) => {
    const fallbackAudit = {
      summary: 'Рецепт составлен сбалансированно. Соотношение солодовой базы и охмеления гармонично.',
      strengths: ['Хорошая плотность сусла', 'Адекватный расчет нормы засева дрожжей'],
      suggestions: ['Контролируйте температуру брожения без резких перепадов'],
      foodPairings: ['Твердые сыры', 'Бургеры на гриле', 'Пряные колбаски'],
      servingTemp: '8-10°C',
      glassType: 'Тюльпан'
    };

    try {
      const data = req.body;
      const mode = data.tokenSettings?.mode || 'eco';
      const aiClient = getAiClient();
      const isOffline = mode === 'offline' || !aiClient;
      const isEco = mode === 'eco';
      const maxTokens = Math.max(600, Math.min(Number(data.tokenSettings?.maxOutputTokens) || (isEco ? 1000 : 1500), 2500));
      const disableThinking = data.tokenSettings?.disableThinking !== false;
      const compressPrompt = data.tokenSettings?.compressPrompt !== false;

      if (isOffline || !aiClient) {
        return res.json({
          success: true,
          audit: fallbackAudit,
          usage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
          isOfflineMode: true
        });
      }

      const prompt = buildAuditPrompt(data, compressPrompt);
      const selectedModel = isEco ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

      const response = await aiClient.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: auditResponseSchema,
          maxOutputTokens: maxTokens,
          thinkingConfig: {
            thinkingLevel: disableThinking ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW
          }
        }
      });

      const parsed = safeParseAiJson(response.text || '', fallbackAudit);
      return res.json({
        success: true,
        audit: parsed,
        usage: response.usageMetadata,
        modelUsed: selectedModel
      });
    } catch (err: any) {
      console.warn('[Gemini Audit] Fallback activated:', err?.message || err);
      return res.json({
        success: true,
        audit: fallbackAudit,
        usage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
        isFallback: true
      });
    }
  });

  // 3. ИИ Генерация описания стиля пива на основе состава рецепта (Gemini 3.8 Flash)
  router.post('/generate-style-description', async (req: Request<{}, {}, GenerateStyleDescriptionRequest>, res: Response) => {
    const offlineFallback = generateOfflineStyleDescription(req.body.recipe);
    try {
      const data = req.body;
      const recipe = data.recipe;
      const mode = data.tokenSettings?.mode || 'eco';
      const aiClient = getAiClient();
      const isOffline = mode === 'offline' || !aiClient;
      const isEco = mode === 'eco';
      const maxTokens = Math.max(1000, Math.min(Number(data.tokenSettings?.maxOutputTokens) || (isEco ? 2000 : 3000), 4000));
      const disableThinking = data.tokenSettings?.disableThinking !== false;
      const compressPrompt = data.tokenSettings?.compressPrompt !== false;

      if (isOffline || !aiClient) {
        return res.json({
          success: true,
          data: offlineFallback,
          usage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
          isOfflineMode: true,
          modelUsed: 'offline'
        });
      }

      const prompt = buildStyleDescriptionPrompt(recipe, compressPrompt);
      const selectedModel = isEco ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

      const response = await aiClient.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: styleDescriptionResponseSchema,
          maxOutputTokens: maxTokens,
          thinkingConfig: {
            thinkingLevel: disableThinking ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW
          }
        }
      });

      const parsed = safeParseAiJson(response.text || '', offlineFallback);
      return res.json({
        success: true,
        data: parsed,
        usage: response.usageMetadata,
        modelUsed: selectedModel
      });
    } catch (err: any) {
      console.warn('[Gemini StyleDescription] Fallback activated:', err?.message || err);
      return res.json({
        success: true,
        data: offlineFallback,
        usage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
        isFallback: true,
        error: err?.message || 'AI request failed'
      });
    }
  });

  // 4. ИИ Экспертиза соответствия рецепта / распознанного файла стилю BJCP (Gemini 3.8 Flash)
  router.post('/bjcp-analysis', async (req: Request<{}, {}, BjcpAnalysisRequest>, res: Response) => {
    const offlineFallback = generateOfflineBjcpAnalysis(req.body.recipe, req.body.targetStyle);
    try {
      const data = req.body;
      const recipe = data.recipe || {};
      const rawFileContent = data.rawFileContent;
      const targetStyle = data.targetStyle;
      const mode = data.tokenSettings?.mode || 'eco';
      const aiClient = getAiClient();
      const isOffline = mode === 'offline' || !aiClient;
      const isEco = mode === 'eco';
      const maxTokens = Math.max(1500, Math.min(Number(data.tokenSettings?.maxOutputTokens) || (isEco ? 3000 : 4500), 6000));
      const disableThinking = data.tokenSettings?.disableThinking !== false;
      const compressPrompt = data.tokenSettings?.compressPrompt !== false;

      if (isOffline || !aiClient) {
        return res.json({
          success: true,
          data: offlineFallback,
          usage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
          isOfflineMode: true,
          modelUsed: 'offline'
        });
      }

      const prompt = buildBjcpAnalysisPrompt(recipe, rawFileContent, targetStyle, compressPrompt);
      const selectedModel = isEco ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

      const response = await aiClient.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: bjcpAnalysisResponseSchema,
          maxOutputTokens: maxTokens,
          thinkingConfig: {
            thinkingLevel: disableThinking ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW
          }
        }
      });

      const parsed = safeParseAiJson(response.text || '', offlineFallback);
      return res.json({
        success: true,
        data: parsed,
        usage: response.usageMetadata,
        modelUsed: selectedModel
      });
    } catch (err: any) {
      console.warn('[Gemini BJCP] Fallback activated:', err?.message || err);
      return res.json({
        success: true,
        data: offlineFallback,
        usage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
        isFallback: true,
        error: err?.message || 'AI request failed'
      });
    }
  });

  return router;
}

