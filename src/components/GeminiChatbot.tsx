import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
import { formatTeacherName } from '../types';
import { Send, Bot, User, Sparkles, Trash2, Copy, Check, ShieldCheck, GraduationCap, Users } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const GeminiChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      role: 'model',
      text: `مرحباً بك في المساعد الذكي لنظام «مدرستي» المخصص للمدارس العراقية.
يسعدني مساعدتك في كافة الجوانب التعليمية والإدارية والتربوية:
• صياغة خطط الدروس والأنشطة الصفية وفق مناهج وزارة التربية العراقية.
• إعداد نماذج الأسئلة الامتحانية الوزارية والشهرية.
• الاستشارات الإدارية ولوائح التوجيه والتقويم.
• إرشادات وتوجيهات لأولياء الأمور لمتابعة تحصيل أبنائهم الدراسي.

كيف يمكنني خدمتك اليوم؟`,
      timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [systemRole, setSystemRole] = useState<'PRINCIPAL_ADVISOR' | 'TEACHER_PEDAGOGY' | 'PARENT_GUIDE'>('TEACHER_PEDAGOGY');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-4-argon' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInputText('');
    setLoading(true);

    try {
      // Map history to API format
      const historyPayload = nextHistory.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await sendChatMessage(historyPayload, systemRole, selectedModel);

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `عذراً، حدث خطأ: ${err.message || 'تعذر الاتصال بالمساعد الذكي'}. يرجى المحاولة مرة أخرى.`,
        timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('هل تريد مسح سجل المحادثة والبدء من جديد؟')) {
      setMessages([
        {
          id: 'm-welcome-reset',
          role: 'model',
          text: 'تم مسح السجل بنجاح. أهلاً بك مجدداً، كيف أستطيع مساعدتك؟',
          timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const quickPrompts = [
    { label: 'خطة درس فيزياء للفرع العلمي', prompt: 'اقترح خطة درس يومية نموذجية لمادة الفيزياء للصف السادس العلمي حول موضوع الحث الكهرومغناطيسي تشمل الأهداف والواجب البيتي.' },
    { label: 'صياغة 5 أسئلة وزارية في القواعد', prompt: 'اكتب 5 أسئلة وزارية نموذجية لمادة قواعد اللغة العربية للصف السادس الابتدائي مع الإجابات النموذجية.' },
    { label: 'نصائح لولي أمر طالب متراجع دراسياً', prompt: 'ما هي الخطوات التربوية التي يجب على ولي أمر الطالب اتباعها لمساعدة ابنه الذي يواجه صعوبة في مادة الرياضيات؟' },
    { label: 'صيغة محضر اجتماع مجلس الآباء', prompt: 'اكتب نموذج محضر رسمي لاجتماع مجلس الآباء والمعلمين الأول للفصل الدراسي في مدرسة عراقية نموذجية.' },
  ];

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">المساعد المدرسي الذكي (Gemini)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            محادثة تفاعلية متعددة الجولات لمساعدة الإدارة والكادر التدريسي وأولياء الأمور
          </p>
        </div>

        {/* Roles and Models Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role selector with system instruction */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs text-xs">
            <span className="text-slate-500 font-medium">الدور:</span>
            <select
              value={systemRole}
              onChange={(e) => setSystemRole(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="TEACHER_PEDAGOGY">المساعد التربوي ومصمم الاختبارات (للكادر)</option>
              <option value="PRINCIPAL_ADVISOR">مستشار الإدارة المدرسية (للمدير)</option>
              <option value="PARENT_GUIDE">المرشد التعليمي للأسرة والطالب (لأولياء الأمور)</option>
            </select>
          </div>

          {/* Model selector requirement: gemini-4-argon (complex), gemini-3.8-flash (general), gemini-3.1-flash-lite (fast) */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs text-xs">
            <span className="text-slate-500 font-medium">النموذج:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-transparent font-bold text-emerald-800 focus:outline-none cursor-pointer font-mono"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (مهام عامة - موصى به)</option>
              <option value="gemini-4-argon">gemini-4-argon (مهام معقدة واستنتاج عالي)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (استجابة فورية سريعة)</option>
            </select>
          </div>

          {/* Clear History */}
          <button
            onClick={handleClearHistory}
            title="مسح سجل المحادثة"
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Prompts Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap shrink-0">
          مقترحات سريعة:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.prompt)}
            disabled={loading}
            className="text-[11px] font-medium px-3 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-lg whitespace-nowrap shrink-0 transition-colors shadow-2xs"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Main Chat Thread Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[560px] overflow-hidden">
        {/* Scrollable messages thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';

            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed group relative ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tl-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tr-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  <div
                    className={`mt-2 flex items-center justify-between text-[10px] ${
                      isUser ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    <span>{m.timestamp}</span>

                    {!isUser && (
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-slate-700"
                        title="نسخ النص"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-xl ml-auto">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tr-xs p-4 text-xs text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-medium mr-1">المساعد يفكر ويصيغ الرد...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              disabled={loading}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب استفسارك أو طلبك للمساعد المدرسي هنا..."
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>إرسال</span>
              <Send className="w-3.5 h-3.5 rotate-180" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1">
            <span>النموذج النشط: {selectedModel} · تلتزم المحادثة بضوابط وزارة التربية العراقية وسابقة «أ.» للكادر</span>
            <span>اضغط Enter للإرسال السريع</span>
          </div>
        </div>
      </div>
    </div>
  );
};
