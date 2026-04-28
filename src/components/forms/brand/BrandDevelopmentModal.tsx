import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { BrandDevelopmentForm } from './BrandDevelopmentForm';

interface BrandDevelopmentModalProps {
  onClose: () => void;
}

export function BrandDevelopmentModal({ onClose }: BrandDevelopmentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-brand-dark rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-brand-dark z-10">
          <h2 className="text-2xl font-semibold text-white">Brand Development</h2>
          <Button variant="secondary" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <BrandDevelopmentForm onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}