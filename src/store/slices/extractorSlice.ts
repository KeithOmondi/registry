import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type { RootState } from '../store';
import api from '../../api/axios';

// Types
export interface ProbateRecord {
  courtStation: string;
  causeNumber: string;
  deceasedName: string;
  datePublished: string;
  extractedAt: string;
}

export interface ExtractionJob {
  _id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  userId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  records: ProbateRecord[];
  totalRecords: number;
  processingTimeMs?: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ExtractionResponse {
  success: boolean;
  data?: ProbateRecord[];
  totalRecords: number;
  fileUrl?: string;
  error?: string;
  processingTimeMs?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface JobsResponse {
  success: boolean;
  data: ExtractionJob[];
  pagination: PaginationInfo;
}

interface JobResponse {
  success: boolean;
  data: ExtractionJob;
}

interface SearchResponse {
  success: boolean;
  data: ProbateRecord[];
  total: number;
  totalInJob: number;
}

interface StatsResponse {
  success: boolean;
  data: {
    totalJobs: number;
    successfulJobs: number;
    failedJobs: number;
    totalRecords: number;
    recentJobs: number;
  };
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

interface ExportSuccess {
  success: true;
  jobId: string;
}

interface ErrorResponse {
  message: string;
  error?: string;
}

interface ExtractorState {
  // Current extraction
  currentExtraction: ExtractionResponse | null;
  isExtracting: boolean;
  extractionError: string | null;
  
  // Jobs list
  jobs: ExtractionJob[];
  currentJob: ExtractionJob | null;
  jobsPagination: PaginationInfo | null;
  isLoadingJobs: boolean;
  jobsError: string | null;
  
  // Statistics
  stats: StatsResponse['data'] | null;
  isLoadingStats: boolean;
  
  // Search
  searchResults: ProbateRecord[];
  isSearching: boolean;
  totalSearchResults: number;
  
  // Export
  isExporting: boolean;
  exportError: string | null;
}

const initialState: ExtractorState = {
  currentExtraction: null,
  isExtracting: false,
  extractionError: null,
  
  jobs: [],
  currentJob: null,
  jobsPagination: null,
  isLoadingJobs: false,
  jobsError: null,
  
  stats: null,
  isLoadingStats: false,
  
  searchResults: [],
  isSearching: false,
  totalSearchResults: 0,
  
  isExporting: false,
  exportError: null,
};

// Type guard for Axios errors
const isAxiosError = (error: unknown): error is AxiosError<ErrorResponse> => {
  return (error as AxiosError)?.isAxiosError === true;
};

// Helper to extract error message
const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.error || error.response?.data?.message || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

// Async Thunks with proper typing

/**
 * Upload PDF and extract probate records
 */
export const extractProbateRecords = createAsyncThunk<
  ExtractionResponse,
  File,
  { rejectValue: string }
>(
  'extractor/extract',
  async (file: File, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    try {
      const response = await api.post<ExtractionResponse>(
        '/extractor/extract',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        }
      );
      
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Get all extraction jobs with pagination
 */
export const getExtractionJobs = createAsyncThunk<
  JobsResponse,
  { page?: number; limit?: number } | undefined,
  { rejectValue: string }
>(
  'extractor/getJobs',
  async (params = {}, { rejectWithValue }) => {
    const { page = 1, limit = 20 } = params;
    
    try {
      const response = await api.get<JobsResponse>(`/extractor/jobs?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Get single extraction job by ID
 */
export const getExtractionJobById = createAsyncThunk<
  JobResponse,
  string,
  { rejectValue: string }
>(
  'extractor/getJobById',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<JobResponse>(`/extractor/jobs/${jobId}`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Search records within a job
 */
export const searchRecordsInJob = createAsyncThunk<
  SearchResponse,
  { jobId: string; query: string; field?: string },
  { rejectValue: string }
>(
  'extractor/searchRecords',
  async ({ jobId, query, field = 'deceasedName' }, { rejectWithValue }) => {
    try {
      const response = await api.get<SearchResponse>(
        `/extractor/jobs/${jobId}/search?query=${encodeURIComponent(query)}&field=${field}`
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Get extraction statistics
 */
export const getExtractionStats = createAsyncThunk<
  StatsResponse,
  void,
  { rejectValue: string }
>(
  'extractor/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<StatsResponse>('/extractor/jobs/stats');
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Export job records as CSV
 */
export const exportJobToCSV = createAsyncThunk<
  ExportSuccess,
  string,
  { rejectValue: string }
>(
  'extractor/exportCSV',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/extractor/jobs/${jobId}/export`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `probate_records_${jobId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, jobId };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Delete extraction job
 */
export const deleteExtractionJob = createAsyncThunk<
  { jobId: string } & DeleteResponse,
  string,
  { rejectValue: string }
>(
  'extractor/deleteJob',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete<DeleteResponse>(`/extractor/jobs/${jobId}`);
      return { jobId, ...response.data };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Slice
const extractorSlice = createSlice({
  name: 'extractor',
  initialState,
  reducers: {
    clearCurrentExtraction: (state) => {
      state.currentExtraction = null;
      state.extractionError = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.totalSearchResults = 0;
    },
    clearJobsError: (state) => {
      state.jobsError = null;
    },
    resetExtractorState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Extract Records
      .addCase(extractProbateRecords.pending, (state) => {
        state.isExtracting = true;
        state.extractionError = null;
      })
      .addCase(extractProbateRecords.fulfilled, (state, action: PayloadAction<ExtractionResponse>) => {
        state.isExtracting = false;
        state.currentExtraction = action.payload;
      })
      .addCase(extractProbateRecords.rejected, (state, action) => {
        state.isExtracting = false;
        state.extractionError = action.payload as string;
      })
      
      // Get Jobs
      .addCase(getExtractionJobs.pending, (state) => {
        state.isLoadingJobs = true;
        state.jobsError = null;
      })
      .addCase(getExtractionJobs.fulfilled, (state, action: PayloadAction<JobsResponse>) => {
        state.isLoadingJobs = false;
        state.jobs = action.payload.data;
        state.jobsPagination = action.payload.pagination;
      })
      .addCase(getExtractionJobs.rejected, (state, action) => {
        state.isLoadingJobs = false;
        state.jobsError = action.payload as string;
      })
      
      // Get Job By ID
      .addCase(getExtractionJobById.pending, (state) => {
        state.isLoadingJobs = true;
      })
      .addCase(getExtractionJobById.fulfilled, (state, action: PayloadAction<JobResponse>) => {
        state.isLoadingJobs = false;
        state.currentJob = action.payload.data;
      })
      .addCase(getExtractionJobById.rejected, (state, action) => {
        state.isLoadingJobs = false;
        state.jobsError = action.payload as string;
      })
      
      // Search Records
      .addCase(searchRecordsInJob.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(searchRecordsInJob.fulfilled, (state, action: PayloadAction<SearchResponse>) => {
        state.isSearching = false;
        state.searchResults = action.payload.data;
        state.totalSearchResults = action.payload.total;
      })
      .addCase(searchRecordsInJob.rejected, (state, action) => {
        state.isSearching = false;
        state.jobsError = action.payload as string;
      })
      
      // Get Stats
      .addCase(getExtractionStats.pending, (state) => {
        state.isLoadingStats = true;
      })
      .addCase(getExtractionStats.fulfilled, (state, action: PayloadAction<StatsResponse>) => {
        state.isLoadingStats = false;
        state.stats = action.payload.data;
      })
      .addCase(getExtractionStats.rejected, (state) => {
        state.isLoadingStats = false;
      })
      
      // Export CSV
      .addCase(exportJobToCSV.pending, (state) => {
        state.isExporting = true;
        state.exportError = null;
      })
      .addCase(exportJobToCSV.fulfilled, (state) => {
        state.isExporting = false;
      })
      .addCase(exportJobToCSV.rejected, (state, action) => {
        state.isExporting = false;
        state.exportError = action.payload as string;
      })
      
      // Delete Job
      .addCase(deleteExtractionJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter(job => job._id !== action.payload.jobId);
        if (state.currentJob?._id === action.payload.jobId) {
          state.currentJob = null;
        }
      });
  },
});

// Selectors
export const selectCurrentExtraction = (state: RootState) => state.extractor.currentExtraction;
export const selectIsExtracting = (state: RootState) => state.extractor.isExtracting;
export const selectExtractionError = (state: RootState) => state.extractor.extractionError;

export const selectJobs = (state: RootState) => state.extractor.jobs;
export const selectCurrentJob = (state: RootState) => state.extractor.currentJob;
export const selectJobsPagination = (state: RootState) => state.extractor.jobsPagination;
export const selectIsLoadingJobs = (state: RootState) => state.extractor.isLoadingJobs;
export const selectJobsError = (state: RootState) => state.extractor.jobsError;

export const selectStats = (state: RootState) => state.extractor.stats;
export const selectIsLoadingStats = (state: RootState) => state.extractor.isLoadingStats;

export const selectSearchResults = (state: RootState) => state.extractor.searchResults;
export const selectIsSearching = (state: RootState) => state.extractor.isSearching;
export const selectTotalSearchResults = (state: RootState) => state.extractor.totalSearchResults;

export const selectIsExporting = (state: RootState) => state.extractor.isExporting;
export const selectExportError = (state: RootState) => state.extractor.exportError;

// Export actions
export const {
  clearCurrentExtraction,
  clearSearchResults,
  clearJobsError,
  resetExtractorState,
} = extractorSlice.actions;

export default extractorSlice.reducer;