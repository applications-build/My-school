import React, { useState } from 'react';
import { generateEducationalImage } from '../services/api';
import { useSchool } from '../context/SchoolContext';
import { Sparkles, Download, Printer, Image, Award, BookOpen, Layers, RefreshCw, CheckCircle2 } from 'lucide-react';

interface GeneratedItem {
  id: string;
  title: string;
  prompt: string;
  size: '1K' | '2K' | '4K';
  type: 'certificate' | 'illustration' | 'badge';
  imageUrl: string;
  resolution: string;
  timestamp: string;
}

export const ImageGenStudio: React.FC = () => {
  const { db } = useSchool();
  const [selectedSize, setSelectedSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generationType, setGenerationType] = useState<'certificate' | 'illustration' | 'badge'>('certificate');
  const [prompt, setPrompt] = useState('تفوق دراسي في مادة الفيزياء للصف السادس العلمي');
  const [studentOrTopicTitle, setStudentOrTopicTitle] = useState('إلى الطالب المتفوق: جعفر علي حيدر');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gallery of generated assets
  const [gallery, setGallery] = useState<GeneratedItem[]>([
    {
      id: 'gen-1',
      title: 'شهادة تقدير وتفوق - جعفر علي حيدر',
      prompt: 'تفوق دراسي في مادة الفيزياء للصف السادس العلمي وحصوله على الدرجة الكاملة',
      size: '2K',
      type: 'certificate',
      imageUrl: '', // synthesized SVG fallback rendered directly
      resolution: '2K (2048x2048 - عالي الدقة)',
      timestamp: '2024-10-25 11:30',
    },
  ]);

  const [activeItem, setActiveItem] = useState<GeneratedItem | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await generateEducationalImage(
        prompt,
        selectedSize,
        generationType,
        studentOrTopicTitle
      );

      const newItem: GeneratedItem = {
        id: `gen-${Date.now()}`,
        title: studentOrTopicTitle || prompt.slice(0, 30),
        prompt,
        size: selectedSize,
        type: generationType,
        imageUrl: res.imageUrl,
        resolution: res.resolution,
        timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
      };

      setGallery([newItem, ...gallery]);
      setActiveItem(newItem);
    } catch (err: any) {
      setError(err.message || 'تعذر توليد الصورة بالدقة المطلوبة.');
    } finally {
      setLoading(false);
    }
  };

  const currentDisplay = activeItem || gallery[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              استوديو الوسائل والشهادات التقديرية بالذكاء الاصطناعي
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            توليد شهادات تقديرية رسمية ووسائل إيضاح للمناهج العراقية باستخدام نموذج gemini-3-pro-image-preview مع خيارات الدقة (1K / 2K / 4K)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-800 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>النموذج: gemini-3-pro-image-preview</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameters & Resolution Affordance (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            إعدادات التوليد الفني والتربوي
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            {/* Resolution Selector Affordance: 1K, 2K, 4K */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                دقة الصورة ومقاس التصدير (Image Size Affordance):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['1K', '2K', '4K'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      selectedSize === sz
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-2 ring-emerald-600/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="font-mono text-sm">{sz}</div>
                    <div className="text-[10px] text-slate-500">
                      {sz === '1K' ? '1024px' : sz === '2K' ? '2048px' : '4096px'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {selectedSize === '1K' && 'مناسب للعرض السريع على الهواتف والأجهزة اللوحية.'}
                {selectedSize === '2K' && 'دقة عالية متوازنة للشاشات الكبيرة والمطبوعات المدرسية.'}
                {selectedSize === '4K' && 'فائق الدقة معد للطباعة الورقية الفاخرة والملصقات الجدارية.'}
              </div>
            </div>

            {/* Category / Type Selector */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">نوع الوسيلة التعليمية:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'certificate', label: 'شهادة تقدير', icon: <Award className="w-3.5 h-3.5" /> },
                  { id: 'illustration', label: 'وسيلة إيضاح', icon: <BookOpen className="w-3.5 h-3.5" /> },
                  { id: 'badge', label: 'شعار تكريم', icon: <Layers className="w-3.5 h-3.5" /> },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setGenerationType(t.id as any)}
                    className={`py-2 px-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      generationType === t.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {t.icon}
                    <span className="text-[11px]">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title / Recipient Field */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {generationType === 'certificate' ? 'اسم الطالب المكرم أو صفته:' : 'عنوان الوسيلة التعليمية:'}
              </label>
              <input
                type="text"
                required
                value={studentOrTopicTitle}
                onChange={(e) => setStudentOrTopicTitle(e.target.value)}
                placeholder="مثال: إلى الطالب المتفوق: جعفر علي حيدر"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            {/* Prompt description */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                الوصف التفصيلي (Prompt):
              </label>
              <textarea
                rows={3}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="اكتب تفاصيل التكريم أو المحتوى العلمي للرسم التوضيحي..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري التوليد بواسطة gemini-3-pro-image-preview...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>توليد الوسيلة الآن بدقة {selectedSize}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Stage: Preview & Print/Export (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {currentDisplay?.title || 'معاينة الوسيلة التعليمية'}
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  الدقة: {currentDisplay?.resolution || `${selectedSize} (مقياس الطباعة)`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  طباعة
                </button>
              </div>
            </div>

            {/* Image / Certificate Display Canvas */}
            <div className="relative aspect-4/3 rounded-xl border border-slate-200 bg-slate-900/5 overflow-hidden flex items-center justify-center">
              {currentDisplay?.imageUrl ? (
                <img
                  src={currentDisplay.imageUrl}
                  alt={currentDisplay.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              ) : (
                // Rich Vector Scholastic Certificate Artwork
                <div className="w-full h-full p-4 flex items-center justify-center bg-radial from-amber-50 to-emerald-50 text-center">
                  <div className="border-4 border-double border-amber-600/80 rounded-xl p-6 max-w-lg w-full bg-white/95 shadow-sm space-y-3">
                    <div className="text-xs font-bold text-emerald-900">جمهورية العراق · وزارة التربية</div>
                    <div className="text-[11px] text-slate-500">{db?.schoolInfo?.name || 'مدرسة الرافدين النموذجية'}</div>
                    <div className="text-2xl font-extrabold text-amber-700 pt-1">شهادة شكر وتقدير وتفوق</div>
                    <div className="text-xs text-slate-600">تمنح إدارة المدرسة هذه الشهادة تقديراً للتفوق العلمي الباهر إلى:</div>
                    <div className="text-lg font-bold text-emerald-900 bg-emerald-50 py-1.5 px-4 rounded-lg border border-emerald-200">
                      {currentDisplay?.title || studentOrTopicTitle}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed px-4">
                      {currentDisplay?.prompt || prompt}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-3 border-t border-slate-200">
                      <span>دقة المخرجات: {currentDisplay?.size || selectedSize} UHD</span>
                      <span>مدير المدرسة: د. حيدر عبد الحسن العراقي</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
              <span>المواصفات: دقة {currentDisplay?.size || selectedSize} · معتمدة لسجلات المدرسة والجداريات</span>
              <span className="font-mono text-[11px] text-emerald-700 font-bold">
                gemini-3-pro-image-preview
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
