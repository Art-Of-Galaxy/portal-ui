import React from 'react';
import { SocialMediaForm } from './SocialMediaForm';
import { ModalHeader } from '../../ui/ModalHeader';

interface SocialMediaModalProps {
  onClose: () => void;
}

export function SocialMediaModal({ onClose }: SocialMediaModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0A1628] rounded-xl max-w-2xl w-full max-h-[90vh] border border-gray-700 flex flex-col">
        <ModalHeader title="Social Media Campaign Brief" onClose={onClose} />
        <div className="p-6 overflow-y-auto">
          <SocialMediaForm onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}