
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

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 border-l-4 border-green-500 pl-2">家族構成 (挨拶文のタイプ)</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button
                onClick={() => updateData({ familyType: 'single', customMessage: '' })}
                className={`py-3 px-2 rounded-lg text-xs font-bold border transition ${data.familyType === 'single' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-green-50'}`}
              >
                👤 一人暮らし
              </button>
              <button
                onClick={() => updateData({ familyType: 'couple', customMessage: '' })}
                className={`py-3 px-2 rounded-lg text-xs font-bold border transition ${data.familyType === 'couple' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-green-50'}`}
              >
                💑 夫婦のみ
              </button>
              <button
                onClick={() => updateData({ familyType: 'family_small', customMessage: '' })}
                className={`py-3 px-2 rounded-lg text-xs font-bold border transition ${data.familyType === 'family_small' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-green-50'}`}
              >
                👶 小さな子どもあり
              </button>
              <button
                onClick={() => updateData({ familyType: 'family_school', customMessage: '' })}
                className={`py-3 px-2 rounded-lg text-xs font-bold border transition ${data.familyType === 'family_school' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-green-50'}`}
              >
                🎒 学校に通う子どもあり
              </button>
              <button
                onClick={() => updateData({ familyType: 'two_households', customMessage: '' })}
                className={`py-3 px-2 rounded-lg text-xs font-bold border transition ${data.familyType === 'two_households' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-green-50'}`}
              >
                🏠 二世帯・同居
              </button>
            </div>
          </div>

          <AddressInput
            label="旧居の住所 (引っ越し前)"
            value={data.oldAddress}
            onChange={(val) => updateData({ oldAddress: val })}
          />

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 border-l-4 border-green-500 pl-2">訪問予定 (挨拶に含める場合)</label>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="例: 4"
                  value={data.visitMonth}
                  onChange={(e) => updateData({ visitMonth: e.target.value, customMessage: '' })}
                  className="w-16 border border-gray-300 p-2 rounded bg-white focus:ring-2 focus:ring-red-500 outline-none text-center"
                />
                <span className="text-sm font-bold text-gray-700">月</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="例: 1"
                  value={data.visitDay}
                  onChange={(e) => updateData({ visitDay: e.target.value, customMessage: '' })}
                  className="w-16 border border-gray-300 p-2 rounded bg-white focus:ring-2 focus:ring-red-500 outline-none text-center"
                />
                <span className="text-sm font-bold text-gray-700">日</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="例: 14"
                  value={data.visitTime}
                  onChange={(e) => updateData({ visitTime: e.target.value, customMessage: '' })}
                  className="w-16 border border-gray-300 p-2 rounded bg-white focus:ring-2 focus:ring-red-500 outline-none text-center"
                />
                <span className="text-sm font-bold text-gray-700">時頃にお伺いします</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">※未入力の場合は挨拶文に含まれません。</p>
          </div>

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
