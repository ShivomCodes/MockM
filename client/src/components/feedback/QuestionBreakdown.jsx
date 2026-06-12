import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { outOfTenBadge } from "@/utils/format"

/**
 * Per-question feedback breakdown with expandable ideal answers.
 */
export default function QuestionBreakdown({ questionFeedback }) {
  if (!questionFeedback || questionFeedback.length === 0) {
    return (
      <Card className="border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900 dark:text-white">
            Per-question breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            No question-level feedback yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900 dark:text-white">
          Per-question breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {questionFeedback.map((item, index) => (
          <div
            key={`${item?.question}-${index}`}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/40"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <p className="font-semibold text-slate-900 dark:text-white">
                {item?.question || "Question"}
              </p>
              <Badge className={outOfTenBadge(Number(item?.score || 0))}>
                {Number(item?.score || 0)}/10
              </Badge>
            </div>
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-200">
              {item?.feedback || "No feedback provided."}
            </p>
            <Accordion type="single" collapsible>
              <AccordionItem value={`ideal-${index}`}>
                <AccordionTrigger className="text-slate-700 dark:text-slate-200">
                  View ideal answer
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 dark:text-slate-300">
                  {item?.idealAnswer || "No ideal answer provided."}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
