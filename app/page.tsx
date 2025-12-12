import { SiteHeader } from "@/components/site-header"
import { LuckyDraw } from "@/components/lucky-draw"

export default function Page() {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <div className="flex flex-col min-h-screen">
        <LuckyDraw />
        </div>
    </div>
  )
}
