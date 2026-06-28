import React, { useEffect, useState } from 'react';
import { User, MapPin, Phone } from 'lucide-react';
import { DashboardHeader, DashboardSection } from '@/features/dashboard/components/DashboardLayout';
import { useProfileStore } from '@/features/profile/store/profileStore';
import { EditableSection } from '@/features/profile/components/EditableSection';
import { SkeletonCard } from '@/features/dashboard/components/SkeletonCard';
import { Input } from '@/components/ui/Input';
import styles from '@/features/profile/components/Profile.module.css';

const ProfilePage: React.FC = () => {
  const { profile, isLoading, error, isSaving, fetchProfile, updateProfile } = useProfileStore();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEdit = (section: string) => {
    setEditingSection(section);
    setFormData(profile || {});
  };

  const handleCancel = () => {
    setEditingSection(null);
  };

  const handleSave = async () => {
    await updateProfile(formData);
    setEditingSection(null);
  };

  if (isLoading || !profile) {
    return (
      <div>
        <DashboardHeader title="Profile" subtitle="Manage your Scholarship DNA." />
        <SkeletonCard height={150} className="mb-4" />
        <SkeletonCard height={300} />
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader 
        title="Profile"
        subtitle="Manage your Scholarship DNA."
      />

      <DashboardSection style={{ maxWidth: 800, margin: '0 auto' }}>
        {error && (
          <div style={{ color: '#ef4444', padding: 'var(--space-xl)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-xl)' }}>
            {error}
          </div>
        )}

        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            <User size={40} />
          </div>
          <div className={styles.avatarInfo}>
            <h2 className={styles.name}>{profile.fullName}</h2>
            <p className={styles.email}>{profile.email}</p>
          </div>
        </div>

        <EditableSection 
          title="Personal Information"
          isEditing={editingSection === 'personal'}
          onEdit={() => handleEdit('personal')}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        >
          {editingSection === 'personal' ? (
            <>
              <Input 
                label="Full Name" 
                value={formData.fullName || ''} 
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
              />
              <Input 
                label="Phone" 
                value={formData.phone || ''} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
              />
              <Input 
                label="Location" 
                value={formData.location || ''} 
                onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
              />
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
              <div className={styles.field}>
                <span className={styles.label}>Phone</span>
                <span className={styles.value} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={14} /> {profile.phone}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Location</span>
                <span className={styles.value} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={14} /> {profile.location}</span>
              </div>
              <div className={styles.field} style={{ gridColumn: 'span 2' }}>
                <span className={styles.label}>Bio</span>
                <span className={styles.value}>{profile.bio}</span>
              </div>
            </div>
          )}
        </EditableSection>

        <EditableSection 
          title="Skills & Expertise"
          isEditing={editingSection === 'skills'}
          onEdit={() => handleEdit('skills')}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        >
          {editingSection === 'skills' ? (
            <Input 
              label="Skills (comma separated)" 
              value={(formData.skills || []).join(', ')} 
              onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })} 
            />
          ) : (
            <div className={styles.tags}>
              {profile.skills.map(skill => (
                <span key={skill} className={styles.tag}>{skill}</span>
              ))}
            </div>
          )}
        </EditableSection>

        <EditableSection 
          title="Academic Records"
          isEditing={editingSection === 'academics'}
          onEdit={() => handleEdit('academics')}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        >
          {editingSection === 'academics' ? (
            <>
              <Input 
                label="Institution" 
                value={formData.academics?.[0]?.institution || ''} 
                onChange={(e) => setFormData({ ...formData, academics: [{ ...formData.academics?.[0], institution: e.target.value }] })} 
              />
              <Input 
                label="Degree" 
                value={formData.academics?.[0]?.degree || ''} 
                onChange={(e) => setFormData({ ...formData, academics: [{ ...formData.academics?.[0], degree: e.target.value }] })} 
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <Input 
                  label="GPA" 
                  type="number"
                  step="0.01"
                  value={formData.academics?.[0]?.gpa || ''} 
                  onChange={(e) => setFormData({ ...formData, academics: [{ ...formData.academics?.[0], gpa: parseFloat(e.target.value) }] })} 
                />
                <Input 
                  label="Graduation Year" 
                  type="number"
                  value={formData.academics?.[0]?.graduationYear || ''} 
                  onChange={(e) => setFormData({ ...formData, academics: [{ ...formData.academics?.[0], graduationYear: parseInt(e.target.value) }] })} 
                />
              </div>
            </>
          ) : (
            <div>
              {profile.academics.map((acc, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)', marginBottom: i !== profile.academics.length - 1 ? 'var(--space-lg)' : 0 }}>
                  <div className={styles.field}>
                    <span className={styles.label}>Institution</span>
                    <span className={styles.value}>{acc.institution}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Degree</span>
                    <span className={styles.value}>{acc.degree}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>GPA</span>
                    <span className={styles.value}>{acc.gpa}</span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Graduation Year</span>
                    <span className={styles.value}>{acc.graduationYear}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </EditableSection>
      </DashboardSection>
    </div>
  );
};

export default ProfilePage;
