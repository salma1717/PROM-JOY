import React, { useState } from 'react';
import { APP_NAME } from '../constants';

interface RespondenModalProps {
  onRespondenIdSet: (responderId: string) => void;
}

const VALID_RESPONDEN_CODES = ['DEV', 'R01', 'R02', 'R03', 'R04', 'R05', 'R06'];

const RespondenModal: React.FC<RespondenModalProps> = ({ onRespondenIdSet }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = inputValue.trim().toUpperCase();
    
    if (!code) {
      setError('Kode responden tidak boleh kosong');
      return;
    }

    if (!VALID_RESPONDEN_CODES.includes(code)) {
      setError(`Kode tidak valid. Gunakan: ${VALID_RESPONDEN_CODES.join(', ')}`);
      return;
    }

    // Save to localStorage
    localStorage.setItem('user_id', code);
    
    // Callback to parent
    onRespondenIdSet(code);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999]">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-joy-400 rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-joy-900 mb-2">{APP_NAME}</h2>
          <p className="text-joy-700">Selamat datang! 👋</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-joy-900 mb-2">
              Masukkan Kode Responden Anda
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError('');
              }}
              placeholder="Masukkan kode Anda"
              className="w-full px-4 py-3 border-2 border-joy-200 rounded-lg focus:outline-none focus:border-joy-400 focus:ring-2 focus:ring-joy-200/50 text-center font-mono text-lg uppercase"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-joy-400 hover:bg-joy-500 text-joy-900 font-bold py-3 rounded-lg transition-all active:scale-95 shadow-md hover:shadow-lg"
          >
            Lanjutkan
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-joy-600 text-center mt-6">
          Data percakapanmu akan tersimpan aman 🔒
        </p>
      </div>
    </div>
  );
};

export default RespondenModal;
