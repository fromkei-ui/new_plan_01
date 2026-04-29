import { EVMData, EACMethod } from './types';

export const EXAMPLE_DATA: EVMData = {
  projectName: '신축 아파트 건설 공사 (Phase 1)',
  baseDate: new Date().toISOString().split('T')[0],
  bac: 100,
  totalDuration: 300,
  elapsedDays: 120,
  pv: 40,
  ev: 35,
  ac: 42,
  eacMethod: EACMethod.TREND
};

export const METRIC_DESCRIPTIONS = {
  SV: 'SV (Schedule Variance): 일정 차이. EV - PV. 양수(+)면 공정 단축, 음수(-)면 공정 지연.',
  SPI: 'SPI (Schedule Performance Index): 공정 성과 지수. EV / PV. 1.0 이상이면 양호.',
  CV: 'CV (Cost Variance): 원가 차이. EV - AC. 양수(+)면 예산 절감, 음수(-)면 예산 초과.',
  CPI: 'CPI (Cost Performance Index): 원가 성과 지수. EV / AC. 1.0 이상이면 양호.',
  EAC: 'EAC (Estimate At Completion): 완료 시점 추정치. 현재까지의 성과를 바탕으로 예상되는 최종 원가.',
  ETC: 'ETC (Estimate To Complete): 잔여 공사 완료에 필요한 추정 비용.',
  VAC: 'VAC (Variance At Completion): 완료 시점의 원가 차이 예상액. BAC - EAC.',
  TCPI: 'TCPI (To-Complete Performance Index): 잔여 예산 내에서 목표를 달성하기 위해 필요한 효율성.'
};

export const DIAGNOSIS_LOGIC = (spi: number, cpi: number) => {
  if (spi >= 1 && cpi >= 1) {
    return {
      status: 'GOOD',
      label: '🟢 양호 - 예산 및 일정 모두 양호',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: '현재의 성과를 유지하며 관리 체계를 지속하십시오.'
    };
  } else if (spi >= 1 && cpi < 1) {
    return {
      status: 'WARNING_COST',
      label: '🟡 주의 - 일정 양호, 원가 초과 위험',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      action: '원가 초과 원인을 분석하십시오: 자재비 상승, 인력 생산성 저하, 설계 변경 등 여부를 검토하고 예산 절감 방안을 수립하십시오.'
    };
  } else if (spi < 1 && cpi >= 1) {
    return {
      status: 'WARNING_SCHEDULE',
      label: '🟡 주의 - 일정 지연, 원가 양호',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      action: '공정만회 대책 수립 필요: 인력 추가 투입, 작업 시간 연장, 공법 변경 또는 패스트 트래킹(Fast Tracking) 적용을 검토하십시오.'
    };
  } else {
    return {
      status: 'DANGER',
      label: '🔴 위험 - 일정 지연 및 원가 초과',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      action: '비상 관리 체제 전환 필요: 프로젝트 전반의 재계획(Re-baselining)을 고려하고, 중점 관리 항목(Critical Path)에 자원을 집중하십시오.'
    };
  }
};
