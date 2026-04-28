import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { LogoDesignForm } from './LogoDesignForm';

interface LogoDesignModalProps {
  onClose: () => void;
}

export function LogoDesignModal({ onClose }: LogoDesignModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0A1628] rounded-xl max-w-4xl w-full max-h-[90vh] border border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-[#0A1628] z-10">
          <h2 className="text-2xl font-semibold text-white">Logo Design Brief</h2>
          <Button variant="secondary" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto modal-content">
          <LogoDesignForm onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}