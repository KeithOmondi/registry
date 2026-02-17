import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Clock, 
  FileText, 
  Loader2, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  ArrowUpRight,
  Search,
  ChevronRight
} from "lucide-react";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchGpDashboard, REJECTION_STATUS } from "../../store/slices/gpSlice";

const GpDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard, loading } = useSelector((state: RootState) => state.gp);
  const records = useMemo(() => dashboard?.records || [], [dashboard]);

  useEffect(() => {
    dispatch(fetchGpDashboard());
  }, [dispatch]);

  // Executive Stats Calculation
  const stats = useMemo(() => {
    const total = records.length;
    const pending = records.filter(r => r.status === REJECTION_STATUS.PENDING).length;
    const health = total > 0 ? Math.round(((total - pending) / total) * 100) : 100;
    
    // Intake this month (simplified logic)
    const thisMonth = new Date().getMonth();
    const monthlyIntake = records.filter(r => new Date(r.dateReceived).getMonth() === thisMonth).length;

    return { total, pending, health, monthlyIntake };
  }, [records]);

  if (loading && !dashboard) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <div className="relative">
          <Loader2 className="animate-spin text-[#013220]" size={48} />
          <div className="absolute inset-0 blur-xl bg-emerald-500/20 rounded-full animate-pulse"></div>
        </div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Initializing Registry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 p-2 md:p-6">
      
      {/* EXECUTIVE TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-emerald-100 text-[#013220] text-[10px] font-black uppercase tracking-widest rounded-md">
              Live Overview
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            GP <span className="text-emerald-600 uppercase">dashboard</span>
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Institutional Compliance & Rejection Monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="bg-white border border-slate-100 p-2 rounded-2xl flex items-center gap-4 px-6 shadow-sm">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Station Context</p>
                <p className="text-sm font-black text-[#013220] uppercase">{records[0]?.courtStation?.name || "Global Registry"}</p>
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                 <Layers size={18} className="text-emerald-600" />
              </div>
           </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Rejections" 
          value={stats.total} 
          icon={<FileText size={20} />} 
          trend="+12% from last month"
          isPrimary 
        />
        <StatCard 
          title="Awaiting Review" 
          value={stats.pending} 
          icon={<Clock size={20} />} 
          trend="Action Required"
          isWarning
        />
        <StatCard 
          title="Compliance Health" 
          value={`${stats.health}%`} 
          icon={<ShieldCheck size={20} />} 
          trend="Station Stability"
        />
        <StatCard 
          title="Monthly Intake" 
          value={stats.monthlyIntake} 
          icon={<TrendingUp size={20} />} 
          trend="New entries"
        />
      </div>

      {/* DATA TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Recent Rectification Records</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit Trail: Latest Submissions</p>
          </div>
          
          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Filter by Cause No..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-8 py-5">Cause Details</th>
                <th className="px-8 py-5">Filing Date</th>
                <th className="px-8 py-5 text-center">Audit Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Layers size={64} className="mb-4" />
                      <p className="text-sm font-black uppercase tracking-widest">No Active Rejections Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id} className="group hover:bg-slate-50/80 transition-all cursor-default">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#013220] font-black text-xs group-hover:scale-110 transition-transform">
                            {record.causeNo.substring(0,1)}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-800 tracking-tight">{record.causeNo}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Reference ID: {record._id.substring(18)}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-600">
                         <Clock size={14} className="opacity-40" />
                         <span className="text-xs font-bold">{new Date(record.dateReceived).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm
                          ${record.status === REJECTION_STATUS.PENDING 
                            ? "bg-amber-50 text-amber-600 border border-amber-100" 
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <a 
                        href={record.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#013220] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0a4730] transition-all hover:shadow-lg hover:shadow-emerald-900/20"
                      >
                        Review PDF <ArrowUpRight size={14} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, isPrimary, isWarning }: any) => (
  <div className={`relative overflow-hidden bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 transition-all hover:-translate-y-1
    ${isPrimary ? "ring-2 ring-[#013220]/5" : ""}`}>
    
    <div className="relative z-10 flex flex-col gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center 
        ${isPrimary ? "bg-[#013220] text-white shadow-lg shadow-[#013220]/20" : 
          isWarning ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
        {icon}
      </div>
      
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
        </div>
      </div>

      <p className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 
        ${isWarning ? "text-rose-500" : "text-emerald-600"}`}>
         {trend} <ChevronRight size={10} />
      </p>
    </div>

    {/* Background visual flair */}
    {isPrimary && <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#013220]/5 rounded-full" />}
  </div>
);

export default GpDashboard;