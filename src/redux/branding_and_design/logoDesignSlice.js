import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";

export const createLogoDesign = createAsyncThunk(
    '/branding-and-design/logo-design/creatLogoDesign',
    async (data, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/branding-and-design/logo-design', data)
            return response.data;
        } catch (e) {
            console.log(e);
            return rejectWithValue(e.response?.data || "Failed to create campaign");

        }
    }
)


const logoDesignSlice = createSlice({
    name: "logoDesign",
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
            .addCase(createLogoDesign.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createLogoDesign.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload);
                state.successMessage = "Request created successfully!";

            })
            .addCase(createLogoDesign.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }

})


export const { clearMessage } = logoDesignSlice.actions;
export default logoDesignSlice.reducer;

