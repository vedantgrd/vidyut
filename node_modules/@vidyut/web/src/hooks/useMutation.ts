import{useState}from'react'
export function useMutation<TData,TVariables=void>(fn:(variables:TVariables)=>Promise<TData>){
  const[isLoading,setIsLoading]=useState(false)
  const[error,setError]=useState<string|null>(null)
  const mutate=async(variables:TVariables):Promise<TData>=>{
    setIsLoading(true);setError(null)
    try{return await fn(variables)}
    catch(e:unknown){const msg=e instanceof Error?e.message:'An error occurred';setError(msg);throw e}
    finally{setIsLoading(false)}
  }
  return{mutate,isLoading,error}
}
