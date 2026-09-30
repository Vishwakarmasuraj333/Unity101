'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Search,
  Download,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Registration, FoodPreference, RegistrationStatus } from '@/types';

export default function RegistrationsManagementPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [foodFilter, setFoodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Selected for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Modals
  const [viewingItem, setViewingItem] = useState<Registration | null>(null);
  const [editingItem, setEditingItem] = useState<Registration | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<Registration | null>(null);

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch registrations
  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: debouncedSearch,
        status: statusFilter,
        food: foodFilter,
        dateRange: dateFilter,
        sortBy,
        sortOrder,
      });

      const res = await fetch(`/api/admin/registrations?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setRegistrations(json.data || []);
        setTotalCount(json.pagination.total);
        setTotalPages(json.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to retrieve registrations');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter, foodFilter, dateFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(registrations.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Quick single status change
  const handleStatusChange = async (id: number, newStatus: RegistrationStatus) => {
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast('success', `Status updated to ${newStatus}`);
        fetchRegistrations();
      } else {
        showToast('error', 'Failed to update status');
      }
    } catch {
      showToast('error', 'Error connecting to server');
    }
  };

  // Delete registration (Soft delete to trash)
  const handleDeleteRegistration = async () => {
    if (!deleteConfirmItem) return;
    try {
      const res = await fetch(`/api/admin/registrations/${deleteConfirmItem.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('success', 'Registration moved to trash.');
        setDeleteConfirmItem(null);
        setSelectedIds((prev) => prev.filter((id) => id !== deleteConfirmItem.id));
        fetchRegistrations();
      } else {
        showToast('error', 'Failed to delete registration');
      }
    } catch {
      showToast('error', 'Error deleting registration');
    }
  };

  // Bulk action
  const handleBulkAction = async (action: 'confirm' | 'cancel' | 'soft_delete') => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
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
        fetchRegistrations();
      } else {
        showToast('error', data.message || 'Bulk action failed');
      }
    } catch {
      showToast('error', 'Error processing bulk action');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Export filtered CSV or selected CSV
  const handleExport = (onlySelected = false) => {
    const params = new URLSearchParams();
    if (onlySelected && selectedIds.length > 0) {
      params.set('ids', selectedIds.join(','));
    } else {
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (foodFilter !== 'all') params.set('food', foodFilter);
      if (dateFilter !== 'all') params.set('dateRange', dateFilter);
    }
    window.location.href = `/api/admin/export?${params.toString()}`;
  };

  return (
    <AdminLayout title="Registrations Directory">
      <div className="space-y-5">
        {/* Toast Notification */}
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

        {/* Top Control Bar */}
        <div className="bg-white rounded-2xl border border-purple-100/80 p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-purple-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, mobile, town, or postcode..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#12071f] border border-slate-200 dark:border-purple-800 rounded-xl focus:outline-none focus:border-[#481268] dark:focus:border-amber-400 focus:bg-white text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/50 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleExport(false)}
                className="inline-flex items-center space-x-1.5 bg-slate-100 dark:bg-purple-900/60 hover:bg-slate-200 dark:hover:bg-purple-800 text-slate-800 dark:text-purple-100 text-xs font-semibold py-2 px-3.5 rounded-xl border border-slate-200/80 dark:border-purple-700/80 transition-all cursor-pointer shadow-xs"
                title="Export filtered records to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center space-x-1.5 bg-[#481268] hover:bg-[#380952] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Guest</span>
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center space-x-1 text-slate-500 font-semibold mr-1">
              <Filter className="w-3.5 h-3.5 text-[#481268]" />
              <span>Filters:</span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-[#481268]"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Food Filter */}
            <select
              value={foodFilter}
              onChange={(e) => {
                setFoodFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-[#481268]"
            >
              <option value="all">All Food Choices</option>
              <option value="Veg Food">Veg Food</option>
              <option value="Non Veg Food">Non Veg Food</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-[#481268]"
            >
              <option value="all">All Dates</option>
              <option value="today">Registered Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>

            {/* Sort Filter */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so as 'ASC' | 'DESC');
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-[#481268] ml-auto"
            >
              <option value="created_at-DESC">Newest First</option>
              <option value="created_at-ASC">Oldest First</option>
              <option value="name-ASC">Name (A-Z)</option>
              <option value="name-DESC">Name (Z-A)</option>
              <option value="town-ASC">Town (A-Z)</option>
            </select>

            {/* Limit selector */}
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-[#481268]"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Ribbon */}
        {selectedIds.length > 0 && (
          <div className="bg-purple-950 text-white rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-md animate-in fade-in">
            <div className="text-xs font-medium">
              <span className="font-bold text-amber-400">{selectedIds.length}</span> registration(s) selected
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('confirm')}
                disabled={bulkActionLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg transition-colors"
              >
                Mark Confirmed
              </button>
              <button
                onClick={() => handleBulkAction('cancel')}
                disabled={bulkActionLoading}
                className="bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg transition-colors"
              >
                Mark Cancelled
              </button>
              <button
                onClick={() => handleExport(true)}
                disabled={bulkActionLoading}
                className="bg-purple-800 hover:bg-purple-700 text-amber-300 text-[11px] font-semibold py-1.5 px-3 rounded-lg transition-colors inline-flex items-center space-x-1"
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>Export Selected</span>
              </button>
              <button
                onClick={() => handleBulkAction('soft_delete')}
                disabled={bulkActionLoading}
                className="bg-slate-800 hover:bg-slate-700 text-red-300 text-[11px] font-semibold py-1.5 px-3 rounded-lg transition-colors"
              >
                Move to Trash
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-white text-[11px] underline ml-1"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Main Registrations Table Card */}
        <div className="bg-white rounded-2xl border border-purple-100/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] tracking-wider select-none">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        registrations.length > 0 && selectedIds.length === registrations.length
                      }
                      className="rounded border-slate-300 text-[#481268] focus:ring-purple-700"
                    />
                  </th>
                  <th className="py-3 px-3 font-semibold">Ref</th>
                  <th className="py-3 px-3 font-semibold">Guest Name</th>
                  <th className="py-3 px-3 font-semibold">Contact</th>
                  <th className="py-3 px-3 font-semibold">Town & Postcode</th>
                  <th className="py-3 px-3 font-semibold">Food</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Registered</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#481268] mb-2" />
                      <span>Loading registration records from MySQL...</span>
                    </td>
                  </tr>
                ) : registrations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <p className="text-sm font-semibold text-slate-600 mb-1">No registrations found</p>
                      <p className="text-xs text-slate-400">
                        {search || statusFilter !== 'all' || foodFilter !== 'all'
                          ? 'Try adjusting your search filters.'
                          : 'No guests have registered yet.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg) => {
                    const isSelected = selectedIds.includes(reg.id);
                    return (
                      <tr
                        key={reg.id}
                        className={`hover:bg-purple-50/30 transition-colors ${
                          isSelected ? 'bg-purple-50/50' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(reg.id)}
                            className="rounded border-slate-300 text-[#481268] focus:ring-purple-700"
                          />
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-[#481268] dark:text-amber-400 text-xs">
                          #{reg.id}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {reg.first_name} {reg.last_name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-purple-300 truncate max-w-[180px]">{reg.address}</p>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-slate-800 dark:text-purple-100 font-medium">{reg.email}</p>
                          <p className="text-[11px] text-slate-500 dark:text-amber-300 font-mono font-semibold">{reg.mobile}</p>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-slate-700 dark:text-purple-100 font-medium">{reg.town}</p>
                          <p className="text-[10px] font-mono text-slate-500 dark:text-purple-300 uppercase font-semibold">{reg.post_code}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              reg.food_preference === 'Veg Food'
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/40'
                                : 'bg-red-100 dark:bg-red-950/80 text-red-900 dark:text-red-300 border border-red-300/40'
                            }`}
                          >
                            {reg.food_preference}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={reg.status}
                            onChange={(e) =>
                              handleStatusChange(reg.id, e.target.value as RegistrationStatus)
                            }
                            className={`text-[11px] font-bold py-1 px-2 rounded-lg border cursor-pointer focus:ring-1 focus:ring-purple-700 ${
                              reg.status === 'confirmed'
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600/50'
                                : reg.status === 'cancelled'
                                ? 'bg-red-100 dark:bg-red-950/80 text-red-900 dark:text-red-300 border-red-300 dark:border-red-600/50'
                                : 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-600/50'
                            }`}
                          >
                            <option value="new">New</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-500 dark:text-purple-200 whitespace-nowrap">
                          {new Date(reg.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Link
                              href={`/admin/registrations/${reg.id}`}
                              className="p-1.5 text-slate-500 dark:text-purple-300 hover:text-purple-700 dark:hover:text-amber-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-lg transition-colors inline-flex items-center"
                              title="View Registration Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => setEditingItem(reg)}
                              className="p-1.5 text-slate-500 dark:text-purple-300 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-lg transition-colors cursor-pointer"
                              title="Edit Registration"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmItem(reg)}
                              className="p-1.5 text-slate-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/60 rounded-lg transition-colors cursor-pointer"
                              title="Move to Trash"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing{' '}
              <span className="font-semibold text-slate-800">
                {totalCount === 0 ? 0 : (page - 1) * limit + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(page * limit, totalCount)}
              </span>{' '}
              of <span className="font-semibold text-slate-800">{totalCount}</span> registrations
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* View Modal */}
        {viewingItem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-purple-100">
              <div className="bg-[#481268] text-white p-5 flex items-center justify-between">
                <div>
                  <span className="text-amber-400 font-mono text-xs font-semibold">
                    REGISTRATION #{viewingItem.id}
                  </span>
                  <h3 className="font-bold text-lg font-serif-brand">
                    {viewingItem.first_name} {viewingItem.last_name}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingItem(null)}
                  className="text-purple-200 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Email Address</span>
                    <p className="font-semibold text-slate-800">{viewingItem.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Mobile Phone</span>
                    <p className="font-semibold text-slate-800 font-mono">{viewingItem.mobile}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-slate-400 block mb-0.5">Postal Address</span>
                  <p className="font-semibold text-slate-800">{viewingItem.address}</p>
                  <p className="text-slate-600">
                    {viewingItem.town}, <span className="font-mono uppercase">{viewingItem.post_code}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Food Choice</span>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full font-semibold ${
                        viewingItem.food_preference === 'Veg Food'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {viewingItem.food_preference}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Current Status</span>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full font-semibold ${
                        viewingItem.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : viewingItem.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {viewingItem.status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-slate-400 block mb-0.5">GDPR Marketing Consent</span>
                  <p className="text-slate-700 font-medium">
                    {viewingItem.gdpr_consent ? '✓ Explicit Consent Granted' : '✗ Not Consented'}
                  </p>
                </div>

                {viewingItem.notes && (
                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-slate-400 block mb-0.5">Admin Notes</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {viewingItem.notes}
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400 flex justify-between">
                  <span>Registered: {new Date(viewingItem.created_at).toLocaleString()}</span>
                  <span>Updated: {new Date(viewingItem.updated_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    const item = viewingItem;
                    setViewingItem(null);
                    setEditingItem(item);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  Edit Guest
                </button>
                <button
                  onClick={() => setViewingItem(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Registration Modal */}
        {editingItem && (
          <EditGuestModal
            registration={editingItem}
            onClose={() => setEditingItem(null)}
            onSaved={() => {
              setEditingItem(null);
              showToast('success', 'Registration updated successfully.');
              fetchRegistrations();
            }}
          />
        )}

        {/* Add Guest Modal */}
        {isAddModalOpen && (
          <AddGuestModal
            onClose={() => setIsAddModalOpen(false)}
            onAdded={() => {
              setIsAddModalOpen(false);
              showToast('success', 'Guest registered successfully in MySQL.');
              fetchRegistrations();
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmItem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#111625] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3 text-red-600 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Guest Registration</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Record will be safely archived</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
                Are you sure you want to delete the registration for{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {deleteConfirmItem.first_name} {deleteConfirmItem.last_name}
                </span>{' '}
                (#{deleteConfirmItem.id})? It will be moved to <strong className="text-purple-700 dark:text-purple-300">Trash & Archival</strong> where it can be restored or permanently purged.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setDeleteConfirmItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRegistration}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Registration</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Sub-component: Edit Guest Modal
function EditGuestModal({
  registration,
  onClose,
  onSaved,
}: {
  registration: Registration;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState({
    first_name: registration.first_name,
    last_name: registration.last_name,
    address: registration.address,
    town: registration.town,
    post_code: registration.post_code,
    email: registration.email,
    mobile: registration.mobile,
    food_preference: registration.food_preference,
    status: registration.status,
    notes: registration.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (formData.first_name.trim().length < 2 || formData.last_name.trim().length < 2) {
      setError('Please provide valid guest first and last names (minimum 2 characters).');
      setSaving(false);
      return;
    }
    if (formData.mobile.replace(/\D/g, '').length < 10) {
      setError('Mobile phone number must contain at least 10 valid digits.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/registrations/${registration.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          town: formData.town.trim(),
          address: formData.address.trim(),
          post_code: formData.post_code.trim().toUpperCase(),
          email: formData.email.trim().toLowerCase(),
          mobile: formData.mobile.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to update registration');
        return;
      }
      onSaved();
    } catch {
      setError('Connection error while updating record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#1a082b] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-purple-100 dark:border-purple-800 max-h-[92vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#2f0846] via-[#481268] to-[#5d1785] text-white p-4 px-6 flex items-center justify-between border-b border-purple-800/60">
          <div>
            <div className="flex items-center space-x-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="font-bold text-sm tracking-wide text-white">
                Edit Guest Registration #{registration.id}
              </h3>
            </div>
            <p className="text-[11px] text-purple-200">Updating live records in verified MySQL database</p>
          </div>
          <button onClick={onClose} className="text-purple-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">
                First Name <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                maxLength={50}
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value.replace(/[^a-zA-Z\s'-]/g, '') })}
                required
                placeholder="e.g. Suraj"
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">
                Last Name <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                maxLength={50}
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value.replace(/[^a-zA-Z\s'-]/g, '') })}
                required
                placeholder="e.g. Patel"
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">
              Street Address <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              maxLength={120}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              placeholder="e.g. 10 St Mary's Road"
              className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">
                Town / City <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                maxLength={50}
                value={formData.town}
                onChange={(e) => setFormData({ ...formData, town: e.target.value.replace(/[^a-zA-Z\s'-]/g, '') })}
                required
                placeholder="e.g. Southampton"
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">
                Postcode <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                value={formData.post_code}
                onChange={(e) => setFormData({ ...formData, post_code: e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '') })}
                required
                placeholder="e.g. SO14 0AY"
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl uppercase bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">
                Email Address <span className="text-amber-500">*</span>
              </label>
              <input
                type="email"
                maxLength={100}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value.trim().toLowerCase() })}
                required
                placeholder="e.g. suraj.patel@gmail.com"
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">
                Mobile Phone (10–15 digits) <span className="text-amber-500">*</span>
              </label>
              <input
                type="tel"
                maxLength={16}
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/[^0-9+\s]/g, '') })}
                required
                placeholder="e.g. 07700 900123"
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">Food Preference</label>
              <select
                value={formData.food_preference}
                onChange={(e) =>
                  setFormData({ ...formData, food_preference: e.target.value as FoodPreference })
                }
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="Veg Food">Veg Food (Vegetarian)</option>
                <option value="Non Veg Food">Non Veg Food</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as RegistrationStatus })
                }
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="confirmed">Confirmed</option>
                <option value="new">New (Pending Review)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">Notes / Table Allocation</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. VIP guest, Table #4, vegetarian Jain diet, seated with Community Radio Trustees..."
              className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100 dark:border-purple-900/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-purple-700/80 bg-slate-100 dark:bg-purple-900/40 hover:bg-slate-200 dark:hover:bg-purple-800 text-slate-700 dark:text-purple-200 font-semibold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center space-x-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sub-component: Add Guest Modal
function AddGuestModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address: '',
    town: '',
    post_code: '',
    email: '',
    mobile: '',
    food_preference: 'Veg Food' as FoodPreference,
    status: 'confirmed' as RegistrationStatus,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Final client-side sanity check
    if (formData.first_name.trim().length < 2 || formData.last_name.trim().length < 2) {
      setError('Please provide valid guest first and last names (minimum 2 characters).');
      setSaving(false);
      return;
    }
    if (formData.mobile.replace(/\D/g, '').length < 10) {
      setError('Mobile phone number must contain at least 10 valid digits.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          town: formData.town.trim(),
          address: formData.address.trim(),
          post_code: formData.post_code.trim().toUpperCase(),
          email: formData.email.trim().toLowerCase(),
          mobile: formData.mobile.trim(),
          gdpr_consent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to add guest');
        return;
      }
      onAdded();
    } catch {
      setError('Connection error while adding guest');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#1a082b] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-purple-100 dark:border-purple-800 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2f0846] via-[#481268] to-[#5d1785] text-white p-4 px-6 flex items-center justify-between border-b border-purple-800/60">
          <div>
            <div className="flex items-center space-x-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="font-bold text-sm tracking-wide text-white">Add New Guest Registration</h3>
            </div>
            <p className="text-[11px] text-purple-200">Recorded directly to verified MySQL database</p>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">
                First Name <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                maxLength={50}
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value.replace(/[^a-zA-Z\s'-]/g, '') })}
                required
                placeholder="e.g. Suraj"
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">
                Last Name <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                maxLength={50}
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value.replace(/[^a-zA-Z\s'-]/g, '') })}
                required
                placeholder="e.g. Patel"
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">
              Street Address <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              maxLength={120}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              placeholder="e.g. 10 St Mary's Road"
              className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">
                Town / City <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                maxLength={50}
                value={formData.town}
                onChange={(e) => setFormData({ ...formData, town: e.target.value.replace(/[^a-zA-Z\s'-]/g, '') })}
                required
                placeholder="e.g. Southampton"
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">
                Postcode <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                value={formData.post_code}
                onChange={(e) => setFormData({ ...formData, post_code: e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '') })}
                required
                placeholder="e.g. SO14 0AY"
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl uppercase bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">
                Email Address <span className="text-amber-500">*</span>
              </label>
              <input
                type="email"
                maxLength={100}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value.trim().toLowerCase() })}
                required
                placeholder="e.g. suraj.patel@gmail.com"
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">
                Mobile Phone (10–15 digits) <span className="text-amber-500">*</span>
              </label>
              <input
                type="tel"
                maxLength={16}
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/[^0-9+\s]/g, '') })}
                required
                placeholder="e.g. 07700 900123"
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">Food Preference</label>
              <select
                value={formData.food_preference}
                onChange={(e) =>
                  setFormData({ ...formData, food_preference: e.target.value as FoodPreference })
                }
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="Veg Food">Veg Food (Vegetarian)</option>
                <option value="Non Veg Food">Non Veg Food</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as RegistrationStatus })
                }
                className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="confirmed">Confirmed</option>
                <option value="new">New (Pending Review)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-purple-200 block mb-1">Notes / Table Allocation</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. VIP guest, Table #4, vegetarian Jain diet, seated with Community Radio Trustees..."
              className="w-full p-2.5 border border-slate-300 dark:border-purple-600/70 rounded-xl bg-slate-50 dark:bg-[#120520] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/40 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-[#17082a] transition-colors"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100 dark:border-purple-900/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-purple-700/80 bg-slate-100 dark:bg-purple-900/40 hover:bg-slate-200 dark:hover:bg-purple-800 text-slate-700 dark:text-purple-200 font-semibold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center space-x-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              <span>Save Registration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
