/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UniholicConnectionStatus =
  | 'connected'
  | 'connecting'
  | 'failed'
  | 'disconnected';

export interface UniholicProbeResult {
  success: boolean;
  pingMs?: number;
  statusCode?: number;
  error?: string;
  failureReason?: 'unreachable' | 'timeout' | 'mixed_content' | 'refused' | 'network_offline';
  timestamp: string;
}

export interface UniholicTroubleshootStep {
  id: string;
  stepNumber: number;
  title: string;
  shortDesc: string;
  details: string[];
  actionType?: 'retry' | 'reset_ip' | 'switch_simulator' | 'open_direct';
  actionLabel?: string;
  badge?: string;
}

export interface UniholicDeviceInfo {
  model: string;          // e.g. "Uniholic"
  version: string;        // e.g. "3.0"
  firmware: string;       // e.g. "3.1.32"
  ipAp: string;           // "192.168.4.1"
  ipSta: string;          // e.g. "192.168.1.105" or "0.0.0.0"
  macAp: string;          // e.g. "F6:CF:A2:F6:02:74"
  macSta: string;         // e.g. "F4:CF:A2:F6:02:74"
  uptime: string;         // e.g. "00:02:30"
  activeIp: string;       // Текущий адрес подключения
  connectionMode: 'real' | 'simulator';
  isConnected: boolean;
  connectionStatus: UniholicConnectionStatus;
  lastPingMs?: number;
  lastCheckedAt?: string;
  lastErrorMessage?: string;
  failureReason?: 'unreachable' | 'timeout' | 'mixed_content' | 'refused' | 'network_offline';
}

export interface UniholicBrewSettings {
  heaterPowerWatt: number;       // Мощность ТЭНа (по умолч. 3000 Вт)
  boilPowerPercent: number;      // Мощность кипячения (по умолч. 85%)
  pumpRestMinutes: number;       // Пауза насоса в минутах (0 - непрерывно)
  pumpWorkMinutes: number;       // Время непрерывной работы насоса (15 мин)
  tempSensorOffsetC: number;     // Калибровка датчика DS18B20 (-2.0 .. +2.0 °C)
  pidKp: number;                 // ПИД Kp (по умолч. 25.0)
  pidKi: number;                 // ПИД Ki (по умолч. 1.2)
  pidKd: number;                 // ПИД Kd (по умолч. 5.0)
  soundAlerts: boolean;          // Звуковые оповещения о событиях
  autoAdvancePauses: boolean;    // Автоматический переход к следующей паузе
}

export interface UniholicPauseItem {
  id: string;
  name: string;                  // Название (Засыпь, Белковая, Мальтозная, Мэшаут, Кипячение)
  targetTempC: number;           // Целевая температура (°C)
  durationMin: number;           // Длительность паузы (мин)
  pumpEnabled: boolean;          // Работа насоса на этапе
  isCompleted: boolean;
  type: 'strike' | 'mash' | 'mashout' | 'boil' | 'whirlpool' | 'cooling';
}

export interface UniholicHopTimer {
  id: string;
  name: string;
  weightG: number;
  alphaAcid: number;
  timeRemainingMin: number;      // За сколько минут до конца кипа внести
  isAdded: boolean;
}

export type UniholicBrewStatus =
  | 'idle'              // Ожидание старта
  | 'heating_strike'    // Нагрев воды до засыпи солода
  | 'wait_malt_add'     // Звуковой сигнал: Засыпьте солод и нажмите старт
  | 'mashing'           // Прохождение пауз затирания
  | 'mash_out'          // Мэшаут (78°C)
  | 'wait_sparge'       // Фильтрация и промывка дробины
  | 'heating_boil'      // Нагрев сусла до кипения
  | 'boiling'           // Кипячение сусла с охмелением
  | 'whirlpool'         // Вирпул и осаждение бруха
  | 'cooling'           // Охлаждение чиллером
  | 'finished'          // Варка успешно завершена
  | 'paused';           // Процесс на паузе

export interface UniholicLiveTelemetry {
  currentTempC: number;
  targetTempC: number;
  heaterActive: boolean;         // ТЭН 1 (верхняя кнопка)
  heaterPwmPercent: number;      // Выходная мощность ТЭНа (0 - 100%)
  pumpActive: boolean;           // Насос циркуляции (нижняя кнопка)
  status: UniholicBrewStatus;
  currentPauseIndex: number;
  currentPauseName: string;
  pauseRemainingSeconds: number;
  totalElapsedSeconds: number;
  loadedRecipeId?: string;
  loadedRecipeName?: string;
  activeAlert?: string | null;   // Текст текущего звукового оповещения (например "Внесите хмель Magnum (25г)!")
}
