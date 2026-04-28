import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";

export const createBrandGuideLine = createAsyncThunk(
    '/branding-and-design/brand-guide/createBrandGuideLine',
    async (data, { rejectWithValue }) => {
            console.log('data',data)
        try {
            const response = await apiClient.post('/branding-and-design/brand-guide', data)
            console.log('response',response)
            return response.data;
        } catch (e) {
            console.log(e);
            return rejectWithValue(e.response?.data || "Failed to create campaign");

        }
    }
)


const brandGuideLineSlice = createSlice({
    name: "brandGuideLine",
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
            .addCase(createBrandGuideLine.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBrandGuideLine.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload);
                state.successMessage = "Request created successfully!";

            })
            .addCase(createBrandGuideLine.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }

})


export const { clearMessage } = brandGuideLineSlice.actions;
export default brandGuideLineSlice.reducer;

