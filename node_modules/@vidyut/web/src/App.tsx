import{useEffect}from'react'
import{BrowserRouter,Routes,Route,Navigate,useLocation}from'react-router-dom'
import{useAuthStore}from'@/store/authStore'
import{useNotificationStore}from'@/store/notificationStore'
import{ToastContainer}from'@/components/ui/Toast'
import{PageSpinner}from'@/components/ui/Spinner'
import{PublicLayout}from'@/components/layout/PublicLayout'
import{OnboardingLayout}from'@/components/layout/OnboardingLayout'
import{StudentLayout}from'@/components/layout/StudentLayout'
import{AdminLayout}from'@/components/layout/AdminLayout'
import{LoginPage}from'@/pages/public/LoginPage'
import{SignupPage}from'@/pages/public/SignupPage'
import{ForgotPasswordPage}from'@/pages/public/ForgotPasswordPage'
import{VerifyEmailPage}from'@/pages/public/VerifyEmailPage'
import{LandingPage}from'@/pages/public/LandingPage'
import{PersonalInfoPage}from'@/pages/onboarding/PersonalInfoPage'
import{AcademicPage}from'@/pages/onboarding/AcademicPage'
import{FamilyInfoPage}from'@/pages/onboarding/FamilyInfoPage'
import{DocumentsPage as OnboardingDocumentsPage}from'@/pages/onboarding/DocumentsPage'
import{DashboardPage}from'@/pages/dashboard/DashboardPage'
import{ScholarshipsPage}from'@/pages/dashboard/ScholarshipsPage'
import{ScholarshipDetailPage}from'@/pages/dashboard/ScholarshipDetailPage'
import{ApplicationsPage}from'@/pages/dashboard/ApplicationsPage'
import{ApplicationDetailPage}from'@/pages/dashboard/ApplicationDetailPage'
import{ProfilePage}from'@/pages/dashboard/ProfilePage'
import{DocumentsPage}from'@/pages/dashboard/DocumentsPage'
import{NotificationsPage}from'@/pages/dashboard/NotificationsPage'
import{SettingsPage}from'@/pages/dashboard/SettingsPage'
import{AdminDashboardPage}from'@/pages/admin/AdminDashboardPage'
import{AdminScholarshipsPage}from'@/pages/admin/AdminScholarshipsPage'
import{AdminScholarshipFormPage}from'@/pages/admin/AdminScholarshipFormPage'
import{AdminApplicationsPage}from'@/pages/admin/AdminApplicationsPage'
import{AdminApplicationReviewPage}from'@/pages/admin/AdminApplicationReviewPage'
import{AdminDocumentsPage}from'@/pages/admin/AdminDocumentsPage'
import{AdminUsersPage}from'@/pages/admin/AdminUsersPage'
function RequireAuth({children}:{children:React.ReactNode}){
  const{user,isInitialized}=useAuthStore();const location=useLocation()
  if(!isInitialized)return<PageSpinner/>
  if(!user)return<Navigate to="/login" state={{from:location}} replace/>
  return<>{children}</>
}
function RequireOnboarding({children}:{children:React.ReactNode}){
  const{user,isInitialized}=useAuthStore();const location=useLocation()
  if(!isInitialized)return<PageSpinner/>
  if(!user)return<Navigate to="/login" state={{from:location}} replace/>
  if(!user.onboardingComplete){const steps=['personal','academic','family','documents'];const path=steps[Math.max(0,user.onboardingStep-1)]??'personal';return<Navigate to={`/onboarding/${path}`} replace/>}
  return<>{children}</>
}
function RequireAdmin({children}:{children:React.ReactNode}){
  const{user,isInitialized}=useAuthStore();const location=useLocation()
  if(!isInitialized)return<PageSpinner/>
  if(!user)return<Navigate to="/login" state={{from:location}} replace/>
  if(user.role!=='ADMIN'&&user.role!=='REVIEWER')return<Navigate to="/dashboard" replace/>
  return<>{children}</>
}
function RedirectIfAuth({children}:{children:React.ReactNode}){
  const{user,isInitialized}=useAuthStore()
  if(!isInitialized)return<PageSpinner/>
  if(user){
    if(user.role==='ADMIN'||user.role==='REVIEWER')return<Navigate to="/admin" replace/>
    if(!user.onboardingComplete){const steps=['personal','academic','family','documents'];const path=steps[Math.max(0,user.onboardingStep-1)]??'personal';return<Navigate to={`/onboarding/${path}`} replace/>}
    return<Navigate to="/dashboard" replace/>
  }
  return<>{children}</>
}
function AppBootstrap(){
  const{refreshSession,isInitialized}=useAuthStore(),{fetchUnreadCount}=useNotificationStore(),user=useAuthStore(s=>s.user)
  useEffect(()=>{refreshSession()},[refreshSession])
  useEffect(()=>{if(user&&user.role==='STUDENT'){fetchUnreadCount();const interval=setInterval(fetchUnreadCount,60000);return()=>clearInterval(interval)}},[user,fetchUnreadCount])
  if(!isInitialized)return<PageSpinner/>
  return<Routes>
    <Route element={<RedirectIfAuth><PublicLayout/></RedirectIfAuth>}>
      <Route path="/" element={<LandingPage/>}/>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/signup" element={<SignupPage/>}/>
      <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
    </Route>
    <Route path="/verify-email" element={<VerifyEmailPage/>}/>
    <Route path="/onboarding" element={<RequireAuth><OnboardingLayout/></RequireAuth>}>
      <Route path="personal" element={<PersonalInfoPage/>}/>
      <Route path="academic" element={<AcademicPage/>}/>
      <Route path="family" element={<FamilyInfoPage/>}/>
      <Route path="documents" element={<OnboardingDocumentsPage/>}/>
    </Route>
    <Route element={<RequireOnboarding><StudentLayout/></RequireOnboarding>}>
      <Route path="/dashboard" element={<DashboardPage/>}/>
      <Route path="/scholarships" element={<ScholarshipsPage/>}/>
      <Route path="/scholarships/:id" element={<ScholarshipDetailPage/>}/>
      <Route path="/applications" element={<ApplicationsPage/>}/>
      <Route path="/applications/:id" element={<ApplicationDetailPage/>}/>
      <Route path="/profile" element={<ProfilePage/>}/>
      <Route path="/documents" element={<DocumentsPage/>}/>
      <Route path="/notifications" element={<NotificationsPage/>}/>
      <Route path="/settings" element={<SettingsPage/>}/>
    </Route>
    <Route path="/admin" element={<RequireAdmin><AdminLayout/></RequireAdmin>}>
      <Route index element={<AdminDashboardPage/>}/>
      <Route path="scholarships" element={<AdminScholarshipsPage/>}/>
      <Route path="scholarships/new" element={<AdminScholarshipFormPage/>}/>
      <Route path="scholarships/:id/edit" element={<AdminScholarshipFormPage/>}/>
      <Route path="applications" element={<AdminApplicationsPage/>}/>
      <Route path="applications/:id" element={<AdminApplicationReviewPage/>}/>
      <Route path="documents" element={<AdminDocumentsPage/>}/>
      <Route path="users" element={<AdminUsersPage/>}/>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>
}
export default function App(){return<BrowserRouter><AppBootstrap/><ToastContainer/></BrowserRouter>}
