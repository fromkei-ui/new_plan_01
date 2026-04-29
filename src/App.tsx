import React, { useState, useMemo, useCallback } from 'react';
import { 
  BarChart, Bar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Calculator, 
  TrendingUp, 
  FileText, 
  RefreshCw, 
  Database, 
  Printer, 
  AlertCircle,
  LayoutDashboard,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { Card, MetricBox } from './components/UI';
import { EVMData, EVMMetrics, EACMethod } from './types';
import { EXAMPLE_DATA, METRIC_DESCRIPTIONS, DIAGNOSIS_LOGIC } from './constants';

export default function App() {
  const [data, setData] = useState<EVMData>(EXAMPLE_DATA);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleEACMethodChange = (method: EACMethod) => {
    setData(prev => ({ ...prev, eacMethod: method }));
  };

  const loadExample = () => setData(EXAMPLE_DATA);
  const resetData = () => setData({
    projectName: '',
    baseDate: new Date().toISOString().split('T')[0],
    bac: 0,
    totalDuration: 0,
    elapsedDays: 0,
    pv: 0,
    ev: 0,
    ac: 0,
    eacMethod: EACMethod.TREND
  });

  const handlePrint = () => {
    window.print();
  };

  // Calculations
  const metrics = useMemo((): EVMMetrics => {
    const { pv, ev, ac, bac, eacMethod } = data;
    
    const sv = ev - pv;
    const spi = pv === 0 ? 1 : ev / pv;
    const cv = ev - ac;
    const cpi = ac === 0 ? 1 : ev / ac;
    
    let eac = 0;
    switch(eacMethod) {
      case EACMethod.TREND:
        eac = cpi === 0 ? bac : bac / cpi;
        break;
      case EACMethod.PLANNED:
        eac = ac + (bac - ev);
        break;
      case EACMethod.COMPOSITE:
        const divider = cpi * spi;
        eac = divider === 0 ? bac : ac + (bac - ev) / divider;
        break;
    }

    const etc = eac - ac;
    const vac = bac - eac;
    const tcpi = (bac - ac) === 0 ? 0 : (bac - ev) / (bac - ac);

    return { sv, spi, cv, cpi, eac, etc, vac, tcpi };
  }, [data]);

  const diagnosis = useMemo(() => DIAGNOSIS_LOGIC(metrics.spi, metrics.cpi), [metrics.spi, metrics.cpi]);

  // Chart Data Preparation
  // In a real app this would come from a timeseries, but here we generate a "Current View" trend
  const chartData = useMemo(() => {
    const steps = 10;
    const arr = [];
    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        // Simple linear interpolation for the chart visual
        arr.push({
            name: `${Math.round(progress * 100)}%`,
            PV: Number((data.pv * progress).toFixed(1)),
            EV: Number((data.ev * progress).toFixed(1)),
            AC: Number((data.ac * progress).toFixed(1)),
        });
    }
    return arr;
  }, [data.pv, data.ev, data.ac]);

  const gaugeDataSPI = [
    { name: 'Value', value: Math.min(1.5, Math.max(0.5, metrics.spi)) - 0.5 },
    { name: 'Remaining', value: 1.5 - Math.min(1.5, Math.max(0.5, metrics.spi)) }
  ];

  const gaugeDataCPI = [
    { name: 'Value', value: Math.min(1.5, Math.max(0.5, metrics.cpi)) - 0.5 },
    { name: 'Remaining', value: 1.5 - Math.min(1.5, Math.max(0.5, metrics.cpi)) }
  ];

  const getSpiColor = (v: number) => v >= 1.0 ? 'text-success-deep' : v >= 0.8 ? 'text-warning-deep' : 'text-danger-deep';
  const getCpiColor = (v: number) => v >= 1.0 ? 'text-success-deep' : v >= 0.8 ? 'text-warning-deep' : 'text-danger-deep';
  const getSpiBg = (v: number) => v >= 1.0 ? 'bg-green-50' : v >= 0.8 ? 'bg-orange-50' : 'bg-red-50';
  const getCpiBg = (v: number) => v >= 1.0 ? 'bg-green-50' : v >= 0.8 ? 'bg-orange-50' : 'bg-red-50';

  return (
    <div className="min-h-screen bg-dashboard-bg pb-12 font-sans text-slate-900 print:bg-white print:pb-0">
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[300px_1fr_1fr] grid-rows-[auto_auto_auto_auto] gap-3 h-full box-border">
        {/* Header */}
        <header className="lg:col-span-3 bg-navy text-white h-[60px] px-6 rounded-[12px] flex items-center justify-between shadow-md print:bg-white print:text-black print:shadow-none print:border-b print:mb-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-blue-300 print:text-blue-600" />
            <h1 className="text-[18px] font-bold tracking-tight">건설 프로젝트 EVM 성과분석 대시보드</h1>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button 
              onClick={resetData}
              className="px-3 py-1.5 bg-transparent border border-white/30 hover:bg-white/10 rounded-md text-[12px] font-semibold transition-all"
            >
              초기화
            </button>
            <button 
              onClick={loadExample}
              className="px-3 py-1.5 bg-white text-navy hover:bg-slate-100 rounded-md text-[12px] font-bold transition-all shadow-sm"
            >
              예시 데이터 로드
            </button>
            <button 
              onClick={handlePrint}
              className="px-3 py-1.5 bg-transparent border border-white/30 hover:bg-white/10 rounded-md text-[12px] font-semibold transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> 인쇄
            </button>
          </div>
        </header>
        
        {/* Sidebar - Inputs */}
        <aside className="lg:row-span-3 flex flex-col gap-3 print:hidden">
          <Card title="프로젝트 기본 정보">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">프로젝트명</label>
                <input 
                  type="text" 
                  name="projectName"
                  value={data.projectName}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-[12px] bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="프로젝트명을 입력하세요"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">기준일자</label>
                <input 
                  type="date" 
                  name="baseDate"
                  value={data.baseDate}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-[12px] bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 flex justify-between">
                  BAC (총 사업비) <span className="font-normal opacity-60">억원</span>
                </label>
                <input 
                  type="number" 
                  name="bac"
                  value={data.bac}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-[12px] bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500">총 공기 (일)</label>
                  <input 
                    type="number" 
                    name="totalDuration"
                    value={data.totalDuration}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-[12px] bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500">경과일수 (일)</label>
                  <input 
                    type="number" 
                    name="elapsedDays"
                    value={data.elapsedDays}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-[12px] bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card title="성과 데이터">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">PV (계획가치) - 억원</label>
                <input 
                  type="number" 
                  name="pv"
                  value={data.pv}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-[12px] bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">EV (획득가치) - 억원</label>
                <input 
                  type="number" 
                  name="ev"
                  value={data.ev}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-[12px] bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">AC (실제원가) - 억원</label>
                <input 
                  type="number" 
                  name="ac"
                  value={data.ac}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-[12px] bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </Card>
        </aside>

        {/* Performance Metrics */}
        <Card title="공정 및 원가 성과">
          <div className="grid grid-cols-2 gap-3 h-full">
            <MetricBox 
              label="SV (일정차이)" 
              value={metrics.sv.toFixed(1)} 
              unit="억" 
              colorClass={metrics.sv >= 0 ? 'text-success-deep' : 'text-danger-deep'}
              bgColor={metrics.sv >= 0 ? 'bg-green-50' : 'bg-red-50'}
              tooltip={METRIC_DESCRIPTIONS.SV}
            />
            <MetricBox 
              label="SPI (공정지수)" 
              value={metrics.spi.toFixed(2)} 
              colorClass={getSpiColor(metrics.spi).replace('text-', 'text-')}
              bgColor={getSpiBg(metrics.spi)}
              tooltip={METRIC_DESCRIPTIONS.SPI}
            />
            <MetricBox 
              label="CV (원가차이)" 
              value={metrics.cv.toFixed(1)} 
              unit="억" 
              colorClass={metrics.cv >= 0 ? 'text-success-deep' : 'text-danger-deep'}
              bgColor={metrics.cv >= 0 ? 'bg-green-50' : 'bg-red-50'}
              tooltip={METRIC_DESCRIPTIONS.CV}
            />
            <MetricBox 
              label="CPI (원가지수)" 
              value={metrics.cpi.toFixed(2)} 
              colorClass={getCpiColor(metrics.cpi)}
              bgColor={getCpiBg(metrics.cpi)}
              tooltip={METRIC_DESCRIPTIONS.CPI}
            />
          </div>
        </Card>

        {/* EAC Prediction */}
        <Card title="완료 시점 예측 (EAC)">
          <div className="flex flex-col h-full">
            <div className="flex gap-2 mb-3 overflow-x-auto print:hidden">
              {[
                { id: EACMethod.TREND, label: 'EAC₁' },
                { id: EACMethod.PLANNED, label: 'EAC₂' },
                { id: EACMethod.COMPOSITE, label: 'EAC₃' }
              ].map(method => (
                <label key={method.id} className="flex items-center gap-1.5 text-[11px] whitespace-nowrap cursor-pointer">
                  <input 
                    type="radio" 
                    checked={data.eacMethod === method.id} 
                    onChange={() => handleEACMethodChange(method.id)}
                    className="w-3 h-3 accent-navy"
                  />
                  <span className={data.eacMethod === method.id ? 'font-bold text-navy' : 'text-slate-500'}>{method.label}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 flex-1">
              <MetricBox 
                label="EAC (최종 추정)" 
                value={metrics.eac.toFixed(1)} 
                unit="억원" 
                colorClass="text-navy"
                bgColor="bg-slate-50"
                tooltip={METRIC_DESCRIPTIONS.EAC}
              />
              <div className="grid grid-rows-2 gap-2">
                <MetricBox 
                  label="ETC (잔여)" 
                  value={metrics.etc.toFixed(1)} 
                  unit="억" 
                  tooltip={METRIC_DESCRIPTIONS.ETC}
                />
                <MetricBox 
                  label="VAC (완료차)" 
                  value={metrics.vac.toFixed(1)} 
                  unit="억" 
                  colorClass={metrics.vac >= 0 ? 'text-success-deep' : 'text-danger-deep'}
                  tooltip={METRIC_DESCRIPTIONS.VAC}
                />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 text-center">
              TCPI (필요성과): <b className="text-slate-700">{metrics.tcpi.toFixed(2)}</b>
            </div>
          </div>
        </Card>

        {/* S-Curve Chart */}
        <Card title="성과 추세 분석 (S-Curve)">
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={9} stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis fontSize={9} stroke="#94a3b8" axisLine={false} tickLine={false} />
                <ReTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }} />
                <Line type="monotone" dataKey="PV" stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="PV" />
                <Line type="monotone" dataKey="EV" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} name="EV" />
                <Line type="monotone" dataKey="AC" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} name="AC" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gauge Charts - Simplified for Bento if needed, but let's keep them if they fit design space */}
        <Card title="성과 지수 게이지">
          <div className="grid grid-cols-2 gap-2 h-full items-center">
             <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={100}>
                  <PieChart>
                    <Pie
                      data={gaugeDataSPI}
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={35}
                      outerRadius={50}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      <Cell key="cell-0" fill={getSpiColor(metrics.spi) === 'text-success-deep' ? '#2e7d32' : getSpiColor(metrics.spi) === 'text-warning-deep' ? '#f9a825' : '#c62828'} />
                      <Cell key="cell-1" fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center -mt-2">
                  <span className="text-sm font-bold block">{metrics.spi.toFixed(2)}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">SPI</span>
                </div>
             </div>
             <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={100}>
                  <PieChart>
                    <Pie
                      data={gaugeDataCPI}
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={35}
                      outerRadius={50}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      <Cell key="cell-0" fill={getCpiColor(metrics.cpi) === 'text-success-deep' ? '#2e7d32' : getCpiColor(metrics.cpi) === 'text-warning-deep' ? '#f9a825' : '#c62828'} />
                      <Cell key="cell-1" fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center -mt-2">
                  <span className="text-sm font-bold block">{metrics.cpi.toFixed(2)}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">CPI</span>
                </div>
             </div>
          </div>
        </Card>

        {/* Diagnosis - Full Width at Bottom */}
        <section className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[12px] p-5 bg-white border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] h-full`}
          >
             <div className="text-[13px] font-bold text-navy mb-4 flex items-center gap-2 uppercase">
                종합 프로젝트 진단 및 대응방안
             </div>
             <div className="flex gap-6 items-start">
               <div className="text-center min-w-[80px] pt-1">
                  <div className="text-4xl mb-1">
                    {diagnosis.status === 'GOOD' ? '🟢' : diagnosis.status === 'DANGER' ? '🔴' : '🟡'}
                  </div>
                  <div className={`text-[13px] font-bold ${diagnosis.color.replace('text-', 'text-')}`}>
                    {diagnosis.status === 'GOOD' ? '양호' : diagnosis.status === 'DANGER' ? '위험' : '주의'}
                  </div>
               </div>
               <div className="flex-1">
                  <div className="text-[14px] font-bold text-slate-800 mb-2 leading-snug">
                    {diagnosis.label}
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    <b className="text-slate-800">현황 분석:</b> 현재 SPI({metrics.spi.toFixed(2)}) 및 CPI({metrics.cpi.toFixed(2)}) 기준 분석 결과, {diagnosis.label.split(' - ')[1]} 상태입니다.<br/>
                    <b className="text-slate-800 block mt-2">대응 방안:</b>
                    <span className="block mt-0.5">{diagnosis.action}</span>
                  </p>
               </div>
             </div>
          </motion.div>
        </section>

        {/* Print Only Breakdown */}
        <div className="hidden print:block lg:col-span-3 mt-8 border-t border-slate-200 pt-8">
           <h4 className="text-[14px] font-bold uppercase mb-4">프로젝트 성과 정보 요약</h4>
           <div className="grid grid-cols-2 gap-8 text-[12px]">
              <div>
                <p><b>프로젝트명:</b> {data.projectName}</p>
                <p><b>기준일자:</b> {data.baseDate}</p>
                <p><b>총 사업비:</b> {data.bac} 억원</p>
              </div>
              <div>
                <p><b>일정지수 (SPI):</b> {metrics.spi.toFixed(3)}</p>
                <p><b>원가지수 (CPI):</b> {metrics.cpi.toFixed(3)}</p>
                <p><b>최종추정 (EAC):</b> {metrics.eac.toFixed(2)} 억원</p>
              </div>
           </div>
        </div>
      </div>

      {/* Floating Action for Mobile */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur border-t border-slate-200 lg:hidden print:hidden z-40">
        <button 
          onClick={handlePrint}
          className="w-full py-3 bg-navy text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
        >
          <Printer className="w-5 h-5" /> 레포트 인쇄
        </button>
      </footer>
    </div>
  );
}
