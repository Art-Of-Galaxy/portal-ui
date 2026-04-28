import React, { useState } from 'react';
import { FormInput } from '../../ui/FormInput';
import { FormTextArea } from '../brand/FormTextArea';
import { ColorPalette } from './ColorPalette';
import { Button } from '../../ui/Button';
import { FormSelect } from '../../ui/FormSelect';
import { useSelector, useDispatch } from 'react-redux';
import { createLogoDesign } from '../../../redux/branding_and_design/logoDesignSlice';

interface LogoDesignFormProps {
  onSuccess?: () => void;
}

export function LogoDesignForm({ onSuccess }: LogoDesignFormProps) {
  const dispatch = useDispatch();

  const { loading, error, successMessage } = useSelector((state) => state.logoDesign);


  const uid = window !== undefined ? localStorage.getItem('uid') : "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

      const formData = new FormData(e.currentTarget);
      const data = {
        uid: uid,
        company_name: formData.get('company_name'),
        industry: formData.get('industry'),
        brand_mission: formData.get('brand_mission'),
        brand_vision: formData.get('brand_vision'),
        product_service: formData.get('product'),
        competitors: formData.get('competitors'),
        color_selection: formData.getAll('colors'),
        logo_communication: formData.get('logo_communication'),
        shape_geometrym: formData.get('shape_geometrym'),
        additional_notes: formData.get('notes') || "",
        logo_style: formData.get('logo_style'),
        service_name: "branding_and_design"
      }
    dispatch(createLogoDesign(data));
    console.log('successMessage',successMessage)
    if(successMessage){
      onSuccess?.()
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
     

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          name="company_name"
          label="Company Name"
          placeholder="Enter your brand name"
          required
        />
        <FormInput
          name="industry"
          label="Industry"
          placeholder="Enter your industry"
          required
        />
      </div>
      <FormInput
        name="brand_mission"
        label="Brand Mission"
        placeholder="A concise description of the brand's purpose and goals to guide the logo&#x27;s message."
        required
      />
      <FormInput
        name="brand_vision"
        label="Brand Vission"
        placeholder="Long-term aspirations of the brand to ensure the logo aligns with future growth."
        required
      />


      <FormInput
        name="product"
        label="Product/Service"
        placeholder="Describe your main product or service"
        required
      />

      <FormTextArea
        name="competitors"
        label="Competitors"
        placeholder="List competitors' websites."
      />

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Color Selection
        </label>
        <ColorPalette />
      </div>

      <FormTextArea
        name="logo_style"
        label="Logo Style"
        placeholder="Define the feeling or perception the logo should create ( trust, excitement, innovation etc.)"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          name="logo_style"
          label="Logo Style"
          required
          options={[
            { value: "wordmark", label: "Wordmark" },
            { value: "icon_symbol", label: "Icon/Symbol" },
            { value: "combination", label: "Combination" },
            { value: "emblem", label: "Emblem" },
          ]}
        />

        <FormSelect
          name="shape_geometrym"
          label="Shapes and Geometrym"
          required
          options={[
            { value: "circles", label: "Circles" },
            { value: "squares_rectangles", label: "Squares/Rectangles" },
            { value: "triangles", label: "Triangles" },
            { value: "linkedin", label: "LinkedIn" },
            { value: "NA", label: "N/A" },
          ]}
        />
      </div>
      <FormTextArea
        name="logo_communication"
        label="Logo Communication"
        placeholder="What are your brand's core values?"
        required
      />
      <FormTextArea
        name="notes"
        label="Additional Notes"
        placeholder="Any other preferences or requirements?"
      />

      <div className="pt-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}
        <Button
          type="submit"
          size="large"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Design Brief'}
        </Button>
      </div>
    </form>
  );
}