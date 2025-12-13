import { SiteHeader } from "@/components/site-header"
import { LuckyDraw } from "@/components/lucky-draw"

export default function Page() {
  return (
    <div className="[--header-height:calc(--spacing(14))] h-full">
      <LuckyDraw />
    </div>
  )
}
