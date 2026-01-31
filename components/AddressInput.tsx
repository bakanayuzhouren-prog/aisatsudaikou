
import React, { useState } from 'react';
import { AddressData } from '../types';
import { fetchAddressByZip } from '../lib/zipService';
import { handleEnterKey } from '../utils/keyboard';

interface AddressInputProps {
  label: string;
  value: AddressData;
  onChange: (val: AddressData) => void;
}

const AddressInput: React.FC<AddressInputProps> = ({ label, value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const isComposing = React.useRef(false);

  const processZipChange = async (inputVal: string) => {
    // Normalize full-width numbers to half-width
    const normalizedValue = inputVal.replace(/[０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });

    // Remove non-digits
    const newZip = normalizedValue.replace(/[^\d]/g, '');

    onChange({ ...value, zip: newZip });

    if (newZip.length === 7) {
      setLoading(true);
      const address = await fetchAddressByZip(newZip);
      setLoading(false);
      if (address) {
        onChange({
          ...value,
          zip: newZip,
          prefecture: address.prefecture,
          city: address.city,
          addressLine: value.addressLine
        });
      }
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposing.current) {
      onChange({ ...value, zip: e.target.value });
      return;
    }
    processZipChange(e.target.value);
  };

  return (
    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm mb-4">
      <h3 className="font-bold text-gray-700 mb-3 border-l-4 border-green-500 pl-2">{label}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">郵便番号</label>
          <div className="relative">
            <input
              type="text"
              value={value.zip}
              onChange={handleZipChange}
              onCompositionStart={() => isComposing.current = true}
              onCompositionEnd={(e) => {
                isComposing.current = false;
                processZipChange(e.currentTarget.value);
              }}
              onKeyDown={handleEnterKey}
              placeholder="1234567"
              maxLength={7}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none transition"
            />
            {loading && <span className="absolute right-3 top-2 text-[10px] text-red-600 animate-pulse font-bold">検索中...</span>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">都道府県</label>
          <input
            type="text"
            value={value.prefecture}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, prefecture: e.target.value })}
            onKeyDown={handleEnterKey}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-red-500 outline-none transition"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">市区町村・番地</label>
          <input
            type="text"
            value={value.city + value.addressLine}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onChange({ ...value, city: e.target.value, addressLine: '' });
            }}
            onKeyDown={handleEnterKey}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none bg-white transition"
          />
        </div>
      </div>
    </div>
  );
};

export default AddressInput;
