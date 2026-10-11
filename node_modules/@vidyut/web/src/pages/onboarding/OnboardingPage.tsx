import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { GlassCard } from '@/components/ui/GlassCard';
import { Stepper } from '@/components/ui/Stepper';
import { Alert } from '@/components/ui/Alert';
import { ApiClient } from '@/api/apiClient';
import { Upload, ChevronRight, ChevronLeft, CheckCircle2, FileText } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Academic' },
  { id: 3, label: 'Family' },
  { id: 4, label: 'Documents' },
  { id: 5, label: 'Confirm' }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { restoreSession } = useAuthStore();
  const navigate = useNavigate();

  // Step 1 Form State (Personal)
  const [personal, setPersonal] = useState({
    dateOfBirth: '',
    gender: 'MALE',
    phone: '',
    religion: '',
    category: 'GENERAL',
    isMinority: false,
    hasDisability: false,
    domicileState: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Step 2 Form State (Academic)
  const [academic10, setAcademic10] = useState({
    institutionName: '',
    boardOrUniversity: '',
    percentage: '',
    passingYear: ''
  });
  const [academic12, setAcademic12] = useState({
    institutionName: '',
    boardOrUniversity: '',
    branch: '',
    percentage: '',
    passingYear: ''
  });
  const [hasUG, setHasUG] = useState(false);
  const [academicUG, setAcademicUG] = useState({
    institutionName: '',
    boardOrUniversity: '',
    courseName: '',
    branch: '',
    percentage: '',
    cgpa: '',
    passingYear: '',
    admissionYear: '',
    currentSemester: '',
    isCurrentlyPursuing: true
  });

  // Step 3 Form State (Family)
  const [family, setFamily] = useState({
    fatherName: '',
    fatherOccupation: '',
    fatherIncome: '',
    motherName: '',
    motherOccupation: '',
    motherIncome: '',
    annualFamilyIncome: '',
    isBPL: false,
    numberOfDependents: '0',
    guardianName: ''
  });

  // Step 4 Form State (Documents)
  const [uploadDocType, setUploadDocType] = useState('AADHAAR');
  const [uploadLabel, setUploadLabel] = useState('My Aadhaar Card');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);

  // Fetch already uploaded documents
  useEffect(() => {
    if (currentStep === 4) {
      fetchDocuments();
    }
  }, [currentStep]);

  const fetchDocuments = async () => {
    try {
      const res = await ApiClient.get<any[]>('/documents');
      setUploadedDocs(res);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', uploadDocType);
      formData.append('label', uploadLabel);

      await ApiClient.post('/documents/upload', formData);
      setSelectedFile(null);
      fetchDocuments();
    } catch (err: any) {
      setError(err.message || 'File upload failed');
    } finally {
      setLoading(false);
    }
  };

  // Next/Back triggers
  const handleNext = async () => {
    setError(null);
    setLoading(true);
    try {
      if (currentStep === 1) {
        // Save Step 1
        await ApiClient.post('/onboarding/personal', personal);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // Save Step 2
        const records = [
          { level: 'CLASS_10', ...academic10, percentage: Number(academic10.percentage), passingYear: Number(academic10.passingYear) },
          { level: 'CLASS_12', ...academic12, percentage: Number(academic12.percentage), passingYear: Number(academic12.passingYear) }
        ];
        if (hasUG) {
          records.push({
            level: 'UNDERGRADUATE',
            ...academicUG,
            percentage: Number(academicUG.percentage || 0),
            cgpa: academicUG.cgpa ? Number(academicUG.cgpa) : 0,
            passingYear: Number(academicUG.passingYear || 0),
            admissionYear: Number(academicUG.admissionYear || 0),
            currentSemester: Number(academicUG.currentSemester || 0),
            isCurrentlyPursuing: !!academicUG.isCurrentlyPursuing
          } as any);
        }
        await ApiClient.post('/onboarding/academic', { records });
        setCurrentStep(3);
      } else if (currentStep === 3) {
        // Save Step 3
        await ApiClient.post('/onboarding/family', {
          ...family,
          fatherIncome: Number(family.fatherIncome || 0),
          motherIncome: Number(family.motherIncome || 0),
          annualFamilyIncome: Number(family.annualFamilyIncome || 0),
          numberOfDependents: Number(family.numberOfDependents || 0)
        });
        setCurrentStep(4);
      } else if (currentStep === 4) {
        // Enforce uploading Aadhaar
        const hasAadhaar = uploadedDocs.some(d => d.type === 'AADHAAR');
        if (!hasAadhaar) {
          throw new Error('Aadhaar Card is mandatory before moving forward.');
        }
        setCurrentStep(5);
      } else if (currentStep === 5) {
        // Finish onboarding!
        await ApiClient.post('/onboarding/complete', {});
        await restoreSession(); // Refresh session state to set onboardingComplete: true
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Saving step details failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard variant="floating" padding="lg" className="border border-[var(--border-strong)]">
      {/* Top Banner Progress */}
      <Stepper steps={STEPS} currentStep={currentStep} className="mb-8" />

      {error && (
        <Alert variant="error" title="Verification Error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* STEP 1: PERSONAL DETAILS */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="border-b border-[var(--border-subtle)] pb-4 select-none">
            <h2 className="text-xl font-bold text-white">Personal Information</h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Please provide correct details matching your government credentials.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contact Number"
              placeholder="e.g. 9876543210"
              value={personal.phone}
              onChange={e => setPersonal({ ...personal, phone: e.target.value })}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={personal.dateOfBirth}
              onChange={e => setPersonal({ ...personal, dateOfBirth: e.target.value })}
            />
            <Select
              label="Gender"
              value={personal.gender}
              onChange={e => setPersonal({ ...personal, gender: e.target.value })}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer Not To Say</option>
            </Select>
            <Select
              label="Category"
              value={personal.category}
              onChange={e => setPersonal({ ...personal, category: e.target.value })}
            >
              <option value="GENERAL">General</option>
              <option value="OBC">OBC (Other Backward Classes)</option>
              <option value="SC">SC (Scheduled Caste)</option>
              <option value="ST">ST (Scheduled Tribe)</option>
              <option value="EWS">EWS (Economically Weaker Section)</option>
            </Select>
            <Input
              label="Religion"
              placeholder="e.g. Hindu, Muslim, Christian"
              value={personal.religion}
              onChange={e => setPersonal({ ...personal, religion: e.target.value })}
            />
            <Input
              label="Domicile State"
              placeholder="e.g. Maharashtra, Karnataka"
              value={personal.domicileState}
              onChange={e => setPersonal({ ...personal, domicileState: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-[var(--border-subtle)]">
            <Input
              label="Address Line 1"
              placeholder="House, Flat No, Street, Colony"
              value={personal.addressLine1}
              onChange={e => setPersonal({ ...personal, addressLine1: e.target.value })}
            />
            <Input
              label="Address Line 2 (Optional)"
              placeholder="Locality, Area landmark"
              value={personal.addressLine2}
              onChange={e => setPersonal({ ...personal, addressLine2: e.target.value })}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                placeholder="e.g. Pune"
                value={personal.city}
                onChange={e => setPersonal({ ...personal, city: e.target.value })}
              />
              <Input
                label="State"
                placeholder="e.g. Maharashtra"
                value={personal.state}
                onChange={e => setPersonal({ ...personal, state: e.target.value })}
              />
              <Input
                label="Pincode"
                placeholder="e.g. 411001"
                value={personal.pincode}
                onChange={e => setPersonal({ ...personal, pincode: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2 select-none">
            <Checkbox
              label="I belong to a religious or linguistic minority community"
              checked={personal.isMinority}
              onChange={e => setPersonal({ ...personal, isMinority: e.target.checked })}
            />
            <Checkbox
              label="I am specially-abled (Person with Disability - PwD)"
              checked={personal.hasDisability}
              onChange={e => setPersonal({ ...personal, hasDisability: e.target.checked })}
            />
          </div>
        </div>
      )}

      {/* STEP 2: ACADEMIC DETAILS */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="border-b border-[var(--border-subtle)] pb-4 select-none">
            <h2 className="text-xl font-bold text-white">Academic Details</h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Provide correct marks. Transcripts will be checked by reviewers.</p>
          </div>

          {/* CLASS 10 */}
          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-3)]/30 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider select-none">Class 10 (Secondary)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="School Name"
                placeholder="e.g. Model High School"
                value={academic10.institutionName}
                onChange={e => setAcademic10({ ...academic10, institutionName: e.target.value })}
              />
              <Input
                label="Board"
                placeholder="e.g. CBSE, ICSE, Maharashtra State Board"
                value={academic10.boardOrUniversity}
                onChange={e => setAcademic10({ ...academic10, boardOrUniversity: e.target.value })}
              />
              <Input
                label="Percentage (%)"
                placeholder="e.g. 91.5"
                type="number"
                value={academic10.percentage}
                onChange={e => setAcademic10({ ...academic10, percentage: e.target.value })}
              />
              <Input
                label="Passing Year"
                placeholder="e.g. 2020"
                type="number"
                value={academic10.passingYear}
                onChange={e => setAcademic10({ ...academic10, passingYear: e.target.value })}
              />
            </div>
          </div>

          {/* CLASS 12 */}
          <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-3)]/30 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider select-none">Class 12 (Higher Secondary)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Junior College Name"
                placeholder="e.g. St. Xavier's College"
                value={academic12.institutionName}
                onChange={e => setAcademic12({ ...academic12, institutionName: e.target.value })}
              />
              <Input
                label="Board"
                placeholder="e.g. CBSE, State Board"
                value={academic12.boardOrUniversity}
                onChange={e => setAcademic12({ ...academic12, boardOrUniversity: e.target.value })}
              />
              <Input
                label="Stream / Branch"
                placeholder="e.g. Science, Commerce, Arts"
                value={academic12.branch}
                onChange={e => setAcademic12({ ...academic12, branch: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Percentage (%)"
                  placeholder="e.g. 84.2"
                  type="number"
                  value={academic12.percentage}
                  onChange={e => setAcademic12({ ...academic12, percentage: e.target.value })}
                />
                <Input
                  label="Passing Year"
                  placeholder="e.g. 2022"
                  type="number"
                  value={academic12.passingYear}
                  onChange={e => setAcademic12({ ...academic12, passingYear: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* UNDERGRADUATE OPTIONAL */}
          <div className="select-none py-1">
            <Checkbox
              label="I am currently pursuing an Undergraduate or higher degree"
              checked={hasUG}
              onChange={e => setHasUG(e.target.checked)}
            />
          </div>

          {hasUG && (
            <div className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)]/30 space-y-4">
              <h3 className="text-sm font-bold text-[var(--interactive-primary)] uppercase tracking-wider select-none">Undergraduate / College Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Institution Name"
                  placeholder="e.g. Pune Institute of Computer Technology"
                  value={academicUG.institutionName}
                  onChange={e => setAcademicUG({ ...academicUG, institutionName: e.target.value })}
                />
                <Input
                  label="University Name"
                  placeholder="e.g. SPPU"
                  value={academicUG.boardOrUniversity}
                  onChange={e => setAcademicUG({ ...academicUG, boardOrUniversity: e.target.value })}
                />
                <Input
                  label="Course Title"
                  placeholder="e.g. Bachelor of Engineering"
                  value={academicUG.courseName}
                  onChange={e => setAcademicUG({ ...academicUG, courseName: e.target.value })}
                />
                <Input
                  label="Specialization / Branch"
                  placeholder="e.g. Computer Science"
                  value={academicUG.branch}
                  onChange={e => setAcademicUG({ ...academicUG, branch: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Current CGPA"
                    placeholder="e.g. 8.4"
                    type="number"
                    value={academicUG.cgpa}
                    onChange={e => setAcademicUG({ ...academicUG, cgpa: e.target.value })}
                  />
                  <Input
                    label="Passing Year (Expected)"
                    placeholder="e.g. 2026"
                    type="number"
                    value={academicUG.passingYear}
                    onChange={e => setAcademicUG({ ...academicUG, passingYear: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Admission Year"
                    placeholder="e.g. 2022"
                    type="number"
                    value={academicUG.admissionYear}
                    onChange={e => setAcademicUG({ ...academicUG, admissionYear: e.target.value })}
                  />
                  <Input
                    label="Current Semester"
                    placeholder="e.g. 5"
                    type="number"
                    value={academicUG.currentSemester}
                    onChange={e => setAcademicUG({ ...academicUG, currentSemester: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: FAMILY & INCOME */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="border-b border-[var(--border-subtle)] pb-4 select-none">
            <h2 className="text-xl font-bold text-white">Family & Income</h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Household income must match your uploaded Income Certificate.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Father's Full Name"
              placeholder="e.g. Rajesh Sharma"
              value={family.fatherName}
              onChange={e => setFamily({ ...family, fatherName: e.target.value })}
            />
            <Input
              label="Father's Occupation"
              placeholder="e.g. Farmer, Shopkeeper, Teacher"
              value={family.fatherOccupation}
              onChange={e => setFamily({ ...family, fatherOccupation: e.target.value })}
            />
            <Input
              label="Father's Annual Income (₹)"
              placeholder="e.g. 180000"
              type="number"
              value={family.fatherIncome}
              onChange={e => setFamily({ ...family, fatherIncome: e.target.value })}
            />
            <Input
              label="Mother's Full Name"
              placeholder="e.g. Suman Sharma"
              value={family.motherName}
              onChange={e => setFamily({ ...family, motherName: e.target.value })}
            />
            <Input
              label="Mother's Occupation"
              placeholder="e.g. Homemaker"
              value={family.motherOccupation}
              onChange={e => setFamily({ ...family, motherOccupation: e.target.value })}
            />
            <Input
              label="Mother's Annual Income (₹)"
              placeholder="e.g. 0"
              type="number"
              value={family.motherIncome}
              onChange={e => setFamily({ ...family, motherIncome: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-subtle)]">
            <Input
              label="Total Annual Household Income (₹)"
              placeholder="e.g. 180000"
              type="number"
              value={family.annualFamilyIncome}
              onChange={e => setFamily({ ...family, annualFamilyIncome: e.target.value })}
            />
            <Input
              label="Number of Dependents"
              placeholder="e.g. 2"
              type="number"
              value={family.numberOfDependents}
              onChange={e => setFamily({ ...family, numberOfDependents: e.target.value })}
            />
          </div>

          <div className="select-none flex gap-4 pt-2">
            <Checkbox
              label="Our household is classified as BPL (Below Poverty Line)"
              checked={family.isBPL}
              onChange={e => setFamily({ ...family, isBPL: e.target.checked })}
            />
          </div>
        </div>
      )}

      {/* STEP 4: DOCUMENT UPLOAD */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="border-b border-[var(--border-subtle)] pb-4 select-none">
            <h2 className="text-xl font-bold text-white">Document Upload (Vault)</h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Upload verified files once, and reuse them across all applications.</p>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleFileUpload} className="p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)]/30 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Document Type"
              value={uploadDocType}
              onChange={e => {
                setUploadDocType(e.target.value);
                const labels: Record<string, string> = {
                  AADHAAR: 'My Aadhaar Card',
                  INCOME_CERTIFICATE: 'Family Income Certificate',
                  CASTE_CERTIFICATE: 'My Caste Certificate',
                  DOMICILE_CERTIFICATE: 'Domicile Certificate',
                  TENTH_MARKSHEET: 'Class 10 Marksheet',
                  TWELFTH_MARKSHEET: 'Class 12 Marksheet',
                  DEGREE_CERTIFICATE: 'Degree Marksheet',
                  BANK_PASSBOOK: 'Bank Passbook Copy',
                  PHOTOGRAPH: 'Passport Photo',
                  BONAFIDE_CERTIFICATE: 'College Bonafide Certificate'
                };
                setUploadLabel(labels[e.target.value] || 'Document Attachment');
              }}
            >
              <option value="AADHAAR">Aadhaar Card (Mandatory)</option>
              <option value="INCOME_CERTIFICATE">Income Certificate</option>
              <option value="CASTE_CERTIFICATE">Caste Certificate</option>
              <option value="DOMICILE_CERTIFICATE">Domicile Certificate</option>
              <option value="TENTH_MARKSHEET">Class 10 Marksheet</option>
              <option value="TWELFTH_MARKSHEET">Class 12 Marksheet</option>
              <option value="DEGREE_CERTIFICATE">Degree Marksheet</option>
              <option value="BANK_PASSBOOK">Bank Passbook Copy</option>
              <option value="PHOTOGRAPH">Passport Photo</option>
              <option value="BONAFIDE_CERTIFICATE">College Bonafide Certificate</option>
            </Select>

            <Input
              label="Document Label / Title"
              placeholder="e.g. My Aadhaar Card"
              value={uploadLabel}
              onChange={e => setUploadLabel(e.target.value)}
            />

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide select-none mb-2">Select File (PDF, PNG, JPG under 5MB)</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="doc-file"
                  className="hidden"
                  onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                />
                <label
                  htmlFor="doc-file"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-white cursor-pointer hover:border-[var(--interactive-primary)] transition-all font-semibold text-sm shrink-0"
                >
                  <Upload className="w-4 h-4" />
                  {selectedFile ? 'Change File' : 'Browse File'}
                </label>
                <span className="text-xs text-[var(--text-tertiary)] truncate">
                  {selectedFile ? `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)` : 'No file selected'}
                </span>
              </div>
            </div>

            <div className="md:col-span-2 pt-2 flex justify-end select-none">
              <Button type="submit" disabled={!selectedFile || loading} isLoading={loading}>
                Upload to Vault
              </Button>
            </div>
          </form>

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider select-none">Uploaded Documents</h3>
            {uploadedDocs.length === 0 ? (
              <div className="p-8 border border-dashed border-[var(--border-strong)] rounded-xl text-center text-sm text-[var(--text-tertiary)]">
                No documents uploaded yet. You must upload your Aadhaar Card to proceed.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {uploadedDocs.map((doc) => (
                  <div key={doc.id} className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[var(--interactive-primary)] shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide select-none">{doc.type}</span>
                        <h4 className="text-sm font-bold text-white truncate">{doc.label}</h4>
                      </div>
                    </div>
                    <div>
                      {doc.status === 'VERIFIED' ? (
                        <span className="text-xs font-semibold bg-[rgba(16,185,129,0.1)] text-[var(--status-success)] px-2 py-0.5 rounded-full border border-[rgba(16,185,129,0.2)]">Verified</span>
                      ) : doc.status === 'REJECTED' ? (
                        <span className="text-xs font-semibold bg-[rgba(239,68,68,0.1)] text-[var(--status-error)] px-2 py-0.5 rounded-full border border-[rgba(239,68,68,0.2)]">Rejected</span>
                      ) : (
                        <span className="text-xs font-semibold bg-[rgba(245,158,11,0.1)] text-[var(--status-warning)] px-2 py-0.5 rounded-full border border-[rgba(245,158,11,0.2)]">Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 5: ONBOARDING COMPLETE CONFIRM */}
      {currentStep === 5 && (
        <div className="space-y-6 text-center select-none py-4">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-[var(--status-success)] animate-bounce" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Onboarding Complete!</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-sm mx-auto">
              Your profile is verified. Our automated eligibility engine will list scholarships you qualify for immediately.
            </p>
          </div>
          <Alert variant="info" title="Important Information" className="max-w-md mx-auto text-left">
            Your documents are currently in **PENDING** status. You can apply for scholarships immediately, but reviewers will inspect your uploaded credentials before granting approval.
          </Alert>
        </div>
      )}

      {/* Footer Navigation Buttons */}
      <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between select-none">
        <Button
          variant="secondary"
          disabled={currentStep === 1 || loading}
          onClick={() => setCurrentStep(currentStep - 1)}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <Button
          variant={currentStep === 5 ? 'magic' : 'primary'}
          onClick={handleNext}
          isLoading={loading}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          {currentStep === 5 ? 'Enter Dashboard' : 'Next Step'}
        </Button>
      </div>
    </GlassCard>
  );
}
