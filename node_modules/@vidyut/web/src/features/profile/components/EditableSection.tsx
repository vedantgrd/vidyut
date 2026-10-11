import React from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './Profile.module.css';

interface EditableSectionProps {
  title: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
  isSaving?: boolean;
}

export const EditableSection: React.FC<EditableSectionProps> = React.memo(({
  title,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  children,
  isSaving
}) => {
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {!isEditing ? (
          <Button variant="secondary" size="sm" onClick={onEdit}>
            <Edit2 size={14} />
            Edit
          </Button>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <Button variant="secondary" size="sm" onClick={onCancel} disabled={isSaving}>
              <X size={14} />
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={onSave} disabled={isSaving}>
              <Check size={14} />
              Save
            </Button>
          </div>
        )}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
});

EditableSection.displayName = 'EditableSection';
