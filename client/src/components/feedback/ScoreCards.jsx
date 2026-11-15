import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

/**
 * Score cards for Communication, Technical, and Confidence.
 */
export default function ScoreCards({ feedback }) {
  const cards = [
    { label: "Communication Score", value: feedback?.communicationScore ?? 0 },
    { label: "Technical Score", value: feedback?.technicalScore ?? 0 },
    { label: "Confidence Score", value: feedback?.confidenceScore ?? 0 },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label} className="border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-900 dark:text-white">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
              {card.value}
            </p>
            <Progress value={card.value} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
