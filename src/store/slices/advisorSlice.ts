import { advisorService, type AdvisorClass, type DashboardResponse, type Semester } from "@/services/advisor.service";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

type AdvisorState = {
  classes: AdvisorClass[];
  semesters: Semester[];

  selectedClassId: string | null;
  selectedSemesterId: string | null;

  dashboard: DashboardResponse | null;

  status: LoadStatus;
  error: string | null;
};

const initialState: AdvisorState = {
  classes: [],
  semesters: [],
  selectedClassId: null,
  selectedSemesterId: null,
  dashboard: null,
  status: "idle",
  error: null,
};

/** ===== Thunks ===== */
export const fetchClassesThunk = createAsyncThunk(
  "advisor/fetchClasses",
  async (params: { include_inactive?: boolean } | undefined, { rejectWithValue }) => {
    try {
      return await advisorService.getMyClasses(params);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? e?.message ?? "Fetch classes failed");
    }
  }
);

export const fetchSemestersThunk = createAsyncThunk(
  "advisor/fetchSemesters",
  async (_: void, { rejectWithValue }) => {
    try {
      return await advisorService.getSemesters();
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? e?.message ?? "Fetch semesters failed");
    }
  }
);

export const fetchDashboardThunk = createAsyncThunk(
  "advisor/fetchDashboard",
  async (
    params: {
      class_id: string;
      semester_id: string;
      q?: string;
      page?: number;
      limit?: number;
      warned_only?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      return await advisorService.getDashboard({
        ...params,
        warned_only: params.warned_only ?? true,
      });
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? e?.message ?? "Fetch dashboard failed");
    }
  }
);

/** ===== Slice ===== */
const advisorSlice = createSlice({
  name: "advisor",
  initialState,
  reducers: {
    setSelectedClass(state, action: PayloadAction<string | null>) {
      state.selectedClassId = action.payload;
      // khi đổi lớp -> clear dashboard để UX rõ ràng
      state.dashboard = null;
      state.error = null;
    },
    setSelectedSemester(state, action: PayloadAction<string | null>) {
      state.selectedSemesterId = action.payload;
      state.dashboard = null;
      state.error = null;
    },
    clearAdvisorError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchClassesThunk.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchClassesThunk.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.classes = a.payload ?? [];
    });
    b.addCase(fetchClassesThunk.rejected, (s, a: any) => {
      s.status = "failed";
      s.error = String(a.payload ?? "Fetch classes failed");
    });

    b.addCase(fetchSemestersThunk.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchSemestersThunk.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.semesters = a.payload ?? [];
    });
    b.addCase(fetchSemestersThunk.rejected, (s, a: any) => {
      s.status = "failed";
      s.error = String(a.payload ?? "Fetch semesters failed");
    });

    b.addCase(fetchDashboardThunk.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchDashboardThunk.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.dashboard = a.payload ?? null;
    });
    b.addCase(fetchDashboardThunk.rejected, (s, a: any) => {
      s.status = "failed";
      s.error = String(a.payload ?? "Fetch dashboard failed");
    });
  },
});

export const { setSelectedClass, setSelectedSemester, clearAdvisorError } = advisorSlice.actions;
export default advisorSlice.reducer;
