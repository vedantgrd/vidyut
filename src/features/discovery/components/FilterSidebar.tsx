import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useDiscoveryStore } from '../store/discoveryStore';
import styles from './FilterSidebar.module.css';

const AVAILABLE_TAGS = ['Tech', 'Merit', 'Need-based', 'State', 'Women', 'Engineering', 'First-Gen', 'Minority', 'STEM'];

export const FilterSidebar: React.FC = () => {
  const { filters, setFilters } = useDiscoveryStore();
  const [searchTerm, setSearchTerm] = useState(filters.searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.searchQuery) {
        setFilters({ searchQuery: searchTerm });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filters.searchQuery, setFilters]);

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    setFilters({ tags: newTags });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <SlidersHorizontal size={20} className={styles.icon} />
        <h2 className={styles.title}>Filters</h2>
      </div>

      <div className={styles.section}>
        <Input 
          placeholder="Search scholarships..." 
          leftIcon={<Search size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Sort By</h3>
        <select 
          className={styles.select}
          value={filters.sortBy}
          onChange={(e) => setFilters({ sortBy: e.target.value as any })}
          aria-label="Sort scholarships"
        >
          <option value="matchScore">Highest Match Score</option>
          <option value="deadline">Upcoming Deadline</option>
          <option value="amount">Highest Amount</option>
        </select>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Categories</h3>
        <div className={styles.tagsContainer}>
          {AVAILABLE_TAGS.map(tag => (
            <button
              key={tag}
              className={`${styles.tagButton} ${filters.tags.includes(tag) ? styles.tagActive : ''}`}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Funding Amount</h3>
        <div className={styles.amountFilters}>
          <Button 
            variant={filters.minAmount === 0 && filters.maxAmount === 50000 ? 'primary' : 'secondary'} 
            size="sm" 
            onClick={() => setFilters({ minAmount: 0, maxAmount: 50000 })}
          >
            Under ₹50k
          </Button>
          <Button 
            variant={filters.minAmount === 50000 && filters.maxAmount === 100000 ? 'primary' : 'secondary'} 
            size="sm" 
            onClick={() => setFilters({ minAmount: 50000, maxAmount: 100000 })}
          >
            ₹50k - ₹1L
          </Button>
          <Button 
            variant={filters.minAmount === 100000 ? 'primary' : 'secondary'} 
            size="sm" 
            onClick={() => setFilters({ minAmount: 100000, maxAmount: 5000000 })}
          >
            Over ₹1L
          </Button>
          <Button 
            variant={filters.minAmount === 0 && filters.maxAmount === 5000000 ? 'primary' : 'secondary'} 
            size="sm" 
            onClick={() => setFilters({ minAmount: 0, maxAmount: 5000000 })}
          >
            Any Amount
          </Button>
        </div>
      </div>
    </aside>
  );
};

FilterSidebar.displayName = 'FilterSidebar';
