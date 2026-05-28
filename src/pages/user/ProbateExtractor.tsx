import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  extractProbateRecords,
  getExtractionJobs,
  getExtractionStats,
  exportJobToCSV,
  deleteExtractionJob,
  clearCurrentExtraction,
  selectCurrentExtraction,
  selectIsExtracting,
  selectExtractionError,
  selectJobs,
  selectJobsPagination,
  selectIsLoadingJobs,
  selectStats,
  selectIsExporting,
} from '../../store/slices/extractorSlice';
import type { AppDispatch } from '../../store/store';

const ProbateExtractor: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Selectors
  const currentExtraction = useSelector(selectCurrentExtraction);
  const isExtracting = useSelector(selectIsExtracting);
  const extractionError = useSelector(selectExtractionError);
  const jobs = useSelector(selectJobs);
  const jobsPagination = useSelector(selectJobsPagination);
  const isLoadingJobs = useSelector(selectIsLoadingJobs);
  const stats = useSelector(selectStats);
  const isExporting = useSelector(selectIsExporting);

  useEffect(() => {
    // Load initial data
    dispatch(getExtractionJobs({ page: currentPage }));
    dispatch(getExtractionStats());
  }, [dispatch, currentPage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) return;
    const result = await dispatch(extractProbateRecords(selectedFile));
    if (extractProbateRecords.fulfilled.match(result)) {
      // Refresh jobs list after successful extraction
      dispatch(getExtractionJobs({ page: 1 }));
      dispatch(getExtractionStats());
      // Reset current page to 1 to show the new job
      setCurrentPage(1);
    }
  };

  const handleExport = (jobId: string) => {
    dispatch(exportJobToCSV(jobId));
  };

  const handleDelete = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this extraction job?')) {
      await dispatch(deleteExtractionJob(jobId));
      dispatch(getExtractionJobs({ page: currentPage }));
      dispatch(getExtractionStats());
    }
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Probate Records Extractor</h1>
          <p className="text-gray-600 mt-1">
            Upload Kenya Gazette PDFs to automatically extract probate records
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Jobs</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalJobs}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Successful</div>
              <div className="text-2xl font-bold text-green-600">{stats.successfulJobs}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Failed</div>
              <div className="text-2xl font-bold text-red-600">{stats.failedJobs}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Records</div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalRecords.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Last 7 Days</div>
              <div className="text-2xl font-bold text-purple-600">{stats.recentJobs}</div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Gazette PDF</h2>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {extractionError && (
                  <p className="mt-2 text-sm text-red-600">{extractionError}</p>
                )}
              </div>
              <button
                onClick={handleExtract}
                disabled={!selectedFile || isExtracting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isExtracting ? 'Extracting...' : 'Extract Records'}
              </button>
            </div>
          </div>

          {/* Extraction Results */}
          {currentExtraction && currentExtraction.data && (
            <div className="border-t p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">
                  Extraction Results ({currentExtraction.totalRecords} records)
                </h3>
                <span className="text-sm text-gray-500">
                  Processed in {currentExtraction.processingTimeMs}ms
                </span>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Court Station</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cause Number</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Deceased Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date Published</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentExtraction.data.slice(0, 50).map((record, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{record.courtStation}</td>
                        <td className="px-4 py-2 text-sm font-mono text-gray-900">{record.causeNumber}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{record.deceasedName}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{record.datePublished}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {currentExtraction.totalRecords > 50 && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Showing first 50 of {currentExtraction.totalRecords} records
                  </p>
                )}
              </div>
              <button
                onClick={() => dispatch(clearCurrentExtraction())}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Results
              </button>
            </div>
          )}
        </div>

        {/* Jobs History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Extraction History</h2>
          </div>
          
          {isLoadingJobs ? (
            <div className="p-8 text-center text-gray-500">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No extraction jobs yet</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">File Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Records</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {jobs.map((job) => (
                      <tr key={job._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{job.fileName}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{job.totalRecords}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(job.createdAt)}</td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          {job.status === 'completed' && job.totalRecords > 0 && (
                            <button
                              onClick={() => handleExport(job._id)}
                              disabled={isExporting}
                              className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            >
                              Export CSV
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(job._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {jobsPagination && jobsPagination.pages > 1 && (
                <div className="px-6 py-4 border-t flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {jobsPagination.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(jobsPagination.pages, p + 1))}
                    disabled={currentPage === jobsPagination.pages}
                    className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProbateExtractor;