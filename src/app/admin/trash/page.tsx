'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Trash2,
  RotateCcw,
  Search,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Registration } from '@/types';

export default function TrashRecoveryPage() {
  const [items, setItems] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<Registration | null>(null);
  const [bulkPermanentConfirm, setBulkPermanentConfirm] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchTrashItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        trash: 'true',
        search: debouncedSearch,
        page: page.toString(),
        limit: '25',
      });
      const res = await fetch(`/api/admin/registrations?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
        setTotalCount(json.pagination.total);
        setTotalPages(json.pagination.totalPages);
      }
    } catch {
      showToast('error', 'Failed to load trash items');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchTrashItems();
  }, [fetchTrashItems]);

  const handleRestoreSingle = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/registrations/${id}/restore`, { method: 'POST' });
      if (res.ok) {
        showToast('success', 'Registration restored to active records.');
        fetchTrashItems();
      } else {
        showToast('error', 'Failed to restore record');
      }
    } catch {
      showToast('error', 'Error restoring record');
    }
  };

  const handlePermanentDeleteSingle = async () => {
    if (!permanentDeleteTarget) return;
    try {
      const res = await fetch(`/api/admin/registrations/${permanentDeleteTarget.id}?permanent=true`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('success', 'Registration permanently removed from database.');
        setPermanentDeleteTarget(null);
        fetchTrashItems();
      } else {
        showToast('error', 'Failed to permanently delete record');
      }
    } catch {
      showToast('error', 'Error permanently deleting record');
    }
  };

  const handleBulkAction = async (action: 'restore' | 'permanent_delete') => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selectedIds }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message);
        setSelectedIds([]);
        setBulkPermanentConfirm(false);
        fetchTrashItems();
      } else {
        showToast('error', data.message || 'Bulk operation failed');
      }
    } catch {
      showToast('error', 'Error communicating with server');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout title="Archived Guest Directory">
      <div className="space-y-5">
        {/* Toast */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg border flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-bottom-3 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : 'bg-red-900 text-red-100 border-red-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Search & Bulk Bar */}
        <div className="bg-white rounded-2xl border border-purple-100/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trash records..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#481268] focus:bg-white text-slate-900"
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-purple-900">
                {selectedIds.length} selected:
              </span>
              <button
                onClick={() => handleBulkAction('restore')}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore Selected</span>
              </button>
              <button
                onClick={() => setBulkPermanentConfirm(true)}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Permanent Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-purple-100/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] tracking-wider select-none">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selectedIds.length === items.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(items.map((i) => i.id));
                        else setSelectedIds([]);
                      }}
                      className="rounded border-slate-300 text-[#481268] focus:ring-purple-700"
                    />
                  </th>
                  <th className="py-3 px-3 font-semibold">Ref</th>
                  <th className="py-3 px-3 font-semibold">Guest</th>
                  <th className="py-3 px-3 font-semibold">Contact</th>
                  <th className="py-3 px-3 font-semibold">Town</th>
                  <th className="py-3 px-3 font-semibold">Food</th>
                  <th className="py-3 px-3 font-semibold">Deleted Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#481268] mb-2" />
                      <span>Loading trash...</span>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Trash2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Trash is Empty</p>
                      <p className="text-xs text-slate-400 mt-0.5">No deleted registrations currently in trash.</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-colors">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() =>
                            setSelectedIds((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((x) => x !== item.id)
                                : [...prev, item.id]
                            )
                          }
                          className="rounded border-slate-300 text-[#481268] focus:ring-purple-700"
                        />
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-amber-400">#{item.id}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800 dark:text-white">
                          {item.first_name} {item.last_name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{item.address}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-slate-600">{item.email}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{item.mobile}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{item.town}</td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] text-slate-600 font-medium">{item.food_preference}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                        {item.deleted_at ? new Date(item.deleted_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleRestoreSingle(item.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Restore registration"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPermanentDeleteTarget(item)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Permanently Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <div>
              Total in trash: <span className="font-semibold text-slate-800">{totalCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Single Permanent Delete Modal */}
        {permanentDeleteTarget && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200">
              <div className="flex items-center space-x-3 text-red-600 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Permanently Delete Record?</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                This action is irreversible. Registration #{permanentDeleteTarget.id} for{' '}
                <span className="font-bold text-slate-900">
                  {permanentDeleteTarget.first_name} {permanentDeleteTarget.last_name}
                </span>{' '}
                will be permanently purged from the MySQL database.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setPermanentDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePermanentDeleteSingle}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
                >
                  Purge Permanently
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Permanent Delete Modal */}
        {bulkPermanentConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200">
              <div className="flex items-center space-x-3 text-red-600 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Permanently Delete Selected?</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Are you sure you want to permanently delete all{' '}
                <span className="font-bold text-slate-900">{selectedIds.length}</span> selected registrations? This operation cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setBulkPermanentConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBulkAction('permanent_delete')}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
                >
                  Confirm Bulk Purge
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
