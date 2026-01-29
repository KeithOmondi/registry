import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FileSearch, 
  UploadCloud, 
  AlertCircle, 
  Loader2,
  Clock,
  Database
} from 'lucide-react';
import type { AppDispatch, RootState } from '../../store/store';
import { resetScanState, scanGazette } from '../../store/slices/gazetteSlice';

// Define the shape of the case for the map function
interface GazetteCase {
  deceased: string;
  cause: string;
  forwardedDate: string;
  leadTime: string;
}

const ScansPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  // Fixed the state selector to use 'state.gazette' as per your store error
  const { 
    scanLoading, 
    scanError, 
    gazetteDetails 
  } = useSelector((state: RootState) => state.gazette);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      dispatch(resetScanState());
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      dispatch(scanGazette(selectedFile));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* --- UPLOAD SECTION --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-blue-50 rounded-full">
            <UploadCloud className="w-10 h-10 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-800">Scan New Gazette</h2>
            <p className="text-sm text-slate-500">Upload PDF to match against Master Records</p>
          </div>
          
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />
          
          <label
            htmlFor="file-upload"
            className="cursor-pointer px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
          >
            {selectedFile ? selectedFile.name : "Choose PDF File"}
          </label>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || scanLoading}
            className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-bold transition-all shadow-lg ${
              !selectedFile || scanLoading 
                ? 'bg-slate-300 cursor-not-allowed text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
            }`}
          >
            {scanLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileSearch className="w-5 h-5" />
            )}
            <span>{scanLoading ? 'Processing PDF...' : 'Start Gazette Scan'}</span>
          </button>
        </div>

        {scanError && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{scanError}</span>
          </div>
        )}
      </div>

      {/* --- RESULTS TABLE --- */}
      {gazetteDetails && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                Scan Results: {gazetteDetails.volumeNo}
              </h3>
              <p className="text-xs text-slate-500">Published: {new Date(gazetteDetails.datePublished).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-blue-600">{gazetteDetails.publishedCount}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Matches Found</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-3 border-b">Deceased Name</th>
                  <th className="px-6 py-3 border-b">Cause Number</th>
                  <th className="px-6 py-3 border-b">Date Forwarded</th>
                  <th className="px-6 py-3 border-b">Lead Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Added types to item and idx */}
                {gazetteDetails.cases.map((item: GazetteCase, idx: number) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 uppercase text-xs">
                      {item.deceased}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">
                      {item.cause}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {item.forwardedDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        item.leadTime === 'N/A' 
                          ? 'bg-slate-100 text-slate-400' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {item.leadTime}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {gazetteDetails.cases.length === 0 && (
            <div className="p-10 text-center text-slate-400 text-sm">
              No matching records found in this Gazette.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScansPage;