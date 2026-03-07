import React from 'react';
import { EmergencyResource } from '../types';
import { EMERGENCY_RESOURCES } from '../constants';

interface EmergencyPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmergencyPanel: React.FC<EmergencyPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-joy-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-4xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-joy-100">
        <div className="p-8 border-b border-joy-50 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-extrabold text-red-600 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Bantuan Profesional
          </h2>
          <button onClick={onClose} className="text-joy-800/30 hover:text-joy-900 p-2 rounded-full hover:bg-joy-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <p className="text-joy-800/60 text-base leading-relaxed font-medium">
            Jika kamu merasa dalam kondisi darurat, sangat tertekan, atau ingin menyakiti diri sendiri, mohon segera hubungi bantuan profesional di bawah ini. Kamu tidak sendirian.
          </p>
          
          {EMERGENCY_RESOURCES.map((resource, index) => (
            <div key={index} className="border border-joy-100 rounded-3xl p-6 hover:border-joy-300 transition-all bg-joy-50/50 group">
              <h3 className="font-extrabold text-joy-900 text-lg group-hover:text-joy-600 transition-colors">{resource.name}</h3>
              <p className="text-joy-800/50 text-sm mt-2 font-medium">{resource.description}</p>
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <a 
                  href={`tel:${resource.contact.replace(/ /g, '').replace(/-/g, '')}`} 
                  className="w-full sm:flex-1 bg-white border-2 border-joy-100 text-joy-900 py-3 px-4 rounded-2xl text-center text-sm font-bold hover:border-joy-400 transition-all active:scale-95"
                >
                  📞 {resource.contact}
                </a>
                {resource.email && (
                  <div className="w-full text-center text-xs text-joy-800/40 mt-2 break-all">
                    📧 {resource.email}
                  </div>
                )}
                {resource.url && (
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 bg-joy-400 text-joy-900 py-3 px-4 rounded-2xl text-center text-sm font-bold hover:bg-joy-500 transition-all active:scale-95 shadow-sm"
                  >
                    Kunjungi Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-8 bg-joy-50/30 text-center rounded-b-4xl border-t border-joy-50">
          <button 
            onClick={onClose}
            className="text-joy-800/40 hover:text-joy-900 text-sm font-bold uppercase tracking-widest transition-colors"
          >
            Kembali ke obrolan
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPanel;
