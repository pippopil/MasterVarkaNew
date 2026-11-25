import React, { useMemo } from 'react';
import { Recipe } from '../types/brewing';
import { ebcToHex, calculateBrewMetrics } from '../utils/brewingMath';

interface Props {
  recipe: Recipe | null | undefined;
}

export const PrintableBrewSheet: React.FC<Props> = ({ recipe }) => {
  if (!recipe) return null;

  const calc = useMemo(() => {
    if (recipe.calculated && typeof recipe.calculated.ogSg === 'number' && !isNaN(recipe.calculated.ogSg)) {
      return recipe.calculated;
    }
    try {
      return calculateBrewMetrics({
        batchSizeL: recipe.batchSizeL || 30,
        boilTimeMin: recipe.boilTimeMin || 60,
        efficiencyPercent: recipe.efficiencyPercent || 72,
        grainRatioLPerKg: recipe.grainRatioLPerKg || 3.5,
        grainTempC: recipe.grainTempC || 20,
        targetCarbonationVol: recipe.targetCarbonationVol || 2.4,
        beerTempAtBottlingC: recipe.beerTempAtBottlingC || 20,
        grains: recipe.grains || [],
        hops: recipe.hops || [],
        yeast: recipe.yeast || { name: 'US-05', type: 'ale', form: 'dry', lab: 'Fermentis', attenuationPercent: 78, tempRange: [18, 22] },
        otherIngredients: recipe.otherIngredients || []
      });
    } catch {
      return null;
    }
  }, [recipe]);

  const ogSg = Number(calc?.ogSg ?? 1.050);
  const ogPlato = Number(calc?.ogPlato ?? 12.4);
  const fgSg = Number(calc?.fgSg ?? 1.010);
  const fgPlato = Number(calc?.fgPlato ?? 2.6);
  const abv = Number(calc?.abv ?? 5.2);
  const ibu = Math.round(Number(calc?.ibu ?? 35));
  const buGuRatio = Number(calc?.buGuRatio ?? 0.7);
  const ebc = Math.round(Number(calc?.ebc ?? 12));
  const srm = Number(calc?.srm ?? 6);
  const dryYeastGramsNeeded = Number(calc?.dryYeastGramsNeeded ?? 11.5);
  const yeastPacksNeeded = Number(calc?.yeastPacksNeeded ?? 1);
  const strikeWaterL = Number(calc?.strikeWaterL ?? 18);
  const spargeWaterL = Number(calc?.spargeWaterL ?? 16);
  const totalWaterL = Number(calc?.totalWaterL ?? 34);
  const strikeTempC = Number(calc?.strikeTempC ?? 72);
  const totalGrainWeightKg = Number(calc?.totalGrainWeightKg ?? 5);
  const dextroseGrams = Math.round(Number(calc?.dextroseGrams ?? 140));
  const sucroseGrams = Math.round(Number(calc?.sucroseGrams ?? 130));
  const speiseMl = Math.round(Number(calc?.speiseMl ?? 1200));

  const safeGrains = recipe.grains || [];
  const safeHops = recipe.hops || [];
  const safeMash = recipe.mashSchedule || [];
  const safeYeast = recipe.yeast || { name: 'US-05', type: 'ale', form: 'dry', lab: 'Fermentis', attenuationPercent: 78, tempRange: [18, 22] };

  return (
    <div id="printable-brew-sheet" className="print-only font-serif p-8 max-w-4xl mx-auto bg-white text-stone-900 leading-tight">
      <div className="border-b-2 border-stone-800 pb-4 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">{recipe.name}</h1>
          <p className="text-lg font-medium text-stone-700 italic mt-1">
            Стиль: {recipe.style} • Категория: {recipe.category}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            Автор: {recipe.author || 'МастерВарка'} • Дата генерации: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>
        <div className="text-right border-l-2 border-stone-200 pl-4">
          <div className="text-2xl font-bold text-amber-700">{recipe.batchSizeL} Л</div>
          <div className="text-xs text-stone-500 uppercase tracking-wider font-sans">Объем партии</div>
          <div className="text-xs text-stone-600 mt-1 font-mono">Эффективность: {recipe.efficiencyPercent || 72}%</div>
        </div>
      </div>

      {/* Ключевые показатели */}
      <div className="grid grid-cols-6 gap-2 border border-stone-300 rounded p-3 mb-6 bg-stone-50 text-center font-sans">
        <div>
          <div className="text-xs text-stone-500 uppercase">НП (OG)</div>
          <div className="text-lg font-bold font-mono">{ogSg.toFixed(3)}</div>
          <div className="text-[10px] text-stone-600">{ogPlato}°P</div>
        </div>
        <div>
          <div className="text-xs text-stone-500 uppercase">КП (FG)</div>
          <div className="text-lg font-bold font-mono">{fgSg.toFixed(3)}</div>
          <div className="text-[10px] text-stone-600">{fgPlato}°P</div>
        </div>
        <div>
          <div className="text-xs text-stone-500 uppercase">Крепость</div>
          <div className="text-lg font-bold text-amber-800">{abv}%</div>
          <div className="text-[10px] text-stone-600">ABV</div>
        </div>
        <div>
          <div className="text-xs text-stone-500 uppercase">Горечь</div>
          <div className="text-lg font-bold">{ibu}</div>
          <div className="text-[10px] text-stone-600">IBU (BU:GU {buGuRatio})</div>
        </div>
        <div>
          <div className="text-xs text-stone-500 uppercase">Цвет</div>
          <div className="text-lg font-bold flex items-center justify-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full border border-stone-400"
              style={{ backgroundColor: ebcToHex(ebc) }}
            />
            {ebc}
          </div>
          <div className="text-[10px] text-stone-600">EBC ({srm} SRM)</div>
        </div>
        <div>
          <div className="text-xs text-stone-500 uppercase">Дрожжи</div>
          <div className="text-lg font-bold">{dryYeastGramsNeeded}г</div>
          <div className="text-[10px] text-stone-600">~{yeastPacksNeeded} пач.</div>
        </div>
      </div>

      {/* Засыпь и вода */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider border-b border-stone-300 pb-1 mb-2 font-sans flex justify-between">
            <span>Засыпь солода</span>
            <span className="text-xs font-normal lowercase">всего: {totalGrainWeightKg} кг</span>
          </h2>
          <table className="w-full text-xs font-sans">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 text-left">
                <th className="py-1">Солод</th>
                <th className="py-1 text-right">Вес</th>
                <th className="py-1 text-right">Доля</th>
                <th className="py-1 text-right">EBC</th>
              </tr>
            </thead>
            <tbody>
              {safeGrains.map((grain) => {
                const pct = ((grain.weightKg / Math.max(0.1, totalGrainWeightKg)) * 100).toFixed(1);
                return (
                  <tr key={grain.id} className="border-b border-stone-100">
                    <td className="py-1 font-medium">{grain.name}</td>
                    <td className="py-1 text-right font-mono">{grain.weightKg} кг</td>
                    <td className="py-1 text-right text-stone-600">{pct}%</td>
                    <td className="py-1 text-right text-stone-600">{grain.colorEbc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-base font-bold uppercase tracking-wider border-b border-stone-300 pb-1 mb-2 font-sans">
            Водоподготовка и Затирание
          </h2>
          <div className="space-y-1 text-xs font-sans">
            <div className="flex justify-between py-0.5 border-b border-stone-100">
              <span className="text-stone-600">Вода на затирание (Strike Water):</span>
              <span className="font-bold font-mono">{strikeWaterL} л</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-stone-100">
              <span className="text-stone-600">Температура засыпи зерна (Strike Temp):</span>
              <span className="font-bold font-mono text-red-700">{strikeTempC}°C</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-stone-100">
              <span className="text-stone-600">Промывочная вода (Sparge Water, до 78°C):</span>
              <span className="font-bold font-mono">{spargeWaterL} л</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-stone-100">
              <span className="text-stone-600">Общий объем воды:</span>
              <span className="font-bold font-mono">{totalWaterL} л</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-stone-100">
              <span className="text-stone-600">Гидромодуль:</span>
              <span className="font-mono">{recipe.grainRatioLPerKg || 3.5} л/кг</span>
            </div>
          </div>
        </div>
      </div>

      {/* Паузы затирания */}
      <div className="mb-6">
        <h2 className="text-base font-bold uppercase tracking-wider border-b border-stone-300 pb-1 mb-2 font-sans">
          Температурные паузы затирания
        </h2>
        <div className="grid grid-cols-4 gap-2 text-xs font-sans">
          {safeMash.map((rest, idx) => (
            <div key={rest.id || idx} className="border border-stone-200 rounded p-2 bg-stone-50">
              <div className="font-bold">{rest.name}</div>
              <div className="text-stone-700 text-sm font-mono mt-0.5">
                {rest.tempC}°C • {rest.timeMin} мин
              </div>
              {rest.description && <div className="text-[10px] text-stone-500 mt-0.5">{rest.description}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Охмеление */}
      <div className="mb-6">
        <h2 className="text-base font-bold uppercase tracking-wider border-b border-stone-300 pb-1 mb-2 font-sans flex justify-between">
          <span>График внесения хмеля</span>
          <span className="text-xs font-normal lowercase">время кипячения: {recipe.boilTimeMin || 60} мин</span>
        </h2>
        <table className="w-full text-xs font-sans">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500 text-left">
              <th className="py-1">Хмель</th>
              <th className="py-1">Вес</th>
              <th className="py-1">Альфа %</th>
              <th className="py-1">Время / Этап</th>
              <th className="py-1">Тип</th>
              <th className="py-1">Отметка</th>
            </tr>
          </thead>
          <tbody>
            {safeHops.map((hop) => (
              <tr key={hop.id} className="border-b border-stone-100">
                <td className="py-1 font-bold">{hop.name}</td>
                <td className="py-1 font-mono">{hop.weightG} г</td>
                <td className="py-1 text-stone-600">{hop.alphaAcid}%</td>
                <td className="py-1 font-mono">
                  {hop.use === 'dry_hop' ? 'Сухое охмеление (Dry Hop)' : hop.use === 'whirlpool' ? 'Вирпул (0 мин)' : `${hop.boilTimeMin} мин до конца`}
                </td>
                <td className="py-1 text-stone-600">{hop.use}</td>
                <td className="py-1 font-mono text-stone-400">[  ]</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Дополнительные ингредиенты (если есть) */}
      {recipe.otherIngredients && recipe.otherIngredients.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold uppercase tracking-wider border-b border-stone-300 pb-1 mb-2 font-sans flex justify-between">
            <span>Дополнительные ингредиенты и добавки</span>
            <span className="text-xs font-normal lowercase">мёд, сахара, специи, фрукты, осветлители</span>
          </h2>
          <table className="w-full text-xs font-sans">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 text-left">
                <th className="py-1">Наименование</th>
                <th className="py-1">Количество</th>
                <th className="py-1">Этап внесения</th>
                <th className="py-1">Время</th>
                <th className="py-1">Примечание</th>
                <th className="py-1">Отметка</th>
              </tr>
            </thead>
            <tbody>
              {recipe.otherIngredients.map((item) => (
                <tr key={item.id} className="border-b border-stone-100">
                  <td className="py-1 font-bold">{item.name}</td>
                  <td className="py-1 font-mono">{item.amount} {item.unit}</td>
                  <td className="py-1 font-mono">
                    {item.stage === 'boil' ? 'Кипячение' : item.stage === 'mash' ? 'Затирание' : item.stage === 'primary' ? 'Главное брожение' : item.stage === 'secondary' ? 'Вторичное / Выдержка' : 'Розлив'}
                  </td>
                  <td className="py-1 font-mono">
                    {item.timeMinOrDays !== undefined ? (item.stage === 'boil' ? `${item.timeMinOrDays} мин` : `${item.timeMinOrDays} дн.`) : '—'}
                  </td>
                  <td className="py-1 text-stone-600 italic text-[11px]">{item.notes || '—'}</td>
                  <td className="py-1 font-mono text-stone-400">[  ]</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Дрожжи и Карбонизация */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border border-stone-200 rounded p-3 text-xs font-sans">
          <h3 className="font-bold text-stone-800 uppercase mb-1">Брожение и Дрожжи</h3>
          <p><span className="text-stone-500">Штамм:</span> <b>{safeYeast.name}</b> ({safeYeast.lab || ''})</p>
          <p><span className="text-stone-500">Тип:</span> {safeYeast.form === 'dry' ? 'Сухие' : 'Жидкие'} ({safeYeast.type})</p>
          <p><span className="text-stone-500">Аттенюация:</span> {safeYeast.attenuationPercent}%</p>
          <p><span className="text-stone-500">Температура брожения:</span> {safeYeast.tempRange?.[0] ?? 18} - {safeYeast.tempRange?.[1] ?? 22}°C</p>
          <p><span className="text-stone-500">Расчетная норма:</span> {dryYeastGramsNeeded} г (~{yeastPacksNeeded} шт)</p>
        </div>

        <div className="border border-stone-200 rounded p-3 text-xs font-sans">
          <h3 className="font-bold text-stone-800 uppercase mb-1">Розлив и Карбонизация</h3>
          <p><span className="text-stone-500">Желаемый уровень:</span> <b>{recipe.targetCarbonationVol || 2.4} vol CO2</b></p>
          <p><span className="text-stone-500">Декстроза (глюкоза):</span> <b>{dextroseGrams} г</b> ({(dextroseGrams / Math.max(1, recipe.batchSizeL)).toFixed(1)} г/л)</p>
          <p><span className="text-stone-500">Или столовый сахар:</span> {sucroseGrams} г</p>
          <p><span className="text-stone-500">Или сусло (Speise):</span> {speiseMl} мл</p>
          <p className="text-[10px] text-stone-500 mt-1 italic">Карбонизация в бутылках: 14-21 день при 20-22°C в темноте, затем созревание в холоде.</p>
        </div>
      </div>

      {/* Поля для ручных замеров пивовара в день варки */}
      <div className="border-2 border-stone-300 rounded p-3 text-xs font-sans mb-4">
        <div className="font-bold uppercase text-stone-700 mb-2">Журнал замеров в день варки (Заполняется пивоваром)</div>
        <div className="grid grid-cols-4 gap-4">
          <div className="border-b border-stone-400 pb-1">
            <span className="text-stone-500">Фактическая плотность до кипа:</span> ______ °P / SG
          </div>
          <div className="border-b border-stone-400 pb-1">
            <span className="text-stone-500">Фактическая НП (OG):</span> ______ °P / SG
          </div>
          <div className="border-b border-stone-400 pb-1">
            <span className="text-stone-500">Фактическая КП (FG):</span> ______ °P / SG
          </div>
          <div className="border-b border-stone-400 pb-1">
            <span className="text-stone-500">рН затора:</span> ______
          </div>
        </div>
        <div className="mt-3 border-b border-stone-400 pb-1">
          <span className="text-stone-500">Заметки и наблюдения пивовара:</span> ____________________________________________________________________
        </div>
      </div>

      <div className="text-center text-[10px] text-stone-400 font-sans">
        МастерВарка • Лаборатория крафтового пивоварения • {new Date().getFullYear()}
      </div>
    </div>
  );
};
