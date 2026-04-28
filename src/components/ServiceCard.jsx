import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GradientText } from './ui/GradientText';

export function ServiceCard({ service }) {
    const navigate = useNavigate();

    const handleClick = () => {
        console.log(`Navigating to ${service.navigator}`);

        navigate(service.navigator, {
            state: {
                selectedService: {
                    id: service.id,
                    title: service.title,
                    description: service.description
                }
            }
        });
    };

    return (
        <div
            onClick={handleClick} // ✅ Now it works correctly
            className="bg-[#1A2737] border border-gray-800 p-6 rounded-xl cursor-pointer transition-all duration-200 hover:bg-[#1E2E42] group"
            key={service.id}
        >
            <div className="flex flex-col h-full">
                <h3 className="text-xl font-bold text-white mb-2">
                    <GradientText size="small">{service.title}</GradientText>
                </h3>
                <p className="text-gray-400 text-sm">{service.description}</p>
                <div className="mt-auto pt-4">
                    <button className="text-gray-400 text-sm group-hover:text-white transition-colors">
                        Learn more →
                    </button>
                </div>
            </div>
        </div>
    );
}
