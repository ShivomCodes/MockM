import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

/**
 * Interview page header with title and "End Interview" dialog.
 */
export default function InterviewHeader({
  isEndDialogOpen,
  setIsEndDialogOpen,
  onConfirmEnd,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
        Live Interview
      </h1>
      <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-200 hover:bg-red-500/20 sm:w-auto"
          >
            End Interview Early
          </Button>
        </DialogTrigger>
        <DialogContent className="border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 text-slate-900 dark:text-slate-100 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-slate-950 dark:text-white">End interview now?</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 mt-2">
              This will stop the current session and finalize your feedback with
              responses collected so far.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsEndDialogOpen(false)}
              className="border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsEndDialogOpen(false)
                onConfirmEnd()
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Confirm End
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
