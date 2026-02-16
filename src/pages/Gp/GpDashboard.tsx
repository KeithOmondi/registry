import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

const GpDashboard = () => {
  return (
    <div className="space-y-8">

      {/* =========================
          PAGE HEADER
      ========================== */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          GP Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Overview of records pending your review and approval
        </p>
      </div>

      {/* =========================
          STATS CARDS
      ========================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Pending Records */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending Records</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">12</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl">
              <Clock className="text-amber-600" size={22} />
            </div>
          </div>
        </div>

        {/* Approved Records */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Approved</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">30</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl">
              <CheckCircle className="text-emerald-600" size={22} />
            </div>
          </div>
        </div>

        {/* Rejected Records */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Rejected</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">5</p>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <AlertTriangle className="text-red-600" size={22} />
            </div>
          </div>
        </div>

        {/* Records Exceeding KPI */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">KPI Breaches</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">3</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl">
              <AlertTriangle className="text-yellow-600" size={22} />
            </div>
          </div>
        </div>

      </div>

      {/* =========================
          RECENT ACTIVITY / RECORDS
      ========================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Records */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Recent Records
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">
                Record #R-0012 forwarded to GP
              </span>
              <span className="text-slate-400">1h ago</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">
                Record #R-0007 approved
              </span>
              <span className="text-slate-400">3h ago</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">
                Record #R-0020 rejected
              </span>
              <span className="text-slate-400">Yesterday</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Quick Actions
          </h2>

          <div className="flex flex-col gap-3">
            <button className="bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition">
              Review Pending Records
            </button>
            <button className="bg-slate-200 text-slate-800 py-2.5 rounded-xl font-semibold hover:bg-slate-300 transition">
              View KPI Breaches
            </button>
            <button className="bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition">
              Access All Records
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GpDashboard;
