import React from 'react';

interface DisclaimerModalProps {
  onAccept: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-joy-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-4xl shadow-2xl max-w-md w-full p-8 md:p-10 animate-fade-in-up border border-joy-100">
        <div className="text-center mb-8">
          <div className="bg-joy-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-joy-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-joy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-joy-900 mb-3">Halo, Aku PROM-JOY</h2>
          <p className="text-joy-800/50 text-base font-medium">Teman Digital untuk Ketenanganmu</p>
        </div>

        <div className="bg-warm-50 border border-warm-100 rounded-3xl p-6 mb-8 text-left">
          <h3 className="text-joy-900 font-bold text-sm mb-3 uppercase tracking-widest">Penting untuk Kamu</h3>
          <ul className="list-disc list-outside ml-4 text-sm text-joy-800/70 space-y-2 font-medium">
            <li>PROM-JOY <strong>bukan</strong> pengganti psikolog atau tenaga medis profesional.</li>
            <li>Aku tidak bisa memberikan diagnosis atau resep obat.</li>
            <li>Percakapan kita bersifat edukatif dan suportif ringan.</li>
            <li>Semua yang kamu ceritakan bersifat anonim.</li>
          </ul>
        </div>

        <button
          onClick={onAccept}
          className="w-full bg-joy-400 hover:bg-joy-500 text-joy-900 font-bold py-4 px-6 rounded-2xl transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-joy-100"
        >
          Mulai Cerita
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;
