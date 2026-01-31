
import React from 'react';
import { FormData } from '../types';
import AddressInput from './AddressInput';
import { handleEnterKey } from '../utils/keyboard';

interface StepInputProps {
  data: FormData;
  updateData: (partial: Partial<FormData>) => void;
  onNext: () => void;
}

const StepInput: React.FC<StepInputProps> = ({ data, updateData, onNext }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-green-600">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
            基本情報の入力
          </h2>
          <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
            <span className="text-sm font-bold text-red-800">作成サイズ:</span>
            <select
              value={data.paperSize || 'postcard'}
              onChange={(e) => updateData({ paperSize: e.target.value as 'a4' | 'postcard' })}
              className="bg-transparent text-sm font-bold text-red-700 focus:outline-none cursor-pointer"
            >
              <option value="postcard">ハガキ (100×148mm)</option>
              <option value="a4">A4 (210×297mm)</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 border-l-4 border-green-500 pl-2">世帯主のお名前</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => updateData({ name: e.target.value })}
              onKeyDown={handleEnterKey}
              className="w-full border border-gray-300 p-3 rounded bg-white focus:ring-2 focus:ring-red-500 outline-none transition"
              placeholder="山田 太郎"
            />
          </div>

          <AddressInput
            label="新居の住所"
            value={data.newAddress}
            onChange={(val) => updateData({ newAddress: val })}
          />

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 border-l-4 border-green-500 pl-2">新しい生活の楽しみや趣味</label>
            <textarea
              value={data.hobbies}
              onChange={(e) => updateData({ hobbies: e.target.value })}
              onKeyDown={handleEnterKey}
              className="w-full border border-gray-300 p-3 rounded bg-white focus:ring-2 focus:ring-red-500 outline-none transition h-24"
              placeholder="広い庭でのBBQ、ガーデニング、DIYなど..."
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-lg font-bold shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
        >
          次へ進む（デザイン作成）
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default StepInput;
