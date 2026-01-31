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

export const AdminDashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedStation, setSelectedStation] = useState("all");

  const { summary, courtPerformance, loading } = useSelector(
    (state: RootState) => state.records,
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
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 px-2 sm:px-0 pb-10">
      
      {/* Header & Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1a3a32] uppercase tracking-tight">Registry Overview</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Live Monitoring: Approved vs Rejected vs Pending</p>
        </div>
        
        <div className="relative inline-block w-full md:w-72">
          <select 
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-200 text-[#1a3a32] text-[10px] font-black uppercase tracking-widest py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer shadow-sm"
          >
            <option value="all">Showing: All Court Stations</option>
            {/* Map actual court stations here */}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {loading && !summary ? (
        <div className="flex h-96 items-center justify-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
          <div className="animate-pulse text-[10px] font-black text-[#1a3a32] uppercase tracking-[0.3em] text-center">
            Synchronizing Registry Analytics...
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards Row - Responsive grid for 5 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm relative group transition-all hover:shadow-md">
                <div className="text-xl mb-3">{stat.icon}</div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-[#1a3a32] tracking-tighter">{stat.value}</p>
                <p className={`text-[8px] font-bold ${stat.color} mt-1 uppercase tracking-widest`}>{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Performance Chart */}
            <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-base md:text-lg font-black text-[#1a3a32] uppercase tracking-tight">Volume by Station</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Which stations handle the most files</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-[#1a3a32]" />
                    <div className="w-3 h-3 rounded-sm bg-[#b48222]" />
                  </div>
                  <span className="text-[10px] font-black text-[#1a3a32] uppercase tracking-tight">Total Files Handled</span>
                </div>
              </div>

              <div className="flex-1 min-h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courtPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="courtName" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 800, fill: "#64748b" }} 
                      interval={0} 
                      angle={-30} 
                      textAnchor="end" 
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: "#64748b" }} />
                    
                    <Tooltip 
                      cursor={{ fill: "#f8fafc" }} 
                      formatter={(value: any) => [`${value} Files`, "Record Volume"]}
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", textTransform: "uppercase", fontSize: "10px", fontWeight: "900" }} 
                    />
                    
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                      {courtPerformance.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#1a3a32" : "#b48222"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6 flex flex-col">
              {/* Lead Time Card */}
              <div className="bg-[#1a3a32] p-6 md:p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-900/10">
                <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-emerald-400">Registry Speed</h3>
                <div className="text-center py-6 border-y border-white/10 my-4">
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Time to Forward</p>
                  <p className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                    {summary?.averageLeadTime?.toFixed(1) || "0"}
                    <span className="text-sm ml-2 text-emerald-500 font-bold uppercase">Days</span>
                  </p>
                </div>
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest text-center">Efficiency Target: 3.0 Days</p>
              </div>

              {/* Station Accuracy List */}
              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 flex-1">
                <h3 className="text-[11px] md:text-sm font-black text-[#1a3a32] uppercase tracking-widest mb-6">Station Accuracy</h3>
                <div className="space-y-6">
                  {courtPerformance?.length > 0 ? (
                    courtPerformance.slice(0, 5).map((court, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-500 uppercase truncate pr-4">{court.courtName}</span>
                          <span className="text-[10px] font-black text-[#1a3a32]">{court.complianceRate || 0}% Approved</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#b48222] transition-all duration-1000" 
                            style={{ width: `${court.complianceRate || 0}%` }} 
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] font-bold text-slate-300 uppercase py-10 text-center italic">Metrics Unavailable</div>
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