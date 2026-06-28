export interface AcademicRecord {
  institution: string;
  degree: string;
  gpa: number;
  graduationYear: number;
}

export interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  academics: AcademicRecord[];
  skills: string[];
}
