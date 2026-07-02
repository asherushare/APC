'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Container } from '@/components/common/Container';
import { apiRequest, ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface NoticeRecord {
  id: string;
  title: string;
  category: 'SCHEME' | 'ANNOUNCEMENT' | 'EVENT' | 'STORY';
  summary: string;
  content: string;
  pdfUrl?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  author?: {
    fullName: string;
    email: string;
  } | null;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search and Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Modal configuration
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeRecord | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'SCHEME' | 'ANNOUNCEMENT' | 'EVENT' | 'STORY'>('ANNOUNCEMENT');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPdfUrl, setFormPdfUrl] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 1. Fetch notices from API
  const fetchNotices = useCallback(async (targetPage = 1) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const queryParams: Record<string, string> = {
        page: String(targetPage),
        limit: '10',
        admin: 'true', // Retrieve drafts as well
      };

      if (category) queryParams.category = category;
      if (search.trim()) queryParams.search = search.trim();

      const query = new URLSearchParams(queryParams);
      const data = await apiRequest<{
        success: boolean;
        notices: NoticeRecord[];
        pagination: typeof pagination;
      }>(`/notices?${query.toString()}`);

      if (data.success) {
        setNotices(data.notices || []);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch notices:', err);
      const msg = err instanceof ApiError ? err.message : 'Could not query notice board database.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, [category, search]);

  // Sync on search or category filter updates
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchNotices(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [fetchNotices]);

  // 2. Open Modal to Create/Edit Notice
  const openModal = (notice: NoticeRecord | null = null) => {
    setEditingNotice(notice);
    setFormErrors({});
    if (notice) {
      setFormTitle(notice.title);
      setFormCategory(notice.category);
      setFormSummary(notice.summary);
      setFormContent(notice.content);
      setFormPdfUrl(notice.pdfUrl || '');
      setFormImageUrl(notice.imageUrl || '');
      setFormIsActive(notice.isActive);
    } else {
      setFormTitle('');
      setFormCategory('ANNOUNCEMENT');
      setFormSummary('');
      setFormContent('');
      setFormPdfUrl('');
      setFormImageUrl('');
      setFormIsActive(true);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNotice(null);
  };

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formTitle.trim()) errors.title = 'Title is required';
    if (!formSummary.trim()) errors.summary = 'Summary is required';
    if (!formContent.trim()) errors.content = 'Content detailed description is required';

    if (formPdfUrl && !formPdfUrl.startsWith('http://') && !formPdfUrl.startsWith('https://')) {
      errors.pdfUrl = 'PDF attachment link must be a valid URL';
    }
    if (formImageUrl && !formImageUrl.startsWith('http://') && !formImageUrl.startsWith('https://')) {
      errors.imageUrl = 'Cover image link must be a valid URL';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 3. Save Notice (Create or Update)
  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      title: formTitle.trim(),
      category: formCategory,
      summary: formSummary.trim(),
      content: formContent.trim(),
      pdfUrl: formPdfUrl.trim() || null,
      imageUrl: formImageUrl.trim() || null,
      isActive: formIsActive,
    };

    try {
      let response;
      if (editingNotice) {
        response = await apiRequest<{ success: boolean; notice: NoticeRecord }>(`/notices/${editingNotice.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        if (response.success) {
          setSuccessMsg('Notice announcement updated successfully.');
        }
      } else {
        response = await apiRequest<{ success: boolean; notice: NoticeRecord }>('/notices', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (response.success) {
          setSuccessMsg('New notice announcement created successfully.');
        }
      }

      closeModal();
      fetchNotices(pagination.page);
    } catch (err) {
      console.error('Save notice error:', err);
      const msg = err instanceof ApiError ? err.message : 'Failed to publish notice details.';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Soft Delete Notice
  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;

    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await apiRequest<{ success: boolean }>(`/notices/${id}`, {
        method: 'DELETE',
      });
      if (data.success) {
        setSuccessMsg('Notice announcement soft-deleted successfully.');
        fetchNotices(1);
      }
    } catch (err) {
      console.error('Delete notice error:', err);
      const msg = err instanceof ApiError ? err.message : 'Could not delete notice.';
      setErrorMsg(msg);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'SCHEME':
        return 'Govt Scheme';
      case 'ANNOUNCEMENT':
        return 'Announcement';
      case 'EVENT':
        return 'Event';
      case 'STORY':
        return 'Success Story';
      default:
        return cat;
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'SCHEME':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ANNOUNCEMENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'EVENT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'STORY':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <main className="min-h-screen bg-surface py-12 px-4 relative overflow-hidden">
      {/* Background Decorative Mesh Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-amber-500/5 blur-3xl" />

      <Container className="max-w-6xl relative z-10 space-y-6">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-md">
          <div className="space-y-1 select-none text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
              APC Administrative Portal
            </span>
            <h3 className="text-headline-md font-black text-on-surface">
              Notices & Announcement Board
            </h3>
            <p className="text-body-sm font-medium text-on-surface-variant max-w-lg">
              Manage eligibility schemes, stories, announcements, and files shared dynamically to the public portal.
            </p>
          </div>

          <button
            onClick={() => openModal(null)}
            className="mt-4 md:mt-0 bg-primary hover:bg-dark-green text-white font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider text-label-sm select-none"
          >
            Create Notice
          </button>
        </div>

        {/* Global Feedback Banners */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-left animate-shake">
            <span className="text-lg shrink-0">⚠️</span>
            <div className="space-y-1">
              <h5 className="font-extrabold text-red-800 text-label-sm">System Error</h5>
              <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                {errorMsg}
              </p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3 text-left animate-fade-in">
            <span className="text-lg shrink-0">✅</span>
            <div className="space-y-1">
              <h5 className="font-extrabold text-emerald-800 text-label-sm">Success Action</h5>
              <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                {successMsg}
              </p>
            </div>
          </div>
        )}

        {/* Filters Header bar */}
        <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">🔍</span>
            <input
              type="text"
              className="w-full rounded-xl border border-outline-variant bg-white pl-10 pr-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              placeholder="Search by Title, Summary, or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              className="rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all select-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="SCHEME">Govt Schemes</option>
              <option value="ANNOUNCEMENT">Announcements</option>
              <option value="EVENT">Events</option>
              <option value="STORY">Success Stories</option>
            </select>
          </div>
        </div>

        {/* Notice Data Table */}
        <div className="bg-white border border-outline-variant/30 rounded-3xl overflow-hidden shadow-md space-y-4 p-6 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 select-none">
            <h4 className="text-label-sm font-black uppercase tracking-widest text-primary/70">
              📢 Active Announcements & Notices
            </h4>
            <span className="text-body-xs font-semibold text-on-surface-variant">
              Showing {notices.length} of {pagination.total} entries
            </span>
          </div>

          <div className="overflow-x-auto min-h-[250px]">
            <table className="w-full text-left border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-outline-variant/20 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/80 select-none bg-surface-container-low/50">
                  <th className="py-4 px-4 w-[40%]">Notice details</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {notices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-on-surface-variant font-medium select-none">
                      No notices board records found matching the filters.
                    </td>
                  </tr>
                ) : (
                  notices.map((notice) => (
                    <tr key={notice.id} className="hover:bg-surface-container-lowest/30 transition-all font-medium">
                      <td className="py-4 px-4 text-on-surface text-left">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-body-sm line-clamp-1">{notice.title}</p>
                          <p className="text-[11px] text-on-surface-variant font-medium line-clamp-2 leading-relaxed">
                            {notice.summary}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 select-none">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border tracking-wide ${getCategoryBadgeClass(notice.category)}`}>
                          {getCategoryLabel(notice.category)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-on-surface-variant select-none">
                        {formatDate(notice.createdAt)}
                      </td>
                      <td className="py-4 px-4 select-none">
                        {notice.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-gray-50 text-gray-400 border border-gray-200">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right select-none">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(notice)}
                            className="bg-white border border-outline hover:bg-surface-container-low text-on-surface font-extrabold py-2 px-3.5 rounded-lg transition-all text-[11px] cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteNotice(notice.id)}
                            className="bg-white border border-red-300 text-red-600 hover:bg-red-50 font-extrabold py-2 px-3.5 rounded-lg transition-all text-[11px] cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4 select-none">
              <button
                onClick={() => fetchNotices(pagination.page - 1)}
                disabled={pagination.page <= 1 || isLoading}
                className="px-4 py-2 rounded-xl border border-outline-variant hover:bg-surface-container-low disabled:opacity-40 text-label-sm font-extrabold uppercase transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                ◀ Previous
              </button>

              <span className="text-body-xs font-semibold text-on-surface-variant">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => fetchNotices(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || isLoading}
                className="px-4 py-2 rounded-xl border border-outline-variant hover:bg-surface-container-low disabled:opacity-40 text-label-sm font-extrabold uppercase transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                Next ▶
              </button>
            </div>
          )}
        </div>
      </Container>

      {/* Create / Edit Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white border border-outline-variant/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in relative flex flex-col text-left">
            {/* Sticky Modal Header */}
            <div className="sticky top-0 bg-white border-b border-outline-variant/25 px-6 py-4 flex items-center justify-between z-10">
              <h4 className="font-extrabold text-on-surface text-body-lg">
                {editingNotice ? 'Edit Notice Update' : 'Publish New Notice Announcement'}
              </h4>
              <button
                onClick={closeModal}
                className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="p-6 space-y-5">
              {/* Form Layout fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-label-sm font-extrabold text-on-surface" htmlFor="form-title">
                    Notice Title
                  </label>
                  <input
                    id="form-title"
                    type="text"
                    className={cn(
                      "w-full rounded-xl border bg-white px-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/15 transition-all",
                      formErrors.title ? "border-red-500" : "border-outline-variant focus:border-primary"
                    )}
                    placeholder="e.g. government scheme sub-plan 2026 guidelines"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                  {formErrors.title && <p className="text-[11px] text-red-500 font-semibold mt-0.5">⚠ {formErrors.title}</p>}
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-label-sm font-extrabold text-on-surface" htmlFor="form-category">
                    Category Filter Type
                  </label>
                  <select
                    id="form-category"
                    className="w-full rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as 'SCHEME' | 'ANNOUNCEMENT' | 'EVENT' | 'STORY')}
                  >
                    <option value="ANNOUNCEMENT">Announcement</option>
                    <option value="SCHEME">Govt Scheme</option>
                    <option value="EVENT">Event</option>
                    <option value="STORY">Success Story</option>
                  </select>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3 pt-6 text-left select-none">
                  <input
                    id="form-active"
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-5 h-5 accent-primary cursor-pointer rounded border-outline-variant"
                  />
                  <label htmlFor="form-active" className="text-body-sm font-extrabold text-on-surface cursor-pointer">
                    Publish Immediately (Active status)
                  </label>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-extrabold text-on-surface" htmlFor="form-summary">
                  Brief Summary Excerpt
                </label>
                <textarea
                  id="form-summary"
                  rows={2}
                  className={cn(
                    "w-full rounded-xl border bg-white px-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/15 transition-all resize-none",
                    formErrors.summary ? "border-red-500" : "border-outline-variant focus:border-primary"
                  )}
                  placeholder="Summarize the announcement details in 1-2 short sentences..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                />
                {formErrors.summary && <p className="text-[11px] text-red-500 font-semibold mt-0.5">⚠ {formErrors.summary}</p>}
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-extrabold text-on-surface" htmlFor="form-content">
                  Detailed Notice Content
                </label>
                <textarea
                  id="form-content"
                  rows={6}
                  className={cn(
                    "w-full rounded-xl border bg-white px-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/15 transition-all",
                    formErrors.content ? "border-red-500" : "border-outline-variant focus:border-primary"
                  )}
                  placeholder="Provide the complete announcement description, eligibility requirements, rules, instructions, or story text..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                />
                {formErrors.content && <p className="text-[11px] text-red-500 font-semibold mt-0.5">⚠ {formErrors.content}</p>}
              </div>

              {/* PDF Url */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-extrabold text-on-surface" htmlFor="form-pdf">
                  PDF Attachment Link (Optional URL)
                </label>
                <input
                  id="form-pdf"
                  type="text"
                  className={cn(
                    "w-full rounded-xl border bg-white px-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/15 transition-all",
                    formErrors.pdfUrl ? "border-red-500" : "border-outline-variant focus:border-primary"
                  )}
                  placeholder="e.g. https://storage.adivasiproducer.com/guides/guide.pdf"
                  value={formPdfUrl}
                  onChange={(e) => setFormPdfUrl(e.target.value)}
                />
                {formErrors.pdfUrl && <p className="text-[11px] text-red-500 font-semibold mt-0.5">⚠ {formErrors.pdfUrl}</p>}
              </div>

              {/* Image Url */}
              <div className="space-y-1.5">
                <label className="text-label-sm font-extrabold text-on-surface" htmlFor="form-image">
                  Cover Image Attachment Link (Optional URL)
                </label>
                <input
                  id="form-image"
                  type="text"
                  className={cn(
                    "w-full rounded-xl border bg-white px-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/15 transition-all",
                    formErrors.imageUrl ? "border-red-500" : "border-outline-variant focus:border-primary"
                  )}
                  placeholder="e.g. https://storage.adivasiproducer.com/images/cover.jpg"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                />
                {formErrors.imageUrl && <p className="text-[11px] text-red-500 font-semibold mt-0.5">⚠ {formErrors.imageUrl}</p>}
              </div>

              {/* Modal Buttons Footer */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="bg-white border border-outline hover:bg-surface-container-low text-on-surface font-extrabold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider text-label-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary hover:bg-dark-green text-white font-extrabold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider text-label-sm disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Notice...</span>
                    </>
                  ) : (
                    <span>{editingNotice ? 'Update Notice' : 'Publish Notice'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
