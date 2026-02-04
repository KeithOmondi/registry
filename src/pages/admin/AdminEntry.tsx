import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { 
  Users, BarChart3, Clock, User as UserIcon, CalendarDays, 
  FilterX, TrendingUp, FileText, Loader2 
} from "lucide-react";
import { fetchRecords } from "../../store/slices/recordsSlice";
import { fetchAllUsers } from "../../store/slices/userSlice";

const AdminEntryPage = () => {
  const dispatch = useAppDispatch();
  
  const { records, loading: recordsLoading } = useAppSelector((state) => state.records);
  const { users, loading: usersLoading } = useAppSelector((state) => state.user);
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    dispatch(fetchRecords());
    dispatch(fetchAllUsers());
  }, [dispatch]);

  /* =====================================
      1. HELPER: STANDARDIZE DATE MATCHING
  ===================================== */
  const isSameDay = (date1: string, date2: string) => {
    if (!date1 || !date2) return false;
    return date1.split('T')[0] === date2.split('T')[0];
  };

  /* =====================================
      2. LOGIC: AGGREGATE STATS
  ===================================== */
  const userStats = useMemo(() => {
    return users.map(user => {
      // Find records where this user is the 'updatedBy'
      const userRecords = records.filter(rec => {
        const updaterId = typeof rec.updatedBy === 'object' ? rec.updatedBy?._id : rec.updatedBy;
        return updaterId === user._id;
      });
      
      // Calculate daily volume based on the selected filterDate
      const onSelectedDateCount = userRecords.filter(rec => 
        isSameDay(rec.updatedAt, filterDate)
      ).length;

      return {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        total: userRecords.length,
        onSelectedDate: onSelectedDateCount,
      };
    }).sort((a, b) => b.onSelectedDate - a.onSelectedDate || a.name.localeCompare(b.name));
  }, [records, users, filterDate]);

  /* =====================================
      3. LOGIC: FILTER RECORDS FOR TABLE
  ===================================== */
  const userDetails = useMemo(() => {
    if (!selectedUserId) return [];

    return records
      .filter((r) => {
        const updaterId = typeof r.updatedBy === 'object' ? r.updatedBy?._id : r.updatedBy;
        return updaterId === selectedUserId && isSameDay(r.updatedAt, filterDate);
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [records, selectedUserId, filterDate]);

  const isGlobalLoading = recordsLoading || usersLoading;

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <span className="bg-[#b48222]/10 text-[#b48222] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">
            Judiciary Audit System
          </span>
          <h1 className="text-4xl font-serif font-bold text-slate-900 flex items-center gap-4">
            Officer Productivity <BarChart3 className="text-[#b48222]" size={32} />
          </h1>
          <p className="text-slate-400 font-medium mt-2">
            Detailed performance tracking for {users.length} officers.
          </p>
        </div>

        <div className="relative flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-[#b48222]">
          <CalendarDays className="text-[#b48222]" size={20} />
          <div className="flex flex-col">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">View Activity For</label>
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setSelectedUserId(null);
              }}
              className="text-sm font-bold text-slate-700 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div>
        <div className="flex items-center gap-3 mb-6 text-slate-500">
          {isGlobalLoading ? <Loader2 className="animate-spin text-[#b48222]" size={18} /> : <TrendingUp size={18} className="text-[#b48222]" />}
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">Officer Performance Rankings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {userStats.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={`group relative p-6 rounded-[2.5rem] transition-all duration-500 text-left overflow-hidden ${
                selectedUserId === user.id 
                  ? "bg-slate-900 text-white shadow-2xl scale-[1.03]" 
                  : "bg-white border border-slate-100 hover:border-[#b48222]/50 text-slate-900 shadow-sm"
              }`}
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedUserId === user.id ? "bg-white/10" : "bg-slate-50"}`}>
                    <UserIcon size={24} className={selectedUserId === user.id ? "text-[#b48222]" : "text-slate-300"} />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase opacity-60">Daily Volume</span>
                    <p className={`text-3xl font-black ${selectedUserId === user.id ? "text-[#b48222]" : "text-slate-900"}`}>
                      {user.onSelectedDate}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1 truncate">{user.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                    System Lifetime: {user.total}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* DETAILED LOG */}
      <div className="mt-12">
        {selectedUserId ? (
          <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-[#b48222]">
                  <FileText size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Audit Log: {userStats.find(u => u.id === selectedUserId)?.name}</h3>
                  <p className="text-[11px] font-black uppercase text-[#b48222] tracking-widest mt-1">Verified records for {new Date(filterDate).toDateString()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUserId(null)} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-all">
                <FilterX size={16} /> Close Audit
              </button>
            </div>

            <div className="overflow-x-auto">
              {userDetails.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-5 text-left">Timestamp</th>
                      <th className="px-8 py-5 text-left">Case Details</th>
                      <th className="px-8 py-5 text-left">Station</th>
                      <th className="px-8 py-5 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
                    {userDetails.map((rec) => (
                      <tr key={rec._id} className="hover:bg-slate-50/50">
                        <td className="px-8 py-6 text-xs flex items-center gap-2">
                          <Clock size={14} className="text-slate-300" /> 
                          {new Date(rec.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-slate-800 tracking-tight">{rec.causeNo}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{rec.nameOfDeceased}</p>
                        </td>
                        <td className="px-8 py-6 text-xs">{rec.courtStation?.name}</td>
                        <td className="px-8 py-6 text-right">
                           <StatusBadge status={rec.form60Compliance} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-20 text-center flex flex-col items-center">
                  <p className="text-xs font-black uppercase text-slate-400 tracking-widest">No entries found for this officer on this date.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <EmptyState date={filterDate} />
        )}
      </div>
    </div>
  );
};

/* COMPONENT: Status Badge */
const StatusBadge = ({ status }: { status: string }) => {
  const isApproved = status === "Approved";
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-4 py-1.5 rounded-full border ${isApproved ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${isApproved ? "bg-emerald-600" : "bg-red-600"}`} />
      {status}
    </span>
  );
};

/* COMPONENT: Empty Selection State */
const EmptyState = ({ date }: { date: string }) => (
  <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[3.5rem] bg-white text-slate-400">
    <Users size={48} className="opacity-10 mb-4" />
    <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Select an officer</h3>
    <p className="text-xs mt-1">To view specific case entries for {new Date(date).toLocaleDateString()}</p>
  </div>
);

export default AdminEntryPage;