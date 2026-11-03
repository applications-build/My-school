import React, { useState, useRef, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Award,
  Printer,
  Download,
  Share2,
  Sparkles,
  RefreshCw,
  Palette,
  CheckCircle2,
  UserCheck,
  BookOpen,
  GraduationCap,
  Calendar,
  Layers,
  ChevronDown,
  Smartphone,
  Eye,
  FileCheck
} from 'lucide-react';

interface CertificateTemplate {
  id: string;
  name: string;
  category: 'APPRECIATION' | 'EXCELLENCE' | 'SUCCESS' | 'CONDUCT' | 'TALENT';
  description: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultCitation: string;
  defaultBadge: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderColor: string;
  bgGradient: string;
  ribbonColor: string;
}

const CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'gold-classic',
    name: 'شهادة تقدير وشكر رسمية',
    category: 'APPRECIATION',
    description: 'الإطار الذهبي الكلاسيكي المعتمد لوزارة التربية العراقية مع الزخارف التراثية.',
    defaultTitle: 'شهادة شكر وتقدير واعتزاز',
    defaultSubtitle: 'تتقدم إدارة المدرسة بوافر الشكر وعظيم الامتنان تقديراً للجد والمثابرة إلى التلميذ(ة):',
    defaultCitation: 'تقديراً لمشاركاته الإيجابية المتميزة والتزامه العالي بالواجبات المدرسية وروح التعاون مع زملائه ومعلميه طوال الفصل الدراسي.',
    defaultBadge: 'تلميذ متميز ومبادر 🌟',
    primaryColor: '#065f46', // emerald-800
    secondaryColor: '#b45309', // amber-700
    accentColor: '#d97706',
    borderColor: '#d97706',
    bgGradient: 'from-amber-50/80 via-white to-emerald-50/60',
    ribbonColor: '#b45309',
  },
  {
    id: 'royal-excellence',
    name: 'شهادة تفوق علمي وامتياز',
    category: 'EXCELLENCE',
    description: 'قالب ملكي نيلي مذهب خاص بأوائل الصفوف والتلاميذ الحاصلين على معدلات 90-100%.',
    defaultTitle: 'شهادة تفوق علمي وامتياز باهر',
    defaultSubtitle: 'يسر الهيئة التعليمية وإدارة المدرسة أن تمنح وسام التفوق والريادة إلى التلميذ(ة):',
    defaultCitation: 'لحصوله على أعلى الدرجات والمركز المتقدم في الامتحانات المدرسية وتفوقه الباهر في جميع المواد الدراسية بجد واقتدار.',
    defaultBadge: 'المرتبة الأولى امتياز 🥇',
    primaryColor: '#1e3a8a', // blue-900
    secondaryColor: '#d97706', // amber-600
    accentColor: '#fbbf24',
    borderColor: '#2563eb',
    bgGradient: 'from-blue-50/80 via-white to-amber-50/60',
    ribbonColor: '#1e3a8a',
  },
  {
    id: 'emerald-success',
    name: 'شهادة نجاح وارتقاء دراسي',
    category: 'SUCCESS',
    description: 'شهادة ارتقاء رسمي للصف الأعلى بنجاح وتفوق مع توثيق السجل المدرسي.',
    defaultTitle: 'شهادة نجاح وارتقاء دراسي',
    defaultSubtitle: 'تشهد إدارة المدرسة بأن التلميذ(ة) قد أتم متطلبات العام الدراسي بنجاح واقتدار:',
    defaultCitation: 'واجتاز الامتحانات المقررة بنجاح باهر وبمعدل مشرف، وارتقى بجدارة واستحقاق إلى الصف الدراسي القادم متمنين له دوام العطاء.',
    defaultBadge: 'ناجح ومرتقٍ بجدارة 🎓',
    primaryColor: '#047857', // emerald-700
    secondaryColor: '#0f766e', // teal-700
    accentColor: '#10b981',
    borderColor: '#059669',
    bgGradient: 'from-emerald-50/90 via-white to-teal-50/60',
    ribbonColor: '#047857',
  },
  {
    id: 'purple-ideal',
    name: 'شهادة التلميذ المثالي والقدوة',
    category: 'CONDUCT',
    description: 'تكريم الأخلاق الفاضلة، الانضباط المدرسي، ومساعدة الزملاء والمعلمين.',
    defaultTitle: 'شهادة التلميذ المثالي والقدوة الحسنة',
    defaultSubtitle: 'تمنح إدارة المدرسة هذه الشهادة تقديراً لسمو الأخلاق ونبل السلوك إلى التلميذ(ة):',
    defaultCitation: 'تقديراً لأخلاقه الرفيعة وانضباطه المثالي في الطابور الصباحي ونظافته وحسن تعامله مع الهيئة التعليمية وزملائه التلاميذ.',
    defaultBadge: 'التلميذ القدوة للعام 🏆',
    primaryColor: '#581c87', // purple-900
    secondaryColor: '#a21caf', // fuchsia-700
    accentColor: '#c084fc',
    borderColor: '#7e22ce',
    bgGradient: 'from-purple-50/80 via-white to-pink-50/50',
    ribbonColor: '#7e22ce',
  },
  {
    id: 'amber-conduct',
    name: 'شهادة حسن سيرة وسلوك ومواظبة',
    category: 'CONDUCT',
    description: 'شهادة توثيق الحضور الكامل وعدم الغياب والالتزام بالزي المدرسي الموحد.',
    defaultTitle: 'شهادة حسن سيرة وسلوك ومواظبة تامة',
    defaultSubtitle: 'تشهد إدارة المدرسة والمشرف التربوي بالتزام التلميذ(ة) النموذجي:',
    defaultCitation: 'لمواظبته على الدوام المدرسي دون أي غياب وحرصه الدائم على التواجد المبكر والالتزام بأنظمة المدرسة وقيم المواطنة الصالحة.',
    defaultBadge: 'مواظبة 100% بلا غياب ⏱️',
    primaryColor: '#854d0e', // yellow-800
    secondaryColor: '#c2410c', // orange-700
    accentColor: '#f59e0b',
    borderColor: '#b45309',
    bgGradient: 'from-amber-50/90 via-white to-orange-50/50',
    ribbonColor: '#b45309',
  },
  {
    id: 'teal-talents',
    name: 'شهادة الإبداع والأنشطة المدرسية',
    category: 'TALENT',
    description: 'لتكريم المواهب في تلاوة القرآن، الخط العربي، الرسم، الرياضة، والخطابة.',
    defaultTitle: 'شهادة الإبداع والتميز في الأنشطة المدرسية',
    defaultSubtitle: 'تحية فخر واعتزاز بالموهبة الطلابية الفذة الممنوحة للتلميذ(ة):',
    defaultCitation: 'لتألقه الاستثنائي في فعاليات الأنشطة اللاصفية والمعارض المدرسية والمهرجانات التربوية وإبراز الصورة المشرقة لمدرستنا العزيزة.',
    defaultBadge: 'نجم الأنشطة والمواهب 🎨',
    primaryColor: '#0f766e', // teal-700
    secondaryColor: '#0369a1', // sky-700
    accentColor: '#14b8a6',
    borderColor: '#0d9488',
    bgGradient: 'from-teal-50/90 via-white to-cyan-50/60',
    ribbonColor: '#0f766e',
  },
];

export const ImageGenStudio: React.FC = () => {
  const { db } = useSchool();
  const certificateRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Selected Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('gold-classic');
  const activeTemplate = CERTIFICATE_TEMPLATES.find((t) => t.id === selectedTemplateId) || CERTIFICATE_TEMPLATES[0];

  // Editable Certificate Fields
  const [mainTitle, setMainTitle] = useState(activeTemplate.defaultTitle);
  const [subtitle, setSubtitle] = useState(activeTemplate.defaultSubtitle);
  const [studentName, setStudentName] = useState('علي حسين كاظم العبيدي');
  const [studentClass, setStudentClass] = useState('الصف الخامس الابتدائي - شعبة أ');
  const [citationText, setCitationText] = useState(activeTemplate.defaultCitation);
  const [honorBadge, setHonorBadge] = useState(activeTemplate.defaultBadge);
  const [schoolName, setSchoolName] = useState(db?.schoolInfo?.name || 'مدرسة الرافدين النموذجية للبنين');
  const [directorName, setDirectorName] = useState(db?.schoolInfo?.principal || 'مدير المدرسة');
  const [teacherName, setTeacherName] = useState('معلم الصف / المرشد التربوي');
  const [academicYear, setAcademicYear] = useState(db?.currentAcademicYear || '2024 - 2025');
  const [issueDate, setIssueDate] = useState(() => {
    return new Date().toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  const [downloadingImage, setDownloadingImage] = useState(false);
  const [mobilePrintTriggered, setMobilePrintTriggered] = useState(false);

  // Sync default texts when template changes if user hasn't heavily customized
  const handleSelectTemplate = (template: CertificateTemplate) => {
    setSelectedTemplateId(template.id);
    setMainTitle(template.defaultTitle);
    setSubtitle(template.defaultSubtitle);
    setCitationText(template.defaultCitation);
    setHonorBadge(template.defaultBadge);
  };

  // Quick student select handler
  const handleSelectExistingStudent = (sId: string) => {
    const st = db?.students?.find((s) => s.id === sId);
    if (st) {
      setStudentName(st.fullName);
      setStudentClass(`${st.gradeLevel} - شعبة ${st.section}`);
    }
  };

  // Direct Mobile Phone Printing
  const handleMobilePrint = () => {
    setMobilePrintTriggered(true);
    setTimeout(() => {
      window.print();
      setMobilePrintTriggered(false);
    }, 150);
  };

  // High-Resolution Image Export (Canvas Download for Mobile)
  const handleDownloadAsImage = () => {
    setDownloadingImage(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Canvas dimensions: 2400 x 1700 (Ultra High-Res Landscape A4)
      const width = 2400;
      const height = 1700;
      canvas.width = width;
      canvas.height = height;

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      if (activeTemplate.id === 'royal-excellence') {
        bgGrad.addColorStop(0, '#f8fafc');
        bgGrad.addColorStop(0.5, '#ffffff');
        bgGrad.addColorStop(1, '#eff6ff');
      } else if (activeTemplate.id === 'purple-ideal') {
        bgGrad.addColorStop(0, '#faf5ff');
        bgGrad.addColorStop(0.5, '#ffffff');
        bgGrad.addColorStop(1, '#fdf4ff');
      } else {
        bgGrad.addColorStop(0, '#fffbeb');
        bgGrad.addColorStop(0.5, '#ffffff');
        bgGrad.addColorStop(1, '#f0fdf4');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Outer Ornate Double Border
      ctx.strokeStyle = activeTemplate.borderColor;
      ctx.lineWidth = 18;
      ctx.strokeRect(60, 60, width - 120, height - 120);

      // Inner Fine Accent Border
      ctx.strokeStyle = activeTemplate.secondaryColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(88, 88, width - 176, height - 176);

      // Decorative Corner Brackets
      const drawCorner = (x: number, y: number, dirX: number, dirY: number) => {
        ctx.save();
        ctx.strokeStyle = activeTemplate.accentColor;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(x, y + dirY * 60);
        ctx.lineTo(x, y);
        ctx.lineTo(x + dirX * 60, y);
        ctx.stroke();
        ctx.restore();
      };
      drawCorner(74, 74, 1, 1);
      drawCorner(width - 74, 74, -1, 1);
      drawCorner(74, height - 74, 1, -1);
      drawCorner(width - 74, height - 74, -1, -1);

      // Typography Setup
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';

      // 1. Header: MoE Iraq
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 44px "Cairo", "Segoe UI", Tahoma, sans-serif';
      ctx.fillText('جمهورية العراق · وزارة التربية', width / 2, 190);

      // 2. School Name
      ctx.fillStyle = '#475569';
      ctx.font = '600 36px "Cairo", "Segoe UI", Tahoma, sans-serif';
      ctx.fillText(schoolName, width / 2, 255);

      // 3. Main Title
      ctx.fillStyle = activeTemplate.primaryColor;
      ctx.font = 'bold 84px "Cairo", "Segoe UI", Tahoma, sans-serif';
      ctx.fillText(mainTitle, width / 2, 400);

      // Decorative divider bar under title
      ctx.fillStyle = activeTemplate.borderColor;
      ctx.fillRect(width / 2 - 250, 440, 500, 6);

      // 4. Subtitle / Introductory Address
      ctx.fillStyle = '#334155';
      ctx.font = '500 38px "Cairo", "Segoe UI", Tahoma, sans-serif';
      ctx.fillText(subtitle, width / 2, 540);

      // 5. Student Name Plaque
      const plaqueWidth = 1400;
      const plaqueHeight = 130;
      const plaqueX = (width - plaqueWidth) / 2;
      const plaqueY = 600;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = activeTemplate.borderColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(plaqueX, plaqueY, plaqueWidth, plaqueHeight, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = activeTemplate.primaryColor;
      ctx.font = 'bold 64px "Cairo", "Segoe UI", Tahoma, sans-serif';
      ctx.fillText(studentName, width / 2, plaqueY + 88);

      // 6. Class & Section
      ctx.fillStyle = '#0f766e';
      ctx.font = 'bold 40px "Cairo", "Segoe UI", Tahoma, sans-serif';
      ctx.fillText(studentClass, width / 2, 810);

      // 7. Citation Text (Wrapped)
      ctx.fillStyle = '#1e293b';
      ctx.font = '400 36px "Cairo", "Segoe UI", Tahoma, sans-serif';
      
      // Multi-line citation text
      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, currentY);
      };
      wrapText(citationText, width / 2, 900, 1800, 56);

      // 8. Honor Badge Pill
      if (honorBadge) {
        ctx.fillStyle = activeTemplate.primaryColor;
        ctx.beginPath();
        ctx.roundRect(width / 2 - 240, 1070, 480, 80, 40);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Cairo", "Segoe UI", Tahoma, sans-serif';
        ctx.fillText(honorBadge, width / 2, 1124);
      }

      // 9. Academic Year & Issue Date
      ctx.fillStyle = '#64748b';
      ctx.font = '500 32px "Cairo", "Segoe UI", Tahoma, sans-serif';
      ctx.fillText(`العام الدراسي: ${academicYear}   ·   تاريخ التحرير: ${issueDate}`, width / 2, 1260);

      // 10. Signatures Line
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;

      // Teacher / Counselor Signature Line
      ctx.beginPath();
      ctx.moveTo(300, 1450);
      ctx.lineTo(750, 1450);
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 36px "Cairo", "Segoe UI", Tahoma, sans-serif';
      ctx.fillText(teacherName, 525, 1510);
      ctx.fillStyle = '#64748b';
      ctx.font = '400 30px "Cairo", "Segoe UI", Tahoma, sans-serif';
      ctx.fillText('التوقيع والختم التربوي', 525, 1560);

      // Official School Seal Center Motif
      ctx.fillStyle = '#f1f5f9';
      ctx.strokeStyle = activeTemplate.borderColor;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(width / 2, 1460, 85, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = activeTemplate.primaryColor;
      ctx.font = 'bold 28px "Cairo", "Segoe UI", Tahoma, sans-serif';
      ctx.fillText('ختم المدرسة', width / 2, 1455);
      ctx.font = 'bold 24px "Cairo", "Segoe UI", Tahoma, sans-serif';
      ctx.fillText('الرسمي', width / 2, 1490);

      // Principal Signature Line
      ctx.beginPath();
      ctx.moveTo(width - 750, 1450);
      ctx.lineTo(width - 300, 1450);
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 36px "Cairo", "Segoe UI", Tahoma, sans-serif';
      ctx.fillText(directorName, width - 525, 1510);
      ctx.fillStyle = '#64748b';
      ctx.font = '400 30px "Cairo", "Segoe UI", Tahoma, sans-serif';
      ctx.fillText('مدير المدرسة الابتدائية', width - 525, 1560);

      // Convert canvas to downloadable PNG
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `شهادة_تقدير_${studentName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Failed to export certificate image:', e);
    } finally {
      setDownloadingImage(false);
    }
  };

  // WhatsApp Share Link
  const handleWhatsAppShare = () => {
    const text = `نبارك للتلميذ المتميز (${studentName}) في (${schoolName}) حصوله على:
${mainTitle}
${citationText}
العام الدراسي: ${academicYear}
مع أطيب تمنيات إدارة المدرسة بالنجاح الدائم والتألق المستمر.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Hidden print stylesheet dedicated for mobile phones and desktop printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-certificate-container, #printable-certificate-container * {
            visibility: visible !important;
          }
          #printable-certificate-container {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 999999 !important;
            background: white !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>

      {/* Hidden high-res canvas used for generating ultra sharp PNG images */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              قوالب واستوديو الشهادات التقديرية والتفوق
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إصدار وطباعة شهادات التقدير، النجاح، والتفوق للتلاميذ بدقة عالية مع دعم كامل للطباعة والحفظ على الهواتف
          </p>
        </div>

        {/* Action Buttons for Mobile & Desktop */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleMobilePrint}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الشهادة (للهاتف والكمبيوتر)</span>
          </button>

          <button
            onClick={handleDownloadAsImage}
            disabled={downloadingImage}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            {downloadingImage ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>حفظ كصورة للهاتف (PNG عالية الدقة)</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">تهنئة واتساب</span>
          </button>
        </div>
      </div>

      {/* Template Selection Cards Carousel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-700" />
            اختر قالب الشهادة المناسب:
          </h3>
          <span className="text-[11px] text-slate-500">({CERTIFICATE_TEMPLATES.length} قوالب رسمية معتمدة)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CERTIFICATE_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl)}
              type="button"
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                selectedTemplateId === tmpl.id
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: tmpl.borderColor }}
                  />
                  {selectedTemplateId === tmpl.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  )}
                </div>
                <div className="font-bold text-xs text-slate-900 leading-snug">
                  {tmpl.name}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {tmpl.description}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1 text-[10px] text-emerald-800 font-medium">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>جاهز للتعديل</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Controls (Left) & Real-time Live Certificate Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Full text and titles customization */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              تعديل نصوص وعناوين الشهادة
            </h3>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
              تحديث حي فوري
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Quick Select Student */}
            {db?.students && db.students.length > 0 && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  اختيار سريع من تلاميذ المدرسة:
                </label>
                <select
                  onChange={(e) => handleSelectExistingStudent(e.target.value)}
                  defaultValue=""
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="" disabled>-- اضغط لاختيار تلميذ مسجل لتعبئة بياناته تلقائياً --</option>
                  {db.students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.gradeLevel} - شعبة {st.section})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Main Title */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                عنوان الشهادة الرئيسي:
              </label>
              <input
                type="text"
                value={mainTitle}
                onChange={(e) => setMainTitle(e.target.value)}
                placeholder="مثال: شهادة شكر وتقدير وتفوق"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                العنوان الفرعي والتمهيد:
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="مثال: تتقدم إدارة المدرسة بوافر الشكر والتقدير إلى التلميذ(ة):"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Student Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                اسم التلميذ المكرم الثلاثي:
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="مثال: علي حسين كاظم العبيدي"
                className="w-full px-3 py-2 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-950 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Class and Section */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                الصف والشعبة:
              </label>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="مثال: الصف الخامس الابتدائي - شعبة أ"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Citation Text */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                نص الإشادة وسبب التكريم:
              </label>
              <textarea
                rows={3}
                value={citationText}
                onChange={(e) => setCitationText(e.target.value)}
                placeholder="اكتب عبارات التقدير والإشادة بالجهود..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Honor Badge / Ribbon */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                شارة ووسام التكريم:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={honorBadge}
                  onChange={(e) => setHonorBadge(e.target.value)}
                  placeholder="مثال: المرتبة الأولى 🥇 أو تلميذ مثالي 🌟"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* School & Signatures */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  اسم المدرسة:
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  العام الدراسي:
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  مدير المدرسة:
                </label>
                <input
                  type="text"
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المعلم / المرشد:
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                تاريخ الإصدار:
              </label>
              <input
                type="text"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Right Stage: Live Interactive Certificate Display Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                  <Eye className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    معاينة حية دقيقة للشهادة (مقاس A4 عرضي)
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    القالب: {activeTemplate.name} · متوافق مع شاشات الهواتف والمطبوعات
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="hidden sm:inline text-[11px] text-slate-500 font-mono">
                  جاهز للتصدير
                </span>
              </div>
            </div>

            {/* The Certificate Container (Targeted by @media print) */}
            <div
              id="printable-certificate-container"
              className="w-full overflow-hidden flex items-center justify-center p-1 sm:p-2"
            >
              <div
                ref={certificateRef}
                className={`w-full max-w-2xl bg-gradient-to-br ${activeTemplate.bgGradient} rounded-2xl border-8 border-double p-6 sm:p-8 shadow-md relative overflow-hidden transition-all`}
                style={{
                  borderColor: activeTemplate.borderColor,
                }}
              >
                {/* Ornate Corner Accents */}
                <div
                  className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 rounded-tr-md"
                  style={{ borderColor: activeTemplate.accentColor }}
                />
                <div
                  className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 rounded-tl-md"
                  style={{ borderColor: activeTemplate.accentColor }}
                />
                <div
                  className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 rounded-br-md"
                  style={{ borderColor: activeTemplate.accentColor }}
                />
                <div
                  className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 rounded-bl-md"
                  style={{ borderColor: activeTemplate.accentColor }}
                />

                {/* Inner Fine Border Frame */}
                <div
                  className="border-2 border-dashed rounded-xl p-4 sm:p-6 text-center space-y-3.5 bg-white/85 backdrop-blur-2xs"
                  style={{ borderColor: `${activeTemplate.secondaryColor}50` }}
                >
                  {/* Top Header */}
                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-bold text-emerald-900">
                      جمهورية العراق · وزارة التربية
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-slate-600">
                      {schoolName}
                    </div>
                  </div>

                  {/* Main Certificate Title */}
                  <div className="py-1">
                    <h2
                      className="text-xl sm:text-3xl font-extrabold tracking-tight"
                      style={{ color: activeTemplate.primaryColor }}
                    >
                      {mainTitle}
                    </h2>
                    <div
                      className="w-24 h-1 mx-auto mt-1.5 rounded-full"
                      style={{ backgroundColor: activeTemplate.borderColor }}
                    />
                  </div>

                  {/* Introductory text */}
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">
                    {subtitle}
                  </p>

                  {/* Student Name Plaque */}
                  <div className="py-1 px-4">
                    <div
                      className="py-2 px-6 rounded-xl border-2 shadow-2xs inline-block min-w-[240px] max-w-full bg-white"
                      style={{
                        borderColor: activeTemplate.borderColor,
                        color: activeTemplate.primaryColor,
                      }}
                    >
                      <span className="text-lg sm:text-2xl font-black">
                        {studentName}
                      </span>
                    </div>
                  </div>

                  {/* Class and Section */}
                  <div className="text-xs sm:text-sm font-bold text-emerald-800">
                    {studentClass}
                  </div>

                  {/* Citation text */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto font-normal px-2">
                    {citationText}
                  </p>

                  {/* Honor Badge */}
                  {honorBadge && (
                    <div className="pt-1">
                      <span
                        className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-black text-white shadow-2xs"
                        style={{ backgroundColor: activeTemplate.primaryColor }}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        {honorBadge}
                      </span>
                    </div>
                  )}

                  {/* Date and Academic Year */}
                  <div className="text-[11px] text-slate-500 pt-1">
                    <span>العام الدراسي: {academicYear}</span>
                    <span className="mx-2">·</span>
                    <span>تحريراً في: {issueDate}</span>
                  </div>

                  {/* Signatures & School Seal Footer */}
                  <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-800 px-2 sm:px-6">
                    <div className="text-center space-y-1">
                      <div className="font-bold text-slate-900">{teacherName}</div>
                      <div className="text-[10px] text-slate-500">معلم الصف / المشرف</div>
                      <div className="w-24 h-0.5 bg-slate-300 mx-auto mt-2" />
                    </div>

                    {/* School Seal Graphic */}
                    <div
                      className="w-14 h-14 rounded-full border-2 border-double flex flex-col items-center justify-center text-[9px] font-bold shadow-2xs bg-white/90"
                      style={{
                        borderColor: activeTemplate.borderColor,
                        color: activeTemplate.primaryColor,
                      }}
                    >
                      <span>ختم</span>
                      <span>المدرسة</span>
                    </div>

                    <div className="text-center space-y-1">
                      <div className="font-bold text-slate-900">{directorName}</div>
                      <div className="text-[10px] text-slate-500">مدير المدرسة الابتدائية</div>
                      <div className="w-24 h-0.5 bg-slate-300 mx-auto mt-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-Friendly Quick Tips */}
            <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
              <Smartphone className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">ملاحظة لمستخدمي الهواتف الذكية: </span>
                <span>
                  يمكنك الضغط على زر <strong>«حفظ كصورة للهاتف»</strong> لحفظ الشهادة مباشرة في ألبوم الصور بدقة فائقة وبدون أي حواف، أو الضغط على <strong>«طباعة الشهادة»</strong> لفتح نافذة الطباعة المتوافقة مع طابعات الواي فاي وميزة AirPrint.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
