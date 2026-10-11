import { useState, useEffect } from 'react';
import { ApiClient } from '@/api/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { Dialog } from '@/components/ui/Dialog';
import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Alert } from '@/components/ui/Alert';
import { Award, Plus, Trash2 } from 'lucide-react';

export default function AdminScholarshipManagementPage() {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New program state
  const [newProgram, setNewProgram] = useState({
    name: '',
    provider: '',
    description: '',
    amount: '',
    amountDescription: '',
    category: 'GOVERNMENT',
    deadline: '',
    eligibilityText: '',
    applicationUrl: ''
  });

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ApiClient.get<any[]>('/admin/scholarships');
      setScholarships(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch scholarships catalog.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setActionLoading('create');
    try {
      const data = {
        ...newProgram,
        amount: Number(newProgram.amount || 0),
        status: 'ACTIVE'
      };
      await ApiClient.post('/admin/scholarships', data);
      setIsCreateOpen(false);
      setNewProgram({
        name: '',
        provider: '',
        description: '',
        amount: '',
        amountDescription: '',
        category: 'GOVERNMENT',
        deadline: '',
        eligibilityText: '',
        applicationUrl: ''
      });
      fetchScholarships();
    } catch (err: any) {
      setError(err.message || 'Failed to create scholarship program.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this scholarship program? All associated applications will be deleted.')) return;
    setActionLoading(id);
    setError(null);
    try {
      await ApiClient.delete(`/admin/scholarships/${id}`);
      fetchScholarships();
    } catch (err: any) {
      setError(err.message || 'Failed to delete scholarship program.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Programs</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Configure, deploy, and retire scholarship programs.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Deploy New Program
        </Button>
      </div>

      {error && (
        <Alert variant="error" title="Program Manager Alert">
          {error}
        </Alert>
      )}

      {/* Catalog listing */}
      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton variant="rect" className="h-96" />
        </div>
      ) : scholarships.length === 0 ? (
        <GlassCard variant="default" padding="lg" className="border border-[var(--border-subtle)] text-center text-sm text-[var(--text-tertiary)] py-20 select-none">
          <Award className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4 opacity-50" />
          <h3 className="text-base font-bold text-white mb-1">Catalog is empty</h3>
          <p className="text-xs text-[var(--text-tertiary)]">Create a program to populate the active catalog list.</p>
        </GlassCard>
      ) : (
        <Table headers={['Program Name', 'Provider', 'Category', 'Deadline', 'Actions']}>
          {scholarships.map((sch) => (
            <TableRow key={sch.id}>
              <TableCell className="font-bold text-white max-w-sm truncate">
                {sch.name}
                <span className="block text-[10px] text-[var(--text-tertiary)] font-semibold mt-0.5">Amount: {sch.amountDescription || `₹${sch.amount}`}</span>
              </TableCell>
              <TableCell className="text-[var(--text-secondary)] font-medium">
                {sch.provider}
              </TableCell>
              <TableCell>
                <span className="text-[9px] font-bold bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800 uppercase tracking-wider select-none">
                  {sch.category}
                </span>
              </TableCell>
              <TableCell className="text-[var(--text-tertiary)] text-xs select-none">
                {new Date(sch.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </TableCell>
              <TableCell>
                <div className="select-none">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={actionLoading === sch.id}
                    onClick={() => handleDeleteProgram(sch.id)}
                    className="text-[var(--status-error)] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.15)]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Creation Modal Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Deploy Scholarship Program"
        className="max-w-2xl"
      >
        <form onSubmit={handleCreateProgram} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Scholarship Title"
              placeholder="e.g. Merit-cum-Means Scholarship"
              required
              value={newProgram.name}
              onChange={e => setNewProgram({ ...newProgram, name: e.target.value })}
            />
            <Input
              label="Provider Agency"
              placeholder="e.g. Ministry of Minority Affairs"
              required
              value={newProgram.provider}
              onChange={e => setNewProgram({ ...newProgram, provider: e.target.value })}
            />
            <Select
              label="Category"
              value={newProgram.category}
              onChange={e => setNewProgram({ ...newProgram, category: e.target.value })}
            >
              <option value="GOVERNMENT">Government</option>
              <option value="PRIVATE">Private</option>
              <option value="NGO">NGO</option>
              <option value="INTERNATIONAL">International</option>
              <option value="MINORITY">Minority Focused</option>
              <option value="MERIT">Merit Based</option>
              <option value="NEED_BASED">Need Based</option>
            </Select>
            <Input
              label="Due Date / Deadline"
              type="date"
              required
              value={newProgram.deadline}
              onChange={e => setNewProgram({ ...newProgram, deadline: e.target.value })}
            />
            <Input
              label="Numeric Amount (₹)"
              placeholder="e.g. 50000"
              type="number"
              required
              value={newProgram.amount}
              onChange={e => setNewProgram({ ...newProgram, amount: e.target.value })}
            />
            <Input
              label="Disbursement Description"
              placeholder="e.g. ₹50,000 per annum"
              required
              value={newProgram.amountDescription}
              onChange={e => setNewProgram({ ...newProgram, amountDescription: e.target.value })}
            />
          </div>

          <Textarea
            label="Program Description"
            placeholder="Write a clear description of the scholarship, benefits, and schedule..."
            required
            value={newProgram.description}
            onChange={e => setNewProgram({ ...newProgram, description: e.target.value })}
          />

          <Textarea
            label="Eligibility Criteria Statement"
            placeholder="Describe the income thresholds, minimum grades, and demographics qualified..."
            required
            value={newProgram.eligibilityText}
            onChange={e => setNewProgram({ ...newProgram, eligibilityText: e.target.value })}
          />

          <Input
            label="Official Website URL (Optional)"
            placeholder="https://example.com/scholarship"
            value={newProgram.applicationUrl}
            onChange={e => setNewProgram({ ...newProgram, applicationUrl: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)] select-none">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading === 'create'}>
              Deploy Program
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
