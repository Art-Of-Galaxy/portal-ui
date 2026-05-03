import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// API Base URL (Replace with your actual API)
// const API_URL = "http://localhost:7071/auth/login";
const API_URL = import.meta.env.VITE_PUBLIC_API_URL;


// Async Thunk for login
export const loginUser = createAsyncThunk(
  "auth",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/authentication/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      // Success: { message: 'Login successful', token, status: true }
      // Failure: { message: 'Invalid credentials' }

      if (!data.status || !data.token) {
        // Backend sends 401 for invalid credentials, so handle both error and 401
        throw new Error(data.message || "Login failed");
      }

      // Store token in localStorage
      localStorage.setItem("accessToken", data.token);
      if (data?.user?.name) {
        localStorage.setItem("user_name", data.user.name);
      }
      localStorage.setItem("user_email", data?.user?.email || userData.email);
      if (data?.user?.profile_photo_url) {
        localStorage.setItem("profile_photo_url", data.user.profile_photo_url);
      } else {
        localStorage.removeItem("profile_photo_url");
      }

      return {
        user: data.user || null,
        token: data.token,
        message: data.message,
        status: data.status,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


const authSlice = createSlice({
  name: "auth/loginUser",
  initialState: {
    user: null,
    token: localStorage.getItem("accessToken") || null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user_email");
      localStorage.removeItem("profile_photo_url");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
