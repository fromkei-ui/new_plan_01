
export enum EACMethod {
  TREND = 'TREND',      // EAC1 = BAC / CPI
  PLANNED = 'PLANNED',  // EAC2 = AC + (BAC - EV)
  COMPOSITE = 'COMPOSITE' // EAC3 = AC + (BAC - EV) / (CPI * SPI)
}

export interface EVMData {
  projectName: string;
  baseDate: string;
  bac: number; // 억원
  totalDuration: number; // 일
  elapsedDays: number; // 일
  pv: number; // 억원
  ev: number; // 억원
  ac: number; // 억원
  eacMethod: EACMethod;
}

export interface EVMMetrics {
  sv: number;
  spi: number;
  cv: number;
  cpi: number;
  eac: number;
  etc: number;
  vac: number;
  tcpi: number;
}
