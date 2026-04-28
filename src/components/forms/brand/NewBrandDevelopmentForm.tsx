import React, { useState } from 'react';
import { FormInput } from '../../ui/FormInput';
import { FormSelect } from '../../ui/FormSelect';
import { FormTextArea } from './FormTextArea';
import { Button } from '../../ui/Button';
// import { supabase } from '../../../lib/supabase';

interface NewBrandDevelopmentFormProps {
  onSuccess?: () => void;
}

export function NewBrandDevelopmentForm({ onSuccess }: NewBrandDevelopmentFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const formData = new FormData(e.currentTarget);
      // const { error } = await supabase.from('brand_development').insert([{
      //   user_id: user.id,
      //   brand_name: formData.get('brand_name'),
      //   industry: formData.get('industry'),
      //   product: formData.get('product'),
      //   brand_mission: formData.get('brand_mission'),
      //   brand_vision: formData.get('brand_vision'),
      //   benefits: formData.get('benefits'),
      //   differentiation: formData.get('differentiation'),
      //   core_values: formData.get('core_values'),
      //   target_audience: {
      //     age: formData.get('age'),
      //     gender: formData.get('gender'),
      //     location: formData.get('location'),
      //     income: formData.get('income'),
      //     education: formData.get('education')
      //   },
      //   brand_positioning: formData.get('brand_positioning'),
      //   brand_personality: {
      //     traits: [
      //       formData.get('personality_trait_1'),
      //       formData.get('personality_trait_2'),
      //       formData.get('personality_trait_3')
      //     ]
      //   },
      //   visual_identity: {
      //     colors: formData.get('colors'),
      //     fonts: formData.get('fonts')
      //   },
      //   notes: formData.get('notes'),
      //   references: formData.get('references')
      // }]);

      if (error) throw error;
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Goals of Brand Development</h2>
        <div className="bg-[#1E2E42] p-4 rounded-lg space-y-2">
          <p className="text-white"><span className="font-medium">Awareness:</span> Making your brand recognizable in your target market.</p>
          <p className="text-white"><span className="font-medium">Trust:</span> Building credibility and loyalty among customers.</p>
          <p className="text-white"><span className="font-medium">Differentiation:</span> Standing out from competitors with unique values and offerings.</p>
          <p className="text-white"><span className="font-medium">Growth:</span> Expanding reach, engagement, and revenue over time.</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Why is Brand Development Important?</h2>
        <div className="bg-[#1E2E42] p-4 rounded-lg space-y-2">
          <p className="text-white">1. <span className="font-medium">Creates Recognition:</span> Strong branding makes your business instantly identifiable.</p>
          <p className="text-white">2. <span className="font-medium">Builds Loyalty:</span> Customers are more likely to remain loyal to a brand they trust and relate to.</p>
          <p className="text-white">3. <span className="font-medium">Drives Business Value:</span> A well-established brand can command higher prices and attract more customers.</p>
          <p className="text-white">4. <span className="font-medium">Supports Marketing Efforts:</span> Consistent branding enhances the effectiveness of marketing campaigns.</p>
          <p className="text-white">5. <span className="font-medium">Establishes Authority:</span> A strong brand is perceived as a leader in its industry.</p>
        </div>
      </div>

      <div className="space-y-6">
        <FormInput
          name="brand_name"
          label="Brand Name"
          placeholder="The official name that represents your brand"
          required
        />

        <FormInput
          name="industry"
          label="Industry"
          placeholder="Specify the industry"
          required
        />

        <FormTextArea
          name="product"
          label="Product/Service"
          placeholder="Description of the product or services being offered"
          required
        />

        <FormTextArea
          name="brand_mission"
          label="Brand Mission"
          placeholder='Example: "Empowering businesses with eco-friendly solutions."'
          required
        />

        <FormTextArea
          name="brand_vision"
          label="Brand Vision"
          placeholder='Example: "To be the global leader in sustainable packaging."'
          required
        />

        <FormTextArea
          name="benefits"
          label="Benefits"
          placeholder="Benefits of the product or service"
          required
        />

        <FormTextArea
          name="differentiation"
          label="Differentiation"
          placeholder="What makes your product stand out from competitors?"
          required
        />

        <FormTextArea
          name="core_values"
          label="Core Values"
          placeholder="The fundamental beliefs and principles that drive your brand and its operations"
          required
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Target Audience</h3>
          
          <FormInput
            name="age"
            label="Age Range"
            placeholder="Specific age range or generation"
            required
          />

          <FormSelect
            name="gender"
            label="Target Gender"
            options={[
              { value: 'all', label: 'All Genders' },
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' }
            ]}
            required
          />

          <FormInput
            name="location"
            label="Geographic Focus"
            placeholder="Urban, rural, regional, global"
            required
          />

          <FormSelect
            name="income"
            label="Income Bracket"
            options={[
              { value: 'low', label: 'Low Income' },
              { value: 'middle', label: 'Middle Income' },
              { value: 'high', label: 'High Income' }
            ]}
            required
          />

          <FormInput
            name="education"
            label="Education Level"
            placeholder="Educational background of your audience"
            required
          />
        </div>

        <FormTextArea
          name="brand_positioning"
          label="Brand Positioning"
          placeholder='Example: "Tesla positions itself as a leader in sustainable, high-performance vehicles."'
          required
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Brand Personality</h3>
          <p className="text-sm text-gray-400">Three words to describe the brand personality</p>
          
          <FormInput
            name="personality_trait_1"
            placeholder="e.g., Trustworthy"
            required
          />
          <FormInput
            name="personality_trait_2"
            placeholder="e.g., Dynamic"
            required
          />
          <FormInput
            name="personality_trait_3"
            placeholder="e.g., Approachable"
            required
          />
        </div>

        <FormTextArea
          name="colors"
          label="Color Palette"
          placeholder="Describe your preferred color scheme"
          required
        />

        <FormSelect
          name="fonts"
          label="Font Style"
          options={[
            { value: 'traditional', label: 'Traditional and professional' },
            { value: 'modern', label: 'Clean and modern' },
            { value: 'elegant', label: 'Elegant and sophisticated' },
            { value: 'bold', label: 'Bold and decorative' },
            { value: 'technical', label: 'Technical and modern' }
          ]}
          required
        />

        <FormTextArea
          name="notes"
          label="Additional Notes"
          placeholder="Additional insights or comments related to the branding process"
        />

        <FormTextArea
          name="references"
          label="References"
          placeholder="Attach reference materials (files, articles) for further research"
        />
      </div>

      <Button type="submit" size="large" fullWidth disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Brand Development Brief'}
      </Button>
    </form>
  );
}