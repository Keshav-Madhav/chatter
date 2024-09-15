import { useMutation } from "convex/react"
import { useCallback, useState } from "react"

type MutationState = 'idle' | 'loading' | 'success' | 'error'

const useMutationHandler = <T, P>(mutation: any) => {
  const [state, setState] = useState<MutationState>("idle")

  const mutationFn = useMutation(mutation)

  const mutate = useCallback(async (payload: P): Promise<T | null> => {
    setState("loading");

    try {
      const result = await mutationFn(payload);
      setState("success");
      return result;
    } catch (error) {
      setState("error");
      console.error("Mutation Error",error);
      throw error;
    } finally{
      setState("idle")
    }
  }, [])

  return {
    mutate,
    state
  } 
}
export default useMutationHandler