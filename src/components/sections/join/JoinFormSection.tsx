'use client';

import { useState } from 'react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { Button } from '@/components/common/Button';

export function JoinFormSection() {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    district: '',
    occupation: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // UI Only implementation: log form data and show success alert
    console.log('Membership Application Data:', formData);
    setIsSubmitted(true);
    alert('Thank you for registering your interest! Our regional coordinator will contact you shortly.');
    setFormData({
      fullName: '',
      mobileNumber: '',
      email: '',
      district: '',
      occupation: '',
      message: '',
    });
  }

  const inputStyles =
    'w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all';

  return (
    <section id="register" className="py-16 md:py-24 bg-surface">
      <Container>
        <div className="max-w-xl mx-auto">
          <SectionHeading
            title="Register Your Interest"
            subtitle="Fill out the details below to begin your cooperative membership onboarding."
          />

          {isSubmitted && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary text-primary rounded-lg text-center font-medium">
              Application submitted successfully! Our local agent will contact you soon.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" id="join-form">
            {/* Full Name */}
            <div>
              <label
                htmlFor="join-full-name"
                className="block text-label-md text-on-surface font-medium mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="join-full-name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className={inputStyles}
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label
                htmlFor="join-mobile"
                className="block text-label-md text-on-surface font-medium mb-2"
              >
                Mobile Number
              </label>
              <input
                type="tel"
                id="join-mobile"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="Enter your 10-digit mobile number"
                required
                className={inputStyles}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="join-email"
                className="block text-label-md text-on-surface font-medium mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="join-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className={inputStyles}
              />
            </div>

            {/* District */}
            <div>
              <label
                htmlFor="join-district"
                className="block text-label-md text-on-surface font-medium mb-2"
              >
                District
              </label>
              <input
                type="text"
                id="join-district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="e.g. Rayagada, Koraput, Kalahandi"
                required
                className={inputStyles}
              />
            </div>

            {/* Occupation */}
            <div>
              <label
                htmlFor="join-occupation"
                className="block text-label-md text-on-surface font-medium mb-2"
              >
                Occupation
              </label>
              <input
                type="text"
                id="join-occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g. Farmer, Artisan, Entrepreneur"
                required
                className={inputStyles}
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="join-message"
                className="block text-label-md text-on-surface font-medium mb-2"
              >
                Message / Brief Context
              </label>
              <textarea
                id="join-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us a little about your crop collective or business"
                rows={4}
                className={inputStyles}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              id="join-submit-application"
              className="w-full cursor-pointer"
            >
              Submit Application
            </Button>
          </form>
        </div>
      </Container>
    </section>
  );
}
