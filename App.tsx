
import React, { useState, useEffect } from 'react';
import { FormData } from './types';
import StepInput from './components/StepInput';
import StepGen from './components/StepGen';
import StepPrint from './components/StepPrint';
import PinLock from './components/PinLock';
import HostingGuide from './components/HostingGuide';

// Force HMR
const generateMembers = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `member_${Date.now()}_${i}`,
    originalImage: null,
    processedImage: null,
    profile: ''
  }));
};

const INITIAL_DATA: FormData = {
  name: '',
  familySize: 2,
  familyType: null,
  oldAddress: { zip: '', prefecture: '', city: '', addressLine: '' },
  newAddress: { zip: '', prefecture: '', city: '', addressLine: '' },
  hobbies: '',
  visitMonth: '',
  visitDay: '',
  visitTime: '',
  selectedTemplateId: '',
  customMessage: '',
  photoMode: 'group',
  illustrationStyle: 'standard',
  objectFit: 'contain', // Default to contain to avoid cropping
  backgroundColor: '#ffffff',
  paperSize: 'postcard',
  originalImage: null,
  processedImage: null,
  familyMembers: generateMembers(2),
};

const STORAGE_KEY = 'moving_card_data_v1';
const PIN_KEY = 'moving_card_pin';

function App() {
  const [step, setStep] = useState<'input' | 'design' | 'print'>('input');
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showHostingGuide, setShowHostingGuide] = useState(false);
  const [pin, setPin] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setFormData({ ...INITIAL_DATA, ...JSON.parse(savedData) });
      } catch (e) { console.error(e); }
    }
    const savedPin = localStorage.getItem(PIN_KEY);
    if (savedPin) {
      setPin(savedPin);
      setIsLocked(true);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  const updateData = (partial: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...partial }));
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-white">
      {isLocked && (
        <PinLock mode="locked" onUnlock={(p) => { if (p === pin) { setIsLocked(false); return true; } return false; }} onSetPin={() => { }} />
      )}
      {showPinSetup && (
        <PinLock mode="setup" onUnlock={() => true} onSetPin={(p) => { localStorage.setItem(PIN_KEY, p); setPin(p); setShowPinSetup(false); }} onCancelSetup={() => setShowPinSetup(false)} />
      )}
      {showHostingGuide && <HostingGuide onClose={() => setShowHostingGuide(false)} />}

      <header className="bg-white shadow-md sticky top-0 z-50 no-print border-b-4 border-green-600">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('input')}>
            <span className="text-2xl">🏠</span>
            <h1 className="font-bold text-lg text-gray-800 tracking-wider">AI 引っ越し挨拶状メーカー</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowHostingGuide(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition">
              <span>⚙️</span> <span className="hidden sm:inline">ガイド</span>
            </button>
            <button onClick={() => setShowPinSetup(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition">
              <span>🔒</span> <span className="hidden sm:inline">ロック</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
        {step === 'input' && <StepInput data={formData} updateData={updateData} onNext={() => setStep('design')} />}
        {step === 'design' && <StepGen data={formData} updateData={updateData} onNext={() => setStep('print')} onBack={() => setStep('input')} />}
        {step === 'print' && <StepPrint data={formData} onBack={() => setStep('design')} />}
      </main>
    </div>
  );
}

export default App;
