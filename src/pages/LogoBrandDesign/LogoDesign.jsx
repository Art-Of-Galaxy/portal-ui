// src/pages/LogoDesign.jsx
import React, { useState } from 'react';

const steps = [
    'Company Info',
    'Logo Style Preferences',
    'Color Preferences',
    'Typography Preferences',
    'Reference Logos',
    'Competitor Info',
    'Confirmation'
];

const styleOptions = {
    Vintage: ['The Wind Peak', 'Alligator', 'Leopard', 'Tiger', 'The Patriot'],
    Mascot: ['MikeKebab', 'Delicious', 'Squirrel', 'Lions', 'The Deer'],
    Wordmark: ['ACADIA', 'ZOH', 'Ongoo', 'Art of Galaxy', 'Bionast'],
    Monogram: ['KR', 'Spider', 'EA', 'W', 'Retro KR'],
    Combination: ['Rocketstar', 'Travelgood', 'Next', 'Adventure', 'Express'],
    Minimalist: ['Nude Concept', 'Royal Crown', 'Klass Gunn', 'MK', 'House Smith']
};

const colors = [
    { name: 'Blue', desc: 'Depth, trust, loyalty, confidence, intelligence, and calmness.' },
    { name: 'Purple', desc: 'Royalty, power, nobility, luxury, wealth, extravagance, and wisdom.' },
    { name: 'Pink', desc: 'Sweet, innocent, sensitive, passionate, playful, and loving.' },
    { name: 'Red', desc: 'Power, energy, passion, desire, speed, strength, love, and interest.' },
    { name: 'Orange', desc: 'Joy, enthusiasm, happiness, creativity, determination, and stimulation.' },
    { name: 'Yellow', desc: 'Sunshine, joy, happiness, intellect, cheerfulness, and energy.' },
    { name: 'Green', desc: 'Nature, growth, harmony, freshness, safety, and healing.' },
    { name: 'Teal', desc: 'Creativity, inspiration, excitement, tranquility, and youth.' },
    { name: 'Grey', desc: 'Power, elegance, reliability, intelligence, modesty, and maturity.' }
];

const typographyStyles = ['Serif', 'Sans Serif', 'Script', 'Modern', 'Display', 'Condensed'];

const LogoDesign = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({ selectedStyles: [], selectedColors: [], selectedFonts: [] });
    const [submittedImageUrl, setSubmittedImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
    const updateField = (field, value) => setFormData({ ...formData, [field]: value });

    const toggleStyle = (style) => {
        const styles = formData.selectedStyles || [];
        updateField(
            'selectedStyles',
            styles.includes(style) ? styles.filter((s) => s !== style) : [...styles, style]
        );
    };

    const toggleColor = (color) => {
        const selected = formData.selectedColors || [];
        updateField(
            'selectedColors',
            selected.includes(color) ? selected.filter((c) => c !== color) : [...selected, color]
        );
    };

    const toggleFont = (font) => {
        const selected = formData.selectedFonts || [];
        updateField(
            'selectedFonts',
            selected.includes(font) ? selected.filter((f) => f !== font) : [...selected, font]
        );
    };

    const submitFormData = async (data) => {
        try {
            setLoading(true);
            setSubmittedImageUrl(null);

            const response = await fetch('https://artofgalaxy.app.n8n.cloud/webhook/42caca0b-7c29-4920-ae8a-616f47615ac3', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`API call failed with status ${response.status}`);
            }

            const result = await response.json();
            setSubmittedImageUrl(result.imageurl);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-[#0f172a] rounded-xl shadow-lg overflow-hidden">
                {/* Left column */}
                <div className="bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white p-8 flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Logo Design</h2>
                        <p className="text-sm mb-6">
                            Capture your brand’s essence with versatile, high-impact logos.
                        </p>
                        <ul className="text-sm list-disc list-inside space-y-1 mb-8">
                            <li>Custom concepts aligned with your values</li>
                            <li>Formats for print, digital & packaging</li>
                            <li>Multiple revisions to perfect your vision</li>
                        </ul>
                        <div className="bg-[#1e40af] p-4 rounded-lg text-white">
                            <p className="font-semibold mb-2">Prefer a more personalized experience?</p>
                            <p className="text-sm mb-3">Schedule a meeting to discuss your ideas in depth.</p>
                            <button className="w-full bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded">
                                Schedule a meeting
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right column: Form */}
                <div className="lg:col-span-2 p-8 bg-[#111827] text-white">
                    <h2 className="text-xl font-bold mb-6">{steps[currentStep]}</h2>

                    {/* STEP FORMS */}
                    {currentStep === 0 && (
                        <div className="space-y-4">
                            <input type="text" placeholder="Company or Brand" className="w-full p-2 bg-black text-white rounded" onChange={(e) => updateField('company', e.target.value)} />
                            <input type="text" placeholder="Tagline (Optional)" className="w-full p-2 bg-black text-white rounded" onChange={(e) => updateField('tagline', e.target.value)} />
                            <textarea placeholder="Business Description" className="w-full p-2 bg-black text-white rounded" onChange={(e) => updateField('description', e.target.value)}></textarea>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-4">
                            {Object.entries(styleOptions).map(([category, styles]) => (
                                <div key={category}>
                                    <h3 className="text-lg font-semibold mb-2">{category}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {styles.map((style) => (
                                            <button
                                                key={style}
                                                className={`px-3 py-1 rounded border ${formData.selectedStyles?.includes(style) ? 'bg-blue-500' : 'bg-gray-700'}`}
                                                onClick={() => toggleStyle(style)}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <p className="text-sm">Pick 2–4 colors you prefer:</p>
                            <div className="grid grid-cols-2 gap-4">
                                {colors.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => toggleColor(color.name)}
                                        className={`p-3 rounded text-left border ${formData.selectedColors?.includes(color.name) ? 'bg-blue-500' : 'bg-gray-800'}`}
                                    >
                                        <strong>{color.name}</strong>
                                        <p className="text-xs text-gray-300">{color.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <p className="text-sm">Pick at least 2 font styles:</p>
                            <div className="flex flex-wrap gap-3">
                                {typographyStyles.map((font) => (
                                    <button
                                        key={font}
                                        onClick={() => toggleFont(font)}
                                        className={`px-4 py-2 rounded border ${formData.selectedFonts?.includes(font) ? 'bg-blue-500' : 'bg-gray-700'}`}
                                    >
                                        {font}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <p className="text-sm">Upload 1–3 logos you admire or paste links:</p>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => updateField('referenceLogos', Array.from(e.target.files))}
                                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                            />
                            <textarea placeholder="Or paste reference links" className="w-full p-2 bg-black text-white rounded" onChange={(e) => updateField('referenceLinks', e.target.value)}></textarea>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-4">
                            <input type="text" placeholder="Competitor Link 1" className="w-full p-2 bg-black text-white rounded" onChange={(e) => updateField('competitor1', e.target.value)} />
                            <input type="text" placeholder="Competitor Link 2" className="w-full p-2 bg-black text-white rounded" onChange={(e) => updateField('competitor2', e.target.value)} />
                            <input type="text" placeholder="Competitor Link 3" className="w-full p-2 bg-black text-white rounded" onChange={(e) => updateField('competitor3', e.target.value)} />
                            <textarea placeholder="Or name them" className="w-full p-2 bg-black text-white rounded" onChange={(e) => updateField('competitorNames', e.target.value)}></textarea>
                        </div>
                    )}

                    {currentStep === 6 && (
                        <div className="space-y-4">
                            <textarea placeholder="Additional Notes or Requests" className="w-full p-4 bg-black text-white rounded" onChange={(e) => updateField('notes', e.target.value)}></textarea>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-30"
                        >
                            Previous
                        </button>

                        {currentStep < steps.length - 1 ? (
                            <button
                                onClick={nextStep}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={() => submitFormData(formData)}
                                className="px-4 py-2 bg-green-600 text-white rounded"
                            >
                                Submit
                            </button>
                        )}
                    </div>

                    {/* Loader and Image Result */}
                    {loading && (
                        <div className="mt-8 text-center">
                            <p className="text-lg font-semibold animate-pulse">🎨 Generating your logo...</p>
                            <svg className="animate-spin h-10 w-10 mx-auto text-blue-500 mt-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        </div>
                    )}

                    {!loading && submittedImageUrl && (
                        <div className="mt-8 text-center">
                            <h3 className="text-lg font-semibold mb-4">Your Logo Preview</h3>
                            <img src={submittedImageUrl} alt="Submitted Logo" className="mx-auto mb-4 max-h-96 rounded shadow-lg" />
                            <a
                                href={submittedImageUrl}
                                download="logo-preview.png"
                                className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                            >
                                Download Logo
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LogoDesign;
