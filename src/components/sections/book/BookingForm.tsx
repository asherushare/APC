'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Button } from '@/components/common/Button';
import { services } from '@/data/services';


const timeSlots = [
  { value: 'morning', label: 'Morning (9:00 AM – 12:00 PM)' },
  { value: 'afternoon', label: 'Afternoon (12:00 PM – 3:00 PM)' },
  { value: 'evening', label: 'Evening (3:00 PM – 6:00 PM)' },
];

const inputClass =
  'w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors';

export function BookingForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    village: '',
    service: '',
    date: '',
    time: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Pre-select service if passed in query params
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam && services.some((s) => s.id === serviceParam)) {
      setFormData((prev) => ({ ...prev, service: serviceParam }));
    }
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  // Get today's date in YYYY-MM-DD for min attribute
  const today = new Date().toISOString().split('T')[0];

  if (isSubmitted) {
    return (
      <section className="py-16 md:py-24 bg-surface-container-low">
        <Container>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 className="text-display-mobile md:text-headline-md text-on-surface">
              Booking Confirmed!
            </h2>

            <p className="text-body-lg text-on-surface-variant">
              Thank you, <strong className="text-on-surface">{formData.name}</strong>! Your service request for{' '}
              <strong className="text-primary">
                {services.find((s) => s.id === formData.service)?.title ?? 'the selected service'}
              </strong>{' '}
              has been received. Our team will contact you at{' '}
              <strong className="text-on-surface">{formData.mobile}</strong> to confirm your appointment.
            </p>

            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-tribal border border-outline-variant/30 text-left space-y-3 max-w-md mx-auto">
              <h3 className="text-headline-sm text-on-surface">Booking Summary</h3>
              <div className="space-y-2 text-body-md">
                <p><span className="text-on-surface-variant">Service:</span>{' '}
                  <span className="font-medium text-on-surface">{services.find((s) => s.id === formData.service)?.title}</span>
                </p>
                <p><span className="text-on-surface-variant">Date:</span>{' '}
                  <span className="font-medium text-on-surface">{formData.date}</span>
                </p>
                <p><span className="text-on-surface-variant">Time:</span>{' '}
                  <span className="font-medium text-on-surface">{timeSlots.find((t) => t.value === formData.time)?.label}</span>
                </p>
                <p><span className="text-on-surface-variant">Village:</span>{' '}
                  <span className="font-medium text-on-surface">{formData.village}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button
                variant="primary"
                onClick={() => {
                  setFormData({ name: '', mobile: '', village: '', service: '', date: '', time: '' });
                  setIsSubmitted(false);
                }}
                id="book-another-btn"
              >
                Book Another Service
              </Button>
              <Button variant="secondary" href="/services" id="back-to-services-btn">
                Back to Services
              </Button>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <Container>
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            label="APPOINTMENT DETAILS"
            title="Fill in Your Details"
            subtitle="All fields marked with * are required. We'll confirm your booking within 24 hours."
          />

          <form
            onSubmit={handleSubmit}
            className="bg-surface-container-lowest rounded-2xl shadow-tribal border border-outline-variant/30 p-6 md:p-10 space-y-6"
            id="booking-form"
          >
            {/* Row 1: Name + Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="book-name" className="block text-label-md text-on-surface mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="book-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="book-mobile" className="block text-label-md text-on-surface mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  id="book-mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+91 00000 00000"
                  required
                  pattern="[0-9+\s]{10,15}"
                  title="Enter a valid mobile number (10-15 digits)"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Row 2: Village + Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="book-village" className="block text-label-md text-on-surface mb-2">
                  Village / Location *
                </label>
                <input
                  type="text"
                  id="book-village"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  placeholder="Your village or town name"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="book-service" className="block text-label-md text-on-surface mb-2">
                  Select Service *
                </label>
                <select
                  id="book-service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="" disabled>
                    Choose a service...
                  </option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} — {s.price}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Date + Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="book-date" className="block text-label-md text-on-surface mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  id="book-date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={today}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="book-time" className="block text-label-md text-on-surface mb-2">
                  Preferred Time *
                </label>
                <select
                  id="book-time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="" disabled>
                    Choose a time slot...
                  </option>
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full font-semibold shadow-tribal cursor-pointer"
                id="booking-submit"
              >
                Confirm Booking
              </Button>
            </div>

            {/* Help text */}
            <p className="text-label-sm text-on-surface-variant text-center">
              Need help? WhatsApp us at{' '}
              <a
                href="https://wa.me/919348747578"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:text-dark-green transition-colors"
              >
                +91 9348747578
              </a>
            </p>
          </form>
        </div>
      </Container>
    </section>
  );
}
