/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BreweryModelId =
  | 'uniholic'
  | 'bavaria'
  | 'easybrew'
  | 'brewzilla_rapt'
  | 'grainfather'
  | 'guten_ardbir'
  | 'craftbeerpi'
  | 'custom_esp';

export type BreweryConnectionMode = 'ap' | 'sta' | 'simulator';

export interface BreweryModelSpec {
  id: BreweryModelId;
  name: string;
  shortName: string;
  manufacturer: string;
  country: string;
  marketShareRu: string;
  description: string;
  defaultIp: string;
  defaultPort: number;
  defaultSsid: string;
  defaultPassword?: string;
  defaultHeaterWatt: number;
  defaultBoilPowerPercent: number;
  protocols: ('http_rest' | 'websocket' | 'rapt_cloud' | 'cbpi_api')[];
  endpoints: {
    status: string;
    control?: string;
    recipe?: string;
  };
  phoneConnectionGuide: {
    apSsid: string;
    apPassword?: string;
    defaultIp: string;
    androidTips: string[];
    iosTips: string[];
    steps: {
      stepNumber: number;
      title: string;
      desc: string;
      important?: boolean;
    }[];
  };
}

export interface UserBrewery {
  id: string;
  name: string;
  modelId: BreweryModelId;
  connectionMode: BreweryConnectionMode;
  ip: string;
  port: number;
  ssid?: string;
  password?: string;
  heaterPowerWatt: number;
  boilPowerPercent: number;
  pumpWorkMinutes: number;
  pumpRestMinutes: number;
  tempSensorOffsetC: number;
  isDefault?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
