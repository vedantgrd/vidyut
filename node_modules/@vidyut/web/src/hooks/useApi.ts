import{useState,useEffect,useCallback}from'react'
export function useApi<T>(fn:()=>Promise<T>,deps:unknown[]=[],options:{immediate?:boolean;initialData?:T}={}){
  const{immediate=true,initialData}=options
  const[data,setData]=useState<T|undefined>(initialData)
  const[isLoading,setIsLoading]=useState(immediate)
  const[error,setError]=useState<string|null>(null)
  const execute=useCallback(async()=>{
    setIsLoading(true);setError(null)
    try{const result=await fn();setData(result);return result}
    catch(e:unknown){const msg=e instanceof Error?e.message:'An error occurred';setError(msg);throw e}
    finally{setIsLoading(false)}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },deps)
  useEffect(()=>{if(immediate)execute()},[execute]) // eslint-disable-line
  return{data,isLoading,error,refetch:execute,setData}
}
