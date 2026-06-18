'use client';

import { useState, useEffect } from 'react';
import { DigitalService } from '@/types/digital';
import { getWhatsAppLink, generateBookingMessage } from '@/lib/whatsapp';

interface BookingProps {
  service: DigitalService | null;
  onClose: () => void;
}

export function Booking({ service, onClose }: BookingProps) {
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [remarks, setRemarks] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (service) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden'; // Prevent main page scrolling
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [service]);

  if (!service) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Match slide transition time
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!village.trim()) newErrors.village = 'Village/Location is required';
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }
    if (!date) newErrors.date = 'Appointment date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const clientData = { name, phone, village, date, remarks };
    const formattedMsg = generateBookingMessage(service, clientData);
    const link = getWhatsAppLink(formattedMsg);

    window.open(link, '_blank');
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Drawer overlay */}
      <div
        className={`relative w-full max-w-md h-full bg-surface-container-lowest border-l border-outline-variant shadow-2xl flex flex-col transition-transform duration-300 z-10 ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-bold text-headline-sm text-primary">Book Digital Service</h3>
            <p className="text-label-sm text-on-surface-variant leading-none">{service.title}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
            aria-label="Close booking form"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Price strip */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center justify-between">
            <span className="text-body-md font-bold text-on-surface">Service Cost:</span>
            <span className="text-headline-sm font-extrabold text-primary">{service.price}</span>
          </div>

          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-label-sm font-bold text-on-surface" htmlFor="booking-name">
              Full Name *
            </label>
            <input
              id="booking-name"
              type="text"
              className={`w-full bg-white border rounded-xl px-4 py-2.5 outline-none transition-all text-body-md ${
                errors.name 
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                  : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/15'
              }`}
              placeholder="e.g. Ramesh Mellaka"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">⚠ {errors.name}</p>}
          </div>

          {/* Phone Input */}
          <div className="space-y-1">
            <label className="text-label-sm font-bold text-on-surface" htmlFor="booking-phone">
              Phone Number *
            </label>
            <input
              id="booking-phone"
              type="tel"
              className={`w-full bg-white border rounded-xl px-4 py-2.5 outline-none transition-all text-body-md ${
                errors.phone 
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                  : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/15'
              }`}
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">⚠ {errors.phone}</p>}
          </div>

          {/* Village Input */}
          <div className="space-y-1">
            <label className="text-label-sm font-bold text-on-surface" htmlFor="booking-village">
              Village / Block Location *
            </label>
            <input
              id="booking-village"
              type="text"
              className={`w-full bg-white border rounded-xl px-4 py-2.5 outline-none transition-all text-body-md ${
                errors.village 
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                  : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/15'
              }`}
              placeholder="e.g. Muniguda, Rayagada"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
            />
            {errors.village && <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">⚠ {errors.village}</p>}
          </div>

          {/* Preferred Date Input */}
          <div className="space-y-1">
            <label className="text-label-sm font-bold text-on-surface" htmlFor="booking-date">
              Preferred Appointment Date *
            </label>
            <input
              id="booking-date"
              type="date"
              className={`w-full bg-white border rounded-xl px-4 py-2.5 outline-none transition-all text-body-md ${
                errors.date 
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                  : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/15'
              }`}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {errors.date && <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">⚠ {errors.date}</p>}
          </div>

          {/* Remarks Input */}
          <div className="space-y-1">
            <label className="text-label-sm font-bold text-on-surface" htmlFor="booking-remarks">
              Notes / Custom Instructions (Optional)
            </label>
            <textarea
              id="booking-remarks"
              rows={3}
              className="w-full bg-white border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/15 rounded-xl px-4 py-2.5 outline-none transition-all text-body-md resize-none"
              placeholder="Add details (e.g. spelling correction, link mobile number...)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 space-y-3">
            <button
              type="submit"
              className="w-full bg-[#25D366] hover:bg-[#1ebd59] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-body-md uppercase tracking-wider select-none"
            >
              <svg className="w-5 h-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Confirm &amp; Book on WhatsApp
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface font-extrabold py-3.5 rounded-xl transition-all cursor-pointer text-body-sm uppercase tracking-wider select-none"
            >
              Cancel
            </button>
          </div>
          
          {/* Visual trust checkmarks */}
          <div className="flex items-center justify-center gap-4 text-[10px] font-extrabold text-on-surface-variant/70 uppercase tracking-widest pt-4 border-t border-outline-variant/10 mt-3 select-none">
            <span className="flex items-center gap-1">🛡️ Secure Data</span>
            <span className="flex items-center gap-1">⚡ Instantly Routed</span>
            <span className="flex items-center gap-1">✓ Verified Support</span>
          </div>
        </form>
      </div>
    </div>
  );
}
