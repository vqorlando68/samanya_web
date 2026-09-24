import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  sendChatMessage,
  ChatMessage,
  AppOperationalContext
} from '../../services/aiService';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Minimize2,
  Maximize2,
  ChevronDown,
  Building2,
  Clock,
  ShieldCheck,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

const SUGERENCIAS_PREGUNTAS = [
  '¿Quién está de turno mañana?',
  '¿Cuáles son los turnos de hoy?',
  '¿Cuántos residentes hay registrados en la sede?',
  '¿Hay permisos o ausencias pendientes?',
  '¿Quiénes integran el equipo de enfermería?'
];

const buildWelcomeMessage = (sedeNombre: string): ChatMessage => ({
  id: 'msg-welcome',
  role: 'assistant',
  content: `👋 **¡Hola! Soy tu Asistente Samanya OS.**\n\nPuedo responder preguntas operativas en tiempo real sobre la sede actual (**${sedeNombre || 'General'}**), tales como:\n• 📅 **¿Quién está de turno mañana?**\n• 🕒 **¿Qué personal está activo hoy?**\n• 🧓 **Estado y habitaciones de residentes**\n• 📋 **Permisos e incidentes pendientes**\n\n¿En qué te puedo colaborar hoy?`,
  timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
});

export const SamanyaAiChat: React.FC = () => {
  const {
    activeSede,
    sedes,
    residentes,
    familiares,
    trabajadores,
    turnos,
    permisos,
    incidentes,
    metrics
  } = useAdmin();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [buildWelcomeMessage(activeSede?.nombre || 'General')];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar mensaje de bienvenida si cambia la sede activa y no hay conversación avanzada
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [buildWelcomeMessage(activeSede?.nombre || 'General')];
      }
      return prev;
    });
  }, [activeSede?.id, activeSede?.nombre]);

  // Auto-scroll al final cuando llegan mensajes o carga
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Enfocar input al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    const contextData: AppOperationalContext = {
      activeSede,
      sedes,
      residentes,
      familiares,
      trabajadores,
      turnos,
      permisos,
      incidentes,
      metrics
    };

    try {
      const responseContent = await sendChatMessage(newHistory, contextData);
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Ocurrió un inconveniente al consultar la IA:**\n${err?.message || 'Error de conexión'}. Por favor verifica tu conexión o intenta nuevamente.`,
        timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    // Al limpiar, queda exactamente como cuando se abre
    setMessages([buildWelcomeMessage(activeSede?.nombre || 'General')]);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Renderizar texto formateado simple con soporte para negrita y saltos
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lIdx) => {
      // Reemplazo básico de **texto**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={lIdx} className={line.trim() === '' ? 'h-2' : 'min-h-[1.25rem]'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-[#1C2C28]">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <>
      {/* Botón Flotante FAB (Trigger) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3.5 bg-linear-to-r from-[#1B3B36] to-[#2D6A4F] text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-600/40 group cursor-pointer"
          title="Abrir Asistente IA de Samanya"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/15 text-emerald-100 group-hover:rotate-12 transition-transform">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse ring-2 ring-[#1B3B36]" />
          </div>
          <div className="text-left pr-1">
            <p className="text-xs font-semibold leading-tight tracking-wide uppercase text-emerald-200">
              Asistente IA
            </p>
            <p className="text-sm font-medium leading-tight text-white">
              Consultas Samanya
            </p>
          </div>
        </button>
      )}

      {/* Ventana Flotante del Chat */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white border border-[#DEDBD1] rounded-2xl shadow-2xl overflow-hidden ${
            isExpanded
              ? 'bottom-4 right-4 left-4 top-4 md:left-auto md:w-[620px] md:h-[85vh]'
              : 'bottom-6 right-6 w-[95vw] sm:w-[420px] h-[580px] max-h-[90vh]'
          }`}
        >
          {/* Header del Chat */}
          <div className="bg-linear-to-r from-[#1B3B36] to-[#285A48] text-white px-4 py-3.5 flex items-center justify-between shadow-xs select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-emerald-300 shrink-0 ring-1 ring-white/20">
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold tracking-tight text-white truncate">
                    Asistente Samanya OS
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    OpenRouter
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-200/80 truncate">
                  <Building2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">{activeSede?.nombre || 'Sede Principal'}</span>
                </div>
              </div>
            </div>

            {/* Acciones de ventana */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-1.5 text-emerald-200/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Limpiar conversación"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:block p-1.5 text-emerald-200/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title={isExpanded ? 'Restaurar tamaño' : 'Ampliar ventana'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-200/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF9F6]">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-[#1B3B36] text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-emerald-700/20">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-[#1B3B36] text-white rounded-tr-xs'
                        : 'bg-white text-[#2B2925] border border-[#E7E5DC] rounded-tl-xs'
                    }`}
                  >
                    <div className="space-y-1">
                      {renderFormattedText(msg.content)}
                    </div>
                    <div
                      className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${
                        isUser ? 'text-emerald-200/70' : 'text-[#8C887B]'
                      }`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-full bg-[#3B5B4F] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Indicador de escribiendo / procesando */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#1B3B36] text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-emerald-700/20 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-[#E7E5DC] rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  <span className="text-xs text-[#6B665A] font-medium">
                    Consultando turnos y datos operativos...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div className="px-3 py-2 bg-white border-t border-[#EAE7DC] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-medium text-[#7C776B] shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Sugerencias:
            </span>
            {SUGERENCIAS_PREGUNTAS.map((pregunta, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(pregunta)}
                disabled={isLoading}
                className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-[#F3F1EA] hover:bg-emerald-50 text-[#3C3A34] hover:text-emerald-800 hover:border-emerald-300 border border-[#DFDDD4] transition-colors cursor-pointer disabled:opacity-50"
              >
                {pregunta}
              </button>
            ))}
          </div>

          {/* Input y Botón de Enviar */}
          <div className="p-3 bg-white border-t border-[#DEDBD1] flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Pregunta por turnos, residentes, empleados..."
              className="flex-1 text-sm bg-[#F7F6F2] border border-[#D5D2C7] focus:border-emerald-600 focus:bg-white rounded-xl px-3.5 py-2.5 outline-none transition-colors text-[#26241F] placeholder:text-[#9A9589] disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 bg-[#1B3B36] hover:bg-[#244E47] disabled:bg-[#CCC9BD] text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
              title="Enviar consulta"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
