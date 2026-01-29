import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  fetchRecordStats,
  fetchRecords,
} from "../../store/slices/recordsSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  List,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  TrendingUp,
  Activity,
} from "lucide-react";

// ===================== BRAND COLORS =====================
const COLORS = {
  PRIMARY_GREEN: "#004832",
  ACCENT_GOLD: "#C8A239",
  DARK_GOLD: "#A57C1B",
  ALERT_RED: "#7A1C1C",
  LIGHT_BG: "#F9F9F7",
};

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { records, stats, loading, error } = useSelector(
    (state: RootState) => state.records,
  );

  useEffect(() => {
    dispatch(fetchRecordStats());
    dispatch(fetchRecords());
  }, [dispatch]);

  // Transform data for the chart using the last 7 days
  const chartData = useMemo(() => {
    if (!records.length) return [];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    return last7Days.map((date) => {
      const dayRecords = records.filter((r) => r.dateReceived.startsWith(date));
      return {
        date: new Date(date).toLocaleDateString("en-KE", { weekday: "short" }),
        approved: dayRecords.filter((r) => r.form60Compliance === "Approved").length,
        rejected: dayRecords.filter((r) => r.form60Compliance === "Rejected").length,
      };
    });
  }, [records]);

  // Simplified terminology for typical users
  const summaryCards = [
    {
      title: "Total Records",
      value: stats?.total || 0,
      bg: COLORS.PRIMARY_GREEN,
      icon: <List />,
    },
    {
      title: "Approved Records",
      value: stats?.compliance.approved || 0,
      bg: COLORS.ACCENT_GOLD,
      icon: <CheckCircle />,
    },
    {
      title: "Rejected Records",
      value: stats?.compliance.rejected || 0,
      bg: COLORS.ALERT_RED,
      icon: <AlertTriangle />,
    },
  ];

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: COLORS.LIGHT_BG }}>
      {/* HEADER */}
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold" style={{ color: COLORS.PRIMARY_GREEN }}>
          My Dashboard
        </h1>
        <p className="text-gray-600">
          Overview of your submitted probate records and their current status.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {summaryCards.map((c, idx) => (
          <div
            key={idx}
            className="text-white rounded-xl p-6 shadow-lg flex items-center justify-between transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: c.bg }}
          >
            <div>
              <h2 className="text-sm font-semibold opacity-90 uppercase tracking-wider">
                {c.title}
              </h2>
              <p className="text-4xl font-extrabold mt-1">
                {loading ? "..." : c.value}
              </p>
            </div>
            <div className="opacity-30">
              {React.cloneElement(c.icon as React.ReactElement )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold mb-6 flex items-center" style={{ color: COLORS.PRIMARY_GREEN }}>
            <TrendingUp size={20} className="mr-2" />
            7-Day Activity Trend
          </h3>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend iconType="circle" />
                  <Line
                    type="monotone"
                    dataKey="approved"
                    name="Approved"
                    stroke={COLORS.PRIMARY_GREEN}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rejected"
                    name="Rejected"
                    stroke={COLORS.ACCENT_GOLD}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RECENT UPDATES SIDEBAR */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold mb-6 flex items-center" style={{ color: COLORS.PRIMARY_GREEN }}>
            <Activity size={20} className="mr-2" />
            Recent Updates
          </h3>
          <div className="space-y-4">
            {records.slice(0, 6).map((record) => (
              <div key={record._id} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0">
                <div className={`mt-1 p-2 rounded-full ${record.form60Compliance === "Approved" ? "bg-green-100" : "bg-red-100"}`}>
                  {record.form60Compliance === "Approved" ? (
                    <CheckCircle size={14} className="text-green-700" />
                  ) : (
                    <AlertTriangle size={14} className="text-red-700" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">{record.causeNo}</p>
                  <p className="text-xs text-gray-500">{record.nameOfDeceased}</p>
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center">
                    <Clock size={10} className="mr-1" />
                    {new Date(record.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {!loading && records.length === 0 && (
              <p className="text-center text-gray-400 py-10 text-sm italic">No activity yet.</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;