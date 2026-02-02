import React, { useRef } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { FormData } from '../types';

interface StepPrintProps {
  data: FormData;
  updateData: (partial: Partial<FormData>) => void;
  onBack: () => void;
}

const StepPrint: React.FC<StepPrintProps> = ({ data, updateData, onBack }) => {
  const isA4 = data.paperSize === 'a4';
  const width = isA4 ? '210mm' : '100mm';
  const height = isA4 ? '297mm' : '148mm';

  // Refs for Draggable (Strict Mode requirement)
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Conversion factor: 1mm is roughly 3.78px on screen (96dpi). 
  // However, since we might be scaled down, or to keep it controllable, we use a factor.
  // Using 3 seems to provide a decent "feel" for 1mm increments.
  const PX_PER_MM = 3.0;

  // Default values
  const layout = data.layout || {
    imageX: 0, imageY: 0, imageScale: 100, imageObjectFit: 'cover',
    textContainerX: 0, textContainerY: 0,
    message: { fontSize: 11, alignment: 'left', tracking: 0.05, lineHeight: 1.8, marginTop: 0 },
    name: { fontSize: 14, alignment: 'right', marginTop: 8, tracking: 0.05 },
    paperSize: 'postcard'
  };

  const updateLayout = (partial: Partial<typeof layout> | any) => {
    updateData({ layout: { ...layout, ...partial } });
  };

  const updateMessageLayout = (partial: Partial<typeof layout.message>) => {
    updateData({ layout: { ...layout, message: { ...layout.message, ...partial } } });
  };

  const updateNameLayout = (partial: Partial<typeof layout.name>) => {
    updateData({ layout: { ...layout, name: { ...layout.name, ...partial } } });
  };

  // Generic drag handler
  const handleDrag = (info: 'image' | 'text', e: DraggableEvent, data: DraggableData) => {
    // data.x/y are accumulated pixels from the starting position
    // We want to map this back to "mm" offsets
    const mmX = Math.round(data.x / PX_PER_MM);
    const mmY = Math.round(data.y / PX_PER_MM);

    if (info === 'image') {
      updateLayout({ imageX: mmX, imageY: mmY });
    } else {
      updateLayout({ textContainerX: mmX, textContainerY: mmY });
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 pb-20 animate-fade-in relative z-[1001]">
      {/* Settings Panel (No Print) */}
      <div className="no-print w-full lg:w-80 bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit space-y-6 max-h-[90vh] overflow-y-auto">
        <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center justify-between">
          <span>🛠️ レイアウト調整</span>
          <span className="text-[10px] text-gray-400 font-normal">ドラッグで移動可</span>
        </h3>

        {/* Image Controls */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-green-700 block bg-green-50 p-1 rounded">画像設定</label>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">拡大・縮小</span>
            <input
              type="range" min="50" max="200" step="5"
              value={layout.imageScale || 100}
              onChange={(e) => updateLayout({ imageScale: parseInt(e.target.value) })}
              className="w-24 accent-green-600"
            />
            <span className="text-xs w-8 text-right">{layout.imageScale || 100}%</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <label className="flex items-center justify-between text-xs text-gray-500">
              <span>↔️ 左右(mm)</span>
              <input
                type="number" value={layout.imageX}
                onChange={(e) => updateLayout({ imageX: parseInt(e.target.value) })}
                className="w-12 border rounded px-1 text-right"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-gray-500">
              <span>↕️ 上下(mm)</span>
              <input
                type="number" value={layout.imageY}
                onChange={(e) => updateLayout({ imageY: parseInt(e.target.value) })}
                className="w-12 border rounded px-1 text-right"
              />
            </label>
          </div>
        </div>

        {/* Font Sizes */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <label className="text-xs font-bold text-blue-700 block bg-blue-50 p-1 rounded">文字設定</label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">挨拶文サイズ</span>
              <input
                type="range" min="6" max="24" step="0.5"
                value={layout.message.fontSize}
                onChange={(e) => updateMessageLayout({ fontSize: parseFloat(e.target.value) })}
                className="w-24 accent-blue-600"
              />
              <span className="text-xs w-8 text-right">{layout.message.fontSize}pt</span>
            </div>
          </div>
        </div>

        {/* Alignment */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-600 block">配置（揃え）</label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">挨拶文</span>
              <div className="flex bg-gray-100 rounded p-1">
                {(['left', 'center', 'right'] as const).map(align => (
                  <button
                    key={align}
                    onClick={() => updateMessageLayout({ alignment: align })}
                    className={`p-1 rounded ${layout.message.alignment === align ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}
                  >
                    {align === 'left' ? '⬅️' : align === 'center' ? '⏺️' : '➡️'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Name Settings */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">名前サイズ</span>
            <input
              type="range" min="8" max="32" step="0.5"
              value={layout.name.fontSize}
              onChange={(e) => updateNameLayout({ fontSize: parseFloat(e.target.value) })}
              className="w-24 accent-blue-600"
            />
            <span className="text-xs w-8 text-right">{layout.name.fontSize}pt</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">名前の配置</span>
            <div className="flex bg-gray-100 rounded p-1">
              {(['left', 'center', 'right'] as const).map(align => (
                <button
                  key={align}
                  onClick={() => updateNameLayout({ alignment: align })}
                  className={`p-1 rounded ${layout.name.alignment === align ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}
                >
                  {align === 'left' ? '⬅️' : align === 'center' ? '⏺️' : '➡️'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">本文との間隔</span>
            <input
              type="range" min="0" max="80" step="1"
              value={layout.name.marginTop}
              onChange={(e) => updateNameLayout({ marginTop: parseInt(e.target.value) })}
              className="w-24 accent-blue-600"
            />
          </div>
        </div>

        <div className="pt-4 flex gap-2">
          <button onClick={onBack} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 font-bold text-sm">戻る</button>
          <button onClick={() => window.print()} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold text-sm shadow hover:bg-green-700">印刷 / PDF</button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex justify-center bg-gray-200 p-4 lg:p-10 rounded-xl overflow-auto sticky top-4 max-h-screen">
        <div
          className="bg-white shadow-2xl relative overflow-hidden flex flex-col print-area transform-gpu"
          style={{
            width: width,
            height: height,
            backgroundColor: data.backgroundColor,
            padding: isA4 ? '12mm' : '6mm'
          }}
        >
          {/* Draggable Image Section */}
          <Draggable
            nodeRef={imageRef}
            position={{ x: layout.imageX * PX_PER_MM, y: layout.imageY * PX_PER_MM }}
            onStop={(e, d) => handleDrag('image', e, d)}
            bounds="parent" // Optional: constrain to paper
          >
            <div
              ref={imageRef}
              className="relative cursor-move hover:ring-2 hover:ring-green-400 transition-shadow duration-200"
              style={{
                height: '40%', // Initial height base
                marginBottom: '4mm',
                transformOrigin: 'center center',
              }}
            >
              {(data.processedImage || data.originalImage) && (
                <img
                  src={data.processedImage || data.originalImage || ''}
                  className="w-full h-full pointer-events-none" // pointer-events-none essential for drag
                  style={{
                    objectFit: layout.imageObjectFit,
                    transform: `scale(${(layout.imageScale || 100) / 100})`
                  }}
                />
              )}
            </div>
          </Draggable>

          {/* Draggable Text Container */}
          <Draggable
            nodeRef={textRef}
            position={{ x: layout.textContainerX * PX_PER_MM, y: layout.textContainerY * PX_PER_MM }}
            onStop={(e, d) => handleDrag('text', e, d)}
          >
            <div
              ref={textRef}
              className="flex-1 flex flex-col cursor-move hover:ring-2 hover:ring-blue-400 transition-shadow duration-200"
            >
              {/* Message */}
              <div style={{
                fontSize: `${layout.message.fontSize}pt`,
                textAlign: layout.message.alignment,
                lineHeight: layout.message.lineHeight,
                letterSpacing: `${layout.message.tracking}em`,
                whiteSpace: 'pre-wrap',
                fontFamily: 'serif'
              }}>
                {data.customMessage}
              </div>

              {/* Name (Flows after message) */}
              <div style={{
                fontSize: `${layout.name.fontSize}pt`,
                textAlign: layout.name.alignment,
                marginTop: `${layout.name.marginTop}mm`,
                letterSpacing: `${layout.name.tracking}em`,
                fontFamily: 'serif',
                fontWeight: 'bold'
              }}>
                {data.name} より
              </div>
            </div>
          </Draggable>
        </div>
      </div>
    </div>
  );
};

export default StepPrint;
