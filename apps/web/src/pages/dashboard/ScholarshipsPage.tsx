import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Award, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApi } from '@/hooks/useApi'
import { api } from '@/api/client'
import type { Scholarship } from '@/types'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Empty } from '@/components/ui/Empty'

const CATS = [
  { value: '', label: 'All Categories' },
  { value: 'GOVERNMENT', label: 'Government Schemes' },
  { value: 'PRIVATE', label: 'Private Foundations' },
  { value: 'NGO', label: 'NGO / Trust' },
  { value: 'MINORITY', label: 'Minority Welfare' },
  { value: 'MERIT', label: 'Merit-Based' },
  { value: 'NEED_BASED', label: 'Need-Based / Financial Aid' },
  { value: 'SPORTS', label: 'Sports Excellence' },
  { value: 'RESEARCH', label: 'Research & Fellowship' },
  { value: 'STUDY_ABROAD', label: 'Study Abroad' }
]

const SORTS = [
  { value: 'matchScore', label: 'Best Profile Match' },
  { value: 'deadline', label: 'Approaching Deadline' },
  { value: 'amount', label: 'Highest Award Amount' },
  { value: 'newest', label: 'Recently Added' }
]

function daysLeft(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

function fmtAmt(a: number) {
  return a >= 100000 ? `₹${(a / 100000).toFixed(1)}L` : `₹${a.toLocaleString('en-IN')}`
}

export function ScholarshipsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState('matchScore')
  const [onlyEligible, setOnlyEligible] = useState(true)
  const [page, setPage] = useState(1)

  const qs = new URLSearchParams({
    page: String(page),
    limit: '12',
    sortBy,
    ...(search && { search }),
    ...(category && { category }),
    ...(onlyEligible && { onlyEligible: 'true' })
  }).toString()

  const { data, isLoading } = useApi(
    () => api.get<{ scholarships: Scholarship[]; pagination: { page: number; totalPages: number; total: number } }>(`/scholarships?${qs}`),
    [qs]
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          Scholarship Directory
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '6px 0 0' }}>
          Discover schemes matched to your academic, domicile, category, and income criteria.
        </p>
      </div>

      {/* Linear-Style Search & Filter Toolbar */}
      <Card style={{ padding: '14px 18px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) auto auto auto', gap: 12, alignItems: 'center' }}>
          <Input
            placeholder="Search by scheme name or provider..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            leftIcon={<Search size={14} color="var(--text-muted)" />}
          />

          <Select
            options={CATS}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setPage(1)
            }}
            style={{ width: 190 }}
          />

          <Select
            options={SORTS}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 170 }}
          />

          <label
            htmlFor="eligible-toggle"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: 38,
              padding: '0 12px',
              borderRadius: 'var(--radius-md)',
              background: onlyEligible ? 'var(--accent-subtle)' : 'var(--bg-canvas)',
              border: `1px solid ${onlyEligible ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            <input
              type="checkbox"
              id="eligible-toggle"
              checked={onlyEligible}
              onChange={(e) => {
                setOnlyEligible(e.target.checked)
                setPage(1)
              }}
              style={{ width: 15, height: 15, accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: onlyEligible ? 600 : 500,
                color: onlyEligible ? 'var(--primary)' : 'var(--text-secondary)',
                whiteSpace: 'nowrap'
              }}
            >
              Eligible only
            </span>
          </label>
        </div>
      </Card>

      {/* Results Section */}
      {isLoading ? (
        <PageSpinner context="scholarships" />
      ) : data?.scholarships.length === 0 ? (
        <Empty
          icon={<Award size={28} />}
          title="No scholarships found"
          description="Try loosening your search keywords or disabling the 'Eligible only' filter to explore all schemes."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('')
                setCategory('')
                setOnlyEligible(false)
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Showing <strong style={{ color: 'var(--text-primary)' }} className="font-tabular">{data?.pagination.total ?? 0}</strong> scholarships
            </span>
            {onlyEligible && (
              <Badge variant="success" dot size="sm">
                Filtered by your profile criteria
              </Badge>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {data?.scholarships.map((s, i) => {
              const days = daysLeft(s.deadline)
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    hover
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      padding: 20,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Badge variant={s.isEligible ? 'success' : 'default'} dot>
                        {s.isEligible ? (
                          <>
                            <span className="font-tabular">{s.matchScore}%</span> match
                          </>
                        ) : (
                          'Review Criteria'
                        )}
                      </Badge>
                      {days <= 30 && days > 0 && (
                        <Badge variant={days <= 7 ? 'error' : 'warning'} size="sm">
                          <span className="font-tabular">{days}d</span> left
                        </Badge>
                      )}
                    </div>

                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: 4,
                        lineHeight: 1.4,
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {s.name}
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      {s.provider}
                    </p>

                    {s.shortDescription && (
                      <p
                        style={{
                          fontSize: 12,
                          color: 'var(--text-secondary)',
                          marginBottom: 12,
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {s.shortDescription}
                      </p>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {s.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="default" size="sm">
                          {t}
                        </Badge>
                      ))}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 'auto',
                        paddingTop: 12,
                        borderTop: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                          Award Amount
                        </span>
                        <span
                          className="font-tabular"
                          style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)' }}
                        >
                          {fmtAmt(s.amount)}
                        </span>
                      </div>
                      <Link to={`/scholarships/${s.id}`} style={{ textDecoration: 'none' }}>
                        <Button size="sm" variant="outline" rightIcon={<ChevronRight size={13} />}>
                          Details
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {data && data.pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="font-tabular" style={{ color: 'var(--text-secondary)', fontSize: 12, padding: '0 12px' }}>
                Page {page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
