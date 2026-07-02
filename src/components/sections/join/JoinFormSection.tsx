'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { compileSubmissionAssets } from '@/lib/membership';
import { ShareholderApplication } from '@/types/membership';
import { cn } from '@/lib/utils';
import { apiRequest, ApiError } from '@/lib/api-client';
import { usePublicAuth } from '@/context/PublicAuthContext';

// Producer eligibility categories from official form
const PRODUCER_CATEGORIES = [
  'Agriculture',
  'Horticulture',
  'Forestry',
  'Animal Husbandry',
  'Fisheries',
  'Minor Forest Produce',
  'Handicrafts',
  'Cottage Industry',
  'Other'
];

interface ShareholderFilesState {
  aadhaarCard: File | null;
  panCard: File | null;
  passportPhoto: File | null;
  producerActivityProof: File | null;
  bankPassbook: File | null;
}

interface FileUploadZoneProps {
  field: keyof ShareholderFilesState;
  label: string;
  required?: boolean;
  files: ShareholderFilesState;
  fileErrors: Record<string, string>;
  errors: Record<string, string>;
  handleFileChange: (field: keyof ShareholderFilesState, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: (field: keyof ShareholderFilesState) => void;
}

// Styled File Picker Zone Subcomponent (declared outside render)
function FileUploadZone({
  field,
  label,
  required = false,
  files,
  fileErrors,
  errors,
  handleFileChange,
  handleRemoveFile
}: FileUploadZoneProps) {
  const file = files[field];
  const errorMsg = fileErrors[field] || errors[field];
  const fileUrl = file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

  return (
    <div className="space-y-1.5 border border-outline-variant/30 rounded-xl p-4 bg-surface-container-lowest">
      <label className="text-label-sm font-extrabold text-on-surface flex justify-between" htmlFor={`file-${field}`}>
        <span>{label} {required && '*'}</span>
        {file && (
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-emerald-200">
            Loaded
          </span>
        )}
      </label>
      
      {file ? (
        <div className="flex items-center justify-between border border-outline-variant rounded-xl p-3 bg-surface-container-low select-none">
          <div className="flex items-center gap-3 min-w-0">
            {/* Document Icon/Thumbnail */}
            {fileUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fileUrl}
                alt="Thumbnail"
                className="w-10 h-10 rounded-md object-cover border border-outline-variant shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-red-50 text-red-500 border border-red-100 flex items-center justify-center font-bold text-lg shrink-0">
                📄
              </div>
            )}

            <div className="min-w-0">
              <p className="text-body-sm font-extrabold text-on-surface truncate max-w-[180px] sm:max-w-xs">{file.name}</p>
              <p className="text-[10px] text-on-surface-variant font-semibold">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            {/* Replace trigger */}
            <label 
              className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-white border border-outline-variant hover:bg-surface-container-high rounded-lg cursor-pointer transition-all focus:ring-2 focus:ring-primary/20 text-primary animate-[pulse_1.5s_infinite]"
            >
              Replace
              <input
                type="file"
                id={`file-${field}-replace`}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(field, e)}
              />
            </label>
            
            {/* Remove Trigger */}
            <button
              type="button"
              onClick={() => handleRemoveFile(field)}
              className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg cursor-pointer transition-all"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <label
            htmlFor={`file-${field}`}
            className={cn(
              "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 bg-surface hover:bg-surface-container-low transition-all cursor-pointer select-none text-center outline-none focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary",
              errorMsg ? "border-red-400 hover:border-red-500" : "border-outline-variant hover:border-primary"
            )}
          >
            <div className="space-y-1.5 text-center">
              <span className="text-2xl">📤</span>
              <p className="text-body-xs font-bold text-on-surface">Click to select or drag &amp; drop</p>
              <p className="text-[9px] text-on-surface-variant font-semibold uppercase tracking-wider">PDF, JPG, JPEG, or PNG (Max 5MB)</p>
            </div>
            <input
              id={`file-${field}`}
              type="file"
              name={field}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(field, e)}
              aria-invalid={!!errorMsg}
              aria-describedby={errorMsg ? `file-${field}-error` : undefined}
            />
          </label>
        </div>
      )}

      {errorMsg && (
        <p id={`file-${field}-error`} role="alert" className="text-[10px] text-red-500 font-semibold mt-1">⚠ {errorMsg}</p>
      )}
    </div>
  );
}

export function JoinFormSection() {
  const { isAuthenticated, isLoading: authLoading } = usePublicAuth();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<Omit<ShareholderApplication, 'calculatedContribution' | 'uploadedDocuments'>>({
    fullName: '',
    fatherHusbandName: '',
    dateOfBirth: '',
    gender: '',
    aadhaarNumber: '',
    panNumber: '',
    mobileNumber: '',
    email: '',
    occupation: '',
    village: '',
    gramPanchayat: '',
    block: '',
    district: '',
    state: 'Odisha',
    pinCode: '',
    producerActivities: [],
    numberOfShares: 1,
    nomineeName: '',
    nomineeRelationship: '',
    nomineeDateOfBirth: '',
    nomineeAddress: '',
    nomineeMobileNumber: '',
    bankAccountHolderName: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    confirmCorrectInfo: false,
    agreeToRules: false,
    understandApprovalRequired: false
  });

  // Client-side file states
  const [files, setFiles] = useState<ShareholderFilesState>({
    aadhaarCard: null,
    panCard: null,
    passportPhoto: null,
    producerActivityProof: null,
    bankPassbook: null
  });

  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Submission success tracking states
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedWaLink, setSubmittedWaLink] = useState<string>('');
  const [submittedAppId, setSubmittedAppId] = useState<string>('');
  const [submittedTime, setSubmittedTime] = useState<string>('');
  const [summaryPdfBlob, setSummaryPdfBlob] = useState<Blob | null>(null);

  // File upload queue states for Milestone 2
  const [submissionStep, setSubmissionStep] = useState<'form' | 'submitting_metadata' | 'uploading_files' | 'success'>('form');
  const [uploadError, setUploadError] = useState<string>('');

  // Compute calculated contribution at render-time
  const calculatedContribution = formData.numberOfShares * 10000;

  // Prevent accidental navigation during active submission or file upload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (submissionStep === 'submitting_metadata' || submissionStep === 'uploading_files') {
        e.preventDefault();
        e.returnValue = 'An application submission is in progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submissionStep]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (
    name: 'confirmCorrectInfo' | 'agreeToRules' | 'understandApprovalRequired'
  ) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleActivityToggle = (activity: string) => {
    setFormData(prev => {
      const current = prev.producerActivities;
      const updated = current.includes(activity)
        ? current.filter(item => item !== activity)
        : [...current, activity];
      
      return { ...prev, producerActivities: updated };
    });

    if (errors.producerActivities) {
      setErrors(prev => ({ ...prev, producerActivities: '' }));
    }
  };

  // Helper file format & size validation
  const validateUploadedFile = (file: File): string | null => {
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      return 'PDF, JPG, JPEG, and PNG only';
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      return 'File exceeds 5MB size limit';
    }

    return null;
  };

  const handleFileChange = (field: keyof ShareholderFilesState, e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationError = validateUploadedFile(selectedFile);
    if (validationError) {
      setFileErrors(prev => ({ ...prev, [field]: validationError }));
      return;
    }

    setFiles(prev => ({ ...prev, [field]: selectedFile }));
    setFileErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleRemoveFile = (field: keyof ShareholderFilesState) => {
    setFiles(prev => ({ ...prev, [field]: null }));
    setFileErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Step-by-step validations based strictly on the official form
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!formData.fatherHusbandName.trim()) newErrors.fatherHusbandName = "Father's or Husband's Name is required";
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
      if (!formData.gender) newErrors.gender = 'Gender selection is required';
      
      const cleanAadhaar = formData.aadhaarNumber.replace(/\s+/g, '');
      if (!cleanAadhaar) {
        newErrors.aadhaarNumber = 'Aadhaar Number is required';
      } else if (!/^\d{12}$/.test(cleanAadhaar)) {
        newErrors.aadhaarNumber = 'Aadhaar must be exactly 12 digits';
      }

      if (formData.panNumber) {
        const cleanPan = formData.panNumber.trim().toUpperCase();
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
          newErrors.panNumber = 'Enter a valid 10-digit PAN (e.g. ABCDE1234F)';
        }
      }

      const cleanMobile = formData.mobileNumber.replace(/\D/g, '');
      if (!cleanMobile) {
        newErrors.mobileNumber = 'Mobile Number is required';
      } else if (!/^\d{10}$/.test(cleanMobile)) {
        newErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
      }

      if (!formData.occupation.trim()) newErrors.occupation = 'Primary Occupation is required';
    }

    if (currentStep === 2) {
      if (!formData.village.trim()) newErrors.village = 'Village name is required';
      if (!formData.gramPanchayat.trim()) newErrors.gramPanchayat = 'Gram Panchayat is required';
      if (!formData.block.trim()) newErrors.block = 'Block is required';
      if (!formData.district.trim()) newErrors.district = 'District is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      
      const cleanPin = formData.pinCode.replace(/\D/g, '');
      if (!cleanPin) {
        newErrors.pinCode = 'PIN Code is required';
      } else if (!/^\d{6}$/.test(cleanPin)) {
        newErrors.pinCode = 'PIN code must be exactly 6 digits';
      }
    }

    if (currentStep === 3) {
      if (formData.producerActivities.length === 0) {
        newErrors.producerActivities = 'Please select at least one activity to establish producer eligibility';
      }
    }

    if (currentStep === 4) {
      const shares = Number(formData.numberOfShares);
      if (isNaN(shares) || shares < 1 || shares > 10) {
        newErrors.numberOfShares = 'Shares count must be between 1 and 10';
      }
    }

    if (currentStep === 5) {
      if (!formData.nomineeName.trim()) newErrors.nomineeName = 'Nominee Full Name is required';
      if (!formData.nomineeRelationship.trim()) newErrors.nomineeRelationship = 'Relationship is required';
      if (!formData.nomineeDateOfBirth) newErrors.nomineeDateOfBirth = 'Nominee Date of Birth is required';
      if (!formData.nomineeAddress.trim()) newErrors.nomineeAddress = 'Nominee Address is required';
      
      const cleanNomineeMobile = formData.nomineeMobileNumber.replace(/\D/g, '');
      if (!cleanNomineeMobile) {
        newErrors.nomineeMobileNumber = 'Nominee Mobile is required';
      } else if (!/^\d{10}$/.test(cleanNomineeMobile)) {
        newErrors.nomineeMobileNumber = 'Nominee Mobile must be exactly 10 digits';
      }
    }

    if (currentStep === 6) {
      if (!formData.bankAccountHolderName.trim()) newErrors.bankAccountHolderName = 'Account Holder Name is required';
      if (!formData.bankName.trim()) newErrors.bankName = 'Bank Name is required';
      
      const cleanAcc = formData.bankAccountNumber.trim();
      if (!cleanAcc) {
        newErrors.bankAccountNumber = 'Account Number is required';
      } else if (cleanAcc.length < 9 || cleanAcc.length > 18) {
        newErrors.bankAccountNumber = 'Enter a valid Account Number (9-18 digits)';
      }

      const cleanIfsc = formData.bankIfscCode.trim().toUpperCase();
      if (!cleanIfsc) {
        newErrors.bankIfscCode = 'IFSC Code is required';
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
        newErrors.bankIfscCode = 'Enter a valid 11-digit IFSC code (e.g. SBIN0001234)';
      }
    }

    // Step 7: Document uploads validation
    if (currentStep === 7) {
      if (!files.aadhaarCard) newErrors.aadhaarCard = 'Aadhaar Card copy is required';
      if (!files.passportPhoto) newErrors.passportPhoto = 'Passport size photograph is required';
      if (!files.producerActivityProof) newErrors.producerActivityProof = 'Proof of producer activity is required';
      if (!files.bankPassbook) newErrors.bankPassbook = 'Bank passbook front page copy is required';
    }

    // Step 8: Pre-submission application review page (No validations, only check layout review)

    // Step 9: Digital Self-Declaration
    if (currentStep === 9) {
      if (!formData.confirmCorrectInfo) newErrors.confirmCorrectInfo = 'You must confirm correctness';
      if (!formData.agreeToRules) newErrors.agreeToRules = 'You must agree to APC rules';
      if (!formData.understandApprovalRequired) newErrors.understandApprovalRequired = 'You must accept that onboarding requires coordinator verification';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      setTimeout(() => {
        const formEl = document.getElementById('wizard-header');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setTimeout(() => {
      const formEl = document.getElementById('wizard-header');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(9)) return;
    if (isSubmitting || submissionStep !== 'form') return;

    // Required files validation
    if (!files.aadhaarCard || !files.passportPhoto || !files.bankPassbook) {
      setErrors({ formSubmit: 'Aadhaar Card, Passport Photograph, and Bank Passbook front page are required files.' });
      return;
    }

    setIsSubmitting(true);
    setSubmissionStep('submitting_metadata');
    setUploadError('');

    try {
      const fd = new FormData();
      fd.append('fullName', formData.fullName);
      fd.append('fatherHusbandName', formData.fatherHusbandName);
      fd.append('dateOfBirth', formData.dateOfBirth);
      fd.append('gender', formData.gender);
      fd.append('aadhaarNumber', formData.aadhaarNumber.replace(/\s+/g, ''));
      if (formData.panNumber) fd.append('panNumber', formData.panNumber.trim().toUpperCase());
      fd.append('mobileNumber', formData.mobileNumber.replace(/\D/g, ''));
      if (formData.email) fd.append('email', formData.email.trim());
      fd.append('occupation', formData.occupation);

      fd.append('village', formData.village);
      fd.append('gramPanchayat', formData.gramPanchayat);
      fd.append('block', formData.block);
      fd.append('district', formData.district);
      fd.append('state', formData.state);
      fd.append('pinCode', formData.pinCode.replace(/\D/g, ''));

      fd.append('producerActivities', JSON.stringify(formData.producerActivities));
      fd.append('numberOfShares', String(formData.numberOfShares));
      fd.append('calculatedContribution', String(calculatedContribution));

      fd.append('nomineeName', formData.nomineeName);
      fd.append('nomineeRelationship', formData.nomineeRelationship);
      fd.append('nomineeDateOfBirth', formData.nomineeDateOfBirth);
      fd.append('nomineeAddress', formData.nomineeAddress);
      fd.append('nomineeMobileNumber', formData.nomineeMobileNumber.replace(/\D/g, ''));

      fd.append('bankAccountHolderName', formData.bankAccountHolderName);
      fd.append('bankName', formData.bankName);
      fd.append('bankAccountNumber', formData.bankAccountNumber.trim());
      fd.append('bankIfscCode', formData.bankIfscCode.trim().toUpperCase());

      fd.append('confirmCorrectInfo', 'true');
      fd.append('agreeToRules', 'true');
      fd.append('understandApprovalRequired', 'true');

      // Append files matching Multer fields
      if (files.aadhaarCard) fd.append('aadhaar', files.aadhaarCard);
      if (files.panCard) fd.append('pan', files.panCard);
      if (files.passportPhoto) fd.append('photo', files.passportPhoto);
      if (files.bankPassbook) fd.append('passbook', files.bankPassbook);

      const response = await apiRequest<{
        success: boolean;
        message: string;
        application: {
          id: string;
          applicationId: string;
          status: string;
          submittedAt: string;
        };
      }>('/applications/apply', {
        method: 'POST',
        body: fd
      });

      if (response.success) {
        setSubmittedAppId(response.application.applicationId);
        setSubmittedTime(response.application.submittedAt);

        // Compile final application metadata for PDF generation
        const uploadedDocsMetadata: ShareholderApplication['uploadedDocuments'] = {};
        const timestamp = new Date().toISOString();

        if (files.aadhaarCard) {
          uploadedDocsMetadata.aadhaarCard = {
            filename: files.aadhaarCard.name,
            fileSize: files.aadhaarCard.size,
            mimeType: files.aadhaarCard.type,
            uploadTimestamp: timestamp,
            uploadStatus: 'done'
          };
        }
        if (files.panCard) {
          uploadedDocsMetadata.panCard = {
            filename: files.panCard.name,
            fileSize: files.panCard.size,
            mimeType: files.panCard.type,
            uploadTimestamp: timestamp,
            uploadStatus: 'done'
          };
        }
        if (files.passportPhoto) {
          uploadedDocsMetadata.passportPhoto = {
            filename: files.passportPhoto.name,
            fileSize: files.passportPhoto.size,
            mimeType: files.passportPhoto.type,
            uploadTimestamp: timestamp,
            uploadStatus: 'done'
          };
        }
        if (files.bankPassbook) {
          uploadedDocsMetadata.bankPassbook = {
            filename: files.bankPassbook.name,
            fileSize: files.bankPassbook.size,
            mimeType: files.bankPassbook.type,
            uploadTimestamp: timestamp,
            uploadStatus: 'done'
          };
        }

        const finalData: ShareholderApplication = {
          ...formData,
          calculatedContribution,
          uploadedDocuments: uploadedDocsMetadata
        };

        if (!summaryPdfBlob) {
          const assets = compileSubmissionAssets(finalData, response.application.applicationId, response.application.submittedAt);
          setSubmittedWaLink(assets.whatsappLink);
          setSummaryPdfBlob(assets.summaryPdfBlob);
        }

        setIsSuccess(true);
        setSubmissionStep('success');
      }
    } catch (err) {
      console.error('Application submission error:', err);
      const errMsg = err instanceof ApiError ? err.message : (err instanceof Error ? err.message : 'Submission failed');
      setErrors({ formSubmit: `Submission failed: ${errMsg}. Please try again.` });
      setSubmissionStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadSummaryPdf = () => {
    if (!summaryPdfBlob) return;
    const url = URL.createObjectURL(summaryPdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `APC-Summary-${submittedAppId || 'Receipt'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadSummaryPdfHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    downloadSummaryPdf();
  };

  const inputStyles = (fieldName: string) => cn(
    'w-full rounded-xl border bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all',
    errors[fieldName]
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 animate-[shake_0.4s_ease-in-out]'
      : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/15'
  );

  if (authLoading) {
    return (
      <section className="bg-surface py-16 min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="bg-surface py-16 select-none text-left">
        <Container>
          <div className="max-w-2xl mx-auto bg-white border border-outline-variant/30 rounded-3xl p-10 text-center space-y-6 shadow-xl">
            <span className="text-5xl block">🔒</span>
            <div className="space-y-2">
              <h3 className="text-headline-sm font-black text-on-surface">Sign In Required</h3>
              <p className="text-body-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
                To submit a shareholder application and track your onboarding status, you must first register or log in to your cooperative producer account.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/login"
                className="bg-primary hover:bg-dark-green text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-wider text-label-sm"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface font-extrabold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95 uppercase tracking-wider text-label-sm"
              >
                Create Account
              </Link>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section id="register" className="py-16 md:py-24 bg-surface border-t border-outline-variant/30 relative">
      <Container>
        <div className="max-w-2xl mx-auto bg-white border border-outline-variant/30 rounded-3xl shadow-xl overflow-hidden">
          
          {submissionStep === 'success' ? (
            /* Premium Success Onboarding Receipt Dashboard */
            <div className="p-8 md:p-12 text-center space-y-6 animate-fade-in animate-mesh">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mx-auto shadow-inner">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="text-headline-md md:text-display-mobile font-black text-primary">
                  Application Submitted Successfully
                </h3>
                <p className="text-body-md text-on-surface-variant font-medium leading-relaxed max-w-lg mx-auto">
                  Your digital shareholder application has been received and compiled.
                </p>
              </div>

              {/* Official Receipt Metadata */}
              <div className="border border-primary/20 bg-primary/5 rounded-2xl p-6 text-left max-w-lg mx-auto space-y-4 shadow-sm select-none">
                <div className="flex justify-between items-start gap-4 border-b border-primary/10 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Receipt Acknowledgement</span>
                    <h4 className="text-body-md font-black text-on-surface uppercase tracking-wider">{submittedAppId}</h4>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Submitted At</span>
                    <p className="text-body-xs font-semibold text-on-surface-variant">
                      {submittedTime ? new Date(submittedTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-label-md">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 block">Current Status</span>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Submitted
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 block">Expected Contact</span>
                    <p className="font-extrabold text-on-surface mt-1">Within 24 Hours</p>
                  </div>
                </div>
              </div>

              {/* Physical Document Reminder Warning Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-1.5 select-none shadow-sm">
                <p className="text-body-sm text-amber-800 font-extrabold flex items-center gap-1.5">
                  🔔 Document Verification Checklist
                </p>
                <p className="text-[11px] text-amber-700/90 font-semibold leading-relaxed">
                  Please keep your **original physical documents** (Aadhaar, PAN, Bank Passbook, Land Deed) ready. An APC block coordinator will visit your village to verify them and collect your physical signature.
                </p>
              </div>

              {/* Onboarding Steps Vertical Timeline */}
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 text-left max-w-lg mx-auto space-y-5 shadow-inner select-none">
                <h4 className="font-black text-primary text-label-sm uppercase tracking-widest border-b border-outline-variant/20 pb-3">
                  📋 Onboarding Timeline & Review Tracker
                </h4>
                
                <div className="relative pl-6 space-y-5 border-l-2 border-outline-variant/40 ml-2.5">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold shadow-md">
                      ✓
                    </div>
                    <div>
                      <h5 className="font-extrabold text-on-surface text-body-sm">1. Application Submitted</h5>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">Your application details and metadata have been logged in the system.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-primary border-2 border-white animate-pulse shadow-md" />
                    <div>
                      <h5 className="font-extrabold text-primary text-body-sm">2. APC Coordinator Review</h5>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">Block coordinators verify eligibility and crop produce activities in your block.</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-outline-variant/60 shadow-sm" />
                    <div>
                      <h5 className="font-semibold text-on-surface-variant/70 text-body-sm">3. Phone Verification</h5>
                      <p className="text-[11px] text-on-surface-variant/50 leading-relaxed">Coordination of local record verification and scheduler checks.</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-outline-variant/60 shadow-sm" />
                    <div>
                      <h5 className="font-semibold text-on-surface-variant/70 text-body-sm">4. Share Capital Payment</h5>
                      <p className="text-[11px] text-on-surface-variant/50 leading-relaxed">Submission of formal share value deposit (₹10,000 per share) via bank receipt.</p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-outline-variant/60 shadow-sm" />
                    <div>
                      <h5 className="font-semibold text-on-surface-variant/70 text-body-sm">5. Approved &amp; Certification</h5>
                      <p className="text-[11px] text-on-surface-variant/50 leading-relaxed">Formal share certificate dispatch and inclusion in the APC co-op register.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Onboarding Dashboard Action Panel */}
              <div className="pt-4 flex flex-col gap-3 max-w-lg mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={downloadSummaryPdfHandler}
                    className="w-full sm:w-auto flex-1 bg-primary hover:bg-dark-green text-white font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-label-md uppercase tracking-wider select-none cursor-pointer"
                  >
                    Download Summary PDF
                  </button>
                  <a
                    href={submittedWaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex-1 bg-[#25D366] hover:bg-[#1ebd59] text-white font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-label-md uppercase tracking-wider select-none cursor-pointer"
                  >
                    Open WhatsApp
                  </a>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:+919348747578"
                    className="w-full sm:w-auto flex-1 bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface font-extrabold py-3.5 px-6 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-label-md uppercase tracking-wider select-none cursor-pointer"
                  >
                    Call APC Office
                  </a>
                  <Link
                    href="/portal"
                    className="w-full sm:w-auto flex-1 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface font-extrabold py-3.5 px-6 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-label-md uppercase tracking-wider select-none cursor-pointer"
                  >
                    Go to Portal Dashboard
                  </Link>
                </div>
              </div>
            </div>
          ) : submissionStep === 'submitting_metadata' ? (
            /* Metadata & Documents Submission Progress overlay */
            <div className="p-12 text-center space-y-6 animate-fade-in select-none">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <div className="space-y-2">
                <h3 className="text-headline-md font-extrabold text-primary animate-pulse">
                  Uploading Application &amp; Documents
                </h3>
                <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
                  Please wait while we stream your supporting documents to secure storage and establish your shareholder profile in the database...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Wizard Header & Timeline progress */}
              <div id="wizard-header" className="px-6 py-6 border-b border-outline-variant/30 bg-surface-container-low select-none">
                <div className="flex items-center justify-between">
                  <h3 className="text-headline-sm font-extrabold text-primary">
                    Shareholder Application Form
                  </h3>
                  <span className="bg-primary/10 text-primary font-black px-3 py-1 rounded-full text-label-sm">
                    Step {step} of 9
                  </span>
                </div>
                
                {/* Horizontal Progress Timeline */}
                <div className="w-full bg-outline-variant/30 h-2 rounded-full mt-5 relative overflow-hidden flex">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${(step / 9) * 100}%` }}
                  />
                </div>
                {/* Desktop/Tablet Horizontal Steps (Visible md+) */}
                <div className="hidden md:flex justify-between text-[7px] font-black uppercase tracking-wider text-on-surface-variant/70 mt-2">
                  <span className={step >= 1 ? 'text-primary' : ''}>1. Identity</span>
                  <span className={step >= 2 ? 'text-primary' : ''}>2. Address</span>
                  <span className={step >= 3 ? 'text-primary' : ''}>3. Eligibility</span>
                  <span className={step >= 4 ? 'text-primary' : ''}>4. Shares</span>
                  <span className={step >= 5 ? 'text-primary' : ''}>5. Nominee</span>
                  <span className={step >= 6 ? 'text-primary' : ''}>6. Bank</span>
                  <span className={step >= 7 ? 'text-primary' : ''}>7. Uploads</span>
                  <span className={step >= 8 ? 'text-primary' : ''}>8. Review</span>
                  <span className={step >= 9 ? 'text-primary' : ''}>9. Declarations</span>
                </div>
                {/* Mobile Current Step (Hidden md+) */}
                <div className="md:hidden text-center text-label-sm font-extrabold text-primary mt-2">
                  Current Step: {
                    step === 1 ? '1. Identity' :
                    step === 2 ? '2. Address' :
                    step === 3 ? '3. Eligibility' :
                    step === 4 ? '4. Shares' :
                    step === 5 ? '5. Nominee' :
                    step === 6 ? '6. Bank' :
                    step === 7 ? '7. Uploads' :
                    step === 8 ? '8. Review' :
                    '9. Declarations'
                  }
                </div>
              </div>

              {/* Wizard Form Body */}
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                
                {/* Step 1: Personal Details */}
                {step === 1 && (
                  <div className="space-y-5 animate-fade-in">
                    <h4 className="text-headline-sm font-extrabold text-on-surface border-b border-outline-variant/20 pb-2">
                      1. Applicant Personal Details
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="fullName">
                          Full Name *
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          name="fullName"
                          className={inputStyles('fullName')}
                          placeholder="e.g. Ramesh Sabar"
                          value={formData.fullName}
                          onChange={handleChange}
                          aria-invalid={!!errors.fullName}
                          aria-describedby={errors.fullName ? "fullName-error" : undefined}
                        />
                        {errors.fullName && <p id="fullName-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.fullName}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="fatherHusbandName">
                          Father&apos;s / Husband&apos;s Name *
                        </label>
                        <input
                          id="fatherHusbandName"
                          type="text"
                          name="fatherHusbandName"
                          className={inputStyles('fatherHusbandName')}
                          placeholder="e.g. Late Mohan Sabar"
                          value={formData.fatherHusbandName}
                          onChange={handleChange}
                          aria-invalid={!!errors.fatherHusbandName}
                          aria-describedby={errors.fatherHusbandName ? "fatherHusbandName-error" : undefined}
                        />
                        {errors.fatherHusbandName && <p id="fatherHusbandName-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.fatherHusbandName}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="dateOfBirth">
                          Date of Birth *
                        </label>
                        <input
                          id="dateOfBirth"
                          type="date"
                          name="dateOfBirth"
                          className={inputStyles('dateOfBirth')}
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          aria-invalid={!!errors.dateOfBirth}
                          aria-describedby={errors.dateOfBirth ? "dateOfBirth-error" : undefined}
                        />
                        {errors.dateOfBirth && <p id="dateOfBirth-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.dateOfBirth}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="gender">
                          Gender *
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          className={inputStyles('gender')}
                          value={formData.gender}
                          onChange={handleChange}
                          aria-invalid={!!errors.gender}
                          aria-describedby={errors.gender ? "gender-error" : undefined}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.gender && <p id="gender-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.gender}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="aadhaarNumber">
                          Aadhaar Number *
                        </label>
                        <input
                          id="aadhaarNumber"
                          type="text"
                          name="aadhaarNumber"
                          maxLength={12}
                          className={inputStyles('aadhaarNumber')}
                          placeholder="12-digit Aadhaar Card No"
                          value={formData.aadhaarNumber}
                          onChange={handleChange}
                          aria-invalid={!!errors.aadhaarNumber}
                          aria-describedby={errors.aadhaarNumber ? "aadhaarNumber-error" : undefined}
                        />
                        {errors.aadhaarNumber && <p id="aadhaarNumber-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.aadhaarNumber}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="panNumber">
                          PAN Number (Optional)
                        </label>
                        <input
                          id="panNumber"
                          type="text"
                          name="panNumber"
                          maxLength={10}
                          className={inputStyles('panNumber')}
                          placeholder="10-character PAN Code"
                          value={formData.panNumber}
                          onChange={handleChange}
                          aria-invalid={!!errors.panNumber}
                          aria-describedby={errors.panNumber ? "panNumber-error" : undefined}
                        />
                        {errors.panNumber && <p id="panNumber-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.panNumber}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="mobileNumber">
                          Mobile Number *
                        </label>
                        <input
                          id="mobileNumber"
                          type="tel"
                          name="mobileNumber"
                          maxLength={10}
                          className={inputStyles('mobileNumber')}
                          placeholder="10-digit primary mobile number"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          aria-invalid={!!errors.mobileNumber}
                          aria-describedby={errors.mobileNumber ? "mobileNumber-error" : undefined}
                        />
                        {errors.mobileNumber && <p id="mobileNumber-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.mobileNumber}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="email">
                          Email Address (Optional)
                        </label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          className={inputStyles('email')}
                          placeholder="e.g. applicant@domain.com"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="occupation">
                          Occupation / Primary Produce Activity *
                        </label>
                        <input
                          id="occupation"
                          type="text"
                          name="occupation"
                          className={inputStyles('occupation')}
                          placeholder="e.g. Rice Cultivator, Broom Grass Collector"
                          value={formData.occupation}
                          onChange={handleChange}
                          aria-invalid={!!errors.occupation}
                          aria-describedby={errors.occupation ? "occupation-error" : undefined}
                        />
                        {errors.occupation && <p id="occupation-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.occupation}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Address */}
                {step === 2 && (
                  <div className="space-y-5 animate-fade-in">
                    <h4 className="text-headline-sm font-extrabold text-on-surface border-b border-outline-variant/20 pb-2">
                      2. Residential Address
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="village">
                          Village *
                        </label>
                        <input
                          id="village"
                          type="text"
                          name="village"
                          className={inputStyles('village')}
                          placeholder="Village name"
                          value={formData.village}
                          onChange={handleChange}
                          aria-invalid={!!errors.village}
                          aria-describedby={errors.village ? "village-error" : undefined}
                        />
                        {errors.village && <p id="village-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.village}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="gramPanchayat">
                          Gram Panchayat *
                        </label>
                        <input
                          id="gramPanchayat"
                          type="text"
                          name="gramPanchayat"
                          className={inputStyles('gramPanchayat')}
                          placeholder="GP name"
                          value={formData.gramPanchayat}
                          onChange={handleChange}
                          aria-invalid={!!errors.gramPanchayat}
                          aria-describedby={errors.gramPanchayat ? "gramPanchayat-error" : undefined}
                        />
                        {errors.gramPanchayat && <p id="gramPanchayat-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.gramPanchayat}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="block">
                          Block *
                        </label>
                        <input
                          id="block"
                          type="text"
                          name="block"
                          className={inputStyles('block')}
                          placeholder="Block name"
                          value={formData.block}
                          onChange={handleChange}
                          aria-invalid={!!errors.block}
                          aria-describedby={errors.block ? "block-error" : undefined}
                        />
                        {errors.block && <p id="block-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.block}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="district">
                          District *
                        </label>
                        <input
                          id="district"
                          type="text"
                          name="district"
                          className={inputStyles('district')}
                          placeholder="e.g. Rayagada"
                          value={formData.district}
                          onChange={handleChange}
                          aria-invalid={!!errors.district}
                          aria-describedby={errors.district ? "district-error" : undefined}
                        />
                        {errors.district && <p id="district-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.district}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="state">
                          State *
                        </label>
                        <input
                          id="state"
                          type="text"
                          name="state"
                          className={inputStyles('state')}
                          placeholder="Odisha"
                          value={formData.state}
                          onChange={handleChange}
                          aria-invalid={!!errors.state}
                          aria-describedby={errors.state ? "state-error" : undefined}
                        />
                        {errors.state && <p id="state-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.state}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="pinCode">
                          PIN Code *
                        </label>
                        <input
                          id="pinCode"
                          type="text"
                          name="pinCode"
                          maxLength={6}
                          className={inputStyles('pinCode')}
                          placeholder="6-digit postal PIN"
                          value={formData.pinCode}
                          onChange={handleChange}
                          aria-invalid={!!errors.pinCode}
                          aria-describedby={errors.pinCode ? "pinCode-error" : undefined}
                        />
                        {errors.pinCode && <p id="pinCode-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.pinCode}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Producer Eligibility Checklist */}
                {step === 3 && (
                  <div className="space-y-5 animate-fade-in select-none">
                    <div>
                      <h4 className="text-headline-sm font-extrabold text-on-surface border-b border-outline-variant/20 pb-2">
                        3. Producer Eligibility Checklist
                      </h4>
                      <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                        To qualify as an APC shareholder, you must declare active engagement in one or more of these official activities:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                      {PRODUCER_CATEGORIES.map((act) => {
                        const isChecked = formData.producerActivities.includes(act);
                        return (
                          <button
                            key={act}
                            type="button"
                            onClick={() => handleActivityToggle(act)}
                            className={cn(
                              "flex items-center gap-3.5 px-4 py-3 rounded-xl border text-left text-body-md transition-all duration-150 active:scale-[0.98] cursor-pointer outline-none focus:ring-2 focus:ring-primary/20",
                              isChecked
                                ? "bg-primary/5 border-primary text-primary font-bold shadow-sm"
                                : "bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container-low"
                            )}
                          >
                            <span className={cn(
                              "w-5 h-5 rounded-md border flex items-center justify-center text-xs",
                              isChecked ? "bg-primary border-primary text-white" : "border-outline-variant"
                            )}>
                              {isChecked && '✓'}
                            </span>
                            {act}
                          </button>
                        );
                      })}
                    </div>

                    {errors.producerActivities && (
                      <p className="text-body-sm text-red-500 font-bold mt-2">⚠ {errors.producerActivities}</p>
                    )}
                  </div>
                )}

                {/* Step 4: Share Subscription Calculator */}
                {step === 4 && (
                  <div className="space-y-5 animate-fade-in">
                    <h4 className="text-headline-sm font-extrabold text-on-surface border-b border-outline-variant/20 pb-2">
                      4. Share Subscription Calculator
                    </h4>

                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center shadow-sm select-none">
                      <span className="text-label-sm uppercase font-black tracking-widest text-on-surface-variant">
                        Estimated Capital Contribution
                      </span>
                      <p className="text-[44px] font-black text-primary leading-none mt-2">
                        ₹{calculatedContribution.toLocaleString('en-IN')}
                      </p>
                      <p className="text-body-sm text-on-surface-variant mt-2 font-medium">
                        For {formData.numberOfShares} Equity Share(s) at ₹10,000 per Share
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-label-sm font-extrabold text-on-surface flex justify-between" htmlFor="numberOfShares">
                        <span>Number of Shares Subscribed *</span>
                        <span className="text-primary font-black">{formData.numberOfShares} Share(s)</span>
                      </label>
                      
                      <div className="flex gap-4 items-center pt-2">
                        <button
                          type="button"
                          disabled={formData.numberOfShares <= 1}
                          onClick={() => setFormData(prev => ({ ...prev, numberOfShares: prev.numberOfShares - 1 }))}
                          className={cn(
                            "w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-xl transition-all cursor-pointer",
                            formData.numberOfShares <= 1
                              ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                              : "border-outline-variant hover:bg-surface-container-low hover:border-primary text-primary"
                          )}
                        >
                          -
                        </button>
                        
                        <input
                          id="numberOfShares"
                          type="range"
                          name="numberOfShares"
                          min={1}
                          max={10}
                          className="flex-1 accent-primary h-2 bg-outline-variant/30 rounded-lg cursor-pointer"
                          value={formData.numberOfShares}
                          onChange={(e) => setFormData(prev => ({ ...prev, numberOfShares: parseInt(e.target.value, 10) }))}
                        />

                        <button
                          type="button"
                          disabled={formData.numberOfShares >= 10}
                          onClick={() => setFormData(prev => ({ ...prev, numberOfShares: prev.numberOfShares + 1 }))}
                          className={cn(
                            "w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-xl transition-all cursor-pointer",
                            formData.numberOfShares >= 10
                              ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                              : "border-outline-variant hover:bg-surface-container-low hover:border-primary text-primary"
                          )}
                        >
                          +
                        </button>
                      </div>
                      
                      <p className="text-[11px] text-on-surface-variant/70 leading-relaxed pt-2">
                        * Under APC cooperative governance bylaws, the current online application supports up to 10 shares and applicants requiring additional shares should contact the APC team directly.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 5: Nominee Designation */}
                {step === 5 && (
                  <div className="space-y-5 animate-fade-in">
                    <h4 className="text-headline-sm font-extrabold text-on-surface border-b border-outline-variant/20 pb-2">
                      5. Nominee Designation
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="nomineeName">
                          Nominee Full Name *
                        </label>
                        <input
                          id="nomineeName"
                          type="text"
                          name="nomineeName"
                          className={inputStyles('nomineeName')}
                          placeholder="Full name of designated nominee"
                          value={formData.nomineeName}
                          onChange={handleChange}
                          aria-invalid={!!errors.nomineeName}
                          aria-describedby={errors.nomineeName ? "nomineeName-error" : undefined}
                        />
                        {errors.nomineeName && <p id="nomineeName-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.nomineeName}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="nomineeRelationship">
                          Relationship *
                        </label>
                        <input
                          id="nomineeRelationship"
                          type="text"
                          name="nomineeRelationship"
                          className={inputStyles('nomineeRelationship')}
                          placeholder="e.g. Wife, Son, Daughter, Brother"
                          value={formData.nomineeRelationship}
                          onChange={handleChange}
                          aria-invalid={!!errors.nomineeRelationship}
                          aria-describedby={errors.nomineeRelationship ? "nomineeRelationship-error" : undefined}
                        />
                        {errors.nomineeRelationship && <p id="nomineeRelationship-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.nomineeRelationship}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="nomineeDateOfBirth">
                          Nominee Date of Birth *
                        </label>
                        <input
                          id="nomineeDateOfBirth"
                          type="date"
                          name="nomineeDateOfBirth"
                          className={inputStyles('nomineeDateOfBirth')}
                          value={formData.nomineeDateOfBirth}
                          onChange={handleChange}
                          aria-invalid={!!errors.nomineeDateOfBirth}
                          aria-describedby={errors.nomineeDateOfBirth ? "nomineeDateOfBirth-error" : undefined}
                        />
                        {errors.nomineeDateOfBirth && <p id="nomineeDateOfBirth-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.nomineeDateOfBirth}</p>}
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="nomineeAddress">
                          Nominee Address *
                        </label>
                        <input
                          id="nomineeAddress"
                          type="text"
                          name="nomineeAddress"
                          className={inputStyles('nomineeAddress')}
                          placeholder="Address of the nominee"
                          value={formData.nomineeAddress}
                          onChange={handleChange}
                          aria-invalid={!!errors.nomineeAddress}
                          aria-describedby={errors.nomineeAddress ? "nomineeAddress-error" : undefined}
                        />
                        {errors.nomineeAddress && <p id="nomineeAddress-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.nomineeAddress}</p>}
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="nomineeMobileNumber">
                          Nominee Mobile Number *
                        </label>
                        <input
                          id="nomineeMobileNumber"
                          type="tel"
                          name="nomineeMobileNumber"
                          maxLength={10}
                          className={inputStyles('nomineeMobileNumber')}
                          placeholder="10-digit mobile number"
                          value={formData.nomineeMobileNumber}
                          onChange={handleChange}
                          aria-invalid={!!errors.nomineeMobileNumber}
                          aria-describedby={errors.nomineeMobileNumber ? "nomineeMobileNumber-error" : undefined}
                        />
                        {errors.nomineeMobileNumber && <p id="nomineeMobileNumber-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.nomineeMobileNumber}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Bank Account Details */}
                {step === 6 && (
                  <div className="space-y-5 animate-fade-in">
                    <h4 className="text-headline-sm font-extrabold text-on-surface border-b border-outline-variant/20 pb-2">
                      6. Shareholder Bank Details
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="bankAccountHolderName">
                          Account Holder Name *
                        </label>
                        <input
                          id="bankAccountHolderName"
                          type="text"
                          name="bankAccountHolderName"
                          className={inputStyles('bankAccountHolderName')}
                          placeholder="Name exactly as printed on passbook"
                          value={formData.bankAccountHolderName}
                          onChange={handleChange}
                          aria-invalid={!!errors.bankAccountHolderName}
                          aria-describedby={errors.bankAccountHolderName ? "bankAccountHolderName-error" : undefined}
                        />
                        {errors.bankAccountHolderName && <p id="bankAccountHolderName-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.bankAccountHolderName}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="bankName">
                          Bank Name *
                        </label>
                        <input
                          id="bankName"
                          type="text"
                          name="bankName"
                          className={inputStyles('bankName')}
                          placeholder="e.g. State Bank of India"
                          value={formData.bankName}
                          onChange={handleChange}
                          aria-invalid={!!errors.bankName}
                          aria-describedby={errors.bankName ? "bankName-error" : undefined}
                        />
                        {errors.bankName && <p id="bankName-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.bankName}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="bankAccountNumber">
                          Account Number *
                        </label>
                        <input
                          id="bankAccountNumber"
                          type="text"
                          name="bankAccountNumber"
                          className={inputStyles('bankAccountNumber')}
                          placeholder="Account Number details"
                          value={formData.bankAccountNumber}
                          onChange={handleChange}
                          aria-invalid={!!errors.bankAccountNumber}
                          aria-describedby={errors.bankAccountNumber ? "bankAccountNumber-error" : undefined}
                        />
                        {errors.bankAccountNumber && <p id="bankAccountNumber-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.bankAccountNumber}</p>}
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-label-sm font-extrabold text-on-surface" htmlFor="bankIfscCode">
                          IFSC Code *
                        </label>
                        <input
                          id="bankIfscCode"
                          type="text"
                          name="bankIfscCode"
                          maxLength={11}
                          className={inputStyles('bankIfscCode')}
                          placeholder="11-digit IFSC code (e.g. SBIN0001234)"
                          value={formData.bankIfscCode}
                          onChange={handleChange}
                          aria-invalid={!!errors.bankIfscCode}
                          aria-describedby={errors.bankIfscCode ? "bankIfscCode-error" : undefined}
                        />
                        {errors.bankIfscCode && <p id="bankIfscCode-error" role="alert" className="text-[11px] text-red-500 font-semibold mt-1">⚠ {errors.bankIfscCode}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 7: Upload Supporting Documents (NEW) */}
                {step === 7 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="border-b border-outline-variant/20 pb-2">
                      <h4 className="text-headline-sm font-extrabold text-on-surface">
                        7. Upload Supporting Documents
                      </h4>
                      <p className="text-body-sm text-on-surface-variant mt-1.5">
                        Please upload digital scans or clear photos of your official documents. Supported formats: **PDF, JPG, JPEG, and PNG (Max 5MB each)**.
                      </p>
                    </div>

                    {/* Trust Disclaimer Alert Panel */}
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3 text-left select-none">
                      <span className="text-lg shrink-0">🛡️</span>
                      <div className="space-y-1">
                        <h5 className="font-extrabold text-primary text-label-sm">Safe &amp; Secure Document Verification</h5>
                        <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                          Your uploaded documents are processed securely and used solely for cooperative membership verification. Personal information remains strictly confidential. No online payment is collected through this site.
                        </p>
                      </div>
                    </div>

                    {/* Grouped Upload Checklist */}
                    <div className="space-y-6">
                      {/* Group A: Identity */}
                      <div className="space-y-3">
                        <h5 className="text-label-sm uppercase font-black tracking-widest text-primary/70 border-l-2 border-primary pl-2.5">
                          Identity Documents
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FileUploadZone field="aadhaarCard" label="Aadhaar Card" required files={files} fileErrors={fileErrors} errors={errors} handleFileChange={handleFileChange} handleRemoveFile={handleRemoveFile} />
                          <FileUploadZone field="panCard" label="PAN Card (Optional)" files={files} fileErrors={fileErrors} errors={errors} handleFileChange={handleFileChange} handleRemoveFile={handleRemoveFile} />
                        </div>
                      </div>

                      {/* Group B: Photograph */}
                      <div className="space-y-3">
                        <h5 className="text-label-sm uppercase font-black tracking-widest text-primary/70 border-l-2 border-primary pl-2.5">
                          Photograph
                        </h5>
                        <FileUploadZone field="passportPhoto" label="Passport Size Photograph" required files={files} fileErrors={fileErrors} errors={errors} handleFileChange={handleFileChange} handleRemoveFile={handleRemoveFile} />
                      </div>

                      {/* Group C: Producer Activity */}
                      <div className="space-y-3">
                        <h5 className="text-label-sm uppercase font-black tracking-widest text-primary/70 border-l-2 border-primary pl-2.5">
                          Producer Verification
                        </h5>
                        <FileUploadZone field="producerActivityProof" label="Proof of Producer Activity (Patta/FRA/Coordinator Certificate)" required files={files} fileErrors={fileErrors} errors={errors} handleFileChange={handleFileChange} handleRemoveFile={handleRemoveFile} />
                      </div>

                      {/* Group D: Bank Copy */}
                      <div className="space-y-3">
                        <h5 className="text-label-sm uppercase font-black tracking-widest text-primary/70 border-l-2 border-primary pl-2.5">
                          Bank Details Verification
                        </h5>
                        <FileUploadZone field="bankPassbook" label="Bank Passbook Front Page Copy" required files={files} fileErrors={fileErrors} errors={errors} handleFileChange={handleFileChange} handleRemoveFile={handleRemoveFile} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 8: Pre-submission Application Review (NEW) */}
                {step === 8 && (
                  <div className="space-y-6 animate-fade-in select-none">
                    <div className="border-b border-outline-variant/20 pb-2">
                      <h4 className="text-headline-sm font-extrabold text-on-surface">
                        8. Review Application Details
                      </h4>
                      <p className="text-body-sm text-on-surface-variant mt-1">
                        Please review all details before final declaration. You can click Edit to change fields.
                      </p>
                    </div>

                    <div className="space-y-5 text-body-sm">
                      {/* 1. Identity Review */}
                      <div className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-lowest">
                        <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2 mb-3">
                          <h5 className="font-extrabold text-primary text-label-md">1. Personal &amp; Identity Details</h5>
                          <button type="button" onClick={() => setStep(1)} className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline cursor-pointer">
                            ✏️ Edit Section
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                          <p><span className="font-bold text-on-surface-variant/80">Full Name:</span> {formData.fullName}</p>
                          <p><span className="font-bold text-on-surface-variant/80">Father/Husband:</span> {formData.fatherHusbandName}</p>
                          <p><span className="font-bold text-on-surface-variant/80">DOB:</span> {formData.dateOfBirth}</p>
                          <p><span className="font-bold text-on-surface-variant/80">Gender:</span> {formData.gender}</p>
                          <p><span className="font-bold text-on-surface-variant/80">Aadhaar Card:</span> {formData.aadhaarNumber}</p>
                          <p><span className="font-bold text-on-surface-variant/80">PAN Code:</span> {formData.panNumber || 'N/A'}</p>
                          <p><span className="font-bold text-on-surface-variant/80">Mobile Number:</span> {formData.mobileNumber}</p>
                          <p><span className="font-bold text-on-surface-variant/80">Email:</span> {formData.email || 'N/A'}</p>
                          <p className="sm:col-span-2"><span className="font-bold text-on-surface-variant/80">Occupation:</span> {formData.occupation}</p>
                        </div>
                      </div>

                      {/* 2. Address Review */}
                      <div className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-lowest">
                        <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2 mb-3">
                          <h5 className="font-extrabold text-primary text-label-md">2. Residential Address</h5>
                          <button type="button" onClick={() => setStep(2)} className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline cursor-pointer">
                            ✏️ Edit Section
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                          <p><span className="font-bold text-on-surface-variant/80">Village:</span> {formData.village}</p>
                          <p><span className="font-bold text-on-surface-variant/80">Gram Panchayat:</span> {formData.gramPanchayat}</p>
                          <p><span className="font-bold text-on-surface-variant/80">Block Name:</span> {formData.block}</p>
                          <p><span className="font-bold text-on-surface-variant/80">District:</span> {formData.district}</p>
                          <p><span className="font-bold text-on-surface-variant/80">State:</span> {formData.state}</p>
                          <p><span className="font-bold text-on-surface-variant/80">PIN Code:</span> {formData.pinCode}</p>
                        </div>
                      </div>

                      {/* 3. Eligibility & Shares Review */}
                      <div className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-lowest grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2 mb-2">
                            <h5 className="font-extrabold text-primary text-label-md">3. Producer Eligibility</h5>
                            <button type="button" onClick={() => setStep(3)} className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline cursor-pointer">
                              ✏️ Edit
                            </button>
                          </div>
                          <p className="leading-relaxed font-semibold">{formData.producerActivities.join(', ')}</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2 mb-2">
                            <h5 className="font-extrabold text-primary text-label-md">4. Share Contribution</h5>
                            <button type="button" onClick={() => setStep(4)} className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline cursor-pointer">
                              ✏️ Edit
                            </button>
                          </div>
                          <p className="font-black text-primary">{formData.numberOfShares} Share(s) subscribed</p>
                          <p className="font-black text-on-surface text-body-md mt-0.5">Total Value: ₹{calculatedContribution.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      {/* 4. Nominee Review */}
                      <div className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-lowest">
                        <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2 mb-3">
                          <h5 className="font-extrabold text-primary text-label-md">5. Nominee Designation</h5>
                          <button type="button" onClick={() => setStep(5)} className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline cursor-pointer">
                            ✏️ Edit Section
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                          <p><span className="font-bold text-on-surface-variant/80">Nominee Name:</span> {formData.nomineeName}</p>
                          <p><span className="font-bold text-on-surface-variant/80">Relationship:</span> {formData.nomineeRelationship}</p>
                          <p><span className="font-bold text-on-surface-variant/80">Nominee DOB:</span> {formData.nomineeDateOfBirth}</p>
                          <p><span className="font-bold text-on-surface-variant/80">Nominee Mobile:</span> {formData.nomineeMobileNumber}</p>
                          <p className="sm:col-span-2"><span className="font-bold text-on-surface-variant/80">Nominee Address:</span> {formData.nomineeAddress}</p>
                        </div>
                      </div>

                      {/* 5. Bank Review */}
                      <div className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-lowest">
                        <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2 mb-3">
                          <h5 className="font-extrabold text-primary text-label-md">6. Bank Account Details</h5>
                          <button type="button" onClick={() => setStep(6)} className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline cursor-pointer">
                            ✏️ Edit Section
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                          <p><span className="font-bold text-on-surface-variant/80">Account Holder:</span> {formData.bankAccountHolderName}</p>
                          <p><span className="font-bold text-on-surface-variant/80">Bank Name:</span> {formData.bankName}</p>
                          <p><span className="font-bold text-on-surface-variant/80">Account Number:</span> {formData.bankAccountNumber}</p>
                          <p><span className="font-bold text-on-surface-variant/80">IFSC Code:</span> {formData.bankIfscCode}</p>
                        </div>
                      </div>

                      {/* 6. Uploaded Documents Review */}
                      <div className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-lowest">
                        <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2 mb-3">
                          <h5 className="font-extrabold text-primary text-label-md">7. Uploaded Documents</h5>
                          <button type="button" onClick={() => setStep(7)} className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline cursor-pointer">
                            ✏️ Edit Section
                          </button>
                        </div>
                        <ul className="space-y-2 font-medium">
                          <li>📂 **Aadhaar Card:** {files.aadhaarCard?.name}</li>
                          <li>📂 **PAN Card:** {files.panCard?.name || 'Not Provided (Optional)'}</li>
                          <li>📂 **Passport Photo:** {files.passportPhoto?.name}</li>
                          <li>📂 **Producer Proof:** {files.producerActivityProof?.name}</li>
                          <li>📂 **Bank Passbook:** {files.bankPassbook?.name}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 9: Declarations & Checkbox Confirmations */}
                {step === 9 && (
                  <div className="space-y-5 animate-fade-in select-none">
                    <h4 className="text-headline-sm font-extrabold text-on-surface border-b border-outline-variant/20 pb-2">
                      9. Digital Self-Declaration
                    </h4>

                    <div className="space-y-4">
                      {/* Checkbox 1 */}
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={formData.confirmCorrectInfo}
                        onClick={() => handleCheckboxChange('confirmCorrectInfo')}
                        className="flex items-start gap-4 text-left cursor-pointer group focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-md"
                      >
                        <span className={cn(
                          "w-6 h-6 rounded-md border flex items-center justify-center text-xs shrink-0 mt-0.5 transition-all",
                          formData.confirmCorrectInfo ? "bg-primary border-primary text-white" : "border-outline-variant group-hover:border-primary"
                        )}>
                          {formData.confirmCorrectInfo && '✓'}
                        </span>
                        <span className="text-body-md text-on-surface-variant leading-relaxed">
                          I confirm that the information provided in this application form is correct and matches my verified documents. *
                        </span>
                      </button>
                      {errors.confirmCorrectInfo && <p className="text-[11px] text-red-500 font-semibold pl-10">⚠ {errors.confirmCorrectInfo}</p>}

                      {/* Checkbox 2 */}
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={formData.agreeToRules}
                        onClick={() => handleCheckboxChange('agreeToRules')}
                        className="flex items-start gap-4 text-left cursor-pointer group focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-md"
                      >
                        <span className={cn(
                          "w-6 h-6 rounded-md border flex items-center justify-center text-xs shrink-0 mt-0.5 transition-all",
                          formData.agreeToRules ? "bg-primary border-primary text-white" : "border-outline-variant group-hover:border-primary"
                        )}>
                          {formData.agreeToRules && '✓'}
                        </span>
                        <span className="text-body-md text-on-surface-variant leading-relaxed">
                          I agree to follow the rules, cooperative guidelines, and general bylaws of Adivasi Producer Company. *
                        </span>
                      </button>
                      {errors.agreeToRules && <p className="text-[11px] text-red-500 font-semibold pl-10">⚠ {errors.agreeToRules}</p>}

                      {/* Checkbox 3 */}
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={formData.understandApprovalRequired}
                        onClick={() => handleCheckboxChange('understandApprovalRequired')}
                        className="flex items-start gap-4 text-left cursor-pointer group focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-md"
                      >
                        <span className={cn(
                          "w-6 h-6 rounded-md border flex items-center justify-center text-xs shrink-0 mt-0.5 transition-all",
                          formData.understandApprovalRequired ? "bg-primary border-primary text-white" : "border-outline-variant group-hover:border-primary"
                        )}>
                          {formData.understandApprovalRequired && '✓'}
                        </span>
                        <span className="text-body-md text-on-surface-variant leading-relaxed">
                          I understand that cooperative shareholder membership is subject to verification by coordinators and formal board approval. *
                        </span>
                      </button>
                      {errors.understandApprovalRequired && <p className="text-[11px] text-red-500 font-semibold pl-10">⚠ {errors.understandApprovalRequired}</p>}
                    </div>

                    {/* Security & Payment Trust Notice */}
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 select-none text-left space-y-2 mt-4">
                      <p className="text-body-sm text-on-surface font-semibold flex items-center gap-1.5 text-primary">
                        🔒 Safe &amp; Secure Onboarding
                      </p>
                      <ul className="list-disc pl-5 text-[11px] text-on-surface-variant font-medium leading-relaxed space-y-1">
                        <li>Your information and files are used only for APC membership verification.</li>
                        <li>No payment is collected through this website.</li>
                        <li>Share payment will only happen after APC verification.</li>
                        <li>Personal data remains confidential.</li>
                      </ul>
                    </div>

                    {errors.formSubmit && (
                      <p className="text-body-sm text-red-500 font-extrabold text-center pt-2">⚠ {errors.formSubmit}</p>
                    )}
                  </div>
                )}

                {/* Form Actions */}
                <div className="pt-6 border-t border-outline-variant/30 flex gap-4">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface font-extrabold py-3.5 rounded-xl transition-all cursor-pointer select-none text-body-sm uppercase tracking-wider focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    >
                      Back
                    </button>
                  )}
                  
                  {step < 9 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 bg-primary hover:bg-dark-green text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer select-none text-body-sm uppercase tracking-wider focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-primary hover:bg-dark-green text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer select-none flex items-center justify-center gap-2 text-body-sm uppercase tracking-wider focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    >
                      {isSubmitting ? (
                        <span>Compiling Application...</span>
                      ) : (
                        <span>Confirm &amp; Submit Application</span>
                      )}
                    </button>
                  )}
                </div>
                
              </form>
            </>
          )}

        </div>

        {/* Help & Support Trust Panel (Visible on Onboarding Form screen only) */}
        {!isSuccess && (
          <div className="max-w-2xl mx-auto mt-8 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 select-none animate-fade-in">
            <div className="space-y-1.5 text-center sm:text-left">
              <h4 className="font-extrabold text-primary text-headline-sm flex items-center justify-center sm:justify-start gap-2">
                🤝 Need Help Applying?
              </h4>
              <p className="text-body-sm text-on-surface-variant font-medium max-w-sm leading-normal">
                Contact our Rayagada support office for assistance with share subscription or document uploading.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto text-label-sm font-extrabold text-on-surface">
              <a
                href="tel:+919348747578"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant bg-white hover:bg-surface-container-low transition-all cursor-pointer justify-center focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                📞 Call: +91 93487 47578
              </a>
              <a
                href="https://wa.me/919348747578?text=Hello%20APC%20Support%2C%20I%20need%20help%20completing%20my%20Shareholder%20Application."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant bg-white hover:bg-surface-container-low transition-all cursor-pointer justify-center text-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                💬 WhatsApp Support
              </a>
              <div className="text-center sm:text-right text-[10px] text-on-surface-variant font-semibold">
                🕒 Hours: Mon-Sat, 9AM - 5PM
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
