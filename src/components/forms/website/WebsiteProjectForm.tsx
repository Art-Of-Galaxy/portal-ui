import React, { useState } from 'react';
import { FormInput } from '../../ui/FormInput';
import { FormSelect } from '../../ui/FormSelect';
import { FormTextArea } from '../brand/FormTextArea';
import { Button } from '../../ui/Button';
// import { supabase } from '../../../lib/supabase';

export function WebsiteProjectForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      console.log('formData',formData)
      const data = {
        
      }

      // const { data: { user } } = await supabase.auth.getUser();
      
      // if (!user) throw new Error('No authenticated user');

      // const { error } = await supabase.from('website_projects').insert([{
      //   user_id: user.id,
      //   project_name: formData.get('project_name'),
      //   website_type: formData.get('website_type'),
      //   target_audience: formData.get('target_audience'),
      //   features: formData.get('features'),
      //   design_preferences: formData.get('design_preferences'),
      //   timeline: formData.get('timeline'),
      //   budget_range: formData.get('budget_range'),
      //   additional_notes: formData.get('additional_notes')
      // }]);

      // if (error) throw error;
      // onSuccess?.();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput
        name="project_name"
        label="Project Name"
        placeholder="Enter project name"
        required
      />

      <FormSelect
        name="website_type"
        label="Website Type"
        required
        options={[
          { value: 'business', label: 'Business Website' },
          { value: 'ecommerce', label: 'E-commerce' },
          { value: 'portfolio', label: 'Portfolio' },
          { value: 'blog', label: 'Blog' },
          { value: 'web-app', label: 'Web Application' }
        ]}
      />

      <FormTextArea
        name="target_audience"
        label="Target Audience"
        placeholder="Describe your target audience"
        required
      />

      <FormTextArea
        name="features"
        label="Required Features"
        placeholder="List the main features you need"
        required
      />

      <FormTextArea
        name="design_preferences"
        label="Design Preferences"
        placeholder="Describe your design preferences"
        required
      />

      <FormSelect
        name="timeline"
        label="Project Timeline"
        required
        options={[
          { value: '1-2-months', label: '1-2 Months' },
          { value: '2-3-months', label: '2-3 Months' },
          { value: '3-6-months', label: '3-6 Months' },
          { value: '6-plus-months', label: '6+ Months' }
        ]}
      />

      <FormSelect
        name="budget_range"
        label="Budget Range"
        required
        options={[
          { value: 'basic', label: '$5,000 - $10,000' },
          { value: 'standard', label: '$10,000 - $25,000' },
          { value: 'premium', label: '$25,000 - $50,000' },
          { value: 'enterprise', label: '$50,000+' }
        ]}
      />

      <FormTextArea
        name="additional_notes"
        label="Additional Notes"
        placeholder="Any other requirements or notes?"
      />

      <Button type="submit" size="large" fullWidth disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Project Brief'}
      </Button>
    </form>
  );
}