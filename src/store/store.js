import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/authSlice.js";
import userReducer from "../redux/signUpSlice.js";
import socialMediaReducer from "../redux/socialMediaSlice.js";
import logoDesignReducer from "../redux/branding_and_design/logoDesignSlice.js";
import brandGuideLineReducer from "../redux/branding_and_design/brandGuidelineSlice.js";
import brandDevelopmentReducer from "../redux/branding_and_design/brandDevelopmentSlice.js";


const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        socialMedia: socialMediaReducer,
        logoDesign: logoDesignReducer,
        brandGuideLine: brandGuideLineReducer,
        brandDevelopment: brandDevelopmentReducer,

    },
});

export default store;
