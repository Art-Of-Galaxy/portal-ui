import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCampaign, clearMessage } from "../../../redux/socialMediaSlice.js";
import { FormInput } from "../../ui/FormInput";
import { FormSelect } from "../../ui/FormSelect";
import { FormTextArea } from "../brand/FormTextArea";
import { Button } from "../../ui/Button";

export function SocialMediaForm({ onSuccess }) {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((state) => state.socialMedia);
  const uid = window !== undefined ? localStorage.getItem('uid') : "";

  const [formData, setFormData] = useState({
    project_name: "",
    platforms: "",
    goals: "",
    target_audience: "",
    content_type: "",
    posting_frequency: "",
    brand_voice: "",
    additional_notes: "",
  });

  // useEffect(() => {
  //   if (successMessage || error) {
  //     setTimeout(() => {
  //       dispatch(clearMessage());
  //     }, 3000);
  //   }
  // }, [successMessage, error, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(createCampaign({ ...formData, uid }));
    if(successMessage){
      onSuccess()
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">


      <FormInput name="project_name" label="Project Name" placeholder="Enter project name" value={formData.project_name} onChange={handleChange} required />

      <FormSelect
        name="platforms"
        label="Primary Platform"
        value={formData.platforms}
        onChange={handleChange}
        required
        options={[
          { value: "instagram", label: "Instagram" },
          { value: "facebook", label: "Facebook" },
          { value: "twitter", label: "Twitter" },
          { value: "linkedin", label: "LinkedIn" },
          { value: "tiktok", label: "TikTok" },
        ]}
      />

      <FormTextArea name="goals" label="Campaign Goals" placeholder="What are your main goals for this campaign?" value={formData.goals} onChange={handleChange} required />

      <FormTextArea name="target_audience" label="Target Audience" placeholder="Describe your target audience" value={formData.target_audience} onChange={handleChange} required />

      <FormSelect
        name="content_type"
        label="Primary Content Type"
        value={formData.content_type}
        onChange={handleChange}
        required
        options={[
          { value: "photos", label: "Photos/Images" },
          { value: "videos", label: "Videos" },
          { value: "stories", label: "Stories" },
          { value: "mixed", label: "Mixed Content" },
        ]}
      />

      <FormSelect
        name="posting_frequency"
        label="Posting Frequency"
        value={formData.posting_frequency}
        onChange={handleChange}
        required
        options={[
          { value: "daily", label: "Daily" },
          { value: "3-5-week", label: "3-5 Times per Week" },
          { value: "weekly", label: "Weekly" },
          { value: "custom", label: "Custom Schedule" },
        ]}
      />

      <FormTextArea name="brand_voice" label="Brand Voice" placeholder="Describe your brand's voice and tone" value={formData.brand_voice} onChange={handleChange} required />

      <FormTextArea name="additional_notes" label="Additional Notes" placeholder="Any other requirements or notes?" value={formData.additional_notes} onChange={handleChange} />
      {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}
      {error && <p className="text-red-500 text-center">{error?.error?.message}</p>}
      <Button type="submit" size="large" fullWidth disabled={loading}>
        {loading ? "Submitting..." : "Submit Campaign Brief"}
      </Button>
    </form>
  );
}
