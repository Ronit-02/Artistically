import { useMutation } from "@tanstack/react-query";
import { createReport } from "@/lib/api/reports";

export function useReportMutations() {
  return {
    create: useMutation({ mutationFn: createReport }),
  };
}
