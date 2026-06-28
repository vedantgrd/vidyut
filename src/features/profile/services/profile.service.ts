import type { UserProfileData } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_PROFILE: UserProfileData = {
  id: 'usr_1',
  fullName: 'Vidyut Student',
  email: 'student@vidyut.in',
  phone: '+91 98765 43210',
  location: 'Mumbai, Maharashtra',
  bio: 'A passionate computer science student dedicated to leveraging AI for social good.',
  academics: [
    {
      institution: 'Indian Institute of Technology',
      degree: 'B.Tech Computer Science',
      gpa: 3.8,
      graduationYear: 2026
    }
  ],
  skills: ['React', 'Python', 'Machine Learning', 'Public Speaking']
};

export const profileService = {
  async fetchProfile(): Promise<UserProfileData> {
    await delay(800);
    return MOCK_PROFILE;
  },

  async updateProfile(data: Partial<UserProfileData>): Promise<UserProfileData> {
    await delay(600);
    return { ...MOCK_PROFILE, ...data };
  }
};
