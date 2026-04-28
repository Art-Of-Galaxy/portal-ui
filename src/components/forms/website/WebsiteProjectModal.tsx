import React from 'react';
import { WebsiteProjectForm } from './WebsiteProjectForm';
import { ModalHeader } from '../../ui/ModalHeader';

interface WebsiteProjectModalProps {
  onClose: () => void;
}

export function WebsiteProjectModal({ onClose }: WebsiteProjectModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0A1628] rounded-xl max-w-2xl w-full max-h-[90vh] border border-gray-700 flex flex-col">
        <ModalHeader title="Website Development Brief" onClose={onClose} />
        <div className="p-6 overflow-y-auto">
          <WebsiteProjectForm onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}