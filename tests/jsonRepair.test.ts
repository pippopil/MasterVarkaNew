import { describe, it, expect } from 'vitest';
import { cleanJsonString, repairJsonString, safeParseAiJson } from '../server/services/jsonRepair';

describe('AI JSON Repair & Sanitization Engine', () => {
  it('cleans markdown code fences with json language tag', () => {
    const raw = '```json\n{"styleName": "American IPA", "score": 90}\n```';
    expect(cleanJsonString(raw)).toBe('{"styleName": "American IPA", "score": 90}');
  });

  it('removes trailing commas before closing braces and brackets', () => {
    const malformed = '{"vitalStats": {"og": 1.055, "fg": 1.010, }, "strengths": ["hop", "malt",], }';
    const repaired = repairJsonString(malformed);
    const parsed = JSON.parse(repaired);
    expect(parsed.vitalStats.og).toBe(1.055);
    expect(parsed.strengths).toEqual(['hop', 'malt']);
  });

  it('repairs truncated JSON cut off mid-property (reproducing position 864 truncation error)', () => {
    // Simulates Gemini truncation at maxOutputTokens right in the middle of line 33 column 22
    const truncated = `{
      "styleName": "American Pale Ale",
      "category": "18B. American Pale Ale",
      "overallScore": 88,
      "verdict": "Отличный сорт с чистым хмелевым профилем",
      "vitalStats": {
        "og": { "actual": 1.052, "target": "1.045 - 1.060", "inRange": true },
        "ibu": { "actual": 38, "target": "30 - 50", "inRange": true }
      },
      "grainBillAnalysis": {
        "summary": "Базовая засыпь с умеренным добавлением карамельного солода",
        "strengths": ["Чистый солодовый фон", "Адекватный цвет"],
        "recommendations": ["Сохранить текущие пропорции"]
      },
      "hopScheduleAnalysis": {
        "summary": "Яркая цитрусовая ароматика",
        "bitternessComment": "Мягкая горечь",
        "aroma`; // Truncated right here!

    const fallback = { styleName: 'Fallback', overallScore: 70 };
    const result = safeParseAiJson<any>(truncated, fallback);

    expect(result).toBeDefined();
    // Must not crash with SyntaxError, and extracted available structured data
    expect(result.styleName).toBe('American Pale Ale');
    expect(result.overallScore).toBe(88);
    expect(result.vitalStats.og.actual).toBe(1.052);
    expect(result.grainBillAnalysis.strengths.length).toBe(2);
  });

  it('repairs truncated JSON cut off mid-string value', () => {
    const truncated = `{"styleName": "Weizen", "verdict": "Присутствуют классические ноты банана и гвоз`;
    const fallback = { styleName: 'Fallback' };
    const result = safeParseAiJson<any>(truncated, fallback);

    expect(result).toBeDefined();
    expect(result.styleName).toBe('Weizen');
    expect(result.verdict).toContain('банана');
  });

  it('safely returns fallback object on completely corrupt input without throwing', () => {
    const corrupt = 'Невозможно проанализировать данный рецепт, произошла ошибка модели.';
    const fallback = { styleName: 'Default Fallback', overallScore: 75 };
    const result = safeParseAiJson(corrupt, fallback);

    expect(result).toEqual(fallback);
  });
});
