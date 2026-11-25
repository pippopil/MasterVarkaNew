import { GrainItem, HopItem, MashRest, OtherIngredientItem, Recipe, Yeast } from '../types/brewing';
import { calculateBrewMetrics } from './brewingMath';

/**
 * Парсер рецептов с портала Бир.РФ (https://xn--90aoy.xn--p1ai / https://беер.рф)
 * Извлекает все ингредиенты, засыпь, паузы затирания, хмель и параметры варки.
 * Поддерживает как встроенный структурированный JSON (#brief), так и чистую HTML разметку страниц.
 */
export function parseBirRfRecipe(html: string, sourceUrl?: string): Recipe | null {
  if (!html || typeof html !== 'string') return null;

  const isBirUrl = Boolean(
    sourceUrl && (sourceUrl.includes('xn--90aoy') || sourceUrl.includes('бир.рф') || sourceUrl.includes('беер.рф') || sourceUrl.includes('beer_recipes'))
  );
  const isBirHtml =
    html.includes('Рецепт напитка от') ||
    html.includes('Добавил(а):') ||
    html.includes('id="brief"') ||
    html.includes('id=\'brief\'') ||
    (html.includes('Зерновые:</i>') && html.includes('Хмель:</i>')) ||
    (html.includes('beer_recipes') && html.includes('Зерновые'));

  if (!isBirUrl && !isBirHtml) {
    return null;
  }

  try {
    // 0. Попытка извлечения встроенного структурированного JSON объекта brief
    let briefData: any = null;
    const briefMatch =
      html.match(/id=["']brief["']\s+value=(["'])([\s\S]*?)\1\s*\/?>/i) ||
      html.match(/id=["']brief["']\s+value=["']([\s\S]*?)["']\s*\/?>/i) ||
      html.match(/value=(["'])({[\s\S]*?})\1\s+id=["']brief["']/i) ||
      html.match(/value=["']({[\s\S]*?})["']\s+id=["']brief["']/i);

    if (briefMatch) {
      const jsonStr = briefMatch[2] || briefMatch[1];
      if (jsonStr) {
        try {
          briefData = JSON.parse(jsonStr);
        } catch (err) {
          console.warn('Failed to parse brief JSON from Бир.РФ:', err);
        }
      }
    }

    // Изолируем тело страницы (отсекая <head>, чтобы <meta name="keywords" content="...хмель..."> не ломал регулярные выражения)
    const bodyContent = html.includes('<article')
      ? html.substring(html.indexOf('<article'))
      : html.includes('<body')
      ? html.substring(html.indexOf('<body'))
      : html;

    // 1. Название рецепта
    let name = 'Рецепт с Бир.РФ';
    const titleMatch = html.match(/<h1[^>]*id=["']item-title["'][^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([^|<]+)/i);
    if (titleMatch && titleMatch[1]) {
      name = titleMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/Рецепт напитка от.*$/i, '')
        .trim();
    }

    // 2. Стиль пива и категория
    let style = (briefData?.cats?.style as string) || 'Крафтовый стиль';
    let category = 'Крафт';

    const styleMatch =
      html.match(/id=["']item-style["'][^>]*>([^<]+)</i) ||
      html.match(/Стиль:.*?<[^>]*>([^<]+)</s) ||
      html.match(/Стиль:\s*([^\n<]+)/);
    if (styleMatch && styleMatch[1]) {
      style = styleMatch[1].trim();
    }

    const catMatch = html.match(/Категория:.*?<[^>]*>([^<]+)</s) || html.match(/Категория:\s*([^\n<]+)/);
    if (catMatch && catMatch[1]) {
      category = catMatch[1].trim();
    }

    // 3. Автор рецепта
    let author = 'Пивовар с Бир.РФ';
    const authorMatch = html.match(/Добавил\(а\):<\/b>\s*<a[^>]*>([^<]+)<\/a>/i);
    if (authorMatch && authorMatch[1]) {
      author = authorMatch[1].trim();
    }

    // 4. Описание / примечание
    let description = '';
    if (briefData?.mess && typeof briefData.mess === 'string') {
      description = briefData.mess
        .replace(/\\n/g, '\n')
        .replace(/\[\/?b\]/gi, '')
        .trim();
    } else {
      const descMatch = html.match(/<b>Примечание:<\/b>\s*<br \/>(.*?)<br \/><br \/>\s*<b>Ингредиенты<\/b>/s);
      if (descMatch && descMatch[1]) {
        description = descMatch[1]
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]+>/g, ' ')
          .trim();
      } else {
        description = `Импортировано с портала Бир.РФ (${sourceUrl || 'https://xn--90aoy.xn--p1ai'})`;
      }
    }

    // 5. Параметры варки: объем, кипячение, эффективность
    let batchSizeL = 30.0;
    if (briefData?.pars?.['after-boiling']) {
      batchSizeL = parseFloat(briefData.pars['after-boiling']) || 30.0;
    } else {
      const sizeMatch =
        html.match(/id=["']item-volume["'][^0-9]*([0-9.]+)\s*л/i) ||
        html.match(/Размер:[^0-9]*([0-9.]+)\s*л/i) ||
        html.match(/Размер партии после кипячения:[^0-9]*([0-9.]+)\s*л/i);
      if (sizeMatch && sizeMatch[1]) {
        batchSizeL = parseFloat(sizeMatch[1]) || 30.0;
      }
    }

    let boilTimeMin = 60;
    if (briefData?.pars?.boil) {
      boilTimeMin = parseInt(briefData.pars.boil, 10) || 60;
    } else {
      const boilMatch = html.match(/Время кипячения:\s*<b>([0-9]+)\s*мин/i);
      if (boilMatch && boilMatch[1]) {
        boilTimeMin = parseInt(boilMatch[1], 10) || 60;
      }
    }

    let efficiencyPercent = 75.0;
    if (briefData?.pars?.kpd) {
      efficiencyPercent = parseFloat(briefData.pars.kpd) || 75.0;
    } else {
      const effMatch = html.match(/Эффективность варки:\s*<b>([0-9.]+)\s*%/i);
      if (effMatch && effMatch[1]) {
        efficiencyPercent = parseFloat(effMatch[1]) || 75.0;
      }
    }

    // 6. Парсинг зерновых (солодов)
    const grains: GrainItem[] = [];

    // А) Пробуем взять структурированные данные из brief.ferm.fm
    if (briefData?.ferm?.fm && typeof briefData.ferm.fm === 'object') {
      const grainList = Object.values(briefData.ferm.fm);
      grainList.forEach((g: any, idx) => {
        const grainName = String(g.name || '').trim();
        const weightKg = parseFloat(g.weight) || 0;
        if (grainName && weightKg > 0) {
          const colorEbc = parseFloat(g.ebc) || (parseFloat(g.srm) ? parseFloat(g.srm) * 1.97 : 4.0);

          let type: GrainItem['type'] = 'base';
          const lower = grainName.toLowerCase();
          if (lower.includes('cara') || lower.includes('кара') || lower.includes('crystal') || lower.includes('мелано')) {
            type = 'caramel';
          } else if (lower.includes('roasted') || lower.includes('жжен') || lower.includes('black') || lower.includes('шоколад') || lower.includes('кофе')) {
            type = 'roasted';
          } else if (lower.includes('wheat') || lower.includes('пшенич')) {
            type = 'wheat';
          } else if (lower.includes('хлопья') || lower.includes('flake') || lower.includes('овсян') || lower.includes('ячменные')) {
            type = 'adjunct';
          } else if (lower.includes('кислый') || lower.includes('acid')) {
            type = 'acid';
          }

          grains.push({
            id: `bir_grain_b_${idx}_${Date.now()}`,
            name: grainName,
            weightKg,
            potentialSg: type === 'roasted' ? 1.025 : 1.037,
            colorEbc: Number(colorEbc.toFixed(1)),
            type
          });
        }
      });
    }

    // Б) Если в brief не было зерновых, парсим HTML разметку
    if (grains.length === 0) {
      let grainBlock = '';
      const grainBlockMatch =
        bodyContent.match(/<i>\s*Зерновые:?\s*<\/i><\/span>[\s\S]*?<br\s*\/?>([\s\S]*?)(?:<span style=["']color:green["']|Всего:|<h[1-6]|<i>)/i) ||
        bodyContent.match(/(?:Зерновые|Солод):?.*?(?:<br\s*\/?>|<\/h[1-6]>|<\/div>|<\/span>)([\s\S]*?)(?:Хмель:|Всего:|<h[1-6]|<span style=["']color:green)/i);

      if (grainBlockMatch && grainBlockMatch[1]) {
        grainBlock = grainBlockMatch[1];
      }

      if (grainBlock) {
        const grainLines = grainBlock.includes('<li>') ? grainBlock.split('<li>') : grainBlock.split(/<br\s*\/?>/i);
        grainLines.forEach((line, idx) => {
          const weightMatch = line.match(/(?:<b>)?([0-9.]+)\s*кг(?:<\/b>)?/i) || line.match(/([0-9.]+)\s*кг/i);
          const nameMatch =
            line.match(/<a[^>]*>([^<]+)<\/a>/) ||
            line.match(/<b>([^<]+)<\/b>/) ||
            line.match(/(?:^|[-–•])\s*([А-Яа-яA-Za-z0-9\s/()\-]+?)(?:,|\s+[0-9.]+\s*кг)/);
          if (weightMatch && nameMatch) {
            const weightKg = parseFloat(weightMatch[1]);
            const grainName = nameMatch[1].replace(/<[^>]+>/g, '').trim();

            if (weightKg > 0 && grainName.length > 2 && !grainName.toLowerCase().includes('зерновые')) {
              let colorEbc = 4.0;
              const colorMatch = line.match(/цвет\s*=\s*([0-9.]+)\s*L°/i) || line.match(/([0-9.]+)\s*(?:EBC|ebc)/i);
              if (colorMatch && colorMatch[1]) {
                colorEbc = Number((parseFloat(colorMatch[1]) * 1.97).toFixed(1));
              }

              let type: GrainItem['type'] = 'base';
              const lower = grainName.toLowerCase();
              if (lower.includes('cara') || lower.includes('кара') || lower.includes('crystal') || lower.includes('мелано')) {
                type = 'caramel';
              } else if (lower.includes('roasted') || lower.includes('жжен') || lower.includes('black') || lower.includes('шоколад') || lower.includes('кофе')) {
                type = 'roasted';
              } else if (lower.includes('wheat') || lower.includes('пшенич')) {
                type = 'wheat';
              } else if (lower.includes('хлопья') || lower.includes('flake') || lower.includes('овсян') || lower.includes('ячменные')) {
                type = 'adjunct';
              } else if (lower.includes('кислый') || lower.includes('acid')) {
                type = 'acid';
              }

              grains.push({
                id: `bir_grain_${idx}_${Date.now()}`,
                name: grainName,
                weightKg,
                potentialSg: type === 'roasted' ? 1.025 : 1.037,
                colorEbc,
                type
              });
            }
          }
        });
      }
    }

    if (grains.length === 0) {
      grains.push({
        id: `g_fallback_${Date.now()}`,
        name: 'Pilsner Malt (Пилснер)',
        weightKg: Math.round(batchSizeL * 0.22 * 10) / 10,
        potentialSg: 1.037,
        colorEbc: 3.5,
        type: 'base'
      });
    }

    // 7. Парсинг хмеля (Hop Extraction)
    const hops: HopItem[] = [];

    // А) Первичный источник: структурированный JSON brief.ferm.hp
    if (briefData?.ferm?.hp && typeof briefData.ferm.hp === 'object') {
      const hopList = Object.values(briefData.ferm.hp);
      hopList.forEach((h: any, idx) => {
        const rawName = String(h.name || '').trim();
        const weightG = parseFloat(h.weight) || 0;
        const alphaAcid = parseFloat(h.acid) || 4.5;
        const boilTimeMinHop = parseInt(h.boil, 10) || 0;

        let use: HopItem['use'] = 'boil';
        const dtype = String(h.dtype || '').toLowerCase();
        const adding = String(h.adding || '');

        if (adding === '6' || dtype.includes('сух') || rawName.toLowerCase().includes('сухое')) {
          use = 'dry_hop';
        } else if (adding === '5' || dtype.includes('вирпул') || rawName.toLowerCase().includes('вирпул')) {
          use = 'whirlpool';
        } else if (boilTimeMinHop <= 15 && boilTimeMinHop > 0) {
          use = 'aroma';
        }

        if (rawName && weightG > 0) {
          hops.push({
            id: `bir_hop_b_${idx}_${Date.now()}`,
            name: rawName,
            weightG,
            alphaAcid,
            boilTimeMin: boilTimeMinHop,
            use
          });
        }
      });
    }

    // Б) Если в brief хмель не был найден, извлекаем из изолированного HTML
    if (hops.length === 0) {
      let hopBlock = '';
      const hopBlockMatch =
        bodyContent.match(/<i>\s*Хмель:?\s*<\/i><\/span>[\s\S]*?<br\s*\/?>([\s\S]*?)(?:<span style=["']color:green["']|Всего:|<h[1-6]|<i>)/i) ||
        bodyContent.match(/Хмель:?[\s\S]*?(?:<br\s*\/?>|<\/span>)([\s\S]*?)(?:Дрожжи:|Параметры:|Всего:|<h[1-6]|<span style=["']color:green)/i);

      if (hopBlockMatch && hopBlockMatch[1]) {
        hopBlock = hopBlockMatch[1];
      }

      if (hopBlock) {
        const hopLines = hopBlock.includes('<li>') ? hopBlock.split('<li>') : hopBlock.split(/<br\s*\/?>/i);
        hopLines.forEach((line, idx) => {
          // Игнорируем строки "Всего: ..."
          if (line.toLowerCase().includes('всего:')) return;

          const weightMatch =
            line.match(/(?:<b>)?([0-9.]+)\s*(?:гр|г|g)(?:<\/b>)?/i) ||
            line.match(/([0-9.]+)\s*(?:гр|г|g)\b/i);

          const nameMatch =
            line.match(/<a[^>]*>([^<]+)<\/a>/) ||
            line.match(/\|\s*<a[^>]*>([^<]+)<\/a>/) ||
            line.match(/\|\s*([^<–-]+?)\s*-\s*<i>/) ||
            line.match(/<b>([^<]+)<\/b>/) ||
            line.match(/(?:[0-9.]+\s*(?:гр|г|g)\s+)([А-Яа-яA-Za-z0-9\s/()\-]+?)(?:\s+(?:a-к|кипятить|альфа|сухое|вирпул|\()|$)/i) ||
            line.match(/(?:^|[-–•|])\s*([А-Яа-яA-Za-z0-9\s/()\-]+?)(?:,|\s+[0-9.]+\s*г|\s*\(a-к)/i);

          if (weightMatch && nameMatch) {
            const weightG = parseFloat(weightMatch[1]);
            let hopName = nameMatch[1].replace(/<[^>]+>/g, '').trim();

            // Очистка от лишних префиксов и суффиксов
            hopName = hopName.replace(/^\|\s*/, '').trim();

            if (weightG > 0 && hopName.length > 1 && !hopName.toLowerCase().startsWith('всего')) {
              let alphaAcid = 4.5;
              const alphaMatch =
                line.match(/a-к\.=([0-9.]+)/i) ||
                line.match(/альфа=([0-9.]+)/i) ||
                line.match(/([0-9.]+)\s*%/);
              if (alphaMatch && alphaMatch[1]) {
                alphaAcid = parseFloat(alphaMatch[1]);
              }

              let boilTimeMinHop = 60;
              let use: HopItem['use'] = 'boil';
              const timeMatch =
                line.match(/кипятить\s*([0-9]+)\s*мин/i) ||
                line.match(/([0-9]+)\s*мин/i);

              if (line.toLowerCase().includes('сухое') || line.toLowerCase().includes('брожение')) {
                use = 'dry_hop';
                boilTimeMinHop = 0;
              } else if (line.toLowerCase().includes('вирпул') || line.toLowerCase().includes('аромат')) {
                use = 'whirlpool';
                boilTimeMinHop = 0;
              } else if (timeMatch && timeMatch[1]) {
                boilTimeMinHop = parseInt(timeMatch[1], 10);
                if (boilTimeMinHop <= 15 && boilTimeMinHop > 0) {
                  use = 'aroma';
                }
              }

              hops.push({
                id: `bir_hop_html_${idx}_${Date.now()}`,
                name: hopName,
                weightG,
                alphaAcid,
                boilTimeMin: boilTimeMinHop,
                use
              });
            }
          }
        });
      }
    }

    // Если хмель абсолютно не указан на странице, используем дефолтный лагерный хмель
    if (hops.length === 0) {
      hops.push({
        id: `h_fallback_${Date.now()}`,
        name: 'Saaz (Жатецкий)',
        weightG: 30,
        alphaAcid: 3.8,
        boilTimeMin: 60,
        use: 'boil'
      });
    }

    // 8. Парсинг пауз затирания
    const mashSchedule: MashRest[] = [];

    // А) Из brief.mode.pause
    if (briefData?.mode?.pause && typeof briefData.mode.pause === 'object') {
      const pauses = Object.values(briefData.mode.pause);
      pauses.forEach((p: any, idx) => {
        const tempC = parseFloat(p.temp);
        const timeMin = parseInt(p.hold, 10);
        if (!isNaN(tempC) && !isNaN(timeMin)) {
          let pType: MashRest['type'] = 'custom';
          let pauseName = `Пауза ${tempC}°C`;
          if (tempC >= 50 && tempC <= 55) {
            pType = 'protein';
            pauseName = 'Белковая пауза';
          } else if (tempC >= 62 && tempC <= 65) {
            pType = 'maltose';
            pauseName = 'Мальтозная пауза';
          } else if (tempC >= 66 && tempC <= 69) {
            pType = 'maltose';
            pauseName = 'Осахаривание';
          } else if (tempC >= 70 && tempC <= 74) {
            pType = 'dextrin';
            pauseName = 'Декстриновая пауза';
          } else if (tempC >= 75) {
            pType = 'mashout';
            pauseName = 'Мэшаут';
          }

          mashSchedule.push({
            id: `bir_pause_b_${idx}_${Date.now()}`,
            name: pauseName,
            tempC,
            timeMin,
            type: pType
          });
        }
      });
    }

    // Б) Из HTML
    if (mashSchedule.length === 0) {
      const mashBlockMatch = bodyContent.match(/Температурные паузы:<\/i><\/span>.*?<br \/>(.*?)(?:<span style=["']color:green["']|Потребность)/s);
      if (mashBlockMatch && mashBlockMatch[1]) {
        const pauseLines = mashBlockMatch[1].split('<li>');
        pauseLines.forEach((line, idx) => {
          const pauseMatch = line.match(/([^:]+):\s*([0-9]+)\s*°С\s*-\s*([0-9]+)\s*мин/i);
          if (pauseMatch) {
            const pauseName = pauseMatch[1].trim();
            const tempC = parseFloat(pauseMatch[2]);
            const timeMin = parseInt(pauseMatch[3], 10);

            let pType: MashRest['type'] = 'custom';
            const lower = pauseName.toLowerCase();
            if (lower.includes('белк') || lower.includes('протеин')) pType = 'protein';
            else if (lower.includes('осахарив') || lower.includes('мальтоз')) pType = 'maltose';
            else if (lower.includes('декстрин')) pType = 'dextrin';
            else if (lower.includes('мэш') || lower.includes('аут')) pType = 'mashout';
            else if (lower.includes('кислот')) pType = 'acid';

            mashSchedule.push({
              id: `bir_pause_${idx}_${Date.now()}`,
              name: pauseName,
              tempC,
              timeMin,
              type: pType
            });
          }
        });
      }
    }

    if (mashSchedule.length === 0) {
      mashSchedule.push(
        { id: 'm1', name: 'Осахаривание (Мальтозная)', tempC: 66, timeMin: 60, type: 'maltose' },
        { id: 'm2', name: 'Мэшаут', tempC: 78, timeMin: 10, type: 'mashout' }
      );
    }

    // 9. Дрожжи
    let yeastName = 'Fermentis SafAle US-05';
    let yeastLab = 'Fermentis';
    let attenuationPercent = 78;

    if (briefData?.ferm?.ys && typeof briefData.ferm.ys === 'object') {
      const yList = Object.values(briefData.ferm.ys);
      const firstYeast: any = yList[0];
      if (firstYeast?.name) {
        yeastName = String(firstYeast.name).trim();
        if (firstYeast.atten) attenuationPercent = parseFloat(firstYeast.atten) || 78;
        if (yeastName.includes('-')) yeastLab = yeastName.split('-')[0].trim();
      }
    } else {
      const yeastMatch = html.match(/Дрожжи:<\/i><\/span>.*?<a[^>]*>([^<]+)<\/a>/s);
      if (yeastMatch && yeastMatch[1]) {
        yeastName = yeastMatch[1].trim();
        if (yeastName.includes('-')) {
          yeastLab = yeastName.split('-')[0].trim();
        }
      }
    }

    const yeast: Yeast = {
      name: yeastName,
      lab: yeastLab,
      form: 'dry',
      type: yeastName.toLowerCase().includes('лагер') || yeastName.toLowerCase().includes('lager') ? 'lager' : 'ale',
      cellsPerGramOrVial: 20,
      attenuationPercent,
      tempRange: [18, 22]
    };

    // 10. Дополнительные ингредиенты (Сахара и Прочее)
    const otherIngredients: OtherIngredientItem[] = [];

    // А) Сахаросодержащие из brief.ferm.ex
    if (briefData?.ferm?.ex && typeof briefData.ferm.ex === 'object') {
      const exList = Object.values(briefData.ferm.ex);
      exList.forEach((ex: any, idx) => {
        const itemName = String(ex.name || '').trim();
        const weightKg = parseFloat(ex.weight) || 0;
        if (itemName && weightKg > 0) {
          otherIngredients.push({
            id: `bir_sugar_b_${idx}_${Date.now()}`,
            name: itemName,
            amount: weightKg,
            unit: 'kg',
            stage: 'boil',
            timeMinOrDays: parseInt(ex.boil, 10) || 15,
            type: 'sugar',
            extractPercent: parseFloat(ex.extr) || 90,
            fermentablePercent: 100,
            colorEbc: parseFloat(ex.ebc) || 2
          });
        }
      });
    }

    // Б) Дополнительные из brief.ferm.ov
    if (briefData?.ferm?.ov && typeof briefData.ferm.ov === 'object') {
      const ovList = Object.values(briefData.ferm.ov);
      ovList.forEach((ov: any, idx) => {
        const itemName = String(ov.name || '').trim();
        const weight = parseFloat(ov.weight) || 0;
        const rawUnit = String(ov.unit || '').toLowerCase();
        const unit = rawUnit.startsWith('кг') || rawUnit === 'kg' ? 'kg' : 'g';
        if (itemName && weight > 0) {
          let type: OtherIngredientItem['type'] = 'other';
          const nLower = itemName.toLowerCase();
          if (nLower.includes('мох')) type = 'fining';
          else if (nLower.includes('дуб') || nLower.includes('бочк')) type = 'wood';
          else if (nLower.includes('цедр') || nLower.includes('кориандр')) type = 'spice';

          otherIngredients.push({
            id: `bir_ov_b_${idx}_${Date.now()}`,
            name: itemName,
            amount: weight,
            unit,
            stage: ov.boil ? 'boil' : 'secondary',
            timeMinOrDays: parseInt(ov.boil, 10) || 10,
            type
          });
        }
      });
    }

    // В) Из HTML (если в brief не было)
    if (otherIngredients.length === 0) {
      const otherBlockMatch = bodyContent.match(/Другие ингредиенты:<\/i><\/span>.*?<br \/>(.*?)(?:<span style=["']color:green["']|<b>Параметры|<center|$)/s);
      if (otherBlockMatch && otherBlockMatch[1]) {
        const itemLines = otherBlockMatch[1].split('<li>');
        itemLines.forEach((line, idx) => {
          const weightMatch = line.match(/<b>([0-9.]+)\s*(гр|г|кг|мл|шт)[^<]*<\/b>/i);
          const nameMatch = line.match(/<a[^>]*>([^<]+)<\/a>/);
          if (weightMatch && nameMatch) {
            const amount = parseFloat(weightMatch[1]);
            const rawUnit = weightMatch[2].toLowerCase();
            const unit = rawUnit.startsWith('кг') ? 'kg' : rawUnit.startsWith('мл') ? 'ml' : rawUnit.startsWith('шт') ? 'pcs' : 'g';
            const itemName = nameMatch[1].trim();

            let stage: OtherIngredientItem['stage'] = 'boil';
            let timeMinOrDays = 10;
            const lower = line.toLowerCase();
            if (lower.includes('котел') || lower.includes('кипят') || lower.includes('варк')) {
              stage = 'boil';
              const tm = line.match(/кипятить\s*([0-9]+)\s*мин/i);
              if (tm) timeMinOrDays = parseInt(tm[1], 10);
            } else if (lower.includes('брожен') || lower.includes('вторич') || lower.includes('тару')) {
              stage = 'secondary';
              timeMinOrDays = 7;
            }

            let itemType: OtherIngredientItem['type'] = 'other';
            const nameLower = itemName.toLowerCase();
            if (nameLower.includes('мох') || nameLower.includes('вирофлок') || nameLower.includes('агар')) itemType = 'fining';
            else if (nameLower.includes('щеп') || nameLower.includes('дуб') || nameLower.includes('палочк')) itemType = 'wood';
            else if (nameLower.includes('цедр') || nameLower.includes('кориандр')) itemType = 'spice';

            otherIngredients.push({
              id: `bir_other_${idx}_${Date.now()}`,
              name: itemName,
              amount,
              unit,
              stage,
              timeMinOrDays,
              type: itemType,
              notes: line.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
            });
          }
        });
      }
    }

    // 11. Расчет характеристик
    const calculated = calculateBrewMetrics({
      batchSizeL,
      boilTimeMin,
      efficiencyPercent,
      grainRatioLPerKg: 3.5,
      grainTempC: 20,
      targetCarbonationVol: 2.4,
      beerTempAtBottlingC: 20,
      grains,
      hops,
      yeast,
      otherIngredients
    });

    return {
      id: `recipe_bir_rf_${Date.now()}`,
      name,
      style,
      category,
      description,
      author,
      batchSizeL,
      boilTimeMin,
      efficiencyPercent,
      grainRatioLPerKg: 3.5,
      grainTempC: 20,
      targetCarbonationVol: 2.4,
      beerTempAtBottlingC: 20,
      grains,
      hops,
      mashSchedule,
      yeast,
      otherIngredients,
      calculated,
      tags: ['Бир.РФ', style, category].filter(Boolean),
      isCustom: true,
      collection: 'my_recipes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('Failed to parse Бир.РФ recipe:', err);
    return null;
  }
}
