import { useState, useMemo } from "react";

const formatKRW = (n) =>
  n >= 100000000 ? `${(n / 100000000).toFixed(1)}억`
  : n >= 10000 ? `${(n / 10000).toFixed(0)}만`
  : `${n.toLocaleString()}`;
const formatFull = (n) => `${Math.round(n).toLocaleString()}원`;
const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

const COLORS = ["#7ec8e3","#a78bfa","#f0a500","#34d399","#f87171","#fb923c","#60a5fa","#e879f9"];

const cardStyle = {
  background: "linear-gradient(135deg,#0d1b2a 0%,#0f2338 100%)",
  border: "1px solid #1e3a5f", borderRadius: 16, padding: "20px",
};
const inputStyle = {
  background: "#0d1b2a", border: "1px solid #1e3a5f", borderRadius: 8,
  color: "#e0f0ff", padding: "8px 12px", fontSize: 14, width: "100%", outline: "none",
};
const labelStyle = { fontSize: 12, color: "#6b9fca", marginBottom: 4, display: "block" };

// ── ISA 만기 플랜 타임라인 ──────────────────────────
function IsaTimeline({ isaOpenYear, isaCycle }) {
  const plans = [];
  let y = isaOpenYear;
  for (let i = 0; i < 3; i++) {
    plans.push({ open: y, min: y + 3, close: y + isaCycle, transfer: y + isaCycle });
    y = y + isaCycle;
  }
  const nowY = new Date().getFullYear();
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 460, position: "relative", paddingTop: 8 }}>
        {/* 타임라인 라인 */}
        <div style={{ position: "absolute", top: 28, left: 0, right: 0, height: 2, background: "#1e3a5f" }} />
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          {plans.map((p, idx) => (
            <div key={idx} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {[
                  { year: p.open, label: "개설", color: "#7ec8e3" },
                  { year: p.min, label: "최소유지", color: "#f0a500" },
                  { year: p.close, label: "해지·이전", color: "#34d399" },
                ].map((dot) => (
                  <div key={dot.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: "50%",
                      background: dot.year <= nowY ? dot.color : "#1e3a5f",
                      border: `2px solid ${dot.color}`,
                      marginBottom: 6, zIndex: 1,
                    }} />
                    <div style={{ fontSize: 10, color: dot.color, fontWeight: 700 }}>{dot.year}</div>
                    <div style={{ fontSize: 9, color: "#4a7fa8" }}>{dot.label}</div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 8, fontSize: 10, color: "#4a7fa8",
                background: "#081525", borderRadius: 6, padding: "4px 6px",
              }}>
                {idx + 1}차 ISA
                {p.close <= nowY ? " ✓완료" : p.open <= nowY ? " 🔄진행중" : " 예정"}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 12, fontSize: 11, color: "#34d399",
          background: "#06200f", borderRadius: 8, padding: "8px 12px",
          borderLeft: "3px solid #34d399",
        }}>
          💡 해지 후 연금 이전 시 이전금액의 10% 세액공제 추가 혜택 (최대 300만원)
        </div>
      </div>
    </div>
  );
}

// ── 도넛 차트 ──────────────────────────────────────
function DonutChart({ data, size = 140 }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  if (total === 0) return null;
  let cumAngle = -Math.PI / 2;
  const cx = size / 2, cy = size / 2, r = size * 0.38, ir = size * 0.22;
  const slices = data.map((d) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle), y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle), y2 = cy + r * Math.sin(cumAngle);
    const ix1 = cx + ir * Math.cos(cumAngle - angle), iy1 = cy + ir * Math.sin(cumAngle - angle);
    const ix2 = cx + ir * Math.cos(cumAngle), iy2 = cy + ir * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    return {
      ...d,
      path: `M${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} L${ix2},${iy2} A${ir},${ir},0,${large},0,${ix1},${iy1} Z`,
    };
  });
  return (
    <svg width={size} height={size}>
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} opacity={0.9} />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#cfe4f7" fontSize={11} fontWeight="bold">
        총 {data.length}종목
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#4a7fa8" fontSize={9}>
        {data.reduce((a, b) => a + b.shares, 0)}주
      </text>
    </svg>
  );
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const now = new Date();

  // ── 기본 설정 ──
  const [currentAge, setCurrentAge] = useState(35);
  const [retireAge, setRetireAge] = useState(60);
  const [targetAmount, setTargetAmount] = useState(500000000);
  const [isaMonthly, setIsaMonthly] = useState(300000);
  const [isaBalance, setIsaBalance] = useState(5000000);
  const [isaRate, setIsaRate] = useState(5);
  const [pensionMonthly, setPensionMonthly] = useState(300000);
  const [pensionBalance, setPensionBalance] = useState(3000000);
  const [pensionRate, setPensionRate] = useState(6);

  // ── ISA 만기 플랜 ──
  const [isaOpenYear, setIsaOpenYear] = useState(2023);
  const [isaCycle, setIsaCycle] = useState(5);

  // ── 보유 종목 ──
  const [holdings, setHoldings] = useState([
    { id: 1, account: "ISA", name: "TIGER 미국배당다우존스", shares: 5, avgPrice: 12000, currentPrice: 13200, dividendPerShare: 45, dividendMonth: "월" },
    { id: 2, account: "ISA", name: "TIGER 미국나스닥100", shares: 1, avgPrice: 85000, currentPrice: 92000, dividendPerShare: 0, dividendMonth: "-" },
    { id: 3, account: "연금", name: "TIGER 미국S&P500", shares: 3, avgPrice: 15000, currentPrice: 16500, dividendPerShare: 0, dividendMonth: "-" },
  ]);
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [newHolding, setNewHolding] = useState({
    account: "ISA", name: "", shares: 1, avgPrice: 0, currentPrice: 0, dividendPerShare: 0, dividendMonth: "월"
  });

  // ── 배당 기록 ──
  const [dividendLogs, setDividendLogs] = useState([
    { id: 1, month: `${now.getFullYear()}-4`, name: "TIGER 미국배당다우존스", amount: 225, reinvested: true },
    { id: 2, month: `${now.getFullYear()}-3`, name: "TIGER 미국배당다우존스", amount: 225, reinvested: true },
  ]);
  const [showAddDiv, setShowAddDiv] = useState(false);
  const [newDiv, setNewDiv] = useState({ name: "", amount: 0, month: `${now.getFullYear()}-${now.getMonth()}`, reinvested: true });

  // ── 납입 기록 ──
  const [records, setRecords] = useState(() => {
    const init = {};
    for (let m = 0; m < 12; m++) {
      init[`${now.getFullYear()}-${m}`] = { isa: false, pension: false };
    }
    return init;
  });
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
  const toggleRecord = (month, type) => {
    const key = `${selectedYear}-${month}`;
    setRecords((prev) => ({ ...prev, [key]: { ...prev[key], [type]: !prev[key]?.[type] } }));
  };

  // ── 계산 ──
  const calc = useMemo(() => {
    const months = (retireAge - currentAge) * 12;
    if (months <= 0) return null;
    const fv = (bal, monthly, rate) => {
      const r = rate / 100 / 12;
      return r === 0
        ? bal + monthly * months
        : bal * Math.pow(1 + r, months) + monthly * ((Math.pow(1 + r, months) - 1) / r);
    };
    const isaFV = fv(isaBalance, isaMonthly, isaRate);
    const pensionFV = fv(pensionBalance, pensionMonthly, pensionRate);
    const totalFV = isaFV + pensionFV;
    return {
      isaFV, pensionFV, totalFV,
      progress: Math.min((totalFV / targetAmount) * 100, 100),
      currentTotal: isaBalance + pensionBalance,
      currentProgress: Math.min(((isaBalance + pensionBalance) / targetAmount) * 100, 100),
    };
  }, [currentAge, retireAge, isaMonthly, isaBalance, isaRate, pensionMonthly, pensionBalance, pensionRate, targetAmount]);

  const yearsLeft = retireAge - currentAge;

  // ── 종목 계산 ──
  const holdingCalc = useMemo(() => {
    const isaH = holdings.filter(h => h.account === "ISA");
    const penH = holdings.filter(h => h.account === "연금");
    const totalIsaVal = isaH.reduce((a, h) => a + h.currentPrice * h.shares, 0);
    const totalPenVal = penH.reduce((a, h) => a + h.currentPrice * h.shares, 0);
    const totalIsaCost = isaH.reduce((a, h) => a + h.avgPrice * h.shares, 0);
    const totalPenCost = penH.reduce((a, h) => a + h.avgPrice * h.shares, 0);
    const annualDiv = holdings.reduce((a, h) => {
      const freq = h.dividendMonth === "월" ? 12 : h.dividendMonth === "분기" ? 4 : h.dividendMonth === "반기" ? 2 : h.dividendMonth === "연" ? 1 : 0;
      return a + h.dividendPerShare * h.shares * freq;
    }, 0);
    return { isaH, penH, totalIsaVal, totalPenVal, totalIsaCost, totalPenCost, annualDiv };
  }, [holdings]);

  const yearPaid = useMemo(() => {
    let isa = 0, pension = 0;
    for (let m = 0; m < 12; m++) {
      const key = `${selectedYear}-${m}`;
      if (records[key]?.isa) isa++;
      if (records[key]?.pension) pension++;
    }
    return { isa, pension };
  }, [records, selectedYear]);

  const totalDivReceived = dividendLogs.reduce((a, b) => a + b.amount, 0);
  const totalDivReinvested = dividendLogs.filter(d => d.reinvested).reduce((a, b) => a + b.amount, 0);

  // ── 원형 프로그레스 ──
  const CircleProgress = ({ value, size = 120, stroke = 10, color, children }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    return (
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e2a3a" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${(value / 100) * circ} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
        <foreignObject x={0} y={0} width={size} height={size} style={{ transform: "rotate(90deg)" }}>
          <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {children}
          </div>
        </foreignObject>
      </svg>
    );
  };

  const TABS = [
    { id: "dashboard", label: "📊 현황" },
    { id: "holdings", label: "📈 종목" },
    { id: "dividend", label: "💰 배당" },
    { id: "isaplan", label: "🔄 ISA플랜" },
    { id: "calendar", label: "📅 달력" },
    { id: "settings", label: "⚙️ 설정" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#060d17 0%,#0a1628 60%,#06111e 100%)",
      fontFamily: "'Pretendard','Noto Sans KR',sans-serif",
      color: "#cfe4f7", paddingBottom: 40,
    }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(90deg,#0a1f3a,#0d2848)", borderBottom: "1px solid #1e3a5f", padding: "20px 24px 0" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
            <span style={{ fontSize: 22 }}>🌙</span>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#7ec8e3", margin: 0 }}>미래 노후 설계</h1>
          </div>
          <p style={{ fontSize: 12, color: "#4a7fa8", margin: "0 0 12px" }}>ISA · 개인연금 통합 관리</p>
          <div style={{ display: "flex", gap: 2, overflowX: "auto", paddingBottom: 2 }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "7px 12px", borderRadius: "8px 8px 0 0", border: "none", whiteSpace: "nowrap",
                background: tab === t.id ? "#0d2848" : "transparent",
                color: tab === t.id ? "#7ec8e3" : "#4a7fa8",
                fontWeight: tab === t.id ? 700 : 400, fontSize: 12, cursor: "pointer",
                borderTop: tab === t.id ? "2px solid #7ec8e3" : "2px solid transparent",
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 14px 0" }}>

        {/* ══ DASHBOARD ══ */}
        {tab === "dashboard" && calc && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ ...cardStyle, textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "#4a7fa8", margin: "0 0 12px" }}>
                {currentAge}세 → {retireAge}세 · {yearsLeft}년 남음
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 28 }}>
                {[
                  { label: "은퇴 시 예상", value: formatKRW(calc.totalFV), pct: calc.progress, color: "#7ec8e3" },
                  { label: "현재 잔액", value: formatKRW(calc.currentTotal), pct: calc.currentProgress, color: "#f0a500" },
                ].map((c) => (
                  <div key={c.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <CircleProgress value={c.pct} size={128} stroke={11} color={c.color}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 19, fontWeight: 800, color: c.color }}>{c.pct.toFixed(1)}%</div>
                        <div style={{ fontSize: 9, color: "#4a7fa8" }}>{c.pct < 100 ? "달성률" : "완료!"}</div>
                      </div>
                    </CircleProgress>
                    <div style={{ fontSize: 11, color: "#6b9fca", marginTop: 6 }}>{c.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#e0f0ff" }}>{c.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: "10px 16px", background: "#081525", borderRadius: 10, fontSize: 13, color: "#6b9fca" }}>
                목표 <span style={{ color: "#f0a500", fontWeight: 700 }}>{formatKRW(targetAmount)}</span> 까지{" "}
                <span style={{ color: "#7ec8e3", fontWeight: 700 }}>{formatKRW(Math.max(0, targetAmount - calc.totalFV))}</span> 남았어요
              </div>
            </div>

            {[
              { label: "ISA 계좌", color: "#7ec8e3", fv: calc.isaFV, monthly: isaMonthly, balance: isaBalance, icon: "💎" },
              { label: "개인연금", color: "#a78bfa", fv: calc.pensionFV, monthly: pensionMonthly, balance: pensionBalance, icon: "🏦" },
            ].map((acc) => (
              <div key={acc.label} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: acc.color }}>{acc.icon} {acc.label}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { label: "현재 잔액", value: formatKRW(acc.balance) },
                    { label: "월 납입", value: formatKRW(acc.monthly) },
                    { label: "은퇴 예상", value: formatKRW(acc.fv) },
                  ].map((item) => (
                    <div key={item.label} style={{ background: "#081525", borderRadius: 10, padding: "9px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#4a7fa8", marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: acc.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ height: 5, background: "#1e3a5f", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min((acc.fv / targetAmount) * 100, 100)}%`, background: `linear-gradient(90deg,${acc.color}88,${acc.color})`, borderRadius: 3, transition: "width 0.8s" }} />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ ...cardStyle, display: "flex", justifyContent: "space-around", textAlign: "center" }}>
              {[
                { label: "월 총 납입", value: formatFull(isaMonthly + pensionMonthly), color: "#7ec8e3" },
                { label: "연간 배당(예상)", value: formatKRW(holdingCalc.annualDiv), color: "#f0a500" },
                { label: "보유 종목 수", value: `${holdings.length}종목`, color: "#a78bfa" },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: 10, color: "#4a7fa8", marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ HOLDINGS ══ */}
        {tab === "holdings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* 계좌별 요약 */}
            {[
              { label: "ISA 계좌", color: "#7ec8e3", items: holdingCalc.isaH, totalVal: holdingCalc.totalIsaVal, totalCost: holdingCalc.totalIsaCost },
              { label: "개인연금", color: "#a78bfa", items: holdingCalc.penH, totalVal: holdingCalc.totalPenVal, totalCost: holdingCalc.totalPenCost },
            ].map((acc) => {
              const pnl = acc.totalVal - acc.totalCost;
              const pnlPct = acc.totalCost > 0 ? (pnl / acc.totalCost) * 100 : 0;
              const donutData = acc.items.map((h, i) => ({
                label: h.name, value: h.currentPrice * h.shares, color: COLORS[i % COLORS.length], shares: h.shares
              }));
              return (
                <div key={acc.label} style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: acc.color }}>{acc.label}</span>
                    <span style={{ fontSize: 12, color: pnl >= 0 ? "#34d399" : "#f87171", fontWeight: 700 }}>
                      {pnl >= 0 ? "+" : ""}{formatKRW(pnl)} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%)
                    </span>
                  </div>

                  {acc.items.length > 0 ? (
                    <>
                      {/* 도넛 + 범례 */}
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                        <DonutChart data={donutData} size={130} />
                        <div style={{ flex: 1 }}>
                          {donutData.map((d, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                              <span style={{ fontSize: 11, color: "#cfe4f7", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
                              <span style={{ fontSize: 11, color: d.color, fontWeight: 700, flexShrink: 0 }}>{formatKRW(d.value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 종목 테이블 */}
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid #1e3a5f" }}>
                              {["종목명","주수","평균단가","현재가","평가금액","손익"].map(h => (
                                <th key={h} style={{ padding: "6px 4px", color: "#4a7fa8", fontWeight: 600, textAlign: h === "종목명" ? "left" : "right" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {acc.items.map((h, i) => {
                              const val = h.currentPrice * h.shares;
                              const cost = h.avgPrice * h.shares;
                              const gain = val - cost;
                              const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
                              return (
                                <tr key={h.id} style={{ borderBottom: "1px solid #0f2030" }}>
                                  <td style={{ padding: "8px 4px", color: COLORS[i % COLORS.length], fontWeight: 600, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</td>
                                  <td style={{ padding: "8px 4px", textAlign: "right", color: "#cfe4f7" }}>{h.shares}주</td>
                                  <td style={{ padding: "8px 4px", textAlign: "right", color: "#6b9fca" }}>{h.avgPrice.toLocaleString()}</td>
                                  <td style={{ padding: "8px 4px", textAlign: "right", color: "#cfe4f7" }}>{h.currentPrice.toLocaleString()}</td>
                                  <td style={{ padding: "8px 4px", textAlign: "right", color: "#cfe4f7", fontWeight: 700 }}>{formatKRW(val)}</td>
                                  <td style={{ padding: "8px 4px", textAlign: "right", color: gain >= 0 ? "#34d399" : "#f87171", fontWeight: 700 }}>
                                    {gain >= 0 ? "+" : ""}{gainPct.toFixed(1)}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <p style={{ fontSize: 12, color: "#4a7fa8", textAlign: "center", padding: "20px 0" }}>종목을 추가해주세요</p>
                  )}
                </div>
              );
            })}

            {/* 종목 추가 */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showAddHolding ? 14 : 0 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#7ec8e3" }}>➕ 종목 추가</span>
                <button onClick={() => setShowAddHolding(!showAddHolding)} style={{
                  padding: "5px 12px", borderRadius: 20, border: "1px solid #1e3a5f",
                  background: showAddHolding ? "#1e3a5f" : "transparent", color: "#7ec8e3", fontSize: 12, cursor: "pointer",
                }}>{showAddHolding ? "닫기" : "추가하기"}</button>
              </div>
              {showAddHolding && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={labelStyle}>계좌</label>
                      <select value={newHolding.account} onChange={e => setNewHolding({...newHolding, account: e.target.value})} style={{ ...inputStyle, appearance: "none" }}>
                        <option value="ISA">ISA</option>
                        <option value="연금">개인연금</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>종목명</label>
                      <input value={newHolding.name} onChange={e => setNewHolding({...newHolding, name: e.target.value})} style={inputStyle} placeholder="예: TIGER 나스닥100" />
                    </div>
                    <div>
                      <label style={labelStyle}>보유 주수</label>
                      <input type="number" min={1} value={newHolding.shares} onChange={e => setNewHolding({...newHolding, shares: Number(e.target.value)})} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>평균 매입가 (원)</label>
                      <input type="number" step={100} value={newHolding.avgPrice} onChange={e => setNewHolding({...newHolding, avgPrice: Number(e.target.value)})} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>현재가 (원)</label>
                      <input type="number" step={100} value={newHolding.currentPrice} onChange={e => setNewHolding({...newHolding, currentPrice: Number(e.target.value)})} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>주당 배당금 (원, 없으면 0)</label>
                      <input type="number" step={1} value={newHolding.dividendPerShare} onChange={e => setNewHolding({...newHolding, dividendPerShare: Number(e.target.value)})} style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={labelStyle}>배당 주기</label>
                      <select value={newHolding.dividendMonth} onChange={e => setNewHolding({...newHolding, dividendMonth: e.target.value})} style={{ ...inputStyle, appearance: "none" }}>
                        {["월","분기","반기","연","-"].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={() => {
                    if (!newHolding.name) return;
                    setHoldings([...holdings, { ...newHolding, id: Date.now() }]);
                    setNewHolding({ account: "ISA", name: "", shares: 1, avgPrice: 0, currentPrice: 0, dividendPerShare: 0, dividendMonth: "월" });
                    setShowAddHolding(false);
                  }} style={{
                    padding: "10px", borderRadius: 10, border: "none",
                    background: "linear-gradient(90deg,#1e5a8a,#7ec8e3)", color: "#06111e",
                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                  }}>종목 저장</button>
                </div>
              )}
            </div>

            {/* 종목 삭제 */}
            {holdings.length > 0 && (
              <div style={cardStyle}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#f87171", margin: "0 0 10px" }}>🗑 종목 삭제</p>
                {holdings.map((h) => (
                  <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #0f2030" }}>
                    <span style={{ fontSize: 12, color: "#cfe4f7" }}>[{h.account}] {h.name}</span>
                    <button onClick={() => setHoldings(holdings.filter(x => x.id !== h.id))} style={{
                      padding: "3px 10px", borderRadius: 12, border: "1px solid #f87171",
                      background: "transparent", color: "#f87171", fontSize: 11, cursor: "pointer",
                    }}>삭제</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ DIVIDEND ══ */}
        {tab === "dividend" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* 요약 카드 */}
            <div style={{ ...cardStyle, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, textAlign: "center" }}>
              {[
                { label: "연간 예상 배당", value: formatKRW(holdingCalc.annualDiv), color: "#f0a500" },
                { label: "누적 수령액", value: formatKRW(totalDivReceived), color: "#34d399" },
                { label: "재투자 완료", value: formatKRW(totalDivReinvested), color: "#7ec8e3" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#081525", borderRadius: 10, padding: "12px 6px" }}>
                  <div style={{ fontSize: 9, color: "#4a7fa8", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* 종목별 예상 배당 */}
            <div style={cardStyle}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#f0a500", margin: "0 0 12px" }}>📊 종목별 예상 배당</p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1e3a5f" }}>
                    {["종목명","주수","주기","주당배당","연간예상"].map(h => (
                      <th key={h} style={{ padding: "6px 4px", color: "#4a7fa8", fontWeight: 600, textAlign: h === "종목명" ? "left" : "right" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {holdings.filter(h => h.dividendPerShare > 0).length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", color: "#4a7fa8", padding: "20px 0", fontSize: 12 }}>배당 종목을 추가해주세요</td></tr>
                  ) : (
                    holdings.filter(h => h.dividendPerShare > 0).map((h, i) => {
                      const freq = h.dividendMonth === "월" ? 12 : h.dividendMonth === "분기" ? 4 : h.dividendMonth === "반기" ? 2 : 1;
                      const annual = h.dividendPerShare * h.shares * freq;
                      return (
                        <tr key={h.id} style={{ borderBottom: "1px solid #0f2030" }}>
                          <td style={{ padding: "8px 4px", color: COLORS[i % COLORS.length], fontWeight: 600, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</td>
                          <td style={{ padding: "8px 4px", textAlign: "right", color: "#cfe4f7" }}>{h.shares}주</td>
                          <td style={{ padding: "8px 4px", textAlign: "right", color: "#6b9fca" }}>{h.dividendMonth}</td>
                          <td style={{ padding: "8px 4px", textAlign: "right", color: "#cfe4f7" }}>{h.dividendPerShare.toLocaleString()}원</td>
                          <td style={{ padding: "8px 4px", textAlign: "right", color: "#f0a500", fontWeight: 700 }}>{formatKRW(annual)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 배당 수령 기록 */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#34d399", margin: 0 }}>💵 배당 수령 기록</p>
                <button onClick={() => setShowAddDiv(!showAddDiv)} style={{
                  padding: "5px 12px", borderRadius: 20, border: "1px solid #1e3a5f",
                  background: showAddDiv ? "#1e3a5f" : "transparent", color: "#34d399", fontSize: 12, cursor: "pointer",
                }}>{showAddDiv ? "닫기" : "기록 추가"}</button>
              </div>

              {showAddDiv && (
                <div style={{ background: "#081525", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={labelStyle}>종목명</label>
                      <input value={newDiv.name} onChange={e => setNewDiv({...newDiv, name: e.target.value})} style={inputStyle} placeholder="종목명 입력" />
                    </div>
                    <div>
                      <label style={labelStyle}>수령 금액 (원)</label>
                      <input type="number" step={100} value={newDiv.amount} onChange={e => setNewDiv({...newDiv, amount: Number(e.target.value)})} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>수령 월 (YYYY-M)</label>
                      <input value={newDiv.month} onChange={e => setNewDiv({...newDiv, month: e.target.value})} style={inputStyle} placeholder="2025-5" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 20 }}>
                      <input type="checkbox" id="reinvest" checked={newDiv.reinvested} onChange={e => setNewDiv({...newDiv, reinvested: e.target.checked})} />
                      <label htmlFor="reinvest" style={{ ...labelStyle, margin: 0, color: "#34d399" }}>재투자 완료</label>
                    </div>
                  </div>
                  <button onClick={() => {
                    if (!newDiv.name || !newDiv.amount) return;
                    setDividendLogs([{ ...newDiv, id: Date.now() }, ...dividendLogs]);
                    setNewDiv({ name: "", amount: 0, month: `${now.getFullYear()}-${now.getMonth()}`, reinvested: true });
                    setShowAddDiv(false);
                  }} style={{
                    width: "100%", padding: "9px", borderRadius: 10, border: "none",
                    background: "linear-gradient(90deg,#0f4a2a,#34d399)", color: "#06111e",
                    fontWeight: 700, fontSize: 13, cursor: "pointer",
                  }}>기록 저장</button>
                </div>
              )}

              {dividendLogs.length === 0 ? (
                <p style={{ fontSize: 12, color: "#4a7fa8", textAlign: "center", padding: "16px 0" }}>배당 기록이 없어요</p>
              ) : (
                dividendLogs.map((d) => (
                  <div key={d.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "9px 0", borderBottom: "1px solid #0f2030",
                  }}>
                    <div>
                      <span style={{ fontSize: 13, color: "#cfe4f7", fontWeight: 600 }}>{d.name}</span>
                      <span style={{ fontSize: 11, color: "#4a7fa8", marginLeft: 8 }}>{d.month.replace("-", "년 ")}월</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, color: "#f0a500", fontWeight: 700 }}>+{d.amount.toLocaleString()}원</span>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10,
                        background: d.reinvested ? "#06200f" : "#200806",
                        color: d.reinvested ? "#34d399" : "#f87171" }}>
                        {d.reinvested ? "재투자" : "보류"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ══ ISA PLAN ══ */}
        {tab === "isaplan" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={cardStyle}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#7ec8e3", margin: "0 0 16px" }}>🔄 ISA → 연금 이전 플랜</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>ISA 개설 연도</label>
                  <input type="number" min={2000} max={2040} value={isaOpenYear} onChange={e => setIsaOpenYear(Number(e.target.value))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>운용 사이클 (년)</label>
                  <select value={isaCycle} onChange={e => setIsaCycle(Number(e.target.value))} style={{ ...inputStyle, appearance: "none" }}>
                    <option value={3}>3년 (최소)</option>
                    <option value={5}>5년 (권장)</option>
                  </select>
                </div>
              </div>

              <IsaTimeline isaOpenYear={isaOpenYear} isaCycle={isaCycle} />
            </div>

            {/* 이전 혜택 안내 */}
            <div style={cardStyle}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#34d399", margin: "0 0 12px" }}>✅ ISA → 연금 이전 혜택 체크리스트</p>
              {[
                { ok: true, text: "이전 금액의 10% 추가 세액공제 (최대 300만원)" },
                { ok: true, text: "ISA 비과세 혜택 (서민형 400만원, 일반 200만원) 그대로 적용" },
                { ok: true, text: "연금 계좌 납입 한도 초과분도 이전 가능" },
                { ok: true, text: "이전 후 연금 운용 수익은 저율 과세 (3.3~5.5%)" },
                { ok: false, text: "이전 시 ISA 계좌는 해지됨 → 새로 개설 필요" },
                { ok: false, text: "이전 후 연금 중도 해지 시 기타소득세 16.5% 부과" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: "1px solid #0f2030", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 14, marginTop: 1 }}>{item.ok ? "✅" : "⚠️"}</span>
                  <span style={{ fontSize: 12, color: item.ok ? "#cfe4f7" : "#f0a500", lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* 절세 시뮬레이션 */}
            <div style={{ ...cardStyle, background: "linear-gradient(135deg,#0a2020,#0d2f1e)" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#34d399", margin: "0 0 10px" }}>💡 이전 시 절세 효과 (예시)</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "ISA 이전 금액", value: formatKRW(isaBalance), color: "#7ec8e3" },
                  { label: "추가 세액공제", value: formatKRW(Math.min(isaBalance * 0.1, 3000000)), color: "#34d399" },
                  { label: "절세 효과", value: formatKRW(Math.min(isaBalance * 0.1, 3000000) * 0.165), color: "#f0a500" },
                  { label: "총 혜택 추정", value: formatKRW(Math.min(isaBalance * 0.1, 3000000) * 1.165), color: "#a78bfa" },
                ].map((s) => (
                  <div key={s.label} style={{ background: "#061510", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#4a7fa8", marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 10, color: "#4a7fa8", marginTop: 10, lineHeight: 1.5 }}>
                * 현재 ISA 잔액 기준 추정값이에요. 실제 세액공제는 소득·세율에 따라 다를 수 있어요.
              </p>
            </div>
          </div>
        )}

        {/* ══ CALENDAR ══ */}
        {tab === "calendar" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {years.map((y) => (
                <button key={y} onClick={() => setSelectedYear(y)} style={{
                  padding: "6px 16px", borderRadius: 20, border: "none",
                  background: selectedYear === y ? "#7ec8e3" : "#0d1b2a",
                  color: selectedYear === y ? "#06111e" : "#7ec8e3",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}>{y}년</button>
              ))}
            </div>

            <div style={{ ...cardStyle, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, textAlign: "center" }}>
              {[
                { label: "ISA 납입 완료", value: `${yearPaid.isa}/12개월`, sub: formatKRW(yearPaid.isa * isaMonthly), color: "#7ec8e3" },
                { label: "연금 납입 완료", value: `${yearPaid.pension}/12개월`, sub: formatKRW(yearPaid.pension * pensionMonthly), color: "#a78bfa" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#081525", borderRadius: 10, padding: "10px" }}>
                  <div style={{ fontSize: 10, color: "#4a7fa8" }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#4a7fa8" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={cardStyle}>
              {MONTHS.map((m, i) => {
                const key = `${selectedYear}-${i}`;
                const rec = records[key] || { isa: false, pension: false };
                const isPast = selectedYear < now.getFullYear() || (selectedYear === now.getFullYear() && i <= now.getMonth());
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "9px 10px", marginBottom: 5, background: "#081525", borderRadius: 10,
                    opacity: !isPast ? 0.4 : 1,
                    border: i === now.getMonth() && selectedYear === now.getFullYear() ? "1px solid #7ec8e366" : "1px solid transparent",
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#cfe4f7", minWidth: 32 }}>{m}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[{ type: "isa", label: "ISA", color: "#7ec8e3" }, { type: "pension", label: "연금", color: "#a78bfa" }].map(({ type, label, color }) => (
                        <button key={type} onClick={() => isPast && toggleRecord(i, type)} style={{
                          padding: "4px 12px", borderRadius: 16,
                          border: `1px solid ${rec[type] ? color : "#1e3a5f"}`,
                          background: rec[type] ? `${color}22` : "transparent",
                          color: rec[type] ? color : "#4a7fa8",
                          fontSize: 12, fontWeight: 600,
                          cursor: isPast ? "pointer" : "default", transition: "all 0.2s",
                        }}>{rec[type] ? "✓ " : ""}{label}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ SETTINGS ══ */}
        {tab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={cardStyle}>
              <h3 style={{ fontSize: 14, color: "#7ec8e3", margin: "0 0 14px", fontWeight: 700 }}>👤 기본 정보</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "현재 나이", value: currentAge, set: setCurrentAge },
                  { label: "목표 은퇴 나이", value: retireAge, set: setRetireAge },
                ].map((f) => (
                  <div key={f.label}>
                    <label style={labelStyle}>{f.label}</label>
                    <input type="number" value={f.value} onChange={e => f.set(Number(e.target.value))} style={inputStyle} />
                  </div>
                ))}
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={labelStyle}>목표 금액 (원)</label>
                  <input type="number" step={10000000} value={targetAmount} onChange={e => setTargetAmount(Number(e.target.value))} style={inputStyle} />
                  <span style={{ fontSize: 11, color: "#4a7fa8", marginTop: 3, display: "block" }}>= {formatKRW(targetAmount)}</span>
                </div>
              </div>
            </div>

            {[
              { label: "💎 ISA 계좌", color: "#7ec8e3",
                fields: [
                  { label: "현재 잔액 (원)", value: isaBalance, set: setIsaBalance, step: 100000 },
                  { label: "월 납입액 (원)", value: isaMonthly, set: setIsaMonthly, step: 50000 },
                  { label: "예상 연 수익률 (%)", value: isaRate, set: setIsaRate, step: 0.5 },
                ]},
              { label: "🏦 개인연금", color: "#a78bfa",
                fields: [
                  { label: "현재 잔액 (원)", value: pensionBalance, set: setPensionBalance, step: 100000 },
                  { label: "월 납입액 (원)", value: pensionMonthly, set: setPensionMonthly, step: 50000 },
                  { label: "예상 연 수익률 (%)", value: pensionRate, set: setPensionRate, step: 0.5 },
                ]},
            ].map((acc) => (
              <div key={acc.label} style={cardStyle}>
                <h3 style={{ fontSize: 14, color: acc.color, margin: "0 0 14px", fontWeight: 700 }}>{acc.label}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {acc.fields.map((f) => (
                    <div key={f.label} style={f.label.includes("수익률") ? { gridColumn: "1/-1" } : {}}>
                      <label style={labelStyle}>{f.label}</label>
                      <input type="number" step={f.step} value={f.value} onChange={e => f.set(Number(e.target.value))} style={inputStyle} />
                      {(f.label.includes("잔액") || f.label.includes("납입")) && (
                        <span style={{ fontSize: 11, color: "#4a7fa8", marginTop: 3, display: "block" }}>= {formatKRW(f.value)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ padding: "11px 14px", background: "#081525", borderRadius: 12, fontSize: 12, color: "#4a7fa8", borderLeft: "3px solid #7ec8e3" }}>
              💡 수익률은 과거 데이터 기준 참고값이에요. 실제 수익률은 다를 수 있어요.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
