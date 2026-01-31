
import React from 'react';
import { FormData } from '../types';

interface StepPrintProps {
  data: FormData;
  onBack: () => void;
}

const StepPrint: React.FC<StepPrintProps> = ({ data, onBack }) => {
  const isA4 = data.paperSize === 'a4';
  const width = isA4 ? '210mm' : '100mm';
  const height = isA4 ? '297mm' : '148mm';
  
  const paddingClass = isA4 ? 'p-12' : 'p-6';
  const titleClass = isA4 ? 'text-2xl mb-6' : 'text-sm mb-2';
  const textClass = isA4 ? 'text-lg leading-loose' : 'text-[10px] leading-relaxed';
  const imageContainerHeight = isA4 ? 'h-[40%] mb-8' : 'h-[40%] mb-4';

  return (
    <div className="max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center animate-fade-in pb-20">
      <div className="no-print text-gray-600 text-xs font-medium bg-white px-4 py-2 rounded-full shadow-sm">
        {isA4 ? 'A4サイズ (210×297mm) プレビュー' : 'ハガキサイズ (100×148mm) プレビュー'}
      </div>
      
      <div 
        className={`bg-white shadow-2xl inline-block print-area text-left flex flex-col ${paddingClass} border border-gray-100`} 
        style={{ width: width, height: height, backgroundColor: data.backgroundColor }}
      >
         <div className={`${imageContainerHeight} bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100`}>
            {(data.processedImage || data.originalImage) && (
              <img 
                src={data.processedImage || data.originalImage || ''} 
                className={`w-full h-full ${data.objectFit === 'cover' ? 'object-cover' : 'object-contain'}`} 
              />
            )}
         </div>
         <div className="flex-1 flex flex-col overflow-hidden">
            <h2 className={`${titleClass} font-serif font-bold text-gray-900 text-right`}>{data.name} より</h2>
            <p className={`${textClass} font-serif whitespace-pre-wrap text-gray-800`}>{data.customMessage}</p>
         </div>
      </div>
      
      <div className="no-print flex gap-4">
        <button onClick={onBack} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition font-bold">デザインに戻る</button>
        <button onClick={() => window.print()} className="px-10 py-3 bg-green-600 text-white rounded-lg font-bold text-lg shadow-lg hover:bg-green-700 transition">🖨️ 印刷 / PDF保存</button>
      </div>
    </div>
  );
};

export default StepPrint;
