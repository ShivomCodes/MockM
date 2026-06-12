import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Reusable stats grid used by Dashboard and Profile pages.
 *
 * @param {{ stats: object, isLoading: boolean, items: Array<{ label, value, subtitle? }> }} props
 */
export default function StatsGrid({ items, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full bg-slate-100 dark:bg-white/10" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
          <CardHeader className="p-4 pb-1 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-300 sm:text-sm">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
              {item.value}
            </p>
            {item.subtitle ? (
              <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
