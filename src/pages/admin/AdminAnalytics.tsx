// pages/Analytics.tsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchMonthlyAnalytics,
  clearAnalytics,
  setYear,
  type MonthlyMetrics,
} from "../../store/slices/analyticsSlice";
import { fetchCourts } from "../../store/slices/courtsSlice";
import type { AppDispatch, RootState } from "../../store/store";

/* =======================
    CONSTANTS
======================= */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const COURT_COLORS = [
  "#378ADD", "#1D9E75", "#D85A30", "#7F77DD",
  "#D4537E", "#BA7517", "#639922", "#888780",
];

const METRIC_OPTIONS = [
  { value: "count",     label: "Records filed" },
  { value: "approved",  label: "Approved (Form 60)" },
  { value: "rejected",  label: "Rejected (Form 60)" },
  { value: "published", label: "Published at GP" },
] as const;

type MetricKey = "count" | "approved" | "rejected" | "published";

const YEAR_OPTIONS = [2023, 2024, 2025, 2026];

/* =======================
    HELPERS
======================= */

const getMonthlyValue = (
  monthly: Record<number, MonthlyMetrics>,
  monthIndex: number,
  metric: MetricKey,
): number => monthly[monthIndex]?.[metric] ?? 0;

const safeAvg = (vals: number[]): number => {
  const valid = vals.filter((v) => v > 0);
  return valid.length
    ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
    : 0;
};

/* =======================
    SUB-COMPONENTS
======================= */

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

const MetricCard = ({ label, value, sub, accent }: MetricCardProps) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className={`text-2xl font-medium ${accent ?? "text-gray-900"}`}>
      {value}
    </p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

/* =======================
    MAIN COMPONENT
======================= */

export default function AdminAnalytics() {
  const dispatch = useDispatch<AppDispatch>();

  const { monthly, year, loading, error } = useSelector(
    (state: RootState) => state.analytics,
  );
  const { courts: allCourts } = useSelector(
    (state: RootState) => state.courts,
  );

  const [selectedCourt, setSelectedCourt] = useState<string>("all");
  const [metric, setMetric] = useState<MetricKey>("count");
  const [activeTab, setActiveTab] = useState<"trend" | "compare" | "table">("trend");
  const [selectedMonth, setSelectedMonth] = useState<number>(1); // 1-based

  /* ---- Fetch courts if not already loaded ---- */
  useEffect(() => {
    if (allCourts.length === 0) {
      dispatch(fetchCourts());
    }
  }, [dispatch, allCourts.length]);

  /* ---- Fetch analytics on mount ---- */
  useEffect(() => {
    dispatch(fetchMonthlyAnalytics({ year }));
    return () => { dispatch(clearAnalytics()); };
  }, [dispatch, year]);

  /* ---- Re-fetch on year change ---- */
  const handleYearChange = (y: number) => {
    dispatch(setYear(y));
    dispatch(fetchMonthlyAnalytics({ year: y }));
    setSelectedCourt("all");
  };

  /* ---- Derived data ---- */
  const courts = useMemo(
    () =>
      allCourts
        .filter((c) => monthly[c._id])
        .map((c) => ({
          id: c._id,
          name: c.name,
          level: c.level,
          monthly: monthly[c._id]?.monthly ?? {},
        })),
    [allCourts, monthly],
  );

  const activeCourts = useMemo(
    () =>
      selectedCourt === "all"
        ? courts
        : courts.filter((c) => c.id === selectedCourt),
    [courts, selectedCourt],
  );

  /* Summary totals */
  const summary = useMemo(() => {
    let total = 0, approved = 0, rejected = 0, published = 0;
    const recLTs: number[] = [];
    const fwdLTs: number[] = [];

    activeCourts.forEach(({ monthly: m }) => {
      MONTHS.forEach((_, i) => {
        const row = m[i + 1];
        if (!row) return;
        total     += row.count;
        approved  += row.approved;
        rejected  += row.rejected;
        published += row.published;
        if (row.avgReceivingLeadTime)  recLTs.push(row.avgReceivingLeadTime);
        if (row.avgForwardingLeadTime) fwdLTs.push(row.avgForwardingLeadTime);
      });
    });

    return {
      total,
      approved,
      rejected,
      published,
      approvalRate: total ? Math.round((approved / total) * 100) : 0,
      avgReceivingLeadTime:  safeAvg(recLTs),
      avgForwardingLeadTime: safeAvg(fwdLTs),
    };
  }, [activeCourts]);

  /* Trend — single court only */
  const trendData = useMemo(() => {
    if (selectedCourt === "all") return [];
    const court = courts.find((c) => c.id === selectedCourt);
    if (!court) return [];
    return MONTHS.map((month, i) => ({
      month,
      value: getMonthlyValue(court.monthly, i + 1, metric),
    }));
  }, [courts, selectedCourt, metric]);

  /* Compare — one row per court */
  const compareData = useMemo(
    () =>
      courts.map(({ id, name, monthly: m }) => ({
        id,
        name: name.split(" ").slice(0, 2).join(" "),
        fullName: name,
        value: MONTHS.reduce(
          (sum, _, i) => sum + getMonthlyValue(m, i + 1, metric),
          0,
        ),
      })),
    [courts, metric],
  );

  /* Table — month rows × court columns */
  const tableData = useMemo(
    () =>
      MONTHS.map((month, i) => {
        const row: Record<string, string | number> = { month };
        courts.forEach(({ id, monthly: m }) => {
          row[id] = getMonthlyValue(m, i + 1, metric);
        });
        row._total = courts.reduce(
          (sum, { monthly: m }) => sum + getMonthlyValue(m, i + 1, metric),
          0,
        );
        return row;
      }),
    [courts, metric],
  );

  /* Month breakdown — per-court counts for the selected month */
  const monthBreakdownData = useMemo(() => {
    const rows = courts
      .map((c) => ({
        id: c.id,
        name: c.name,
        shortName: c.name.split(" ").slice(0, 2).join(" "),
        count: getMonthlyValue(c.monthly, selectedMonth, "count"),
      }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count);

    const total = rows.reduce((sum, r) => sum + r.count, 0);
    return { rows, total };
  }, [courts, selectedMonth]);

  const metricLabel =
    METRIC_OPTIONS.find((o) => o.value === metric)?.label ?? "Records filed";

  const selectedCourtName =
    courts.find((c) => c.id === selectedCourt)?.name ?? "all courts";

  /* =======================
      RENDER
  ======================= */

  return (
    <div className="p-6 space-y-6">

      {/* ---- Header ---- */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monthly records breakdown by court station
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={year}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={selectedCourt}
            onChange={(e) => setSelectedCourt(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All courts</option>
            {allCourts.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as MetricKey)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {METRIC_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ---- Error ---- */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* ---- Summary cards ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        <MetricCard
          label="Total records"
          value={summary.total.toLocaleString()}
          sub={`${year} · ${selectedCourt === "all" ? "all courts" : selectedCourtName}`}
        />
        <MetricCard
          label="Approved"
          value={summary.approved.toLocaleString()}
          sub={`${summary.approvalRate}% approval rate`}
          accent="text-green-700"
        />
        <MetricCard
          label="Rejected"
          value={summary.rejected.toLocaleString()}
          sub="Form 60 non-compliance"
          accent="text-red-600"
        />
        <MetricCard
          label="Published at GP"
          value={summary.published.toLocaleString()}
          sub={`${summary.total ? Math.round((summary.published / summary.total) * 100) : 0}% of total`}
          accent="text-blue-600"
        />
        <MetricCard
          label="Avg receiving lead time"
          value={`${summary.avgReceivingLeadTime}d`}
          sub="Date of receipt → date received"
        />
        <MetricCard
          label="Avg forwarding lead time"
          value={`${summary.avgForwardingLeadTime}d`}
          sub="Date received → forwarded to GP"
        />
        <MetricCard
          label="Courts tracked"
          value={courts.length}
          sub={`${activeCourts.length} selected`}
        />
      </div>

      {/* ---- Tabs ---- */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {(["trend", "compare", "table"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab
                  ? "border border-b-white border-gray-200 text-gray-900 -mb-px bg-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "trend"   && "Monthly trend"}
              {tab === "compare" && "Court comparison"}
              {tab === "table"   && "Data table"}
            </button>
          ))}
        </nav>
      </div>

      {/* ---- Chart panel ---- */}
      <div className="border border-gray-200 rounded-lg p-5 bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-sm text-gray-400">
            Loading analytics…
          </div>
        ) : courts.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-sm text-gray-400">
            No data available for {year}.
          </div>
        ) : (
          <>
            {/* Trend */}
            {activeTab === "trend" && (
              <>
                {selectedCourt === "all" ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-2">
                    <p className="text-sm text-gray-400">
                      Select a specific court to view its monthly trend.
                    </p>
                    <p className="text-xs text-gray-300">
                      Use the court dropdown above, or switch to Court comparison to compare all courts.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-4">
                      {metricLabel} per month — {selectedCourtName} ({year})
                    </p>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                        <Tooltip
                          formatter={(value) => [value, metricLabel]}
                          labelFormatter={(label) => `${label} ${year}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          name={metricLabel}
                          stroke={COURT_COLORS[0]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )}
              </>
            )}

            {/* Compare */}
            {activeTab === "compare" && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {metricLabel} — total per court ({year})
                </p>
                <div className="overflow-y-auto max-h-[600px]">
                  <ResponsiveContainer
                    width="100%"
                    height={Math.max(courts.length * 36 + 60, 260)}
                  >
                    <BarChart
                      data={compareData}
                      layout="vertical"
                      margin={{ left: 16, right: 24 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                        horizontal={false}
                      />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        width={130}
                      />
                      <Tooltip
                        formatter={(value, _, { payload }) => [
                          value,
                          payload?.fullName ?? metricLabel,
                        ]}
                      />
                      <Bar dataKey="value" name={metricLabel} radius={[0, 4, 4, 0]}>
                        {compareData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={COURT_COLORS[i % COURT_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* Table */}
            {activeTab === "table" && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {metricLabel} — month × court ({year})
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 whitespace-nowrap">
                          Month
                        </th>
                        {courts.map(({ id, name }) => (
                          <th
                            key={id}
                            className="text-left py-2 px-3 text-xs font-medium text-gray-500 whitespace-nowrap"
                          >
                            {name.split(" ").slice(0, 2).join(" ")}
                          </th>
                        ))}
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row) => (
                        <tr
                          key={row.month}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-2 px-3 font-medium text-gray-700">
                            {row.month}
                          </td>
                          {courts.map(({ id }) => (
                            <td key={id} className="py-2 px-3 text-gray-600">
                              {row[id] ?? 0}
                            </td>
                          ))}
                          <td className="py-2 px-3 font-medium text-gray-700">
                            {row._total}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-medium">
                        <td className="py-2 px-3 text-gray-700">Total</td>
                        {courts.map(({ id, monthly: m }) => (
                          <td key={id} className="py-2 px-3 text-gray-700">
                            {MONTHS.reduce(
                              (sum, _, i) => sum + getMonthlyValue(m, i + 1, metric),
                              0,
                            )}
                          </td>
                        ))}
                        <td className="py-2 px-3 text-gray-700">
                          {summary.total}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ================================================
          MONTH BREAKDOWN SECTION
      ================================================ */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">

        {/* Section header + month pill selector */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-gray-900">
              Records received by court —{" "}
              <span className="text-blue-600">{MONTH_FULL[selectedMonth - 1]} {year}</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {monthBreakdownData.rows.length} courts with records ·{" "}
              {monthBreakdownData.total.toLocaleString()} total
            </p>
          </div>

          {/* Month pill selector */}
          <div className="flex flex-wrap gap-1">
            {MONTHS.map((m, i) => {
              const monthNum = i + 1;
              const hasData = courts.some(
                (c) => getMonthlyValue(c.monthly, monthNum, "count") > 0,
              );
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(monthNum)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedMonth === monthNum
                      ? "bg-blue-600 text-white"
                      : hasData
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-gray-50 text-gray-300 cursor-default"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400">
            Loading…
          </div>
        ) : monthBreakdownData.rows.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400">
            No records received in {MONTH_FULL[selectedMonth - 1]} {year}.
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">

            {/* Left — scrollable table */}
            <div className="md:w-1/2 overflow-y-auto max-h-80 border-b md:border-b-0 md:border-r border-gray-100">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">
                      #
                    </th>
                    <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">
                      Court
                    </th>
                    <th className="text-right py-2 px-4 text-xs font-medium text-gray-500">
                      Records
                    </th>
                    <th className="text-right py-2 px-4 text-xs font-medium text-gray-500">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthBreakdownData.rows.map((row, i) => {
                    const share = monthBreakdownData.total
                      ? Math.round((row.count / monthBreakdownData.total) * 100)
                      : 0;
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 px-4 text-xs text-gray-400">{i + 1}</td>
                        <td className="py-2 px-4 text-gray-700">{row.name}</td>
                        <td className="py-2 px-4 text-right font-medium text-gray-900">
                          {row.count.toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-right">
                          <span className="text-xs text-gray-400">{share}%</span>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Total row */}
                  <tr className="bg-gray-50 font-medium">
                    <td className="py-2 px-4" />
                    <td className="py-2 px-4 text-gray-700">Total</td>
                    <td className="py-2 px-4 text-right text-gray-900">
                      {monthBreakdownData.total.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right text-xs text-gray-400">
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right — horizontal bar chart */}
            <div className="md:w-1/2 p-4 overflow-y-auto max-h-80">
              <ResponsiveContainer
                width="100%"
                height={Math.max(monthBreakdownData.rows.length * 32 + 40, 200)}
              >
                <BarChart
                  data={monthBreakdownData.rows.map((r, i) => ({
                    ...r,
                    color: COURT_COLORS[i % COURT_COLORS.length],
                  }))}
                  layout="vertical"
                  margin={{ left: 8, right: 24 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    horizontal={false}
                  />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="shortName"
                    tick={{ fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip
                    formatter={(value, _, { payload }) => [
                      value,
                      payload?.name ?? "Records",
                    ]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {monthBreakdownData.rows.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COURT_COLORS[i % COURT_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}