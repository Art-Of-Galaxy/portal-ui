import React, { useState } from 'react';
import { FormInput } from '../../ui/FormInput';
import { FormTextArea } from './FormTextArea';
import { Button } from '../../ui/Button';
import { useSelector, useDispatch } from 'react-redux';
import { createBrandGuideLine } from '../../../redux/branding_and_design/brandGuidelineSlice';


interface BrandGuidelinesFormProps {
  onSuccess?: () => void;
}

export function BrandGuidelinesForm({ onSuccess }: BrandGuidelinesFormProps) {
  const dispatch = useDispatch();

  const { loading, error, successMessage } = useSelector((state) => state.brandGuideLine);
  const uid = window !== undefined ? localStorage.getItem('uid') : "";
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = {
      uid: uid,
      service_name: "branding_and_design",
      brand_overview: { 
        core_brand_assets: formData.get('core_brand_assets'),
        whats_working: formData.get('whats_working')
    },
    brand_voice_and_overview: { 
        brand_voice: formData.get('brand_voice'),
        core_values: formData.get('core_values')
    },
    visual_identity_essential: { 
        color_palette: formData.get('color_palette'),
        typography: formData.get('typography')
    },
    brand_usages_and_consistency: { 
        primary_use_cases: formData.get('primary_use_cases'),
        inconsistencies_noticed: formData.get('inconsistencies_noticed')
    },
    additional_requests: { 
        additional_deliverables: formData.get('additional_deliverables'),
        additional_notes: formData.get('additional_notes'),
        reference_materials : formData.get('reference_materials'),
    },
    }
    dispatch(createBrandGuideLine(data));

    if (successMessage) {
      onSuccess?.()
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Brand Overview */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">1. Brand Overview</h2>

        <FormTextArea
          name="core_brand_assets"
          label="Core Brand Assets"
          placeholder="What existing resources or materials do you already have? (logo files, color palette, fonts) Attach files"
          required
        />

        <div className="grid grid-cols-1 gap-6">
          <FormTextArea
            name="whats_working"
            label="What's Working"
            placeholder="Which aspects of your current brand do you love?"
            required
          />
          {/* <FormTextArea
            name="needs_update"
            label="What Needs an Update"
            placeholder='Example (GreenWave): "We love our tagline but find our social media graphics inconsistent."'
            required
          /> */}
        </div>
      </div>

      {/* 2. Brand Voice & Values */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">2. Brand Voice & Values</h2>

        <FormTextArea
          name="brand_voice"
          label="Brand Voice"
          placeholder='How would you describe your brand&#x27;s tone (friendly, authoritative, playful)? Example (GreenWave): "Conversational and warm, but we&#x27;d like more professionalism in B2B channels.'
        required
        />

        <FormTextArea
          name="core_values"
          label="Core Values or Key Messages"
          placeholder='What main points or values should always come through? Example (GreenWave): "Sustainability, community engagement, and trustworthiness."'
          required
        />
      </div>

      {/* 3. Visual Identity Essentials */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">3. Visual Identity Essentials</h2>

        <div className="grid grid-cols-1 gap-6">
          <FormTextArea
            name="color_palette"
            label="Current Color Palette"
            placeholder='Are your current colors staying? Any new shades needed? Example (GreenWave): "Keep our primary green, add a bright aqua accent."'
            required
          />
          <FormTextArea
            name="typography"
            label="Typography"
            placeholder="Which fonts do you use? Should they be standardized or refreshed?"
          />
        </div>

        {/* <div className="grid grid-cols-1 gap-6">
          <FormTextArea
            name="current_fonts"
            label="Current Typography"
            placeholder="Which fonts do you use?"
            required
          />
          <FormTextArea
            name="font_standardization"
            label="Typography Standardization"
            placeholder='Example (GreenWave): "We&#x27;re using Open Sans but want a matching serif for printed materials."'
          required
          />
        </div> */}
      </div>

      {/* 4. Brand Usage & Consistency */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">4. Brand Usage & Consistency</h2>

        <FormTextArea
          name="primary_use_cases"
          label="Primary Use Cases"
          placeholder='Where will you apply your brand most frequently? Example (GreenWave): "Mainly on social media, event brochures, and storefront signage."'
          required
        />

        <FormTextArea
          name="inconsistencies_noticed"
          label="Inconsistencies Noticed"
          placeholder='Example (GreenWave): "We have different logo sizes on each social channel, and some posts stray from our brand colors."'
          required
        />
      </div>

      {/* 5. Additional Requests */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">5. Additional Requests</h2>

        <FormTextArea
          name="additional_deliverables"
          label="Additional Deliverables"
          placeholder='Any extra requests (email signatures, mockups, banners, business cards, stickers, sales sheets)? Example (GreenWave): "A simple one-page PDF style guide for quick reference would be very helpful."'
        />

        <FormTextArea
          name="additional_notes"
          label="Notes"
          placeholder="Additional insights or comments related to the branding process"
        />

        <FormTextArea
          name="reference_materials"
          label="References"
          placeholder="Attach reference materials (files, articles) for further research"
        />
      </div>

      <Button type="submit" size="large" fullWidth disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Brand Guidelines Brief'}
      </Button>
    </form>
  );
}