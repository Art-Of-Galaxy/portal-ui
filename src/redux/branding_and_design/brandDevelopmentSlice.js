import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";

export const createBrandDevelopment = createAsyncThunk(
    '/branding-and-design/brand-development/createBrandDevelopment',
    async (data, { rejectWithValue }) => {
            console.log('data',data)
        try {
            const response = await apiClient.post('/branding-and-design/brand-development', data)
            console.log('response',response)
            return response.data;
        } catch (e) {
            console.log(e);
            return rejectWithValue(e.response?.data || "Failed to create campaign");

        }
    }
)


const brandDevelopmentSlice = createSlice({
    name: "brandDevelopment",
    initialState: {
        loading: false,
        error: null,
        data: [],
        successMessage: "",

    },
    reducers: {
        clearMessage: (state) => {
            state.successMessage = "";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createBrandDevelopment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBrandDevelopment.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload);
                state.successMessage = "Request created successfully!";

            })
            .addCase(createBrandDevelopment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }

})


export const { clearMessage } = brandDevelopmentSlice.actions;
export default brandDevelopmentSlice.reducer;

