import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { fetchAnalytics } from "../../store/slices/recordsSlice";

// Define strict interfaces for the component
interface CourtPerformance {
  courtName: string;
  count: number;
  complianceRate: number;
}

interface AnalyticsSummary {
  totalRecords: number;
  compliantCount: number;
  pendingForwarding: number;
  averageLeadTime: number;
}

export const AdminDashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedStation, setSelectedStation] = useState<string>("all");

  // Type-safe selection from Redux
  const { summary, courtPerformance, loading } = useSelector(
    (state: RootState) => state.records as {
      summary: AnalyticsSummary | null;
      courtPerformance: CourtPerformance[];
      loading: boolean;
    },
  );

  useEffect(() => {
    dispatch(fetchAnalytics(selectedStation));
  }, [dispatch, selectedStation]);

  // Expanded stats for granular visibility
  const stats = [
    {
      label: "Registry Volume",
      value: summary?.totalRecords.toLocaleString() || "0",
      sub: "Total Files",
      icon: "🏛️",
      color: "text-slate-600",
    },
    {
      label: "Approved Files",
      value: summary?.compliantCount.toLocaleString() || "0",
      sub: "Verified Correct",
      icon: "✅",
      color: "text-emerald-600",
    },
    {
      label: "Rejected Files",
      value: (summary ? summary.totalRecords - summary.compliantCount : 0).toLocaleString(),
      sub: "Needs Correction",
      icon: "❌",
      color: "text-red-600",
    },
    {
      label: "Awaiting Action",
      value: summary?.pendingForwarding?.toString() || "0",
      sub: "Ready to Forward",
      icon: "⏳",
      color: "text-amber-600",
    },
    {
      label: "Success Rate",
      value: summary && summary.totalRecords > 0
          ? `${((summary.compliantCount / summary.totalRecords) * 100).toFixed(1)}%`
          : "0%",
      sub: "Accuracy Level",
      icon: "📈",
      color: "text-blue-600",
    },
  ];

  return (
    <div className="space-y-8 md:space-y-10 px-4 sm:px-6 lg:px-8 py-6 md:py-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      
      {/* Header & Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1a3a32] uppercase tracking-tight">
            Registry Overview
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            Live Monitoring: Approved vs Rejected vs Pending
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <select 
            value={selectedStation}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStation(e.target.value)}
            className="w-full appearance-none bg-white/80 backdrop-blur-sm border border-slate-200 text-[#1a3a32] text-xs font-black uppercase tracking-wider py-3.5 px-5 pr-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <option value="all">Showing: All Court Stations</option>
            {/* Map actual court stations here */}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {loading && !summary ? (
        <div className="flex h-96 items-center justify-center bg-white/60 rounded-3xl border border-slate-100 shadow-sm backdrop-blur-sm">
          <div className="animate-pulse text-xs font-black text-[#1a3a32] uppercase tracking-[0.3em] text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Synchronizing Registry Analytics...
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards Row - enhanced with hover effects and better spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="text-2xl mb-3">{stat.icon}</div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-[#1a3a32] tracking-tight">{stat.value}</p>
                <p className={`text-[9px] font-bold ${stat.color} mt-1 uppercase tracking-wider`}>{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Performance Chart - refined styling */}
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#1a3a32] uppercase tracking-tight">Volume by Station</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Which stations handle the most files</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-100">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-[#1a3a32] shadow-sm" />
                    <div className="w-3 h-3 rounded-sm bg-[#b48222] shadow-sm" />
                  </div>
                  <span className="text-[9px] font-black text-[#1a3a32] uppercase tracking-wider">Files Handled</span>
                </div>
              </div>

              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courtPerformance} margin={{ top: 20, right: 10, left: -10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="courtName" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 800, fill: "#475569" }} 
                      interval={0} 
                      angle={-30} 
                      textAnchor="end" 
                      height={60}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#475569" }} />
                    
                    <Tooltip 
                      cursor={{ fill: "#f1f5f9" }}
                      formatter={((value: number | string | (number | string)[] | undefined) => {
                        const formattedValue = Number(value || 0).toLocaleString();
                        return [`${formattedValue} Files`, "Record Volume"];
                      }) as React.ComponentProps<typeof Tooltip>['formatter']}
                      contentStyle={{ 
                        borderRadius: "16px", 
                        border: "none", 
                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.05)", 
                        textTransform: "uppercase", 
                        fontSize: "10px", 
                        fontWeight: "900",
                        padding: "8px 12px",
                        background: "white",
                      }} 
                    />
                    
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36}>
                      {courtPerformance.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#1a3a32" : "#b48222"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Sidebar - enhanced cards */}
            <div className="space-y-6 flex flex-col">
              {/* Lead Time Card - glassmorphism style */}
              <div className="bg-gradient-to-br from-[#1a3a32] to-[#0f2922] p-7 md:p-8 rounded-3xl text-white shadow-xl shadow-emerald-900/20 backdrop-blur-sm border border-white/10">
                <h3 className="text-xs font-black uppercase tracking-wider mb-6 text-emerald-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Registry Speed
                </h3>
                <div className="text-center py-6 border-y border-white/15 my-4">
                  <p className="text-[11px] font-black text-white/60 uppercase tracking-wider mb-2">Average Forwarding Time</p>
                  <p className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                    {summary?.averageLeadTime?.toFixed(1) || "0"}
                    <span className="text-lg ml-2 text-emerald-400 font-bold uppercase">Days</span>
                  </p>
                </div>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider text-center">Target: ≤ 3.0 Days</p>
              </div>

              {/* Station Accuracy List - clean list with progress bars */}
              <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex-1">
                <h3 className="text-sm font-black text-[#1a3a32] uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#b48222] rounded-full"></span>
                  Station Accuracy
                </h3>
                <div className="space-y-6">
                  {courtPerformance?.length > 0 ? (
                    courtPerformance.slice(0, 5).map((court: CourtPerformance, i: number) => (
                      <div key={i} className="group">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[11px] font-black text-slate-500 uppercase truncate pr-3 group-hover:text-[#1a3a32] transition-colors">
                            {court.courtName}
                          </span>
                          <span className="text-[10px] font-black text-[#1a3a32] bg-slate-100 px-2 py-0.5 rounded-full">
                            {court.complianceRate || 0}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#b48222] to-amber-600 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${court.complianceRate || 0}%` }} 
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] font-bold text-slate-300 uppercase py-10 text-center italic">
                      No station data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};