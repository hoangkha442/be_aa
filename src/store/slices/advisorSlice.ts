import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { advisorService } from "@/services/advisor.service";

type AdvisorState = {
  classes: any[];
  semesters: any[];
  selectedClassId: string | null;
  selectedSemesterId: string | null;

  dashboard: any | null;

  warnings: any | null; // paginated/list
  preview: any | null;

  notes: any | null;

  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: AdvisorState = {
  classes: [],
  semesters: [],
  selectedClassId: null,
  selectedSemesterId: null,
  dashboard: null,
  warnings: null,
  preview: null,
  notes: null,
  status: "idle",
  error: null,
};

export const fetchClassesThunk = createAsyncThunk(
  "advisor/classes",
  async (_, { rejectWithValue }) => {
    try {
      return await advisorService.getMyClasses();
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message ?? "Không tải được danh sách lớp"
      );
    }
  }
);

export const fetchSemestersThunk = createAsyncThunk(
  "advisor/semesters",
  async (_, { rejectWithValue }) => {
    try {
      return await advisorService.getSemesters();
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message ?? "Không tải được học kỳ"
      );
    }
  }
);

export const fetchDashboardThunk = createAsyncThunk(
  "advisor/dashboard",
  async (
    params: {
      class_id: string;
      semester_id?: string;
      q?: string;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      return await advisorService.getDashboard(params);
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message ?? "Không tải được dashboard"
      );
    }
  }
);

export const listWarningsThunk = createAsyncThunk(
  "advisor/warnings/list",
  async (
    params: {
      class_id: string;
      semester_id?: string;
      status?: string;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      return await advisorService.listWarnings(params);
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message ?? "Không tải được warnings"
      );
    }
  }
);

export const previewWarningsThunk = createAsyncThunk(
  "advisor/warnings/preview",
  async (
    params: { class_id: string; semester_id?: string },
    { rejectWithValue }
  ) => {
    try {
      return await advisorService.previewWarnings(params);
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message ?? "Không preview được warnings"
      );
    }
  }
);

export const generateWarningsThunk = createAsyncThunk(
  "advisor/warnings/generate",
  async (
    body: {
      class_id: string;
      semester_id?: string;
      create_status: "Draft" | "Sent";
      send_channel?: "in_app" | "email";
    },
    { rejectWithValue }
  ) => {
    try {
      return await advisorService.generateWarnings(body);
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message ?? "Không generate được warnings"
      );
    }
  }
);

export const sendWarningsThunk = createAsyncThunk(
  "advisor/warnings/send",
  async (
    body: { warning_ids: string[]; channel?: "in_app" | "email" },
    { rejectWithValue }
  ) => {
    try {
      return await advisorService.sendWarnings(body);
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message ?? "Không gửi được warnings"
      );
    }
  }
);

export const listNotesThunk = createAsyncThunk(
  "advisor/notes/list",
  async (student_id: string, { rejectWithValue }) => {
    try {
      return await advisorService.listNotes(student_id);
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message ?? "Không tải được notes"
      );
    }
  }
);

export const createNoteThunk = createAsyncThunk(
  "advisor/notes/create",
  async (
    body: {
      student_id: string;
      warning_id?: string;
      content: string;
      counseling_date?: string;
      handling_status?: "not_contacted" | "contacted" | "monitoring" | "stable";
      attachment_url?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await advisorService.createNote(body);
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message ?? "Không tạo được note"
      );
    }
  }
);

const advisorSlice = createSlice({
  name: "advisor",
  initialState,
  reducers: {
    setSelectedClass(state, action) {
      state.selectedClassId = action.payload;
    },
    setSelectedSemester(state, action: { payload: string | null }) {
      state.selectedSemesterId = action.payload;
    },
    clearPreview(state) {
      state.preview = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: AdvisorState) => {
      state.status = "loading";
      state.error = null;
    };
    const failed = (state: AdvisorState, action: any) => {
      state.status = "failed";
      state.error = action.payload ?? "Lỗi";
    };

    builder
      .addCase(fetchClassesThunk.pending, loading)
      .addCase(fetchClassesThunk.fulfilled, (state, action: any) => {
        state.status = "succeeded";
        state.classes = action.payload ?? [];
        // auto select first class
        if (!state.selectedClassId && state.classes.length) {
          state.selectedClassId = state.classes[0]?.class?.id ?? null;
        }
      })
      .addCase(fetchClassesThunk.rejected, failed)

      .addCase(fetchSemestersThunk.pending, loading)
      .addCase(fetchSemestersThunk.fulfilled, (state, action: any) => {
        state.status = "succeeded";
        state.semesters = action.payload ?? [];
        // auto select current or first
        if (!state.selectedSemesterId && state.semesters.length) {
          const cur = state.semesters.find((x: any) => x.is_current);
          state.selectedSemesterId = cur?.id ?? state.semesters[0]?.id ?? null;
        }
      })
      .addCase(fetchSemestersThunk.rejected, failed)

      .addCase(fetchDashboardThunk.pending, loading)
      .addCase(fetchDashboardThunk.fulfilled, (state, action: any) => {
        state.status = "succeeded";
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboardThunk.rejected, failed)

      .addCase(listWarningsThunk.pending, loading)
      .addCase(listWarningsThunk.fulfilled, (state, action: any) => {
        state.status = "succeeded";
        state.warnings = action.payload;
      })
      .addCase(listWarningsThunk.rejected, failed)

      .addCase(previewWarningsThunk.pending, loading)
      .addCase(previewWarningsThunk.fulfilled, (state, action: any) => {
        state.status = "succeeded";
        state.preview = action.payload;
      })
      .addCase(previewWarningsThunk.rejected, failed)

      .addCase(generateWarningsThunk.pending, loading)
      .addCase(generateWarningsThunk.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(generateWarningsThunk.rejected, failed)

      .addCase(sendWarningsThunk.pending, loading)
      .addCase(sendWarningsThunk.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(sendWarningsThunk.rejected, failed)

      .addCase(listNotesThunk.pending, loading)
      .addCase(listNotesThunk.fulfilled, (state, action: any) => {
        state.status = "succeeded";
        state.notes = action.payload;
      })
      .addCase(listNotesThunk.rejected, failed)

      .addCase(createNoteThunk.pending, loading)
      .addCase(createNoteThunk.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createNoteThunk.rejected, failed);
  },
});

export const { setSelectedClass, setSelectedSemester, clearPreview } =
  advisorSlice.actions;
export default advisorSlice.reducer;
