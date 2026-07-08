'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Container } from '@/components/common/Container';
import { apiRequest, ApiError } from '@/lib/api-client';
import { CoordinatorModal, CoordinatorData } from '@/components/sections/admin/CoordinatorModal';

// Available Blocks for selection
const BLOCKS = [
  'Bhamragad',
  'Etapalli',
  'Mulchera',
  'Aheri',
  'Sironcha',
  'Chamorshi',
  'Dhanora',
  'Kurkheda'
];

export default function AdminCoordinatorsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Coordinators directory states
  const [coordinators, setCoordinators] = useState<CoordinatorData[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [block, setBlock] = useState('');
  const [page, setPage] = useState(1);

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState<CoordinatorData | null>(null);

  // Auth gate check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/staff-portal/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Fetch coordinators from API
  const fetchCoordinators = useCallback(async () => {
    setIsDataLoading(true);
    setErrorMsg('');
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: '10',
        search: search.trim(),
        block
      });
      const data = await apiRequest<{
        success: boolean;
        coordinators: CoordinatorData[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>(`/users?${query.toString()}`);

      if (data.success) {
        setCoordinators(data.coordinators);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch coordinators:', err);
      const msg = err instanceof ApiError ? err.message : 'Failed to query coordinators directory.';
      setErrorMsg(msg);
    } finally {
      setIsDataLoading(false);
    }
  }, [page, search, block]);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      const timer = setTimeout(() => {
        fetchCoordinators();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, fetchCoordinators]);

  // Handle coordinator delete action
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate ${name}'s coordinator account? This will revoke all their active sessions immediately.`)) {
      return;
    }

    try {
      await apiRequest(`/users/${id}`, { method: 'DELETE' });
      fetchCoordinators();
    } catch (err) {
      console.error(err);
      const msg = err instanceof ApiError ? err.message : 'Failed to deactivate coordinator account.';
      alert(msg);
    }
  };

  const handleEditClick = (coordinator: CoordinatorData) => {
    setSelectedCoordinator(coordinator);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedCoordinator(null);
    setIsModalOpen(true);
  };

  if (isAuthLoading) {
    return <DirectorySkeleton />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Double check authorization on client side
  if (user.role !== 'ADMIN') {
    return (
      <main className="min-h-screen py-16 px-4 flex items-center justify-center bg-surface select-none">
        <div className="bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-md text-center space-y-4 max-w-md">
          <span className="text-4xl">⚠️</span>
          <h4 className="text-body-lg font-black text-on-surface">Access Restrained</h4>
          <p className="text-body-sm text-on-surface-variant font-medium leading-relaxed">
            Only administrators are authorized to manage block coordinator accounts. Please sign in with an admin profile.
          </p>
          <button
            onClick={() => router.push('/staff-portal/dashboard')}
            className="w-full bg-primary hover:bg-dark-green text-white font-extrabold py-2.5 px-6 rounded-xl transition-all shadow-sm uppercase tracking-wider text-xs"
          >
            Return to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface py-12 px-4 relative overflow-hidden">
      {/* Decorative Background Blur */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-amber-500/5 blur-3xl" />

      <Container className="max-w-6xl relative z-10 space-y-6">
        
        {/* Header Panel */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-md">
          <div className="space-y-1 select-none text-left">
            <span className="block text-[10px] font-black uppercase tracking-widest text-primary/70">
              APC Administrative Portal
            </span>
            <h3 className="text-headline-md font-black text-on-surface">
              Coordinators Directory
            </h3>
            <p className="text-body-sm font-medium text-on-surface-variant">
              Register field coordinators, edit block boundary permissions, and manage accounts
            </p>
          </div>
          
          <button
            onClick={handleCreateClick}
            className="mt-4 md:mt-0 bg-primary hover:bg-dark-green text-white font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider text-label-sm select-none"
          >
            Add Coordinator
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-left animate-shake">
            <span className="text-lg shrink-0">⚠️</span>
            <div className="space-y-1">
              <h5 className="font-extrabold text-red-800 text-label-sm">Query Error</h5>
              <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                {errorMsg}
              </p>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        <div className="bg-white border border-outline-variant/30 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-sm">🔍</span>
            <input
              type="text"
              className="w-full rounded-xl border border-outline bg-white pl-10 pr-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200"
              placeholder="Search coordinator by name/email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="w-full md:w-60 text-left">
            <select
              className="w-full rounded-xl border border-outline bg-white px-4 py-2.5 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200"
              value={block}
              onChange={(e) => {
                setBlock(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Block boundaries</option>
              {BLOCKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Directory Listing Table */}
        <div className="bg-white border border-outline-variant/30 rounded-3xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20 text-[11px] font-black uppercase tracking-wider text-on-surface-variant/70 text-left">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Assigned Block</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-body-sm text-on-surface">
                {isDataLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant/60 font-semibold select-none">
                      <div className="w-6 h-6 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                      Loading coordinators...
                    </td>
                  </tr>
                ) : coordinators.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-on-surface-variant/60 font-semibold select-none">
                      No block coordinators found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  coordinators.map((coord) => (
                    <tr key={coord.id} className="hover:bg-surface-container-lowest/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-left">{coord.fullName}</td>
                      <td className="px-6 py-4 font-medium text-left">{coord.email}</td>
                      <td className="px-6 py-4 font-medium text-left">{coord.phoneNumber || '—'}</td>
                      <td className="px-6 py-4 text-left">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase bg-primary/10 text-primary border border-primary/10 tracking-wide">
                          {coord.block}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEditClick(coord)}
                          className="px-4 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 text-amber-800 font-bold rounded-lg text-xs transition-colors cursor-pointer select-none uppercase tracking-wide"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(coord.id, coord.fullName)}
                          className="px-4 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200/50 text-red-800 font-bold rounded-lg text-xs transition-colors cursor-pointer select-none uppercase tracking-wide"
                        >
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!isDataLoading && coordinators.length > 0 && (
            <div className="px-6 py-4 bg-surface-container-lowest border-t border-outline-variant/20 flex items-center justify-between text-label-sm font-extrabold uppercase tracking-wider text-on-surface-variant select-none">
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border border-outline hover:bg-surface-container-low text-on-surface font-extrabold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Prev
                </button>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border border-outline hover:bg-surface-container-low text-on-surface font-extrabold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </Container>

      {/* Modal Dialog */}
      {isModalOpen && (
        <CoordinatorModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCoordinator(null);
          }}
          onSuccess={fetchCoordinators}
          initialData={selectedCoordinator}
        />
      )}
    </main>
  );
}

function DirectorySkeleton() {
  return (
    <main className="min-h-screen bg-surface py-12 px-4 relative overflow-hidden animate-pulse">
      <Container className="max-w-6xl relative z-10 space-y-6">
        <div className="h-28 bg-white border border-outline-variant/20 rounded-3xl p-8 flex items-center justify-between">
          <div className="space-y-3 w-1/3 text-left">
            <div className="h-3 w-1/4 bg-outline-variant/30 rounded" />
            <div className="h-6 w-3/4 bg-outline-variant/40 rounded" />
          </div>
          <div className="h-10 w-28 bg-outline-variant/30 rounded-xl" />
        </div>

        <div className="h-16 bg-white border border-outline-variant/20 rounded-3xl p-4 flex items-center justify-between gap-4">
          <div className="h-10 bg-outline-variant/20 rounded-xl flex-1" />
        </div>

        <div className="bg-white border border-outline-variant/20 rounded-3xl p-6 space-y-4">
          <div className="h-4 w-1/4 bg-outline-variant/30 rounded" />
          <div className="space-y-3">
            <div className="h-10 bg-outline-variant/20 rounded-xl" />
            <div className="h-12 bg-outline-variant/10 rounded-xl" />
            <div className="h-12 bg-outline-variant/10 rounded-xl" />
            <div className="h-12 bg-outline-variant/10 rounded-xl" />
          </div>
        </div>
      </Container>
    </main>
  );
}
