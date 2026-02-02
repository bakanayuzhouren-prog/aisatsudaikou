import React, { useState, useEffect } from 'react';
import { FormData } from '../types';
import { generateGreetingMessage, transformImageToIllustration, editImageWithPrompt } from '../lib/aiService';
import { resizeImage, resizeBase64 } from '../lib/imageService';
import { checkBudget, addCost, getUsage, getRemainingBudget, COSTS } from '../utils/costTracker';

interface StepGenProps {
  data: FormData;
  updateData: (partial: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepGen: React.FC<StepGenProps> = ({ data, updateData, onNext, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [budgetInfo, setBudgetInfo] = useState({ used: 0, remaining: 0 });

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null); // For individual mode camera
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const updateBudgetDisplay = () => {
    const usage = getUsage();
    setBudgetInfo({
      used: usage.totalCost,
      remaining: getRemainingBudget()
    });
  };

  const applyTemplate = (type: 'single' | 'couple' | 'family_small' | 'family_school' | 'two_households') => {
    const address = `${data.oldAddress.prefecture}${data.oldAddress.city}`;
    const name = data.name || "〇〇";
    const visitText = (data.visitMonth && data.visitDay && data.visitTime)
      ? `\nご都合がよろしければ、${data.visitMonth}月${data.visitDay}日${data.visitTime}時頃に\nご挨拶に伺えればと存じます。`
      : "";

    const templates = {
      single: `この度、${address} より引っ越してきました。${name}と申します。\n新しい環境での生活は、これからとなりますが、\n建設中は何かとご配慮を賜り、誠にありがとうございました。\nまだ不慣れな点もあるかと存じますが、\n今後ともどうぞよろしくお願いいたします。`,
      couple: `この度、私たちは ${address} より引っ越してきました。${name}と申します。\n二人で協力しながら、新しい生活を始めてまいります。\n建設中は何かとご配慮を賜り、誠にありがとうございました。\n何かと至らぬ点もあるかと存じますが、\n今後ともどうぞよろしくお願い申し上げます。`,
      family_small: `この度、${address} より引っ越してきました。${name}と申します。\n小さな子どもがおり、何かとお騒がせしてしまうことがあるかもしれませんが、\n建設中は何かとご配慮を賜り、心より御礼申し上げます。\nまだ不慣れな点もあるかと存じますが、\n今後ともどうぞよろしくお願いいたします。`,
      family_school: `この度、${address} より引っ越してきました。${name}と申します。\n子どもの転校手続きなども一段落し、\n新しい生活を少しずつ整えているところです。\n建設中は何かとご配慮を賜り、誠にありがとうございました。\n何かとお世話になることもあるかと存じますが、\n今後ともどうぞよろしくお願いいたします。`,
      two_households: `この度、${address} より引っ越してきました。${name}と申します。\n建設中は何かとご配慮を賜り、誠にありがとうございました。\n世帯人数も多く、何かとお騒がせしてしまうことがあるかと存じますが、\nまだ不慣れな点もあるかと存じます。\n今後とも家族一同、どうぞよろしくお願いいたします。`
    };

    updateData({ customMessage: templates[type] + visitText });
  };

  const handleAiText = async () => {
    if (!checkBudget(COSTS.TEXT)) {
      alert("今月の利用限度額（500円）に達しました。\n来月までお待ちいただくか、開発者にご相談ください。");
      return;
    }

    setIsGenerating(true);
    try {
      const text = await generateGreetingMessage(data);
      updateData({ customMessage: text });
      addCost(COSTS.TEXT);
      updateBudgetDisplay();
    } catch (e) {
      console.error(e);
      alert("挨拶文の生成に失敗しました。APIキーが正しく設定されているか確認してください。");
    } finally {
      setIsGenerating(false);
    }
  };

  const openCamera = async (memberId: string | null = null) => {
    setActiveMemberId(memberId);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Prefer back camera
      });
      setCameraStream(stream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Camera Error:", err);
      alert("カメラの起動に失敗しました。カメラへのアクセスを許可してください。\n(HTTPSまたはlocalhost環境でのみ動作します)");
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setActiveMemberId(null);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        // Match canvas size to video resolution
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const rawImageData = canvas.toDataURL('image/jpeg', 0.85); // 0.85 quality

        // Resize if too big (for mobile stability)
        resizeBase64(rawImageData).then(imageData => {
          if (activeMemberId) {
            // Update individual member
            const updatedMembers = data.familyMembers.map(m =>
              m.id === activeMemberId ? { ...m, originalImage: imageData, processedImage: null } : m
            );
            updateData({ familyMembers: updatedMembers });
          } else {
            // Update main group image
            updateData({ originalImage: imageData, processedImage: null });
          }

          setEditPrompt("");
          closeCamera();
        }).catch(err => {
          console.error("Resize error:", err);
          alert("写真の処理に失敗しました。もう一度お試しください。");
        });
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, memberId: string | null = null) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await resizeImage(file);
        if (memberId) {
          const updatedMembers = data.familyMembers.map(m =>
            m.id === memberId ? { ...m, originalImage: base64, processedImage: null } : m
          );
          updateData({ familyMembers: updatedMembers });
        } else {
          updateData({ originalImage: base64, processedImage: null });
        }
        setEditPrompt("");
      } catch (err) {
        alert("画像の読み込みに失敗しました。");
      }
    }
  };

  const handleFamilySizeChange = (size: number) => {
    let members = [...data.familyMembers];
    if (size > members.length) {
      // Add members
      for (let i = members.length; i < size; i++) {
        members.push({
          id: `member_${Date.now()}_${i}`,
          originalImage: null,
          processedImage: null,
          profile: ''
        });
      }
    } else if (size < members.length) {
      // Remove members
      members = members.slice(0, size);
    }
    updateData({ familySize: size, familyMembers: members });
  };

  const updateMemberProfile = (id: string, text: string) => {
    const updatedMembers = data.familyMembers.map(m =>
      m.id === id ? { ...m, profile: text } : m
    );
    updateData({ familyMembers: updatedMembers });
  };

  const handleTransform = async () => {
    if (!data.originalImage) return;

    if (!checkBudget(COSTS.IMAGE)) {
      alert("今月の利用限度額（500円）以内で実行できません。\n来月までお待ちください。");
      return;
    }

    setIsGenerating(true);
    try {
      const processed = await transformImageToIllustration(data.originalImage, data.illustrationStyle);
      updateData({ processedImage: processed });
      addCost(COSTS.IMAGE);
      updateBudgetDisplay();
    } catch (e: any) {
      console.error(e);
      alert(`イラスト変換に失敗しました。\nエラー: ${e.message}\n(詳細: ${e.name})`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiEdit = async () => {
    const targetImage = data.processedImage || data.originalImage;
    if (!targetImage || !editPrompt.trim()) return;

    if (!checkBudget(COSTS.IMAGE)) {
      alert("今月の利用限度額（500円）以内で実行できません。\n来月までお待ちください。");
      return;
    }

    setIsGenerating(true);
    try {
      const processed = await editImageWithPrompt(targetImage, editPrompt);
      updateData({ processedImage: processed });
      addCost(COSTS.IMAGE);
      updateBudgetDisplay();
    } catch (e: any) {
      console.error(e);
      alert(`画像の編集に失敗しました。\nエラー: ${e.message}\n(詳細: ${e.name})`);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    updateBudgetDisplay();
    return () => {
      // Cleanup stream on unmount
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Auto-apply template based on familyType from Step 1
  useEffect(() => {
    if (data.familyType && !data.customMessage) {
      applyTemplate(data.familyType);
    }
  }, []);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream]);

  const aspectRatioStyle = data.paperSize === 'a4' ? { aspectRatio: '1 / 1.414' } : { aspectRatio: '1 / 1.48' };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in relative">

      {/* 予算表示バッジ */}
      <div className="absolute top-[-40px] right-0 bg-white px-4 py-2 rounded-full shadow-sm text-xs font-bold text-gray-500 flex items-center gap-2 border border-gray-200">
        <span>💰 今月の利用額:</span>
        <span className={`text-base ${budgetInfo.remaining < 50 ? 'text-red-500' : 'text-green-600'}`}>
          {Math.floor(budgetInfo.used)}円
        </span>
        <span className="text-gray-400">/ 500円</span>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-600">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
            <span className="text-green-600 text-xl">✍️</span> 1. 挨拶文を生成
          </h2>



          <button
            onClick={handleAiText}
            disabled={isGenerating || budgetInfo.remaining < COSTS.TEXT}
            className="w-full bg-gradient-to-r from-gray-700 to-gray-600 text-white py-3 rounded-lg mb-4 font-bold shadow-md hover:shadow-gray-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {isGenerating ? <span className="animate-spin">🌀</span> : "✨ AIでオリジナル文章を作る (有料: 約0.5円)"}
          </button>
          <textarea
            value={data.customMessage}
            onChange={(e) => updateData({ customMessage: e.target.value })}
            className="w-full border-gray-300 border h-48 p-4 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-700 leading-relaxed text-sm bg-gray-50"
            placeholder="ここにAIが作成した文章が表示されます。"
          />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-red-600">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
            <span className="text-red-600 text-xl">📸</span> 2. 写真を加工・編集
          </h2>
          <div className="space-y-4">

            {/* モード選択 (家族全員 vs 個別) */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-4">
              <p className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1">
                <span>👥</span> 写真モードを選択
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateData({ photoMode: 'group' })}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-2 ${data.photoMode === 'group' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  <span>👨‍👩‍👧‍👦</span> 家族全員での挨拶
                </button>
                <button
                  onClick={() => updateData({ photoMode: 'individual' })}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-2 ${data.photoMode === 'individual' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  <span>👤</span> 個々のプロフィール
                </button>
              </div>
            </div>

            {/* 画像選択エリア: ファイル or カメラ */}
            {data.photoMode === 'group' ? (
              <div className="flex gap-4">
                <label className="flex-1 flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-red-50 hover:border-red-300 transition bg-green-50 group shadow-sm">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-2xl mb-1 group-hover:scale-110 transition">📁</span>
                    <p className="text-xs text-gray-600 font-bold">写真を選択</p>
                    <p className="text-[10px] text-gray-400">アルバムから</p>
                  </div>
                  <input type="file" className="hidden" onChange={(e) => handleImageUpload(e)} accept="image/*" />
                </label>

                <button
                  onClick={() => openCamera()}
                  className="flex-1 flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-red-50 hover:border-red-300 transition bg-blue-50 group shadow-sm"
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-2xl mb-1 group-hover:scale-110 transition">📸</span>
                    <p className="text-xs text-gray-600 font-bold">カメラで撮影</p>
                    <p className="text-[10px] text-gray-400">その場で撮影</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-bold text-gray-700">家族の人数:</label>
                  <select
                    value={data.familySize}
                    onChange={(e) => handleFamilySizeChange(Number(e.target.value))}
                    className="border border-gray-300 rounded p-1 text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num}人</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4">
                  {data.familyMembers.map((member, index) => (
                    <div key={member.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex gap-3 items-start">
                      <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 border border-gray-300 relative">
                        {member.originalImage ? (
                          <img src={member.originalImage} className="w-full h-full object-cover" alt={`Member ${index + 1}`} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-700">メンバー {index + 1}</span>
                          <div className="flex gap-1">
                            <label className="cursor-pointer bg-white border border-gray-300 text-gray-600 px-2 py-1 rounded text-[10px] hover:bg-gray-100">
                              📁 選択
                              <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, member.id)} accept="image/*" />
                            </label>
                            <button
                              onClick={() => openCamera(member.id)}
                              className="bg-white border border-gray-300 text-gray-600 px-2 py-1 rounded text-[10px] hover:bg-gray-100"
                            >
                              📸 撮影
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={member.profile}
                          onChange={(e) => updateMemberProfile(member.id, e.target.value)}
                          placeholder="例: パパ、趣味:サッカー"
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.originalImage && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-red-50 rounded-xl border border-red-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                      <span>🎨</span> イラスト変換
                    </div>
                    <div className="flex gap-1">
                      {(['contain', 'cover'] as const).map(fit => (
                        <button
                          key={fit}
                          onClick={() => updateData({ objectFit: fit })}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition ${data.objectFit === fit ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-200'
                            }`}
                        >
                          {fit === 'contain' ? '全体を表示' : '枠に広げる'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(['standard', 'casual', 'simple', 'luxury'] as const).map(style => (
                      <button
                        key={style}
                        onClick={() => updateData({ illustrationStyle: style })}
                        className={`py-2 rounded-lg text-[10px] font-medium border transition ${data.illustrationStyle === style ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200'
                          }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleTransform}
                    disabled={isGenerating || budgetInfo.remaining < COSTS.IMAGE}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? "変換中..." : "イラスト風に変換実行 (約7円)"}
                  </button>
                </div>

                <div className="p-4 bg-gray-100 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                    <span>🪄</span> AIで自由に編集
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="例: 背景を消して"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 outline-none bg-white"
                      onKeyDown={(e) => e.key === 'Enter' && handleAiEdit()}
                    />
                    <button
                      onClick={handleAiEdit}
                      disabled={isGenerating || !editPrompt.trim() || budgetInfo.remaining < COSTS.IMAGE}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg font-bold shadow-md text-sm disabled:opacity-50"
                    >
                      実行 (約7円)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="lg:sticky lg:top-24 w-full flex flex-col items-center">
          <h2 className="font-bold text-gray-500 text-xs mb-4 uppercase tracking-widest">
            Preview / 完成イメージ ({data.paperSize === 'a4' ? 'A4' : 'ハガキ'})
          </h2>

          <div className="w-full flex justify-center px-4">
            <div
              className="w-full max-w-[320px] sm:max-w-sm bg-white border border-gray-100 shadow-2xl p-6 sm:p-8 flex flex-col overflow-hidden relative transition-all duration-300 origin-top"
              style={{ ...aspectRatioStyle, backgroundColor: data.backgroundColor }}
            >
              <div className="h-[45%] bg-gray-100 mb-6 overflow-hidden rounded-sm border border-gray-200 relative shadow-inner group">
                {data.processedImage ? (
                  <img src={data.processedImage} className={`w-full h-full animate-fade-in ${data.objectFit === 'cover' ? 'object-cover' : 'object-contain'}`} alt="Preview" />
                ) : data.originalImage ? (
                  <img src={data.originalImage} className={`w-full h-full opacity-40 ${data.objectFit === 'cover' ? 'object-cover' : 'object-contain'}`} alt="Draft" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300">
                    <span className="text-4xl mb-2">🏡</span>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <p className="text-[10px] sm:text-[11px] leading-relaxed whitespace-pre-wrap text-gray-800 font-serif">
                    {data.customMessage || "挨拶文がここに表示されます。"}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 font-serif">{data.name || "世帯主氏名"} より</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between w-full max-w-sm mt-8 px-4">
            <button onClick={onBack} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 font-bold transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
              戻る
            </button>
            <button
              onClick={onNext}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-xl hover:bg-green-700 transition-all"
            >
              完成！印刷へ進む
            </button>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
          <div className="bg-white p-4 rounded-2xl max-w-lg w-full shadow-2xl">
            <h3 className="text-center font-bold text-gray-800 mb-4">写真を撮影</h3>
            <div className="relative aspect-[3/4] bg-black rounded-xl overflow-hidden mb-6 shadow-inner border border-gray-200">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex justify-between gap-4">
              <button
                onClick={closeCamera}
                className="flex-1 py-3 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                キャンセル
              </button>
              <button
                onClick={takePhoto}
                className="flex-1 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>📸</span> 撮影する
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default StepGen;
