import{create}from'zustand'
import type{User}from'@/types'
import{api,setAccessToken}from'@/api/client'
interface AuthState{user:User|null;accessToken:string|null;isLoading:boolean;isInitialized:boolean;login:(email:string,password:string)=>Promise<void>;signup:(fullName:string,email:string,password:string,confirmPassword:string)=>Promise<void>;logout:()=>Promise<void>;refreshSession:()=>Promise<boolean>;updateUser:(user:Partial<User>)=>void}
export const useAuthStore=create<AuthState>((set)=>({
  user:null,accessToken:null,isLoading:false,isInitialized:false,
  login:async(email,password)=>{
    set({isLoading:true})
    try{const data=await api.post<{user:User;accessToken:string}>('/auth/login',{email,password});setAccessToken(data.accessToken);set({user:data.user,accessToken:data.accessToken,isLoading:false})}
    catch(e){set({isLoading:false});throw e}
  },
  signup:async(fullName,email,password,confirmPassword)=>{
    set({isLoading:true})
    try{const data=await api.post<{user:User;accessToken:string}>('/auth/signup',{fullName,email,password,confirmPassword});setAccessToken(data.accessToken);set({user:data.user,accessToken:data.accessToken,isLoading:false})}
    catch(e){set({isLoading:false});throw e}
  },
  logout:async()=>{await api.post('/auth/logout').catch(()=>{});setAccessToken(null);set({user:null,accessToken:null})},
  refreshSession:async()=>{
    try{const data=await api.post<{user:User;accessToken:string}>('/auth/refresh');setAccessToken(data.accessToken);set({user:data.user,accessToken:data.accessToken,isInitialized:true});return true}
    catch{setAccessToken(null);set({user:null,accessToken:null,isInitialized:true});return false}
  },
  updateUser:(updates)=>set((s)=>({user:s.user?{...s.user,...updates}:null})),
}))
