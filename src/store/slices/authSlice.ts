import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService, type LoginRequest } from '@/services/auth.service';
import { tokenStorage, type AuthUser } from '@/services/tokenStorage';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  bootstrapping: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: tokenStorage.getUser(),
  accessToken: tokenStorage.getAccessToken(),
  refreshToken: tokenStorage.getRefreshToken(),
  status: 'idle',
  bootstrapping: true,
  error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginRequest, { rejectWithValue }) => {
    try {
      const data = await authService.login(payload);
      return data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? 'Đăng nhập thất bại');
    }
  },
);

export const bootstrapAuthThunk = createAsyncThunk<
  { user: AuthUser | null; access_token: string | null; refresh_token: string | null },
  void,
  { rejectValue: string }
>('auth/bootstrap', async (_: void, thunkApi) => {
  const { rejectWithValue } = thunkApi;
  try {
    const user = tokenStorage.getUser();
    const at = tokenStorage.getAccessToken();
    const rt = tokenStorage.getRefreshToken();

    if (user && at && rt) return { user, access_token: at, refresh_token: rt };

    if (user && rt && !at) {
      const tokens = await authService.refresh(rt);
      tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
      return { user, access_token: tokens.access_token, refresh_token: tokens.refresh_token };
    }

    return { user: null, access_token: null, refresh_token: null };
  } catch {
    tokenStorage.clearAll();
    return rejectWithValue('Phiên đăng nhập hết hạn');
  }
});


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      tokenStorage.clearAll();
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: any) => {
        const { user, access_token, refresh_token } = action.payload;

        tokenStorage.setUser(user);
        tokenStorage.setTokens(access_token, refresh_token);

        state.user = user;
        state.accessToken = access_token;
        state.refreshToken = refresh_token;
        state.status = 'succeeded';
      })
      .addCase(loginThunk.rejected, (state, action: any) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Đăng nhập thất bại';
      })

      .addCase(bootstrapAuthThunk.pending, (state) => {
        state.bootstrapping = true;
      })
      .addCase(bootstrapAuthThunk.fulfilled, (state, action: any) => {
        state.bootstrapping = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
      })
      .addCase(bootstrapAuthThunk.rejected, (state, action: any) => {
        state.bootstrapping = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload ?? 'Bootstrap failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
