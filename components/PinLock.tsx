
import React, { useState } from 'react';

interface PinLockProps {
  mode: 'locked' | 'setup';
  onUnlock: (pin: string) => boolean;
  onSetPin: (pin: string) => void;
  onCancelSetup?: () => void;
  onResetAll?: () => void;
}

const PinLock: React.FC<PinLockProps> = ({ mode, onUnlock, onSetPin, onCancelSetup, onResetAll }) => {
  const [input, setInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter'); // for setup
  const [error, setError] = useState<string | null>(null);

  const handleNumClick = (num: number) => {
    if (input.length < 4) {
      const next = input + num;
      setInput(next);
      setError(null);

      // Auto submit on 4 digits
      if (next.length === 4) {
        setTimeout(() => handleSubmit(next), 200);
      }
    }
  };

  const handleClear = () => {
    setInput('');
    setError(null);
  };

  const handleSubmit = (pin: string) => {
    if (mode === 'locked') {
      const success = onUnlock(pin);
      if (!success) {
        setError('パスコードが間違っています');
        setInput('');
      }
    } else {
      // Setup mode
      if (step === 'enter') {
        setConfirmInput(pin);
        setStep('confirm');
        setInput('');
      } else {
        if (pin === confirmInput) {
          onSetPin(pin);
        } else {
          setError('パスコードが一致しません。もう一度設定してください。');
          setStep('enter');
          setInput('');
          setConfirmInput('');
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-gray-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-white">
      <div className="w-full max-w-xs flex flex-col items-center">
        
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner border border-gray-700">
            {mode === 'locked' ? '🔒' : '🛡️'}
          </div>
          <h2 className="text-xl font-bold mb-2">
            {mode === 'locked' ? 'アプリはロックされています' : 
             step === 'enter' ? '新しいパスコードを設定' : '確認のため再入力'}
          </h2>
          <p className="text-sm text-gray-400">
             {mode === 'locked' ? '解除するには4桁の数字を入力してください' : '4桁の数字を決めてください'}
          </p>
        </div>

        {/* Dots Display */}
        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                i < input.length ? 'bg-green-600 scale-110 shadow-[0_0_10px_rgba(22,163,74,0.5)]' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {error && (
           <div className="mb-6 text-red-400 text-sm font-bold bg-red-900/30 px-4 py-2 rounded animate-pulse border border-red-900/50">
             {error}
           </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full mb-8">
           {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
             <button
               key={num}
               onClick={() => handleNumClick(num)}
               className="h-16 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-2xl font-bold transition shadow-lg border border-gray-700"
             >
               {num}
             </button>
           ))}
           <div className="flex items-center justify-center">
              {mode === 'setup' && (
                <button onClick={onCancelSetup} className="text-sm text-gray-400 hover:text-white px-2 py-4">キャンセル</button>
              )}
           </div>
           <button
             onClick={() => handleNumClick(0)}
             className="h-16 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-2xl font-bold transition shadow-lg border border-gray-700"
           >
             0
           </button>
           <button
             onClick={handleClear}
             className="flex items-center justify-center text-gray-400 hover:text-white"
           >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12l-2.25 2.25m-4.288-2.42-2.25-2.25a.75.75 0 0 0-1.061 0l-2.25 2.25a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l2.25-2.25a.75.75 0 0 0 0-1.06Z" />
             </svg>
           </button>
        </div>

        {mode === 'locked' && onResetAll && (
           <button onClick={onResetAll} className="text-xs text-gray-500 hover:text-red-400 border-b border-gray-600 hover:border-red-400 pb-0.5 transition">
             パスコードを忘れた場合（データ初期化）
           </button>
        )}
      </div>
    </div>
  );
};

export default PinLock;
