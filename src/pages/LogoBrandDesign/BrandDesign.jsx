import React from 'react';
import { useParams } from 'react-router-dom';
import { GradientText } from '../../components/ui/GradientText';
import { ServiceCard } from '../../components/ServiceCard';
import { services } from '../../services/data/services';

const BrandDesign = () => {
    const { type } = useParams();

    const brandingService = services.find(service => service.id === 'branding-design');
    const subServices = brandingService?.subServices || [];

    // Check if a specific sub-service is requested via URL param
    const selectedSubService = type
        ? subServices.find(sub => sub.id === type)
        : null;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">
                    <GradientText>
                        {selectedSubService ? selectedSubService.title : 'Branding & Design Services'}
                    </GradientText>
                </h1>
                <p className="text-gray-400">
                    {selectedSubService
                        ? selectedSubService.description
                        : 'Creative branding and design services tailored for your business.'}
                </p>
            </div>

            {!selectedSubService ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subServices.map((sub) => (
                        <ServiceCard key={sub.id} service={sub} />
                    ))}
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
                    <h2 className="text-xl font-semibold mb-4">{selectedSubService.title}</h2>
                    <p className="text-gray-700">{selectedSubService.description}</p>
                    {/* You can add images, features, CTA buttons here */}
                </div>
            )}
        </div>
    );
};

export default BrandDesign;
