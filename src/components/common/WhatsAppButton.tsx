'use client';

import { useState, useEffect, useRef } from 'react';

const WHATSAPP_NUMBER = '919348747578';

export function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Delay appearance for smooth entry
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const departments = [
    {
      name: '🚜 Agriculture Advisory',
      desc: 'Crop advice, organic inputs, marketing help',
      text: 'Hello APC, I need agriculture advisory support.',
    },
    {
      name: '💻 Digital & Documents Help',
      desc: 'Caste certificates, Aadhaar, PAN, online services',
      text: 'Hello APC, I need assistance with digital or document services.',
    },
    {
      name: '💰 Government Schemes Desk',
      desc: 'Check scheme eligibility and application guidance',
      text: 'Hello APC, I need information on government schemes.',
    },
    {
      name: '⚠️ Report a Complaint / Grievance',
      desc: 'Service feedback, office issues, complaints',
      text: 'I would like to report an issue/complaint: [please describe here]',
      isComplaint: true,
    },
  ];

  const getWaLink = (text: string) => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className={`whatsapp-btn-container fixed bottom-6 right-6 z-[9999] flex flex-col items-end transition-all duration-300 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} ref={menuRef}>

      {/* Floating Menu Popover */}
      <div
        className={`
          mb-4 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl bg-surface border border-outline-variant shadow-2xl overflow-hidden transition-all duration-300 transform origin-bottom-right
          ${isOpen ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto' : 'scale-90 opacity-0 translate-y-4 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="bg-primary text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-label-lg leading-tight font-sans">Adivasi Producer Company (APC) Helpdesk</h3>
            <p className="text-[11px] text-white/85">Instant assistance on WhatsApp</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-white/80 transition-colors p-1 cursor-pointer"
            aria-label="Close helpdesk"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Directory List */}
        <div className="p-3 bg-surface-container-lowest max-h-[350px] overflow-y-auto divide-y divide-outline-variant/30">
          {departments.map((dept, index) => (
            <a
              key={index}
              href={getWaLink(dept.text)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className={`
                block p-3 text-left transition-all hover:bg-surface-container-low/70 cursor-pointer
                ${dept.isComplaint ? 'hover:bg-red-50/50 group' : ''}
              `}
            >
              <h4 className={`text-label-md font-bold text-on-surface ${dept.isComplaint ? 'text-red-700 group-hover:text-red-800' : 'text-primary'}`}>
                {dept.name}
              </h4>
              <p className="text-body-xs text-on-surface-variant mt-0.5 leading-snug">
                {dept.desc}
              </p>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-surface-container-low p-3 text-center border-t border-outline-variant/30">
          <p className="text-[10px] text-on-surface-variant">
            Helpline: <strong className="text-on-surface">+91 9348747578</strong>
          </p>
        </div>
      </div>

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle WhatsApp Helpdesk Menu"
        id="whatsapp-float-btn"
        className={`
          w-14 h-14 md:w-16 md:h-16
          rounded-full
          bg-[#25D366] hover:bg-[#1EBE5D]
          text-white
          flex items-center justify-center
          shadow-lg hover:shadow-xl
          transition-all duration-300
          hover:scale-115 active:scale-95 cursor-pointer
          pointer-events-auto
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
        `}
        style={{
          animation: isVisible && !isOpen ? 'whatsapp-pulse 2s ease-in-out infinite' : 'none',
        }}
      >
        {/* Toggle icon */}
        {isOpen ? (
          <svg className="w-6 h-6 md:w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        ) : (
          <svg
            className="w-7 h-7 md:w-8 md:h-8"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        )}

        {/* Tooltip (only when closed) */}
        {!isOpen && (
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-inverse-surface text-inverse-on-surface text-label-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-md hidden md:block">
            Need help? Click to chat
          </span>
        )}
      </button>
    </div>
  );
}
