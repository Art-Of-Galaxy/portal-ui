import React from 'react';
import { FormInput } from '../../ui/FormInput';
import { FormTextArea } from './FormTextArea';
import { Button } from '../../ui/Button';
import { useSelector, useDispatch } from 'react-redux';
import { FormSelect } from '../../ui/FormSelect';
import { createBrandDevelopment } from '../../../redux/branding_and_design/brandDevelopmentSlice';


interface BrandDevelopmentFormProps {
  onSuccess?: () => void;
}

export function BrandDevelopmentForm({ onSuccess }: BrandDevelopmentFormProps) {
  const dispatch = useDispatch();

  const { loading, error, successMessage } = useSelector((state) => state.brandDevelopment);
  const uid = window !== undefined ? localStorage.getItem('uid') : "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const data = {
        uid: uid,
        service_name: "branding_and_design",
        goals_of_brand_development: formData.get('goals_of_brand_development'),
        why_brand_dev_imp: formData.get('why_brand_dev_imp'),
        brand_name: formData.get('brand_name'),
        industry: formData.get('industry'),
        brand_mission: formData.get('brand_mission'),
        brand_vision: formData.get('brand_vision'),
        benefits: formData.get('benefits'),
        product: formData.get('product'),
        core_values: formData.get('core_values'),
        target_audience: formData.get('target_audience'),
        demographics: formData.get('demographics'),
        brand_personality: formData.get('brand_personality'),
        colors: formData.get('colors'),
        fonts: formData.get('fonts'),
        additional_notes: formData.get('additional_notes'),
        reference: formData.get('reference'),
      }
      dispatch(createBrandDevelopment(data));
console.log('successMessage',successMessage)
      if (successMessage) {
        onSuccess?.()
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          name="goals_of_brand_development"
          label="Goals of Brand Development"
          required
          options={[
            { value: "awareness", label: "Awareness" },
            { value: "trust", label: "Trust" },
            { value: "differentiation", label: "Differentiation" },
            { value: "growth", label: "Growth" },
          ]}
        />

        <FormSelect
          name="why_brand_dev_imp"
          label="Why is Brand Development Important?"
          required
          options={[
            { value: "create_recognition", label: "Create Recognition" },
            { value: "builds_loyalty", label: "Builds Loyalty" },
            { value: "drives_business_value", label: "Drives Business Value" },
            { value: "support_marketing_efforts", label: "Support Marketing Efforts" },
            { value: "establishes_authority", label: "Establishes Authority" },
          ]}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <FormInput
          name="brand_name"
          label="Brand Name"
          placeholder="The official name that represents your brand"
          required
        />
        <FormInput
          name="industry"
          label="Industry"
          placeholder="The official name that represents your brand"
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
        label="Product"
        placeholder="Describe your main product or service"
        required
      />
      <FormInput
        name="benefits"
        label="Benefits"
        placeholder="Describe your main benifits"
        required
      />

      <FormTextArea
        name="core_values"
        label="Core Values or Key Messages"
        placeholder='What main points or values should always come through? Example (GreenWave): "Sustainability, community engagement, and trustworthiness."'
        required
      />
      <FormTextArea
        name="target_audience"
        label="Target Audience"
        placeholder='What main points or values should always come through? Example (GreenWave): "Sustainability, community engagement, and trustworthiness."'
        required
      />


      <FormTextArea
        name="demographics"
        label="Demographics"
        placeholder='What main points or values should always come through? Example (GreenWave): "Sustainability, community engagement, and trustworthiness."'
        required
      />


      <FormTextArea
        name="brand_personality"
        label="Brand Personality"
        placeholder='What main points or values should always come through? Example (GreenWave): "Sustainability, community engagement, and trustworthiness."'
        required
      />

      <FormTextArea
        name="colors"
        label="Colors"
        placeholder='What main points or values should always come through? Example (GreenWave): "Sustainability, community engagement, and trustworthiness."'
        required
      />

      <FormTextArea
        name="fonts"
        label="Fonts"
        placeholder='What main points or values should always come through? Example (GreenWave): "Sustainability, community engagement, and trustworthiness."'
        required
      />


      {/* Additional Notes */}
      <div className="space-y-6">
        <FormTextArea
          name="additional_notes"
          label="Additional Notes"
          placeholder="Any other information or specific requirements"
        />
      </div>
      <FormTextArea
        name="reference"
        label="Reference"
        placeholder='Any Reference?'
        required
      />
      <Button type="submit" size="large" fullWidth>
        Submit Brand Development Brief
      </Button>
    </form>
  );
}