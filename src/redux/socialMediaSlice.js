import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../api/apiClient";
// const API_URL = import.meta.env.VITE_PUBLIC_API_URL;


// Async action to create a social media campaign
export const createCampaign = createAsyncThunk(
  "socialMedia/createCampaign",
  async (campaignData, { rejectWithValue }) => {
    try {
        console.log('slice',campaignData);
      const response = await apiClient.post("/social-media-campaigns/", campaignData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create campaign");
    }
  }
);

const socialMediaSlice = createSlice({
  name: "socialMedia",
  initialState: {
    campaigns: [],
    loading: false,
    error: null,
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
      .addCase(createCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns.push(action.payload);
        state.successMessage = "Campaign created successfully!";
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessage } = socialMediaSlice.actions;
export default socialMediaSlice.reducer;
