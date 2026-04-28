import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// API Base URL
const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

// Async Thunk for creating a user and logging in immediately
export const signUpUser = createAsyncThunk(
    "auth/signUpUser",
    async (userData, { rejectWithValue }) => {
        try {
            const signUpResponse = await fetch(`${API_URL}/staff/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    dob: userData.dob || null,
                    status: 1,
                }),
            });

            const signUpData = await signUpResponse.json();
            if (!signUpResponse.ok || !signUpData.status) {
                throw new Error(signUpData?.message || "Signup failed");
            }

            const loginResponse = await fetch(`${API_URL}/authentication/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password,
                }),
            });

            const loginData = await loginResponse.json();
            if (!loginResponse.ok || !loginData.status || !loginData.token) {
                throw new Error(loginData?.message || "Signup succeeded but auto-login failed");
            }

            localStorage.setItem("accessToken", loginData.token);
            localStorage.setItem("token", loginData.token);
            if (loginData?.user?.name) {
                localStorage.setItem("user_name", loginData.user.name);
            }
            localStorage.setItem("user_email", loginData?.user?.email || userData.email);

            return {
                signUp: signUpData,
                login: loginData,
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const companySlice = createSlice({
    name: "auth",
    initialState: {
        company: null,
        user: null,
        token: localStorage.getItem("accessToken") || localStorage.getItem("token") || null,
        isLoading: false,
        error: null,
    },
    reducers: {
        signUpLogout: (state) => {
            state.company = null;
            state.user = null;
            state.token = null;
            localStorage.removeItem("accessToken");
            localStorage.removeItem("token");
            localStorage.removeItem("user_email");
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(signUpUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signUpUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.company = action.payload.signUp;
                state.user = action.payload.login?.user || null;
                state.token = action.payload.login?.token || null;
            })
            .addCase(signUpUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { signUpLogout } = companySlice.actions;
export default companySlice.reducer;
