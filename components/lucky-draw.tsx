"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import type { JSX } from "react"
import Image from "next/image"
import * as XLSX from "xlsx"
// Removed framer-motion import - using direct CSS transforms for smoother animation
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Trash2, Download, Sparkles, Users, Trophy, Settings, 
  RotateCcw, FileText, FileSpreadsheet, File, FileImage,
  ChevronDown, ChevronUp, Upload, List, Search, ChevronLeft, ChevronRight, Inbox, Gift, Edit2, ChevronsLeft, ChevronsRight, ArrowDown, Plus, Minus, X, Disc3
} from "lucide-react"
import Confetti from "react-confetti"
// @ts-ignore - canvas-confetti doesn't have type definitions
import confetti from "canvas-confetti"
import { SettingsPanel } from "@/components/settings"
import { SiteHeader } from "@/components/site-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "react-toastify"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useSound } from "@/hooks/use-sound"

interface Entry {
  id: string
  name: string
  createdAt: string
  _count?: {
    winners: number
  }
}

interface Winner {
  id: string
  position: number
  entry: Entry
  prizeId?: string
  prize?: Prize
  status?: string // "present" or "not_present"
}

interface Draw {
  id: string
  numWinners: number
  seed: string | null
  createdAt: string
  winners: Winner[]
}

type View = "main" | "entries" | "prizes" | "settings" | "results"

interface Prize {
  id: string
  name: string
  description: string | null
  value: number | null
  position: number | null
  imageUrl: string | null
  createdAt: string
  _count?: {
    winners: number
  }
}

// Entries Table Component
function EntriesTable({ entries, onDelete, onEdit }: { entries: Entry[]; onDelete: (id: string, name: string) => void; onEdit: (id: string, name: string) => void }) {
  // Hooks must be called before any conditional returns
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize])

  const totalPages = Math.ceil(entries.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedEntries = entries.slice(startIndex, startIndex + pageSize)

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="size-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No entries found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
        {paginatedEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3 hover:bg-blue-100 transition-colors"
          >
            <span className="flex-1 text-sm font-medium">{entry.name}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(entry.id, entry.name)}
                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1"
                title="Edit entry"
              >
                <Edit2 className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(entry.id, entry.name)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                title="Delete entry"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="entries-rows-per-page" className="text-xs text-muted-foreground">
            Rows:
          </Label>
          <select
            id="entries-rows-per-page"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="px-1.5 py-0.5 border rounded text-xs bg-background h-6"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">
            {currentPage}/{totalPages}
          </span>
          <div className="flex items-center gap-0.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              title="First page"
              className="h-6 w-6 p-0"
            >
              <ChevronsLeft className="size-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              title="Previous page"
              className="h-6 w-6 p-0"
            >
              <ChevronLeft className="size-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              title="Next page"
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="size-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              title="Last page"
              className="h-6 w-6 p-0"
            >
              <ChevronsRight className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Prizes Table Component
function PrizesTable({
  prizes,
  onEdit,
  onDelete,
}: {
  prizes: Prize[]
  onEdit: (prize: Prize) => void
  onDelete: (id: string, name: string) => void
}) {
  // Hooks must be called before any conditional returns
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize])

  // Color palette for prize circles
  const prizeColors = [
    "bg-blue-500",
    "bg-indigo-600",
    "bg-green-500",
    "bg-orange-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-teal-500",
    "bg-cyan-500",
  ]

  const getPrizeColor = (index: number) => {
    return prizeColors[index % prizeColors.length]
  }

  const totalPages = Math.ceil(prizes.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedPrizes = prizes.slice(startIndex, startIndex + pageSize)

  if (prizes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Gift className="size-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No prizes found</p>
      </div>
    )
  }

  if (prizes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Gift className="size-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No prizes found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
        {paginatedPrizes.map((prize, index) => {
          const originalIndex = startIndex + index
          return (
            <div
              key={prize.id}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3 hover:bg-yellow-100 transition-colors"
            >
              <div className={`${getPrizeColor(originalIndex)} rounded-full size-4 shrink-0`} />
              <span className="flex-1 text-sm font-medium">{prize.name}</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(prize)}
                  className="text-orange-500 hover:text-orange-700 hover:bg-orange-50 p-1"
                  title="Edit prize"
                >
                  <Edit2 className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(prize.id, prize.name)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                  title="Delete prize"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="prizes-rows-per-page" className="text-xs text-muted-foreground">
              Rows:
            </Label>
            <select
              id="prizes-rows-per-page"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="px-1.5 py-0.5 border rounded text-xs bg-background h-6"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              {currentPage}/{totalPages}
            </span>
            <div className="flex items-center gap-0.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="First page"
                className="h-6 w-6 p-0"
              >
                <ChevronsLeft className="size-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Previous page"
                className="h-6 w-6 p-0"
              >
                <ChevronLeft className="size-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                title="Next page"
                className="h-6 w-6 p-0"
              >
                <ChevronRight className="size-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                title="Last page"
                className="h-6 w-6 p-0"
              >
                <ChevronsRight className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function LuckyDraw() {
  const { startSpinningSound, stopSpinningSound, updateSpinSpeed, checkEntryPassed, playModalMusic, stopModalMusic } = useSound()
  const [currentView, setCurrentView] = useState<View>("main")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [entries, setEntries] = useState<Entry[]>([])
  const [draws, setDraws] = useState<Draw[]>([])
  // Results table state
  const [resultsSearch, setResultsSearch] = useState("")
  const [resultsSortBy, setResultsSortBy] = useState<"time" | "prize">("time")
  const [resultsSortOrder, setResultsSortOrder] = useState<"asc" | "desc">("asc")
  const [resultsPage, setResultsPage] = useState(1)
  const [resultsPageSize, setResultsPageSize] = useState(10)
  const [resultsPrizeFilter, setResultsPrizeFilter] = useState<string>("all")
  const [winnersCardStatus, setWinnersCardStatus] = useState<"present" | "not_present">("present")
  const [winnersCardPage, setWinnersCardPage] = useState(1)
  const [winnersCardPageSize, setWinnersCardPageSize] = useState(10)
  const [prizes, setPrizes] = useState<Prize[]>([])

  // Check fullscreen status
  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    // Check initial state
    checkFullscreen()

    // Listen for fullscreen changes
    document.addEventListener("fullscreenchange", checkFullscreen)
    document.addEventListener("webkitfullscreenchange", checkFullscreen)
    document.addEventListener("mozfullscreenchange", checkFullscreen)
    document.addEventListener("MSFullscreenChange", checkFullscreen)

    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen)
      document.removeEventListener("webkitfullscreenchange", checkFullscreen)
      document.removeEventListener("mozfullscreenchange", checkFullscreen)
      document.removeEventListener("MSFullscreenChange", checkFullscreen)
    }
  }, [])
  const [loading, setLoading] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [lastDraw, setLastDraw] = useState<Draw | null>(null)
  const [settings, setSettings] = useState<any>(null)
  const [entriesCollapsed, setEntriesCollapsed] = useState(false)
  const [prizesCollapsed, setPrizesCollapsed] = useState(false)
  const [shuffledEntries, setShuffledEntries] = useState<Entry[]>([])
  const [animationOffset, setAnimationOffset] = useState(0)
  const [rouletteType, setRouletteType] = useState<"vertical" | "wheel">("vertical")
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [winnerData, setWinnerData] = useState<{ winners: Winner[]; draw: Draw } | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [currentPrizeName, setCurrentPrizeName] = useState<string>("")
  const [remainingWinners, setRemainingWinners] = useState<number>(0)
  const [currentAnimationSpeed, setCurrentAnimationSpeed] = useState(100)
  const [isSpinning, setIsSpinning] = useState(false)
  
  // Track drawing progress for sequential single-winner draws
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0)
  const [currentPrizeWinnerCount, setCurrentPrizeWinnerCount] = useState(0)
  const [allDrawnWinners, setAllDrawnWinners] = useState<Winner[]>([])
  const [isDrawingInProgress, setIsDrawingInProgress] = useState(false)
  
  // Control wrapping during landing
  const disableWrappingRef = useRef(false)
  const isLockedPositionRef = useRef(false)
  const lockedPositionRef = useRef<number | null>(null)
  
  
  // Prize form state
  const [prizeName, setPrizeName] = useState("")
  const [editingPrizeId, setEditingPrizeId] = useState<string | null>(null)
  const [prizeLoading, setPrizeLoading] = useState(false)
  
  // Form state
  const [excludePrevious, setExcludePrevious] = useState(false)
  const [bulkEntries, setBulkEntries] = useState("")
  const [entryMode, setEntryMode] = useState<"bulk" | "import">("bulk")
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, percentage: 0 })
  const [showImportProgress, setShowImportProgress] = useState(false)
  const [prizeAssignments, setPrizeAssignments] = useState<Array<{ prizeId: string; count: number }>>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [showClearAllConfirmDialog, setShowClearAllConfirmDialog] = useState(false)
  const [showDrawSettingsModal, setShowDrawSettingsModal] = useState(false)
  const [showResetDrawConfirmDialog, setShowResetDrawConfirmDialog] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [tempPrizeAssignments, setTempPrizeAssignments] = useState<Array<{ prizeId: string; count: number }>>([])
  const [draggedPrizeIndex, setDraggedPrizeIndex] = useState<number | null>(null)
  const [tempPrizeOrder, setTempPrizeOrder] = useState<string[]>([])
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [revealDelay, setRevealDelay] = useState(3) // seconds
  const [spinTime, setSpinTime] = useState(5) // seconds - animation duration
  const rouletteSpeed = 100 // Fixed speed for idle animation (not configurable)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [pendingEntryCount, setPendingEntryCount] = useState(0)
  const [pendingDeleteEntryId, setPendingDeleteEntryId] = useState<string | null>(null)
  const [pendingDeleteEntryName, setPendingDeleteEntryName] = useState<string>("")
  const [showDeletePrizeConfirmDialog, setShowDeletePrizeConfirmDialog] = useState(false)
  const [pendingDeletePrizeId, setPendingDeletePrizeId] = useState<string | null>(null)
  const [pendingDeletePrizeName, setPendingDeletePrizeName] = useState<string>("")
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editingEntryName, setEditingEntryName] = useState<string>("")
  // Toast notifications using react-toastify

  // Apply settings to document
  useEffect(() => {
    if (settings) {
      document.documentElement.style.setProperty("--primary-color", settings.primaryColor)
      document.documentElement.style.setProperty("--background-color", settings.backgroundColor)
      if (settings.fontFamily) {
        document.body.style.fontFamily = settings.fontFamily
      }
      // Update animation settings when settings change
      if (settings.revealDelay !== undefined) {
        setRevealDelay(settings.revealDelay)
      }
      if (settings.spinTime !== undefined) {
        setSpinTime(settings.spinTime)
      }
    }
  }, [settings])

  // Listen for settings updates from settings panel
  useEffect(() => {
    const handleSettingsUpdate = () => {
      const saved = localStorage.getItem("drawSettings")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setSettings(parsed)
          // Update animation settings immediately
          if (parsed.revealDelay !== undefined) {
            setRevealDelay(parsed.revealDelay)
          }
          if (parsed.spinTime !== undefined) {
            setSpinTime(parsed.spinTime)
          }
        } catch (e) {
          console.error("Error loading updated settings:", e)
        }
      }
    }
    
    window.addEventListener("settingsUpdated", handleSettingsUpdate)
    window.addEventListener("storage", handleSettingsUpdate)
    
    return () => {
      window.removeEventListener("settingsUpdated", handleSettingsUpdate)
      window.removeEventListener("storage", handleSettingsUpdate)
    }
  }, [])

  // Fetch entries
  const fetchEntries = async () => {
    try {
      // Fetch all entries by setting a very high limit
      const res = await fetch("/api/entries?limit=100000")
      const data = await res.json()
      setEntries(data.entries || [])
    } catch (error) {
      console.error("Error fetching entries:", error)
    }
  }

  // Fetch draws
  const fetchDraws = async () => {
    try {
      // Fetch all draws without pagination for results view
      const res = await fetch("/api/draws?limit=10000")
      const data = await res.json()
      setDraws(data.draws || [])
    } catch (error) {
      console.error("Error fetching draws:", error)
    }
  }

  // Export winners by status to Excel or PDF
  const handleExportWinnersByStatus = (status: "present" | "not_present", format: "excel" | "pdf") => {
    try {
      const allWinners = draws.flatMap(draw => 
        draw.winners.map(winner => ({
          ...winner,
          drawId: draw.id,
          drawDate: new Date(draw.createdAt),
        }))
      )
      
      const filteredWinners = allWinners.filter(w => (w.status || 'present') === status)
      
      if (filteredWinners.length === 0) {
        alert(`No ${status === 'present' ? 'present' : 'not present'} winners to export`)
        return
      }

      if (format === "excel") {
        const exportData: any[] = []
        let rowNumber = 1
        
        filteredWinners.forEach((winner) => {
          exportData.push({
            "#": rowNumber++,
            "Winner Name": winner.entry.name,
            "Prize": winner.prize?.name || "N/A",
            "Status": status === 'present' ? 'Present' : 'Not Present',
            "Date & Time": winner.drawDate.toLocaleString(),
          })
        })

        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        
        // Style header row
        const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1')
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: headerRange.s.r, c: col })
          if (!ws[cellAddress]) continue
          
          ws[cellAddress].s = {
            fill: { fgColor: { rgb: "4472C4" } },
            font: { color: { rgb: "FFFFFF" }, bold: true },
            alignment: { horizontal: "left", vertical: "center" }
          }
        }
        
        ws['!cols'] = [
          { wch: 8 },  // #
          { wch: 25 }, // Winner Name
          { wch: 20 }, // Prize
          { wch: 15 }, // Status
          { wch: 25 }  // Date & Time
        ]
        
        XLSX.utils.book_append_sheet(wb, ws, status === 'present' ? 'Present Winners' : 'Not Present Winners')
        const filename = `${status === 'present' ? 'present' : 'not-present'}-winners-${new Date().toISOString().split('T')[0]}.xlsx`
        XLSX.writeFile(wb, filename)
      } else {
        // PDF export using window.print() or a library
        // For now, we'll create a simple HTML table and use browser print
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
          alert("Please allow popups to export PDF")
          return
        }
        
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${status === 'present' ? 'Present' : 'Not Present'} Winners</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background-color: #4472C4; color: white; padding: 10px; text-align: left; }
                td { padding: 8px; border: 1px solid #ddd; }
                tr:nth-child(even) { background-color: #f2f2f2; }
                h1 { color: #333; }
              </style>
            </head>
            <body>
              <h1>${status === 'present' ? 'Present' : 'Not Present'} Winners</h1>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Winner Name</th>
                    <th>Prize</th>
                    <th>Status</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredWinners.map((winner, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${winner.entry.name}</td>
                      <td>${winner.prize?.name || 'N/A'}</td>
                      <td>${status === 'present' ? 'Present' : 'Not Present'}</td>
                      <td>${winner.drawDate.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `
        printWindow.document.write(html)
        printWindow.document.close()
        setTimeout(() => {
          printWindow.print()
        }, 250)
      }
    } catch (error) {
      console.error(`Error exporting ${status} winners:`, error)
      alert(`Failed to export ${status === 'present' ? 'present' : 'not present'} winners`)
    }
  }

  // Export results to Excel
  const handleExportToExcel = () => {
    try {
      // Prepare data for export with incremented numbers
      const exportData: any[] = []
      let rowNumber = 1
      
      draws.forEach((draw) => {
        draw.winners.forEach((winner) => {
          exportData.push({
            "#": rowNumber++,
            "Winner Name": winner.entry.name,
            "Prize": winner.prize?.name || "N/A",
            "Date & Time": new Date(draw.createdAt).toLocaleString(),
          })
        })
      })

      if (exportData.length === 0) {
        alert("No data to export")
        return
      }

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      
      // Style header row (blue background, white text)
      const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1')
      const headerRow = headerRange.s.r // First row (0-indexed)
      
      // Apply styling to header cells
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col })
        if (!ws[cellAddress]) continue
        
        // Set cell style for header
        ws[cellAddress].s = {
          fill: {
            fgColor: { rgb: "4472C4" } // Blue color
          },
          font: {
            color: { rgb: "FFFFFF" }, // White text
            bold: true
          },
          alignment: {
            horizontal: "left",
            vertical: "center"
          }
        }
      }
      
      // Set column widths
      ws['!cols'] = [
        { wch: 8 },  // #
        { wch: 25 }, // Winner Name
        { wch: 20 }, // Prize
        { wch: 25 }  // Date & Time
      ]
      
      XLSX.utils.book_append_sheet(wb, ws, "Winners")

      // Generate filename with current date
      const filename = `draw-results-${new Date().toISOString().split('T')[0]}.xlsx`

      // Write and download
      XLSX.writeFile(wb, filename)
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      alert("Failed to export to Excel")
    }
  }

  // Fetch prizes
  const fetchPrizes = async () => {
    try {
      const res = await fetch("/api/prizes")
      const data = await res.json()
      setPrizes(data.prizes || [])
    } catch (error) {
      console.error("Error fetching prizes:", error)
    }
  }

  // Fetch draw settings from database
  const fetchDrawSettings = async () => {
    try {
      const res = await fetch("/api/draw-settings")
      const data = await res.json()
      if (data.prizeAssignments && Array.isArray(data.prizeAssignments)) {
        // Filter out invalid prize IDs after prizes are loaded
        // This will be cleaned up in useEffect when prizes are available
        setPrizeAssignments(data.prizeAssignments)
      }
    } catch (error) {
      console.error("Error fetching draw settings:", error)
    }
  }

  // Save draw settings to database
  const saveDrawSettings = async (assignments: Array<{ prizeId: string; count: number }>) => {
    try {
      const res = await fetch("/api/draw-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prizeAssignments: assignments,
        }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        console.error("API Error:", errorData)
        throw new Error(errorData.error || "Failed to save draw settings")
      }
    } catch (error) {
      console.error("Error saving draw settings:", error)
      throw error
    }
  }

  useEffect(() => {
    fetchEntries()
    fetchDraws()
    fetchPrizes()
    fetchDrawSettings() // Load draw settings from database
    // Load settings
    const saved = localStorage.getItem("drawSettings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings(parsed)
        // Load animation settings from saved settings
        if (parsed.revealDelay !== undefined) {
          setRevealDelay(parsed.revealDelay)
        }
        if (parsed.spinTime !== undefined) {
          setSpinTime(parsed.spinTime)
        }
      } catch (e) {
        console.error("Error loading settings:", e)
      }
    }
    
    // Set window size for confetti
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Clean up invalid prize IDs from prizeAssignments when prizes change
  useEffect(() => {
    // Skip if no prizes or no assignments
    if (prizes.length === 0 || prizeAssignments.length === 0) {
      // If no prizes but there are assignments, clear them
      if (prizes.length === 0 && prizeAssignments.length > 0) {
        setPrizeAssignments([])
        saveDrawSettings([]).catch(err => console.error("Error saving cleaned assignments:", err))
      }
      return
    }
    
    const validPrizeIds = prizes.length > 0 ? new Set(prizes.map(p => p.id)) : new Set<string>()
    const cleanedAssignments = prizeAssignments.filter(a => 
      a.prizeId && 
      a.prizeId.trim() !== "" && 
      a.count > 0 &&
      validPrizeIds.has(a.prizeId)
    )
    
    // Only update if there were invalid IDs removed
    if (cleanedAssignments.length !== prizeAssignments.length) {
      setPrizeAssignments(cleanedAssignments)
      // Save cleaned assignments to database
      saveDrawSettings(cleanedAssignments).catch(err => console.error("Error saving cleaned assignments:", err))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prizes.length]) // Only run when number of prizes changes

  // Initialize prize state when prize assignments are loaded (on page refresh)
  useEffect(() => {
    // Only initialize if not currently drawing and state is not set
    if (!isDrawingInProgress && prizes.length > 0 && prizeAssignments.length > 0) {
      // Filter valid assignments and sort by prize order (ascending)
      const validPrizeIds = new Set(prizes.map(p => p.id))
      const prizeIndexMap = new Map(prizes.map((p, index) => [p.id, index]))
      
      const filteredAssignments = prizeAssignments
        .filter(a => 
          a.prizeId && 
          a.prizeId.trim() !== "" && 
          a.count > 0 &&
          validPrizeIds.has(a.prizeId)
        )
        .sort((a, b) => {
          const indexA = prizeIndexMap.get(a.prizeId) ?? Infinity
          const indexB = prizeIndexMap.get(b.prizeId) ?? Infinity
          return indexA - indexB // Ascending order
        })
      
      // If we have valid assignments but prize state is not initialized
      if (filteredAssignments.length > 0 && (remainingWinners === 0 || currentPrizeName === "")) {
        // Initialize to first prize (lowest index with count > 0)
        const firstAssignment = filteredAssignments[0]
        const firstPrize = prizes.find(p => p.id === firstAssignment.prizeId)
        
        if (firstPrize) {
          setCurrentPrizeIndex(0)
          setCurrentPrizeWinnerCount(0)
          setRemainingWinners(firstAssignment.count)
          setCurrentPrizeName(firstPrize.name)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prizeAssignments.length, prizes.length]) // Run when prize assignments or prizes change

  // Animation refs - never reset, always continuous
  const animationRef = useRef<number | null>(null)
  const velocityRef = useRef<number>(0)
  const offsetRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const targetSpeedRef = useRef<number>(100)
  const isSpinningRef = useRef<boolean>(false)

  // Update target speed and spinning state
  useEffect(() => {
    targetSpeedRef.current = isSpinning ? currentAnimationSpeed : rouletteSpeed
    isSpinningRef.current = isSpinning
  }, [isSpinning, currentAnimationSpeed, rouletteSpeed])

  // Smooth continuous animation - never restarts
  useEffect(() => {
    if (entries.length === 0) {
      setShuffledEntries([])
      setAnimationOffset(0)
      offsetRef.current = 0
      velocityRef.current = 0
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    // Create extended array for smooth looping - don't shuffle, keep consistent order
    if (rouletteType !== "wheel") {
      // Only update if entries actually changed (by ID comparison)
      const currentIds = entries.map(e => e.id).join(',')
      const existingIds = shuffledEntries.slice(0, entries.length).map(e => e.id).join(',')
      
      if (shuffledEntries.length === 0 || currentIds !== existingIds) {
        const extendedEntries = [...entries, ...entries, ...entries, ...entries]
        setShuffledEntries(extendedEntries)
      }
    }

    // Calculate loop dimensions
    let loopSize: number
    if (rouletteType === "vertical") {
      loopSize = entries.length * 80 // itemHeight(70) + spacing(10)
    } else {
      loopSize = 360 // degrees for wheel
    }

    // Start animation loop only once
    if (!animationRef.current) {
      lastTimeRef.current = performance.now()
      
      const animate = (currentTime: number) => {
        const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1) // Cap deltaTime to prevent large jumps
        lastTimeRef.current = currentTime

        // Always animate - smooth continuous motion
        // Skip if position is locked (after winner is selected)
        if (isLockedPositionRef.current && lockedPositionRef.current !== null) {
          setAnimationOffset(lockedPositionRef.current)
          return
        }
        
        const targetSpeed = targetSpeedRef.current
        const speedDiff = targetSpeed - velocityRef.current
        const acceleration = speedDiff * 5 // Smooth acceleration factor
        velocityRef.current += acceleration * deltaTime

        // Update offset
        if (Math.abs(velocityRef.current) > 0.1 || Math.abs(targetSpeed) > 0.1) {
          offsetRef.current += velocityRef.current * deltaTime
          
          // Only wrap if not in landing phase
          if (!disableWrappingRef.current) {
            // Wrap around for infinite loop smoothly
            while (offsetRef.current >= loopSize) {
              offsetRef.current -= loopSize
            }
            while (offsetRef.current < 0) {
              offsetRef.current += loopSize
            }
          }
          
          setAnimationOffset(offsetRef.current)
          
          // Check if entry passed and play toot sound
          if (isSpinningRef.current) {
            checkEntryPassed(offsetRef.current)
          }
          
          // Update spinning sound speed to sync with continuous animation
          // Only if not in controlled draw animation (isSpinning state handles that)
          if (!isSpinningRef.current && Math.abs(velocityRef.current) > 10) {
            updateSpinSpeed(Math.abs(velocityRef.current))
          }
        }
        
        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      // Keep animation running, just cleanup reference
    }
  }, [entries, rouletteType])

  // Memoize colors array to avoid recreating it
  const verticalColors = useMemo(() => [
    'bg-blue-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-cyan-500',
  ], [])

  // Calculate vertical roulette items (not memoized since animationOffset changes every frame)
  // But we optimize by only calculating visible items
  const getVerticalRouletteItems = () => {
    if (rouletteType !== "vertical" || entries.length === 0) return []
    
    const itemHeight = settings?.verticalRouletteContainerHeight || 70
    const itemSpacing = 10
    const totalItemHeight = itemHeight + itemSpacing
    const loopHeight = entries.length * totalItemHeight
    
    // Only render items visible in viewport + buffer (optimized for large entry counts)
    const viewportHeight = 500
    const buffer = 200 // Extra items above/below viewport
    const visibleRange = viewportHeight / 2 + buffer
    
    // Calculate which entries to render based on current offset
    const normalizedOffset = ((animationOffset % loopHeight) + loopHeight) % loopHeight
    const startIndex = Math.floor((normalizedOffset - visibleRange) / totalItemHeight)
    const endIndex = Math.ceil((normalizedOffset + visibleRange) / totalItemHeight)
    
    const itemsToRender: JSX.Element[] = []
    
    // Render items in visible range (with wrapping) - limit to reasonable range
    const maxItems = Math.min(endIndex - startIndex, 50) // Cap at 50 items max
    for (let i = startIndex; i <= startIndex + maxItems && i <= endIndex; i++) {
      const entryIndex = ((i % entries.length) + entries.length) % entries.length
      const entry = entries[entryIndex]
      if (!entry) continue
      
      const baseY = i * totalItemHeight
      let adjustedY = baseY - normalizedOffset
      
      // Wrap to keep in reasonable range
      while (adjustedY < -loopHeight / 2) adjustedY += loopHeight
      while (adjustedY > loopHeight / 2) adjustedY -= loopHeight
      
      const distanceFromCenter = Math.abs(adjustedY)
      
      // Skip if too far from viewport
      if (Math.abs(adjustedY) > visibleRange) continue
      
      const isNearCenter = distanceFromCenter < totalItemHeight * 0.6
      const color = verticalColors[entryIndex % verticalColors.length]
      
      const textSize = settings?.verticalRouletteTextSize || 18
      itemsToRender.push(
        <div
          key={`${entry.id}-${i}`}
          className={`absolute left-0 right-0 mx-6 rounded-2xl px-6 py-5 font-bold shadow-lg ${color} text-white`}
          style={{
            top: '50%',
            height: `${itemHeight}px`,
            transform: `translateY(calc(-50% + ${adjustedY}px))`,
            opacity: isNearCenter ? 1 : Math.max(0.2, 0.8 - (distanceFromCenter / totalItemHeight) * 0.3),
            zIndex: isNearCenter ? 20 : 10,
            transition: 'none',
            willChange: 'transform',
            fontSize: `${textSize}px`
          }}
        >
          <div className="text-center flex items-center justify-center h-full w-full px-2">
            <span 
              className="block truncate"
              style={{
                maxWidth: '100%'
              }}
              title={entry.name.toUpperCase()}
            >
              {entry.name.toUpperCase()}
            </span>
          </div>
        </div>
      )
    }
    
    return itemsToRender
  }

  // Memoize wheel SVG elements for performance (must be at top level)
  // For large entry counts, limit rendering to prevent hangs
  const wheelSvgElements = useMemo(() => {
    if (rouletteType !== "wheel" || entries.length === 0) return []
    
    // Render all entries - performance is handled by limiting text rendering complexity
    // For very large counts, we'll use smaller font and fewer characters, but show all segments
    const entriesToRender = entries
    
    const colors = [
      ['#f97316', '#ea580c'], // orange
      ['#3b82f6', '#2563eb'], // blue
      ['#eab308', '#ca8a04'], // yellow
      ['#a855f7', '#9333ea'], // purple
      ['#ec4899', '#db2777'], // pink
      ['#22c55e', '#16a34a'], // green
      ['#ef4444', '#dc2626'], // red
      ['#6366f1', '#4f46e5'], // indigo
      ['#14b8a6', '#0d9488'], // teal
      ['#06b6d4', '#0891b2'], // cyan
    ]
    
    const totalEntries = entries.length
    const anglePerSegment = 360 / totalEntries
    const radius = 100
    const elements: JSX.Element[] = []
    
    // Calculate responsive font size based on total entry count
    // More entries = smaller text to fit better, but keep it readable
    let fontSize: number
    let maxNameLength: number
    if (totalEntries > 1000) {
      fontSize = 4 // Very small for 1000+ entries
      maxNameLength = 5 // Show first 5 chars
    } else if (totalEntries > 500) {
      fontSize = 5 // Small for 500-1000 entries
      maxNameLength = 6 // Show first 6 chars
    } else if (totalEntries > 300) {
      fontSize = 6 // Small for 300-500 entries
      maxNameLength = 8
    } else if (totalEntries > 200) {
      fontSize = 7 // Medium-small for 200-300 entries
      maxNameLength = 10
    } else if (totalEntries > 100) {
      fontSize = 8 // Medium for 100-200 entries
      maxNameLength = 12
    } else {
      fontSize = 10 // Normal for <100 entries
      maxNameLength = 18
    }
      
    // Helper functions for color calculation
    const getLuminance = (r: number, g: number, b: number) => {
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255
    }
    
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 }
    }
    
    entriesToRender.forEach((entry, renderIndex) => {
      const index = renderIndex
      const [color1, color2] = colors[index % colors.length]
      // Use total entries angle for proper segment spacing (all entries)
      const startAngle = index * anglePerSegment - 90 // Start from top
      const endAngle = startAngle + anglePerSegment
      
      // Convert to radians
      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180
      
      // Calculate arc path
      const x1 = 100 + radius * Math.cos(startRad)
      const y1 = 100 + radius * Math.sin(startRad)
      const x2 = 100 + radius * Math.cos(endRad)
      const y2 = 100 + radius * Math.sin(endRad)
      
      // For full circle (single entry), use different approach
      const largeArcFlag = anglePerSegment > 180 ? 1 : 0
      
      const pathData = totalEntries === 1 
        ? `M 100 100 m -100 0 a 100 100 0 1 0 200 0 a 100 100 0 1 0 -200 0`
        : [
            `M 100 100`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`
          ].join(' ')
      
      // Calculate text position - place horizontally in the middle of the segment
      const textAngle = startAngle + anglePerSegment / 2
      const textRad = (textAngle * Math.PI) / 180
      
      // Position text in the middle of the segment (between center and edge)
      // Adjust radius based on total entry count - closer to center for more entries
      let textRadius: number
      if (totalEntries > 1000) {
        textRadius = 75 // Closer to center for very large counts
      } else if (totalEntries > 500) {
        textRadius = 73 // Closer to center for very large counts
      } else if (totalEntries > 300) {
        textRadius = 71
      } else if (totalEntries > 200) {
        textRadius = 69
      } else if (totalEntries > 100) {
        textRadius = 67
      } else {
        textRadius = 65 // Normal position
      }
      
      // Calculate text position
      const textX = 100 + textRadius * Math.cos(textRad)
      const textY = 100 + textRadius * Math.sin(textRad)
      
      // Determine text color based on segment brightness for better contrast
      // Use the lighter color (color1) to determine text color
      const rgb = hexToRgb(color1)
      const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
      // If segment is bright (luminance > 0.5), use dark text, otherwise use white text
      const textColor = luminance > 0.5 ? '#000000' : '#FFFFFF'
      const textStroke = luminance > 0.5 ? '#FFFFFF' : '#000000'
      
      elements.push(
        <g key={entry.id}>
          <defs>
            <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: color1, stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: color2, stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path
            d={pathData}
            fill={`url(#grad-${index})`}
            stroke="white"
            strokeWidth="2"
          />
          {/* Text positioned horizontally in the middle of the segment */}
          {(() => {
            // Truncate name based on entry count
            let displayName = entry.name
            if (displayName.length > maxNameLength) {
              displayName = displayName.substring(0, maxNameLength - 3) + '...'
            } else {
              displayName = displayName.toUpperCase()
            }
            
            return (
              <text
                x={textX}
                y={textY}
                fill={textColor}
                fontSize={fontSize}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                // Rotate text to align with segment angle (horizontal within segment)
                // Add 90 degrees to make text horizontal (perpendicular to radius)
                transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                style={{ 
                  filter: luminance > 0.5 
                    ? 'drop-shadow(0 0 2px rgba(255,255,255,0.8))' 
                    : 'drop-shadow(0 0 2px rgba(0,0,0,0.8))',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  stroke: textStroke,
                  strokeWidth: '0.3px',
                  paintOrder: 'stroke fill'
                }}
              >
                {displayName}
              </text>
            )
          })()}
        </g>
      )
    })
    
    return elements
  }, [entries, rouletteType])

  // Normalize name for duplicate detection: lowercase + remove spaces
  const normalizeName = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '')
  }

  // Check for duplicates in new entries and against existing entries
  const checkDuplicates = (newEntries: Array<{ name: string }>): {
    hasDuplicates: boolean
    duplicateNames: string[]
    existingDuplicates: string[]
  } => {
    const existingNormalized = new Set(entries.map(e => normalizeName(e.name)))
    const newNormalized = new Map<string, string>() // normalized -> original
    const duplicateNames: string[] = []
    const existingDuplicates: string[] = []

    // Check for duplicates within new entries
    for (const entry of newEntries) {
      if (!entry.name.trim()) continue
      
      const normalized = normalizeName(entry.name)
      
      // Check if duplicate within new entries
      if (newNormalized.has(normalized)) {
        if (!duplicateNames.includes(entry.name)) {
          duplicateNames.push(entry.name)
        }
      } else {
        newNormalized.set(normalized, entry.name)
      }
      
      // Check if duplicate with existing entries
      if (existingNormalized.has(normalized)) {
        if (!existingDuplicates.includes(entry.name)) {
          existingDuplicates.push(entry.name)
        }
      }
    }

    return {
      hasDuplicates: duplicateNames.length > 0 || existingDuplicates.length > 0,
      duplicateNames,
      existingDuplicates,
    }
  }

  // Parse CSV line - extract name from CSV format
  const parseCSVLine = (line: string): { name: string } => {
    // Simple CSV parser - handles quoted and unquoted values
    const parts: string[] = []
    let current = ""
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    parts.push(current.trim())
    
    // Use the first part as name (for CSV files with multiple columns)
    return {
      name: parts[0] || line.trim(),
    }
  }

  // Parse bulk entries text - extract names
  const parseBulkEntries = (text: string): Array<{ name: string }> => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    return lines.map(line => {
      // Check if line contains tab (TSV format) - use first column
      if (line.includes('\t')) {
        const parts = line.split('\t')
        return { name: parts[0].trim() || line.trim() }
      }
      
      // For lines with commas, check if it's CSV format or a name with comma
      // CSV format typically has 3+ columns or the second part looks like a different data type
      // Name format like "LASTNAME, FIRSTNAME MIDDLENAME" should use entire line
      if (line.includes(',')) {
        const parts = line.split(',').map(p => p.trim()).filter(p => p.length > 0)
        
        // If 3+ parts, likely CSV - use first column
        if (parts.length >= 3) {
          return { name: parts[0] }
        }
        
        // If 2 parts, check if it looks like "LASTNAME, FIRSTNAME" format
        // In this format, the second part usually contains spaces (first name + middle name)
        // or is a reasonable length (not just a single letter or code)
        if (parts.length === 2) {
          const secondPart = parts[1]
          // If second part has spaces or multiple words, it's part of the name
          // Use entire line (e.g., "ABAD, JEFFRY CANTO")
          if (secondPart.includes(' ') || secondPart.length > 3) {
            return { name: line.trim() }
          }
          // If second part is very short (1-3 chars), might be a code/initial - use first part only
          // But for names, we'll default to using entire line to be safe
          return { name: line.trim() }
        }
        
        // Single part - use entire line
        return { name: line.trim() }
      }
      
      // Simple format: just name (no commas or tabs)
      return { name: line.trim() }
    })
  }


  // Add bulk entries
  const handleAddBulkEntries = async () => {
    if (!bulkEntries.trim()) {
      toast.warning("Please enter at least one entry")
      return
    }

    const parsed = parseBulkEntries(bulkEntries)
    const validEntries = parsed.filter(e => e.name && e.name.trim())
    const entryCount = validEntries.length

    if (entryCount === 0) {
      toast.warning("No valid entries found")
      return
    }

    // Check for duplicates
    const duplicateCheck = checkDuplicates(validEntries)
    
    if (duplicateCheck.hasDuplicates) {
      let message = "Duplicate entries detected:\n"
      
      if (duplicateCheck.duplicateNames.length > 0) {
        message += `\nDuplicates within your input:\n${duplicateCheck.duplicateNames.join(", ")}`
      }
      
      if (duplicateCheck.existingDuplicates.length > 0) {
        message += `\n\nAlready exists in system:\n${duplicateCheck.existingDuplicates.join(", ")}`
      }
      
      message += "\n\nPlease remove duplicates before adding."
      toast.error(message)
      return
    }

    // Show confirmation dialog
    setPendingEntryCount(entryCount)
    setPendingAction(() => async () => {
      setLoading(true)
      setShowConfirmDialog(false)
      
      try {
        let successCount = 0
        let errorCount = 0

        for (const entry of validEntries) {
          if (!entry.name) continue
          
          try {
            const res = await fetch("/api/entries", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: entry.name,
            }),
            })

            if (res.ok) {
              successCount++
            } else {
              errorCount++
            }
          } catch (error) {
            errorCount++
          }
        }

        setBulkEntries("")
        await fetchEntries()
        
        if (errorCount > 0) {
          toast.warning(`Added ${successCount} entries. ${errorCount} failed.`)
        } else {
          toast.success(`Successfully added ${successCount} entries!`)
        }
      } catch (error) {
        console.error("Error adding bulk entries:", error)
        toast.error("Failed to add entries")
      } finally {
        setLoading(false)
        setPendingAction(null)
      }
    })
    setShowConfirmDialog(true)
  }

  // Handle Excel/CSV file import
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setShowImportProgress(true)
    setImportProgress({ current: 0, total: 0, percentage: 0 })

    try {
      let text = await file.text()
      
      // Skip header row if it looks like a header (contains "name")
      const lines = text.split('\n')
      if (lines.length > 0) {
        const firstLine = lines[0].toLowerCase()
        if (firstLine.includes('name')) {
          text = lines.slice(1).join('\n')
        }
      }
      
      const parsed = parseBulkEntries(text)
      const validEntries = parsed.filter(e => e.name && e.name.trim())
      
      if (validEntries.length === 0) {
        toast.warning("No valid entries found in the file")
        setShowImportProgress(false)
        setImporting(false)
        return
      }

      // Check for duplicates
      const duplicateCheck = checkDuplicates(validEntries)
      
      if (duplicateCheck.hasDuplicates) {
        let message = "Duplicate entries detected:\n"
        
        if (duplicateCheck.duplicateNames.length > 0) {
          message += `\nDuplicates within file:\n${duplicateCheck.duplicateNames.join(", ")}`
        }
        
        if (duplicateCheck.existingDuplicates.length > 0) {
          message += `\n\nAlready exists in system:\n${duplicateCheck.existingDuplicates.join(", ")}`
        }
        
        message += "\n\nPlease remove duplicates before importing."
        toast.error(message)
        setShowImportProgress(false)
        setImporting(false)
        return
      }

      // Initialize progress
      const totalEntries = validEntries.length
      setImportProgress({ current: 0, total: totalEntries, percentage: 0 })

      let successCount = 0
      let errorCount = 0

      // Import entries with progress tracking
      for (let i = 0; i < validEntries.length; i++) {
        const entry = validEntries[i]
        if (!entry.name) continue
        
        try {
          const res = await fetch("/api/entries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: entry.name,
            }),
          })

          if (res.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          errorCount++
        }
        
        // Update progress
        const current = i + 1
        const percentage = Math.round((current / totalEntries) * 100)
        setImportProgress({ current, total: totalEntries, percentage })
        
        // Small delay to allow UI to update (optional, can be removed for faster import)
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }

      await fetchEntries()
      
      // Hide progress after a brief delay
      setTimeout(() => {
        setShowImportProgress(false)
        setImporting(false)
      }, 500)
      
      if (errorCount > 0) {
        toast.warning(`Imported ${successCount} entries. ${errorCount} failed.`)
      } else {
        toast.success(`Successfully imported ${successCount} entries!`)
      }
    } catch (error) {
      console.error("Error importing file:", error)
      toast.error("Failed to import file. Please ensure it's a valid CSV or text file.")
      setShowImportProgress(false)
      setImporting(false)
    } finally {
      // Reset file input
      e.target.value = ""
    }
  }

  // Delete entry
  const handleDeleteEntry = (id: string, name: string) => {
    setPendingDeleteEntryId(id)
    setPendingDeleteEntryName(name)
    setShowDeleteConfirmDialog(true)
  }

  const confirmDeleteEntry = async () => {
    if (!pendingDeleteEntryId) return

    try {
      const res = await fetch(`/api/entries/${pendingDeleteEntryId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        await fetchEntries()
        toast.success(`Entry "${pendingDeleteEntryName}" deleted successfully`)
      } else {
        toast.error("Failed to delete entry")
      }
    } catch (error) {
      console.error("Error deleting entry:", error)
      toast.error("Failed to delete entry")
    } finally {
      setShowDeleteConfirmDialog(false)
      setPendingDeleteEntryId(null)
      setPendingDeleteEntryName("")
    }
  }

  // Function to enter fullscreen
  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen()
        } else if ((document.documentElement as any).mozRequestFullScreen) {
          await (document.documentElement as any).mozRequestFullScreen()
        } else if ((document.documentElement as any).msRequestFullscreen) {
          await (document.documentElement as any).msRequestFullscreen()
        }
      }
    } catch (error) {
      console.error("Error entering fullscreen:", error)
    }
  }

  // Initialize or continue drawing (one click = one winner)
  const handleRunDraw = async () => {
    if (entries.length === 0) {
      toast.warning("No entries available. Please add entries first.")
      return
    }

    // Enter fullscreen when draw starts
    await enterFullscreen()

    // If not currently in a drawing session, validate and start new session
    if (!isDrawingInProgress) {
      // Filter out invalid prize IDs
      const validPrizeIds = prizes.length > 0 ? new Set(prizes.map(p => p.id)) : new Set<string>()
      const filteredAssignments = prizeAssignments.filter(a => 
        a.prizeId && 
        a.prizeId.trim() !== "" && 
        a.count > 0 &&
        (prizes.length === 0 ? false : validPrizeIds.has(a.prizeId)) // Only check if prizes exist
      )
      
      // Update prizeAssignments if invalid IDs were found
      if (filteredAssignments.length !== prizeAssignments.filter(a => a.prizeId && a.prizeId.trim() !== "" && a.count > 0).length) {
        setPrizeAssignments(filteredAssignments)
        // Save cleaned assignments
        saveDrawSettings(filteredAssignments).catch(err => console.error("Error saving cleaned assignments:", err))
      }
      
      const num = filteredAssignments.reduce((sum, a) => sum + a.count, 0)
      
      if (num < 1) {
        toast.warning("Please add at least one prize assignment with winners")
        return
      }

      // Calculate available entries
      let availableEntries = entries.length
      if (excludePrevious) {
        const previousWinnerIds = new Set<string>()
        draws.forEach(draw => {
          draw.winners.forEach(winner => {
            previousWinnerIds.add(winner.entry.id)
          })
        })
        availableEntries = entries.filter(e => !previousWinnerIds.has(e.id)).length
      }

      if (num > availableEntries) {
        const message = excludePrevious 
          ? `Not enough available entries. You have ${entries.length} total entries, but ${entries.length - availableEntries} are previous winners. Only ${availableEntries} entries are available, but you need ${num} winners.`
          : `Not enough entries. You have ${entries.length} entries, but need ${num} winners.`
        toast.warning(message)
        return
      }

      // Start new drawing session
      setIsDrawingInProgress(true)
      setCurrentPrizeIndex(0)
      setCurrentPrizeWinnerCount(0)
      setAllDrawnWinners([])
    }

    // Get current prize assignment - filter out invalid prize IDs and sort by prize order (ascending)
    const validPrizeIds = prizes.length > 0 ? new Set(prizes.map(p => p.id)) : new Set<string>()
    const prizeIndexMap = new Map(prizes.map((p, index) => [p.id, index]))
    
    // Filter and sort assignments by prize order (ascending)
    const filteredAssignments = prizeAssignments
      .filter(a => 
        a.prizeId && 
        a.prizeId.trim() !== "" && 
        a.count > 0 &&
        (prizes.length === 0 || validPrizeIds.has(a.prizeId)) // Only check if prizes exist
      )
      .sort((a, b) => {
        const indexA = prizeIndexMap.get(a.prizeId) ?? Infinity
        const indexB = prizeIndexMap.get(b.prizeId) ?? Infinity
        return indexA - indexB // Ascending order
      })
    
    if (filteredAssignments.length === 0) {
      toast.warning("No prizes with winners configured. Please configure draw settings.")
      setIsDrawingInProgress(false)
      return
    }
    
    // Reset to first valid prize if current index is invalid
    if (currentPrizeIndex >= filteredAssignments.length || currentPrizeIndex < 0) {
      setCurrentPrizeIndex(0)
      const firstAssignment = filteredAssignments[0]
      const firstPrize = prizes.find(p => p.id === firstAssignment.prizeId)
      if (firstPrize) {
        setCurrentPrizeName(firstPrize.name)
        setRemainingWinners(firstAssignment.count)
        setCurrentPrizeWinnerCount(0)
      }
    }
    
    if (currentPrizeIndex >= filteredAssignments.length) {
      // All prizes completed, show final results
      await finishDrawing()
      return
    }

    const currentAssignment = filteredAssignments[currentPrizeIndex]
    const prize = prizes.find(p => p.id === currentAssignment.prizeId)
    const prizeName = prize?.name || "Prize"
    const remainingForThisPrize = currentAssignment.count - currentPrizeWinnerCount

    if (remainingForThisPrize <= 0) {
      // Move to next prize
      const nextIndex = currentPrizeIndex + 1
      if (nextIndex < filteredAssignments.length) {
        const nextAssignment = filteredAssignments[nextIndex]
        const nextPrize = prizes.find(p => p.id === nextAssignment?.prizeId)
        if (nextPrize) {
          setCurrentPrizeName(nextPrize.name)
          setRemainingWinners(nextAssignment.count)
        }
      }
      setCurrentPrizeIndex(nextIndex)
      setCurrentPrizeWinnerCount(0)
      // Recursively call to draw for next prize
      await handleRunDraw()
      return
    }

    setDrawing(true)
    
    // Update prize name and remaining count before drawing
    setCurrentPrizeName(prizeName)
    setRemainingWinners(remainingForThisPrize)

    try {
      // Call API to get ONE winner
      const res = await fetch("/api/draws", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numWinners: 1,
          excludePreviousWinners: excludePrevious,
          prizeAssignments: [{ prizeId: currentAssignment.prizeId, count: 1 }],
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(`Error: ${error.error}`)
        setDrawing(false)
        return
      }

      const newDraw = await res.json()
      const winner = newDraw.winners[0]
      
      // Find the winner's index in current entries
      const winnerIndex = entries.findIndex(e => e.id === winner.entry.id)
      
      // Prize name and remaining count are already set before drawing starts
      // Wait a moment to show the prize label
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Calculate winner position and target
      let loopSize = 360
      let targetPosition = 0
      
      if (rouletteType === "vertical") {
        const itemHeight = settings?.verticalRouletteContainerHeight || 70
        const itemSpacing = 10
        const totalItemHeight = itemHeight + itemSpacing
        loopSize = entries.length * totalItemHeight
        // Winner position - this puts the winner card at center (offset = 0)
        // The yellow box is at center (50%), so we need the winner entry center to align with it
        targetPosition = winnerIndex * totalItemHeight
      } else if (rouletteType === "wheel") {
        const anglePerSegment = 360 / entries.length
        // Wheel segments are drawn starting from -90° (top)
        // Segment i starts at: (i * anglePerSegment) - 90
        // Segment i center is at: (i * anglePerSegment) - 90 + (anglePerSegment / 2)
        // The arrow indicator is at 0° (right side, pointing left)
        // When wheel rotates by R degrees clockwise, segment i center moves to:
        //   (i * anglePerSegment) - 90 + (anglePerSegment / 2) + R
        // We want winner segment's center to be at 0° (arrow position):
        //   (winnerIndex * anglePerSegment) - 90 + (anglePerSegment / 2) + R = 0
        // Solving for R: R = 90 - (winnerIndex * anglePerSegment) - (anglePerSegment / 2)
        // R = 90 - (winnerIndex + 0.5) * anglePerSegment
        // Calculate the exact center angle of the winner segment
        // Segment center in wheel's local coordinates: (winnerIndex * anglePerSegment) - 90 + (anglePerSegment / 2)
        const segmentCenterAngle = (winnerIndex * anglePerSegment) - 90 + (anglePerSegment / 2)
        // Rotate wheel so segment center aligns with arrow at 0°
        // After rotation R, segment center is at: segmentCenterAngle + R
        // We want: segmentCenterAngle + R = 0, so R = -segmentCenterAngle
        targetPosition = -segmentCenterAngle
        // Normalize to 0-360 range with high precision
        targetPosition = ((targetPosition % 360) + 360) % 360
        // Round to high precision to avoid floating point errors that might cause landing on separator lines
        // Using 4 decimal places ensures we're well within the segment center, not on the separator
        targetPosition = Math.round(targetPosition * 10000) / 10000
      }
      
      // Get current normalized position
      const currentNormalizedPos = offsetRef.current % loopSize
      
      // Calculate shortest distance to target
      let distanceToTarget = targetPosition - currentNormalizedPos
      
      // Add extra spins - more spins for fewer entries to ensure fast spinning feel
      // With fewer entries, we need more spins to maintain the fast spinning perception
      const baseSpins = 3 + Math.floor(Math.random() * 3) // 3-5 base spins
      const entryCountMultiplier = entries.length < 20 ? Math.max(2, 20 / entries.length) : 1 // More spins for fewer entries
      const extraSpins = Math.floor(baseSpins * entryCountMultiplier)
      const extraDistance = extraSpins * loopSize
      
      // Unlock position for new draw
      isLockedPositionRef.current = false
      lockedPositionRef.current = null
      
      // Use spinTime setting for animation duration (convert seconds to milliseconds)
      // This controls how long the roulette spins before stopping
      const totalDuration = spinTime * 1000
      
      // Get starting position
      const startTime = performance.now()
      const startOffset = offsetRef.current
      
      // Start at MAXIMUM FULL SPEED - super fast spinning from the very beginning
      // Use a fixed very high speed that doesn't depend on spin time or entry count
      // This ensures it always starts fast regardless of spin time setting or number of entries
      const initialSpinSpeed = 15000 // Fixed maximum speed - always fast at start
      
      // Calculate final absolute target
      let finalTarget = offsetRef.current + extraDistance + distanceToTarget
      
      // Ensure minimum distance for fast spinning feel (especially important for few entries)
      // Calculate minimum distance needed for the spin time at initial speed
      // This ensures the animation always feels fast, even with few entries
      const minDistanceForSpinTime = (initialSpinSpeed * 0.75) * (totalDuration / 1000) // Average speed * time
      const actualDistance = Math.abs(finalTarget - startOffset)
      
      // If actual distance is less than minimum, add more distance
      if (actualDistance < minDistanceForSpinTime) {
        const additionalSpins = Math.ceil((minDistanceForSpinTime - actualDistance) / loopSize)
        finalTarget = offsetRef.current + (extraSpins + additionalSpins) * loopSize + distanceToTarget
      }
      
      // START SPINNING - animation continues automatically
      setIsSpinning(true)
      disableWrappingRef.current = true // Prevent wrapping during controlled animation
      
      // Set initial speed immediately so it starts at full speed
      setCurrentAnimationSpeed(initialSpinSpeed)
      
      // Start spinning sound effect with entries info
      startSpinningSound(initialSpinSpeed, entries.length, rouletteType)
      
      // Smooth animation to target using easing
      const animateToTarget = () => {
        const elapsed = performance.now() - startTime
        const progress = Math.min(elapsed / totalDuration, 1)
        
        if (progress < 1) {
          // Ease out cubic for natural deceleration - starts fast, slows down smoothly
          const easeProgress = 1 - Math.pow(1 - progress, 3)
          const currentPosition = startOffset + ((finalTarget - startOffset) * easeProgress)
          
          offsetRef.current = currentPosition
          setAnimationOffset(currentPosition)
          
          // Decelerate speed based on spin time progress - start slowing at 30% (last 70% slows down)
          // Keep full speed for first 30%, then dramatically slow down for maximum suspense
          let speedMultiplier: number
          if (progress < 0.30) {
            // Maintain full speed for first 30% of spin time
            // Very slight decrease to make it feel natural, but stays very fast
            speedMultiplier = 1.0 - (progress / 0.30) * 0.01 // Only 1% decrease over first 30%
          } else if (progress < 0.50) {
            // Start decelerating in the 30-50% range (gradual slowdown begins)
            const slowdownProgress = (progress - 0.30) / 0.20 // 0-1 for 30-50% range
            speedMultiplier = 0.99 * (1 - Math.pow(slowdownProgress, 2.5)) // Stronger slowdown
          } else if (progress < 0.70) {
            // Moderate slowdown in 50-70% range (suspense building)
            const suspenseProgress = (progress - 0.50) / 0.20 // 0-1 for 50-70% range
            speedMultiplier = 0.3 * Math.pow(1 - suspenseProgress, 5) // Very strong deceleration
          } else if (progress < 0.85) {
            // Dramatic slowdown in 70-85% range (strong suspense)
            const dramaticProgress = (progress - 0.70) / 0.15 // 0-1 for 70-85% range
            speedMultiplier = 0.1 * Math.pow(1 - dramaticProgress, 7) // Very strong deceleration
          } else if (progress < 0.94) {
            // Extreme slowdown in 85-94% range (extreme suspense)
            const extremeProgress = (progress - 0.85) / 0.09 // 0-1 for 85-94% range
            speedMultiplier = 0.03 * Math.pow(1 - extremeProgress, 9) // Extreme deceleration
          } else if (progress < 0.98) {
            // Very slow in 94-98% range (maximum suspense)
            const maxProgress = (progress - 0.94) / 0.04 // 0-1 for 94-98% range
            speedMultiplier = 0.008 * Math.pow(1 - maxProgress, 12) // Maximum deceleration
          } else {
            // Extremely slow crawl in last 2% (ultimate suspense before reveal)
            const finalProgress = (progress - 0.98) / 0.02 // 0-1 for last 2%
            speedMultiplier = 0.002 * Math.pow(1 - finalProgress, 15) // Ultimate deceleration
          }
          
          const currentSpeed = initialSpinSpeed * speedMultiplier
          
          // Ensure minimum speed for smooth stopping (very slow near the end)
          let minSpeed: number
          if (progress > 0.995) {
            minSpeed = 0.2 // Extremely slow in last 0.5%
          } else if (progress > 0.98) {
            minSpeed = 0.5 // Very slow in last 2%
          } else if (progress > 0.94) {
            minSpeed = 1 // Slow in last 6%
          } else if (progress > 0.85) {
            minSpeed = 2 // Moderate slow in last 15%
          } else if (progress > 0.70) {
            minSpeed = 3 // Slight slow in last 30%
          } else if (progress > 0.50) {
            minSpeed = 5 // Minimum slow in last 50%
          } else if (progress > 0.30) {
            minSpeed = 8 // Minimum slow in last 70%
          } else {
            minSpeed = 15 // Minimum speed for first 30%
          }
          
          const finalSpeed = Math.max(minSpeed, currentSpeed)
          
          setCurrentAnimationSpeed(finalSpeed)
          
          // Update spinning sound speed to sync with animation
          updateSpinSpeed(finalSpeed)
          
          // Check if entry passed center/indicator and play tick sound
          // Always call checkEntryPassed during controlled animation (isSpinning is true)
          checkEntryPassed(offsetRef.current)
          
          requestAnimationFrame(animateToTarget)
        } else {
          // Animation complete - lock position to prevent flickering
          // Calculate loopSize based on current settings
          let loopSize = 360
          if (rouletteType === "vertical") {
            const itemHeight = settings?.verticalRouletteContainerHeight || 70
            const itemSpacing = 10
            const totalItemHeight = itemHeight + itemSpacing
            loopSize = entries.length * totalItemHeight
          }
          
          let normalizedPosition = targetPosition % loopSize
          if (normalizedPosition < 0) normalizedPosition += loopSize
          
          // For vertical, verify the winner is correctly positioned in the yellow box
          if (rouletteType === "vertical" && entries.length > 0) {
            const itemHeight = settings?.verticalRouletteContainerHeight || 70
            const itemSpacing = 10
            const totalItemHeight = itemHeight + itemSpacing
            // Calculate which entry should be at center based on normalized position
            const entryFloat = normalizedPosition / totalItemHeight
            const calculatedIndex = Math.floor(entryFloat + 0.5) % entries.length
            const actualIndex = calculatedIndex < 0 ? calculatedIndex + entries.length : calculatedIndex
            
            if (actualIndex !== winnerIndex) {
              // Recalculate to ensure winner is exactly centered
              const correctPosition = winnerIndex * totalItemHeight
              normalizedPosition = correctPosition % loopSize
              if (normalizedPosition < 0) normalizedPosition += loopSize
            }
          }
          
          // For wheel, verify the winner is correct and ensure we're in the center of segment, not on separator
          if (rouletteType === "wheel" && entries.length > 0) {
            const anglePerSegment = 360 / entries.length
            // Calculate the exact center angle of the winner segment
            const correctSegmentCenter = (winnerIndex * anglePerSegment) - 90 + (anglePerSegment / 2)
            // Calculate the exact rotation needed to align segment center with arrow at 0°
            let exactRotation = -correctSegmentCenter
            // Normalize to 0-360 with high precision
            exactRotation = ((exactRotation % 360) + 360) % 360
            // Round to avoid floating point errors that might cause landing on separator line
            exactRotation = Math.round(exactRotation * 10000) / 10000
            
            // Verify we're close to the correct position (within 0.01 degrees to avoid separator)
            const positionDiff = Math.abs(normalizedPosition - exactRotation)
            const wrappedDiff = Math.min(positionDiff, 360 - positionDiff)
            
            if (wrappedDiff > 0.01) {
              // Use the exact calculated position to ensure we're in the center of the segment, not on separator
              normalizedPosition = exactRotation
            }
            
            // Double-check: verify which segment is actually at the arrow
            const calculatedIndex = Math.floor((90 - (anglePerSegment / 2) - normalizedPosition + 360) / anglePerSegment) % entries.length
            const actualIndex = calculatedIndex < 0 ? calculatedIndex + entries.length : calculatedIndex
            
            if (actualIndex !== winnerIndex) {
              // Recalculate with exact precision to ensure correct winner and avoid separator
              normalizedPosition = exactRotation
            }
          }
          
          // Lock the position
          isLockedPositionRef.current = true
          lockedPositionRef.current = normalizedPosition
          offsetRef.current = normalizedPosition
          setAnimationOffset(normalizedPosition)
          velocityRef.current = 0
          setCurrentAnimationSpeed(0)
          disableWrappingRef.current = false // Re-enable wrapping
          
          setTimeout(() => {
            setIsSpinning(false)
            setCurrentAnimationSpeed(100)
            // Stop spinning sound
            stopSpinningSound()
            // Keep position locked until next draw starts
          }, 100)
        }
      }
      
      requestAnimationFrame(animateToTarget)
      
      // Wait for animation to complete (use exact spinTime duration)
      // Add small buffer (50ms) to ensure animation completes
      await new Promise(resolve => setTimeout(resolve, totalDuration + 50))
      
      // After animation completes, wait for the reveal delay
      // Reveal delay is the time to wait AFTER the animation completes before showing the winner
      const revealDelayMs = revealDelay * 1000
      
      if (revealDelayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, revealDelayMs))
      }
      
      // Don't remove winner from entries list yet - it will be removed when "Remove" or "Next" is clicked
      // This allows the winner to remain visible in the roulette until the user decides
      
      // Save winner (but don't increment count yet - only when "Next" is clicked)
      setAllDrawnWinners(prev => [...prev, winner])
      
      // Update draws list
      await fetchDraws()
      
      // Show winner modal immediately with confetti
      setWinnerData({ winners: [winner], draw: newDraw })
      setShowWinnerModal(true)
      setShowConfetti(true)
      
      // Play modal music
      playModalMusic()
      
      // Trigger confetti effect
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }
      
      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }
      
      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now()
        
        if (timeLeft <= 0) {
          clearInterval(interval)
          setShowConfetti(false)
          return
        }
        
        const particleCount = 50 * (timeLeft / duration)
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)
      
      // Don't check if prize is complete here - that will be handled when "Next" is clicked
      
    } catch (error) {
      console.error("Error running draw:", error)
      toast.error("Failed to run draw")
    } finally {
      setDrawing(false)
      setIsSpinning(false)
    }
  }

  // Finish the drawing session
  const finishDrawing = async () => {
    setIsDrawingInProgress(false)
    setCurrentPrizeName("")
    setRemainingWinners(0)
    setCurrentPrizeIndex(0)
    setCurrentPrizeWinnerCount(0)
    setPrizeAssignments([])
    
    // Refresh entries from database
    await fetchEntries()
    
    toast.success("All winners drawn successfully!")
    setAllDrawnWinners([])
  }

  // Draw again with same settings
  const handleDrawAgain = async () => {
    if (!lastDraw) return
    // Note: numWinners is handled automatically by the draw system
    await handleRunDraw()
  }


  // Prize management functions
  const handlePrizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPrizeLoading(true)

    try {
      const prizeData = {
        name: prizeName.trim(),
      }

      if (editingPrizeId) {
        const res = await fetch(`/api/prizes/${editingPrizeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prizeData),
        })

        if (res.ok) {
          setPrizeName("")
          setEditingPrizeId(null)
          await fetchPrizes()
          toast.success("Prize updated successfully!")
        } else {
          const error = await res.json()
          toast.error(error.error || "Failed to update prize")
        }
      } else {
        const res = await fetch("/api/prizes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prizeData),
        })

        if (res.ok) {
          setPrizeName("")
          await fetchPrizes()
          toast.success("Prize added successfully!")
        } else {
          const error = await res.json()
          toast.error(error.error || "Failed to add prize")
        }
      }
    } catch (error) {
      console.error("Error saving prize:", error)
      toast.error("Failed to save prize")
    } finally {
      setPrizeLoading(false)
    }
  }

  const handleEditPrize = (prize: Prize) => {
    setPrizeName(prize.name)
    setEditingPrizeId(prize.id)
  }

  const handleDeletePrize = async (id: string, name: string) => {
    // Remove this prize from prizeAssignments
    const updatedAssignments = prizeAssignments.filter(a => a.prizeId !== id)
    setPrizeAssignments(updatedAssignments)
    
    // Save updated assignments to database
    try {
      await saveDrawSettings(updatedAssignments)
    } catch (error) {
      console.error("Error updating draw settings after prize deletion:", error)
    }
    setPendingDeletePrizeId(id)
    setPendingDeletePrizeName(name)
    setShowDeletePrizeConfirmDialog(true)
  }

  const confirmDeletePrize = async () => {
    if (!pendingDeletePrizeId) return

    try {
      const res = await fetch(`/api/prizes/${pendingDeletePrizeId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        // Remove this prize from prizeAssignments
        const updatedAssignments = prizeAssignments.filter(a => a.prizeId !== pendingDeletePrizeId)
        setPrizeAssignments(updatedAssignments)
        
        // Save updated assignments to database
        try {
          await saveDrawSettings(updatedAssignments)
        } catch (error) {
          console.error("Error updating draw settings after prize deletion:", error)
        }
        
        await fetchPrizes()
        toast.success(`Prize "${pendingDeletePrizeName}" deleted successfully`)
      } else {
        toast.error("Failed to delete prize")
      }
    } catch (error) {
      console.error("Error deleting prize:", error)
      toast.error("Failed to delete prize")
    } finally {
      setShowDeletePrizeConfirmDialog(false)
      setPendingDeletePrizeId(null)
      setPendingDeletePrizeName("")
    }
  }

  // Reset all draws (delete all previous winners)
  const handleResetDraws = async () => {
    setResetting(true)
    try {
      const res = await fetch("/api/draws", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        const data = await res.json()
        await fetchDraws()
        setLastDraw(null)
        
        // Reset drawing state to first prize with original remaining count
        // Filter valid prize assignments and sort by prize order (ascending)
        const validPrizeIds = prizes.length > 0 ? new Set(prizes.map(p => p.id)) : new Set<string>()
        const prizeIndexMap = new Map(prizes.map((p, index) => [p.id, index]))
        
        const filteredAssignments = prizeAssignments
          .filter(a => 
            a.prizeId && 
            a.prizeId.trim() !== "" && 
            a.count > 0 &&
            (prizes.length === 0 || validPrizeIds.has(a.prizeId))
          )
          .sort((a, b) => {
            const indexA = prizeIndexMap.get(a.prizeId) ?? Infinity
            const indexB = prizeIndexMap.get(b.prizeId) ?? Infinity
            return indexA - indexB // Ascending order
          })
        
        // Reset to first prize (lowest index with count > 0)
        setIsDrawingInProgress(false)
        setCurrentPrizeIndex(0)
        setCurrentPrizeWinnerCount(0)
        setAllDrawnWinners([])
        
        // Set remaining winners and prize name for first prize (already sorted by ascending order)
        if (filteredAssignments.length > 0) {
          const firstAssignment = filteredAssignments[0]
          const firstPrize = prizes.find(p => p.id === firstAssignment.prizeId)
          if (firstPrize) {
            setRemainingWinners(firstAssignment.count)
            setCurrentPrizeName(firstPrize.name)
          } else {
            setRemainingWinners(0)
            setCurrentPrizeName("")
          }
        } else {
          setRemainingWinners(0)
          setCurrentPrizeName("")
        }
        
        // Refresh entries to restore all entries (since winners were removed)
        await fetchEntries()
        
        toast.success(`Successfully reset all draws. ${data.deletedCount || 0} draw(s) removed.`)
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to reset draws")
      }
    } catch (error) {
      console.error("Error resetting draws:", error)
      toast.error("Failed to reset draws")
    } finally {
      setResetting(false)
      setShowResetDrawConfirmDialog(false)
    }
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <div className={`flex flex-col ${isFullscreen ? 'h-screen' : 'min-h-screen'}`} style={{ backgroundColor: settings?.backgroundColor || undefined }}>
        {!isFullscreen && (
          <SiteHeader
            currentView={currentView}
            onViewChange={setCurrentView}
            entriesCount={entries.length}
            prizesCount={prizes.length}
          />
        )}
        <main className={`flex-1 ${isFullscreen ? 'overflow-hidden flex flex-col' : ''}`}>
          <div className={`w-full ${isFullscreen ? 'max-w-full px-2 sm:px-4 md:px-6 lg:px-8 flex-1 flex flex-col min-h-0' : 'max-w-7xl mx-auto p-4'} ${isFullscreen ? 'py-2' : 'space-y-4'}`}>
        {/* Main View */}
        {currentView === "main" && (
          <div className={`relative ${isFullscreen ? 'h-full flex flex-col' : ''}`}>
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-orange-200/20 rounded-2xl blur-3xl -z-10" />
            
            <div className={`flex flex-col items-center justify-center relative z-10 ${isFullscreen ? 'flex-1 min-h-0 overflow-hidden' : ''}`}>
                <div className={`w-full ${isFullscreen ? 'flex flex-col flex-1 min-h-0 justify-between overflow-hidden' : ''}`}>
                  {/* Current Prize Display - Automatically shows from draw settings */}
                  {(() => {
                    // Get valid prize assignments
                    const filteredAssignments = prizeAssignments.filter(a => a.prizeId && a.prizeId.trim() !== "" && a.count > 0)
                    
                    // If no prizes are set up, show "PRIZES NOT SETUP YET"
                    if (filteredAssignments.length === 0) {
                      return (
                        <div 
                          className={`${isFullscreen ? 'mb-1' : 'mb-3'} border-2 border-gray-300 rounded-xl text-center shadow-lg`}
                          style={{
                            backgroundColor: settings?.prizeTitleBackgroundColor || "#9ca3af",
                            padding: `${settings?.prizeTitleBackgroundSize || 12}px`
                          }}
                        >
                          <h3 
                            className="font-black text-white drop-shadow-lg"
                            style={{
                              fontSize: `${settings?.prizeTitleFontSize || 48}px`
                            }}
                          >
                            PRIZES NOT SETUP YET
                          </h3>
                        </div>
                      )
                    }
                    
                    // Always show the prize at currentPrizeIndex (the prize currently being drawn)
                    if (currentPrizeIndex >= filteredAssignments.length) {
                      // If index is out of bounds, don't show anything (all prizes completed)
                      return null
                    }
                    
                    const currentAssignment = filteredAssignments[currentPrizeIndex]
                    if (!currentAssignment) return null
                    
                    const prize = prizes.find(p => p.id === currentAssignment.prizeId)
                    if (!prize) return null
                    
                    // Check if remaining winners is 0
                    if (remainingWinners === 0) {
                      return (
                        <div 
                          className={`${isFullscreen ? 'mb-1' : 'mb-3'} border-2 border-gray-300 rounded-xl text-center shadow-lg`}
                          style={{
                            backgroundColor: settings?.prizeTitleBackgroundColor || "#9ca3af",
                            padding: `${settings?.prizeTitleBackgroundSize || 12}px`
                          }}
                        >
                          <h3 
                            className="font-black text-white drop-shadow-lg"
                            style={{
                              fontSize: `${settings?.prizeTitleFontSize || 48}px`
                            }}
                          >
                            WAITING FOR NEXT PRIZE
                          </h3>
                        </div>
                      )
                    }
                    
                    // Show the current prize being drawn
                    return (
                      <div 
                        className={`${isFullscreen ? 'mb-1' : 'mb-3'} border-2 border-gray-300 rounded-xl text-center shadow-lg`}
                        style={{
                          backgroundColor: settings?.prizeTitleBackgroundColor || "#9ca3af",
                          padding: `${settings?.prizeTitleBackgroundSize || 12}px`
                        }}
                      >
                        <h3 
                          className="font-black text-white drop-shadow-lg"
                          style={{
                            fontSize: `${settings?.prizeTitleFontSize || 48}px`
                          }}
                        >
                          PRIZE : {prize.name.toUpperCase()}
                        </h3>
                      </div>
                    )
                  })()}
                  
                  {/* Roulette Type Toggle */}
                  <div className={`flex justify-center ${isFullscreen ? 'mb-1' : 'mb-3'} relative z-50`}>
                    <div className="inline-flex rounded-lg border p-1 bg-muted">
                      <Button
                        variant={rouletteType === "vertical" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setRouletteType("vertical")}
                        className="gap-2 relative z-50"
                      >
                        <ArrowDown className="size-4" />
                        Vertical
                      </Button>
                      <Button
                        variant={rouletteType === "wheel" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setRouletteType("wheel")}
                        className="gap-2 relative z-50"
                      >
                        <Disc3 className="size-4" />
                        Wheel
                      </Button>
                    </div>
                  </div>

                  {/* Vertical Roulette */}
                  {rouletteType === "vertical" && (
                    <div className={`relative ${isFullscreen ? 'flex-1 min-h-0 max-h-[calc(100vh-350px)]' : 'h-[500px]'} flex items-center justify-center ${isFullscreen ? 'mb-1' : 'mb-4'} px-4`}>
                      {entries.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                          <Sparkles className="size-16 mx-auto mb-4 opacity-30" />
                          <p className="text-lg font-medium">Add entries to start the draw</p>
                          <p className="text-sm mt-2">Your lucky winners will appear here!</p>
                        </div>
                      ) : (
                        <div className="relative w-full max-w-2xl h-full overflow-hidden rounded-3xl border-4 border-gray-500 shadow-2xl bg-gradient-to-b from-blue-50 to-white">
                          {/* Gradient fade effects removed */}
                          
                          {/* Winner Highlight Box - Center */}
                          <div className="absolute top-1/2 left-4 right-4 transform -translate-y-1/2 z-30 pointer-events-none">
                            <div 
                              className="border-4 border-yellow-400 rounded-2xl bg-yellow-50/30" 
                              style={{ 
                                boxShadow: '0 0 30px rgba(250, 204, 21, 0.4)',
                                height: `${settings?.verticalRouletteContainerHeight || 70}px`
                              }} 
                            />
                          </div>
                          
                          {/* Scrolling container */}
                          <div className="relative w-full h-full flex items-center justify-center">
                            {getVerticalRouletteItems()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Wheel Roulette */}
                  {rouletteType === "wheel" && (
                    <div className={`relative ${isFullscreen ? 'flex-1 min-h-0 max-h-[calc(100vh-350px)]' : 'h-[550px]'} flex items-center justify-center ${isFullscreen ? 'mb-1' : 'mb-4'}`}>
                      {entries.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                          <Sparkles className="size-16 mx-auto mb-4 opacity-30" />
                          <p className="text-lg font-medium">Add entries to start the draw</p>
                          <p className="text-sm mt-2">Your lucky winners will appear here!</p>
                        </div>
                      ) : (
                        <div className={`relative ${isFullscreen ? 'w-[min(500px,calc(100vh-380px))] h-[min(500px,calc(100vh-380px))] min-w-[350px] min-h-[350px] max-w-[700px] max-h-[700px]' : 'w-[550px] h-[550px]'} flex items-center justify-center`}>
                          {/* Winner Indicator - Right Side Arrow (fixed, outside wheel) */}
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-5 z-10 pointer-events-none">
                            {/* Arrow pointing left (towards wheel) */}
                            <div className="w-0 h-0 border-t-[35px] border-b-[35px] border-r-[60px] border-t-transparent border-b-transparent border-r-yellow-400 drop-shadow-2xl animate-pulse relative z-10" />
                          </div>
                          
                          {/* Outer decorative ring */}
                          <div className="absolute inset-0 rounded-full shadow-2xl"
                               style={{
                                 background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #a855f7, #ec4899, #f97316, #eab308) border-box',
                                 border: '10px solid transparent'
                               }}
                          />
                          
                          {/* Spinning Wheel SVG */}
                          <svg
                            className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)]"
                            viewBox="0 0 200 200"
                            style={{
                              transform: `rotate(${animationOffset}deg)`,
                              transition: 'none',
                              willChange: 'transform',
                            }}
                          >
                            {/* Dashed line on the wheel - extends from right edge (0 degrees) to center */}
                            <line
                              x1="200"
                              y1="100"
                              x2="100"
                              y2="100"
                              stroke="#facc15"
                              strokeWidth="2"
                              strokeDasharray="10 10"
                              opacity="0.7"
                            />
                            {wheelSvgElements}
                          </svg>
                          
                          {/* Center Circle */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 shadow-2xl border-4 border-white z-40 flex items-center justify-center overflow-hidden">
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Run Draw Button */}
                  <div className={`flex flex-col items-center ${isFullscreen ? 'gap-1' : 'gap-4'}`}>
                    <div className={`w-full ${isFullscreen ? 'max-w-md' : 'max-w-xs'} flex flex-col ${isFullscreen ? 'gap-1.5' : 'gap-3'}`}>
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleRunDraw()
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                        }}
                        disabled={
                          drawing || 
                          entries.length === 0 || 
                          prizes.length === 0 ||
                          (!isDrawingInProgress && (prizeAssignments.length === 0 ||
                          prizeAssignments.filter(a => a.prizeId && a.prizeId.trim() !== "" && a.count > 0).length === 0))
                        }
                        className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold ${isFullscreen ? 'py-2 text-sm' : 'py-4 text-base'} disabled:opacity-50 disabled:cursor-not-allowed`}
                        size="lg"
                      >
                        <Trophy className="size-5 mr-2" />
                        {drawing ? "Drawing..." : isDrawingInProgress ? "DRAW NEXT WINNER" : "START DRAW"}
                      </Button>
                      {isDrawingInProgress && (
                        <div className="text-center p-2 bg-blue-50 border border-blue-300 rounded-lg">
                          <p className="text-xs font-semibold text-blue-700">
                            Drawing in progress... Click button to draw next winner
                          </p>
                          <p className="text-xs text-blue-600 mt-0.5">
                            Prize: {currentPrizeName || "Loading..."} | Remaining: {remainingWinners}
                          </p>
                        </div>
                      )}
                      {!isDrawingInProgress && (entries.length === 0 || prizeAssignments.filter(a => a.prizeId && a.prizeId.trim() !== "" && a.count > 0).length === 0) && (
                        <p className="text-center text-sm text-muted-foreground">
                          {entries.length === 0 
                            ? "Add entries to start the draw" 
                            : "Configure draw settings to start the draw"}
                        </p>
                      )}
                      <div className={`grid grid-cols-2 ${isFullscreen ? 'gap-2' : 'gap-3'} w-full`}>
                        <Button
                          onClick={() => {
                            // Initialize temp state with current prizeAssignments when opening modal
                            setTempPrizeAssignments([...prizeAssignments])
                            // Initialize prize order based on current assignments order, then add remaining prizes
                            const assignedPrizeIds = prizeAssignments.map(a => a.prizeId)
                            const remainingPrizeIds = prizes.filter(p => !assignedPrizeIds.includes(p.id)).map(p => p.id)
                            setTempPrizeOrder([...assignedPrizeIds, ...remainingPrizeIds])
                            setShowDrawSettingsModal(true)
                          }}
                          variant="outline"
                          className="w-full"
                          size={isFullscreen ? "sm" : "sm"}
                        >
                          <Settings className={`${isFullscreen ? 'size-3' : 'size-4'} mr-2`} />
                          <span className={isFullscreen ? 'text-xs' : ''}>Draw Settings</span>
                        </Button>
                        
                        {/* Reset Draw Button */}
                        <Button
                          onClick={() => setShowResetDrawConfirmDialog(true)}
                          disabled={resetting || draws.length === 0}
                          variant="outline"
                          className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          size={isFullscreen ? "sm" : "sm"}
                        >
                          <RotateCcw className={`${isFullscreen ? 'size-3' : 'size-4'} mr-2`} />
                          <span className={isFullscreen ? 'text-xs' : ''}>{resetting ? "Resetting..." : "Reset Draw"}</span>
                        </Button>
                      </div>
                    </div>
                    
                    {entries.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground">Add entries to start the draw</p>
                    )}
                  </div>
                </div>
                
              </div>
            </div>
        )}

        {/* Marquee - Full width outside container, only in main view */}
        {currentView === "main" && settings?.marqueeEnabled && settings?.marqueeText && (
          <div 
            className={`w-full overflow-hidden border-2 border-gray-300 shadow-lg ${isFullscreen ? 'mt-4' : ''}`}
            style={{
              backgroundColor: settings.marqueeBackgroundColor || "#9ca3af",
              paddingTop: `${settings.marqueeBackgroundSize || 12}px`,
              paddingBottom: `${settings.marqueeBackgroundSize || 12}px`
            }}
          >
            <div className="marquee-container">
              <div 
                className="marquee-content"
                style={{
                  animationDuration: `${settings.marqueeSpeed || 30}s`
                }}
              >
                <span 
                  className="text-white font-black drop-shadow-lg whitespace-nowrap"
                  style={{
                    fontSize: `${settings.marqueeFontSize || 18}px`
                  }}
                >
                  {settings.marqueeText} • {settings.marqueeText} • {settings.marqueeText} • {settings.marqueeText} • {settings.marqueeText} • 
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Logos - Displayed below marquee, only in main view */}
        {currentView === "main" && settings?.logos && settings.logos.length > 0 && (
          <div className="w-full px-4 py-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {settings.logos
                .map((logoItem: string | { url: string; size: number; opacity?: number }) => {
                  // Handle backward compatibility: if logo is a string, convert to object
                  if (typeof logoItem === 'string') {
                    return { url: logoItem, size: 64, opacity: 100 }
                  }
                  return { ...logoItem, opacity: logoItem.opacity || 100 }
                })
                .filter((logo: { url: string; size: number; opacity?: number }) => logo.url && logo.url.trim())
                .map((logo: { url: string; size: number; opacity?: number }, index: number) => (
                  <div key={index} className="flex items-center justify-center">
                    <Image
                      src={logo.url}
                      alt={`Logo ${index + 1}`}
                      width={logo.size}
                      height={logo.size}
                      className="object-contain"
                      style={{ 
                        maxWidth: `${logo.size}px`, 
                        maxHeight: `${logo.size}px`, 
                        width: 'auto', 
                        height: 'auto',
                        opacity: `${(logo.opacity || 100) / 100}`
                      }}
                      onError={(e) => {
                        // Hide broken images
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Entries View */}
        {currentView === "entries" && (
          <section className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="size-5 text-blue-500" />
                Entries Management
              </h2>
              <div className="bg-blue-100 text-blue-600 rounded-full px-3 py-1 text-xs font-semibold">
                {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
              </div>
            </div>
            
            {/* Add/Edit Single Entry Form */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault()
                const input = e.currentTarget.querySelector('input') as HTMLInputElement
                const name = input?.value.trim()
                if (!name) return
                
                // Check for duplicates (skip if editing the same entry)
                if (!editingEntryId || name !== editingEntryName) {
                  const duplicateCheck = checkDuplicates([{ name }])
                  if (duplicateCheck.hasDuplicates) {
                    if (duplicateCheck.existingDuplicates.includes(name)) {
                      toast.error("This entry already exists")
                    } else {
                      toast.error("Duplicate entry detected")
                    }
                    return
                  }
                }
                
                setLoading(true)
                try {
                  if (editingEntryId) {
                    // Update existing entry
                    const res = await fetch(`/api/entries/${editingEntryId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name }),
                    })
                    
                    if (res.ok) {
                      input.value = ""
                      setEditingEntryId(null)
                      setEditingEntryName("")
                      await fetchEntries()
                      toast.success("Entry updated successfully!")
                    } else {
                      const error = await res.json()
                      toast.error(error.error || "Failed to update entry")
                    }
                  } else {
                    // Create new entry
                    const res = await fetch("/api/entries", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name }),
                    })
                    
                    if (res.ok) {
                      input.value = ""
                      await fetchEntries()
                      toast.success("Entry added successfully!")
                    } else {
                      const error = await res.json()
                      toast.error(error.error || "Failed to add entry")
                    }
                  }
                } catch (error) {
                  console.error("Error saving entry:", error)
                  toast.error(editingEntryId ? "Failed to update entry" : "Failed to add entry")
                } finally {
                  setLoading(false)
                }
              }}
              className="mb-4"
            >
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter participant name..."
                  value={editingEntryName}
                  onChange={(e) => setEditingEntryName(e.target.value)}
                  required
                  className="flex-1 border-blue-500 focus:border-blue-600"
                />
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  size="sm"
                >
                  {editingEntryId ? (
                    <>
                      <Edit2 className="size-4 mr-2" />
                      Update Entry
                    </>
                  ) : (
                    <>
                      <Plus className="size-4 mr-2" />
                      Add Entry
                    </>
                  )}
                </Button>
                {editingEntryId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingEntryId(null)
                      setEditingEntryName("")
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>

            {/* Excel/CSV Import */}
            <div className="mb-4 p-3 border rounded-lg bg-muted/50">
              <Label htmlFor="fileImport" className="mb-1 block font-semibold text-sm">
                <Upload className="size-4 inline mr-2" />
                Import from Excel/CSV
              </Label>
              <Input
                id="fileImport"
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
                onChange={handleFileImport}
                disabled={importing}
                className="mb-1"
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: CSV, TXT, Excel (.xlsx, .xls). Only the first column will be used as the name.
              </p>
            </div>

            <EntriesTable 
              entries={entries} 
              onDelete={handleDeleteEntry}
              onEdit={(id, name) => {
                setEditingEntryId(id)
                setEditingEntryName(name)
              }}
            />
          </section>
        )}

        {/* Prizes View */}
        {currentView === "prizes" && (
          <section className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Gift className="size-5 text-orange-500" />
                Prizes Management
              </h2>
              <div className="bg-orange-100 text-orange-600 rounded-full px-3 py-1 text-xs font-semibold">
                {prizes.length} {prizes.length === 1 ? 'Prize' : 'Prizes'}
              </div>
            </div>
            
            {/* Add/Edit Prize Form */}
            <form onSubmit={handlePrizeSubmit} className="mb-4">
              <div className="flex gap-2">
                <Input
                  id="prizeName"
                  value={prizeName}
                  onChange={(e) => setPrizeName(e.target.value)}
                  required
                  placeholder="Enter prize name..."
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={prizeLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  size="sm"
                >
                  <Plus className="size-4 mr-2" />
                  {editingPrizeId ? "Update Prize" : "Add Prize"}
                </Button>
                {editingPrizeId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPrizeName("")
                      setEditingPrizeId(null)
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>

            {/* Prizes List */}
            <PrizesTable prizes={prizes} onEdit={handleEditPrize} onDelete={handleDeletePrize} />
          </section>
        )}

        {/* Results View */}
        {currentView === "results" && (() => {
          // Flatten all winners from all draws
          const allWinners = draws.flatMap(draw => 
            draw.winners.map(winner => ({
              ...winner,
              drawId: draw.id,
              drawDate: new Date(draw.createdAt),
            }))
          )

          // Filter by search and prize
          const filteredWinners = allWinners.filter(winner => {
            const searchLower = resultsSearch.toLowerCase()
            const matchesSearch = (
              winner.entry.name.toLowerCase().includes(searchLower) ||
              winner.prize?.name.toLowerCase().includes(searchLower) ||
              winner.drawId.toLowerCase().includes(searchLower)
            )
            const matchesPrize = resultsPrizeFilter === "all" || winner.prizeId === resultsPrizeFilter
            return matchesSearch && matchesPrize
          })

          // Sort
          const sortedWinners = [...filteredWinners].sort((a, b) => {
            let comparison = 0
            if (resultsSortBy === "time") {
              comparison = a.drawDate.getTime() - b.drawDate.getTime()
            } else if (resultsSortBy === "prize") {
              const prizeA = a.prize?.name || "ZZZ"
              const prizeB = b.prize?.name || "ZZZ"
              comparison = prizeA.localeCompare(prizeB)
            }
            return resultsSortOrder === "asc" ? comparison : -comparison
          })

          // Paginate
          const totalPages = Math.ceil(sortedWinners.length / resultsPageSize)
          const startIndex = (resultsPage - 1) * resultsPageSize
          const paginatedWinners = sortedWinners.slice(startIndex, startIndex + resultsPageSize)

          return (
            <section className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="size-5 text-blue-500" />
                  Results & Draw History
                </h2>
                <Button
                  onClick={handleExportToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Download className="size-4 mr-2" />
                  Export to Excel
                </Button>
              </div>

              {/* Search, Filter and Sort Controls */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    type="text"
                    placeholder="Search by winner name, prize, or draw ID..."
                    value={resultsSearch}
                    onChange={(e) => {
                      setResultsSearch(e.target.value)
                      setResultsPage(1) // Reset to first page on search
                    }}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="prizeFilter" className="text-sm whitespace-nowrap">Filter by prize:</Label>
                  <select
                    id="prizeFilter"
                    value={resultsPrizeFilter}
                    onChange={(e) => {
                      setResultsPrizeFilter(e.target.value)
                      setResultsPage(1)
                    }}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="all">All Prizes</option>
                    {prizes.map(prize => (
                      <option key={prize.id} value={prize.id}>{prize.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="sortBy" className="text-sm whitespace-nowrap">Sort by:</Label>
                  <select
                    id="sortBy"
                    value={resultsSortBy}
                    onChange={(e) => {
                      setResultsSortBy(e.target.value as "time" | "prize")
                      setResultsPage(1)
                    }}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="time">Time</option>
                    <option value="prize">Prize</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setResultsSortOrder(resultsSortOrder === "asc" ? "desc" : "asc")
                      setResultsPage(1)
                    }}
                    className="whitespace-nowrap"
                  >
                    {resultsSortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                  </Button>
                </div>
              </div>

              {draws.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="size-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No draws have been conducted yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">Start a draw to see results here.</p>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-16">#</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Winner Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Prize</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Draw ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y">
                        {paginatedWinners.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                              No results found
                            </td>
                          </tr>
                        ) : (
                          paginatedWinners.map((winner, index) => {
                            const status = winner.status || 'present'
                            return (
                              <tr key={winner.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-600 font-medium">
                                  {startIndex + index + 1}
                                </td>
                                <td className="px-4 py-3 font-medium">{winner.entry.name}</td>
                                <td className="px-4 py-3">
                                  {winner.prize ? (
                                    <span className="text-orange-600 font-medium">{winner.prize.name}</span>
                                  ) : (
                                    <span className="text-muted-foreground">N/A</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {status === 'present' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Present
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Not Present
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                                  {winner.drawId.slice(-8)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {winner.drawDate.toLocaleString()}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {sortedWinners.length > 0 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rows per page</span>
                        <select
                          value={resultsPageSize}
                          onChange={(e) => {
                            setResultsPageSize(Number(e.target.value))
                            setResultsPage(1) // Reset to first page when changing page size
                          }}
                          className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 px-2">
                          Page {resultsPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setResultsPage(1)}
                          disabled={resultsPage === 1}
                          className="min-w-[40px]"
                        >
                          <ChevronsLeft className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setResultsPage(prev => Math.max(1, prev - 1))}
                          disabled={resultsPage === 1}
                          className="min-w-[40px]"
                        >
                          <ChevronLeft className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setResultsPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={resultsPage === totalPages}
                          className="min-w-[40px]"
                        >
                          <ChevronRight className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setResultsPage(totalPages)}
                          disabled={resultsPage === totalPages}
                          className="min-w-[40px]"
                        >
                          <ChevronsRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Merged Present/Not Present Winners Card */}
                  {sortedWinners.length > 0 && (() => {
                    const presentWinners = sortedWinners.filter(w => (w.status || 'present') === 'present')
                    const notPresentWinners = sortedWinners.filter(w => (w.status || 'present') === 'not_present')
                    const currentWinners = winnersCardStatus === 'present' ? presentWinners : notPresentWinners
                    const totalPages = Math.ceil(currentWinners.length / winnersCardPageSize)
                    const startIndex = (winnersCardPage - 1) * winnersCardPageSize
                    const paginatedWinners = currentWinners.slice(startIndex, startIndex + winnersCardPageSize)
                    
                    return (
                      <div className="mt-6 border-2 rounded-lg p-4" style={{
                        borderColor: winnersCardStatus === 'present' ? '#86efac' : '#fca5a5',
                        backgroundColor: winnersCardStatus === 'present' ? '#f0fdf4' : '#fef2f2'
                      }}>
                        {/* Header with Tabs and Export */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant={winnersCardStatus === 'present' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                setWinnersCardStatus('present')
                                setWinnersCardPage(1)
                              }}
                              className={winnersCardStatus === 'present' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                            >
                              <Trophy className="size-4 mr-2" />
                              Present Winners
                              <span className="ml-2 bg-white/20 rounded-full px-2 py-0.5 text-xs font-bold">
                                {presentWinners.length}
                              </span>
                            </Button>
                            <Button
                              variant={winnersCardStatus === 'not_present' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                setWinnersCardStatus('not_present')
                                setWinnersCardPage(1)
                              }}
                              className={winnersCardStatus === 'not_present' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                            >
                              <X className="size-4 mr-2" />
                              Not Present Winners
                              <span className="ml-2 bg-white/20 rounded-full px-2 py-0.5 text-xs font-bold">
                                {notPresentWinners.length}
                              </span>
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleExportWinnersByStatus(winnersCardStatus, 'excel')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <FileSpreadsheet className="size-4 mr-2" />
                              Export Excel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleExportWinnersByStatus(winnersCardStatus, 'pdf')}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <File className="size-4 mr-2" />
                              Export PDF
                            </Button>
                          </div>
                        </div>

                        {/* Winners List */}
                        <div className="space-y-2 min-h-[200px]">
                          {paginatedWinners.length === 0 ? (
                            <p className={`text-sm text-center py-8 ${winnersCardStatus === 'present' ? 'text-green-600' : 'text-red-600'}`}>
                              No {winnersCardStatus === 'present' ? 'present' : 'not present'} winners
                            </p>
                          ) : (
                            paginatedWinners.map((winner) => (
                              <div
                                key={winner.id}
                                className="bg-white border rounded p-3 flex items-center justify-between shadow-sm"
                                style={{
                                  borderColor: winnersCardStatus === 'present' ? '#86efac' : '#fca5a5'
                                }}
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">{winner.entry.name}</p>
                                  {winner.prize && (
                                    <p className="text-xs text-gray-500 mt-1">{winner.prize.name}</p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">{winner.drawDate.toLocaleString()}</p>
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  winnersCardStatus === 'present' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {winnersCardStatus === 'present' ? 'Present' : 'Not Present'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Pagination */}
                        {currentWinners.length > 0 && (
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Rows per page</span>
                              <select
                                value={winnersCardPageSize}
                                onChange={(e) => {
                                  setWinnersCardPageSize(Number(e.target.value))
                                  setWinnersCardPage(1)
                                }}
                                className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 px-2">
                                Page {winnersCardPage} of {totalPages}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setWinnersCardPage(1)}
                                disabled={winnersCardPage === 1}
                                className="min-w-[40px]"
                              >
                                <ChevronsLeft className="size-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setWinnersCardPage(prev => Math.max(1, prev - 1))}
                                disabled={winnersCardPage === 1}
                                className="min-w-[40px]"
                              >
                                <ChevronLeft className="size-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setWinnersCardPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={winnersCardPage === totalPages}
                                className="min-w-[40px]"
                              >
                                <ChevronRight className="size-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setWinnersCardPage(totalPages)}
                                disabled={winnersCardPage === totalPages}
                                className="min-w-[40px]"
                              >
                                <ChevronsRight className="size-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </>
              )}
            </section>
          )
        })()}

        {/* Settings View */}
        {currentView === "settings" && (
          <section className="bg-card border rounded-lg p-4">
            <SettingsPanel onSettingsChange={setSettings} />
          </section>
        )}
          </div>
        </main>
      </div>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Import Progress Modal */}
      {showImportProgress && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <h3 className="text-lg font-semibold">Importing Entries</h3>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{importProgress.percentage}%</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${importProgress.percentage}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{importProgress.current} of {importProgress.total} entries</span>
                <span>{importProgress.total > 0 ? Math.round((importProgress.current / importProgress.total) * 100) : 0}%</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Please wait while entries are being imported...
            </p>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog for Adding Entries */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Add Entries</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to add {pendingEntryCount} {pendingEntryCount === 1 ? 'entry' : 'entries'}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowConfirmDialog(false)
              setPendingAction(null)
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (pendingAction) {
                pendingAction()
              }
            }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog for Deleting Entry */}
      <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the entry "{pendingDeleteEntryName}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteConfirmDialog(false)
              setPendingDeleteEntryId(null)
              setPendingDeleteEntryName("")
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEntry}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog for Deleting Prize */}
      <AlertDialog open={showDeletePrizeConfirmDialog} onOpenChange={setShowDeletePrizeConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete Prize</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the prize "{pendingDeletePrizeName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeletePrizeConfirmDialog(false)
              setPendingDeletePrizeId(null)
              setPendingDeletePrizeName("")
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePrize}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Draw Settings Modal */}
      {showDrawSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowDrawSettingsModal(false)
              setTempPrizeAssignments([])
              setTempPrizeOrder([])
              setDraggedPrizeIndex(null)
            }}
          />
          
          {/* Modal Content */}
          <div className="relative z-50 bg-background border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2">
                <Settings className="size-5" />
                <h2 className="text-xl font-semibold">Draw Settings</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowDrawSettingsModal(false)
                  setTempPrizeAssignments([])
                  setTempPrizeOrder([])
                  setDraggedPrizeIndex(null)
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
            
            <p className="px-6 pt-4 text-sm text-muted-foreground">
              Configure how many winners each prize will have
            </p>

            {/* Prize List - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {prizes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="size-12 mx-auto mb-2 opacity-50" />
                  <p>No prizes available. Add prizes first.</p>
                </div>
              ) : (() => {
                // Use tempPrizeOrder if available, otherwise use prizes order
                const orderedPrizeIds = tempPrizeOrder.length > 0 && tempPrizeOrder.length === prizes.length
                  ? tempPrizeOrder
                  : prizes.map(p => p.id)
                
                // Get prizes in the ordered sequence
                const orderedPrizes = orderedPrizeIds
                  .map(id => prizes.find(p => p.id === id))
                  .filter((p): p is Prize => p !== undefined)
                
                return orderedPrizes.map((prize, index) => {
                  // Use tempPrizeAssignments if modal is open and has data, otherwise use prizeAssignments
                  const assignmentsToUse = showDrawSettingsModal && tempPrizeAssignments.length > 0 
                    ? tempPrizeAssignments 
                    : prizeAssignments
                  const assignment = assignmentsToUse.find(a => a.prizeId === prize.id)
                  const currentCount = assignment?.count || 0
                  
                  // Calculate max allowed for this prize
                  const otherAssignmentsTotal = assignmentsToUse
                    .filter(a => a.prizeId !== prize.id)
                    .reduce((sum, a) => sum + (a.count || 0), 0)
                  const maxAllowed = Math.max(0, entries.length - otherAssignmentsTotal)
                  
                  const prizeColors = [
                    "bg-blue-500", "bg-indigo-600", "bg-green-500", "bg-orange-500",
                    "bg-purple-500", "bg-pink-500", "bg-red-500", "bg-yellow-500",
                    "bg-teal-500", "bg-cyan-500"
                  ]
                  const prizeColor = prizeColors[index % prizeColors.length]

                  const isDragging = draggedPrizeIndex === index
                  const isDragOver = dragOverIndex === index && draggedPrizeIndex !== null && draggedPrizeIndex !== index
                  
                  return (
                    <div 
                      key={prize.id} 
                      draggable
                      onDragStart={(e) => {
                        setDraggedPrizeIndex(index)
                        e.dataTransfer.effectAllowed = "move"
                        // Create a custom drag image with rotation effect
                        const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
                        dragImage.style.opacity = "0.8"
                        dragImage.style.transform = "rotate(5deg) scale(1.05)"
                        dragImage.style.width = e.currentTarget.offsetWidth + "px"
                        dragImage.style.boxShadow = "0 10px 25px rgba(0,0,0,0.3)"
                        document.body.appendChild(dragImage)
                        e.dataTransfer.setDragImage(dragImage, e.currentTarget.offsetWidth / 2, e.currentTarget.offsetHeight / 2)
                        setTimeout(() => document.body.removeChild(dragImage), 0)
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault()
                        if (draggedPrizeIndex !== null && draggedPrizeIndex !== index) {
                          setDragOverIndex(index)
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = "move"
                        if (draggedPrizeIndex !== null && draggedPrizeIndex !== index) {
                          setDragOverIndex(index)
                        }
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault()
                        // Only clear if we're actually leaving the element (not entering a child)
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = e.clientX
                        const y = e.clientY
                        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                          setDragOverIndex(null)
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (draggedPrizeIndex === null || draggedPrizeIndex === index) return
                        
                        const newOrder = [...orderedPrizeIds]
                        const [removed] = newOrder.splice(draggedPrizeIndex, 1)
                        newOrder.splice(index, 0, removed)
                        setTempPrizeOrder(newOrder)
                        setDraggedPrizeIndex(null)
                        setDragOverIndex(null)
                      }}
                      onDragEnd={() => {
                        setDraggedPrizeIndex(null)
                        setDragOverIndex(null)
                      }}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-move transition-all relative ${
                        isDragging 
                          ? 'opacity-30 scale-95 bg-gray-100 border-dashed border-2 border-blue-400' 
                          : isDragOver
                          ? 'bg-blue-50 border-blue-400 border-2 shadow-lg scale-105 transform'
                          : 'hover:bg-gray-50 hover:shadow-md'
                      }`}
                      style={{
                        transform: isDragging ? 'scale(0.95) rotate(2deg)' : isDragOver ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.2s ease-in-out',
                        zIndex: isDragging ? 50 : isDragOver ? 10 : 1
                      }}
                    >
                      {/* Drop indicator line */}
                      {isDragOver && (
                        <div className="absolute -top-1 left-0 right-0 h-1 bg-blue-500 rounded-full animate-pulse" />
                      )}
                      {/* Drag Handle */}
                      <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      
                      {/* Position Number */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm shrink-0">
                        {index + 1}
                      </div>
                      
                      {/* Colored Circle */}
                      <div className={`${prizeColor} rounded-full size-4 shrink-0`} />
                      
                      {/* Prize Name */}
                      <span className="flex-1 text-sm font-medium">{prize.name}</span>
                      
                      {/* Winners Label */}
                      <span className="text-sm text-muted-foreground">Winners:</span>
                      
                      {/* Increment/Decrement Controls */}
                      <div className="flex items-center gap-1 border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 h-8"
                          onClick={() => {
                            const currentAssignments = showDrawSettingsModal && tempPrizeAssignments.length > 0 
                              ? tempPrizeAssignments 
                              : prizeAssignments
                            const newAssignments = [...currentAssignments]
                            const existingIndex = newAssignments.findIndex(a => a.prizeId === prize.id)
                            if (existingIndex >= 0) {
                              newAssignments[existingIndex].count = Math.max(0, newAssignments[existingIndex].count - 1)
                              if (newAssignments[existingIndex].count === 0) {
                                newAssignments.splice(existingIndex, 1)
                              }
                            }
                            setTempPrizeAssignments(newAssignments)
                          }}
                          disabled={currentCount === 0}
                        >
                          <Minus className="size-4" />
                        </Button>
                        
                        <div className="px-3 py-1 min-w-[3rem] text-center text-sm font-medium">
                          {currentCount}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 h-8"
                          onClick={() => {
                            const currentAssignments = showDrawSettingsModal && tempPrizeAssignments.length > 0 
                              ? tempPrizeAssignments 
                              : prizeAssignments
                            // Recalculate maxAllowed based on current assignments
                            const otherTotal = currentAssignments
                              .filter(a => a.prizeId !== prize.id)
                              .reduce((sum, a) => sum + (a.count || 0), 0)
                            const currentMaxAllowed = Math.max(0, entries.length - otherTotal)
                            
                            const newAssignments = [...currentAssignments]
                            const existingIndex = newAssignments.findIndex(a => a.prizeId === prize.id)
                            if (existingIndex >= 0) {
                              newAssignments[existingIndex].count = Math.min(currentMaxAllowed, newAssignments[existingIndex].count + 1)
                            } else {
                              newAssignments.push({ prizeId: prize.id, count: 1 })
                            }
                            setTempPrizeAssignments(newAssignments)
                          }}
                          disabled={currentCount >= maxAllowed}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>

            {/* Summary and Validation */}
            <div className="px-6 py-4 border-t bg-blue-50/50 dark:bg-blue-950/20">
              {(() => {
                const assignmentsToUse = showDrawSettingsModal && tempPrizeAssignments.length > 0 
                  ? tempPrizeAssignments 
                  : prizeAssignments
                const totalWinners = assignmentsToUse.reduce((sum, a) => sum + (a.count || 0), 0)
                const availableEntries = entries.length
                const difference = totalWinners - availableEntries
                
                return (
                  <>
                    <div className="text-sm mb-2">
                      <span className="text-muted-foreground">Total winners needed: </span>
                      <span className="font-bold">{totalWinners}</span>
                      <span className="text-muted-foreground"> / </span>
                      <span className="font-bold">{availableEntries}</span>
                      <span className="text-muted-foreground"> entries</span>
                    </div>
                    {difference > 0 && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Not enough entries for this configuration. Need {difference} more.
                      </p>
                    )}
                  </>
                )
              })()}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDrawSettingsModal(false)
                  setTempPrizeAssignments([]) // Reset temp state on cancel
                  setTempPrizeOrder([])
                  setDraggedPrizeIndex(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  // Reorder assignments based on tempPrizeOrder
                  const assignmentsToSave = tempPrizeAssignments.length > 0 ? tempPrizeAssignments : []
                  
                  // Reorder assignments to match the prize order
                  let orderedAssignments = tempPrizeOrder.length > 0 && tempPrizeOrder.length === prizes.length
                    ? tempPrizeOrder
                        .map(prizeId => assignmentsToSave.find(a => a.prizeId === prizeId))
                        .filter((a): a is { prizeId: string; count: number } => a !== undefined)
                    : assignmentsToSave
                  
                  // Filter out prizes with 0 winners and sort by prize order (ascending)
                  // Get prize indices for sorting
                  const prizeIndexMap = new Map(prizes.map((p, index) => [p.id, index]))
                  
                  // Filter out assignments with count = 0, then sort by prize order (ascending)
                  orderedAssignments = orderedAssignments
                    .filter(a => a.count > 0 && a.prizeId && a.prizeId.trim() !== "")
                    .sort((a, b) => {
                      const indexA = prizeIndexMap.get(a.prizeId) ?? Infinity
                      const indexB = prizeIndexMap.get(b.prizeId) ?? Infinity
                      return indexA - indexB // Ascending order
                    })
                  
                  setPrizeAssignments(orderedAssignments)
                  
                  // Save to database
                  try {
                    await saveDrawSettings(orderedAssignments)
                    setShowDrawSettingsModal(false)
                    setTempPrizeAssignments([]) // Clear temp state
                    setTempPrizeOrder([])
                    setDraggedPrizeIndex(null)
                    toast.success("Draw settings saved")
                  } catch (error) {
                    toast.error("Failed to save draw settings")
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Save & Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Clearing All Prize Assignments */}
      <AlertDialog open={showClearAllConfirmDialog} onOpenChange={setShowClearAllConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Clear All</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all prize assignments? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowClearAllConfirmDialog(false)
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setPrizeAssignments([])
              setShowClearAllConfirmDialog(false)
            }}>
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog for Resetting Draws */}
      <AlertDialog open={showResetDrawConfirmDialog} onOpenChange={setShowResetDrawConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reset Draw</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all draws? This will delete all previous winners and draw history. 
              This action cannot be undone. All entries will become available for future draws.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowResetDrawConfirmDialog(false)
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetDraws}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {resetting ? "Resetting..." : "Reset All Draws"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Winner Modal with Confetti */}
      {showWinnerModal && winnerData && (
        <>
          {/* React Confetti */}
          {showConfetti && windowSize.width > 0 && windowSize.height > 0 && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.3}
            />
          )}
          
          {/* Winner Modal */}
          <div className="fixed inset-0 z-[9998] flex items-center justify-center">
            {/* Overlay - No click handler to disable outside clicks */}
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <div className="relative z-[9999] bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-700">
              
              {/* Header with Trophy */}
              <div className="text-center pt-10 pb-6 px-6">
                {/* Trophy Icon in Orange Circle */}
                <div className="flex justify-center mb-4">
                  <div className="bg-orange-500 rounded-full p-4 shadow-lg shadow-orange-500/50">
                    <Trophy className="size-12 text-white" />
                  </div>
                </div>
                
                {/* Winner Announced Text */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Sparkles className="size-4 text-orange-500" />
                  <h1 className="text-lg font-semibold text-white uppercase tracking-wide">
                    Winner Announced
                  </h1>
                  <Sparkles className="size-4 text-orange-500" />
                </div>
              </div>
              
              {/* Winner Details */}
              <div className="px-6 pb-8">
                {winnerData.winners.map((winner) => {
                  const prize = prizes.find(p => p.id === winner.prizeId)
                  return (
                    <div
                      key={winner.id}
                      className="bg-gray-700/50 rounded-xl p-6 text-center"
                    >
                      {/* Winner Name */}
                      <h2 className="text-4xl font-bold text-white mb-4">
                        {winner.entry.name.toUpperCase()}
                      </h2>
                      
                      {/* Prize with Decorative Lines */}
                      {prize && (
                        <div className="flex items-center justify-center gap-3">
                          <div className="h-px w-8 bg-orange-500"></div>
                          <span className="text-xl font-semibold text-orange-500 uppercase tracking-wide">
                            {prize.name.toUpperCase()}
                          </span>
                          <div className="h-px w-8 bg-orange-500"></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {/* Footer Buttons */}
              <div className="px-6 pb-6 flex gap-3">
                <Button
                  onClick={async () => {
                    if (winnerData.winners.length > 0) {
                      const winner = winnerData.winners[0]
                      try {
                        // Update status to "not_present" instead of deleting
                        const res = await fetch(`/api/winners/${winner.id}`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ status: 'not_present' }),
                        })
                        if (res.ok) {
                          // Mark as not present but don't decrease count
                          // Remove winner from entries list
                          setEntries(prevEntries => prevEntries.filter(e => e.id !== winner.entry.id))
                          stopModalMusic()
                          setShowWinnerModal(false)
                          setWinnerData(null)
                          // Reset roulette to starting position
                          setAnimationOffset(0)
                          offsetRef.current = 0
                          lockedPositionRef.current = null
                          isLockedPositionRef.current = false
                          disableWrappingRef.current = false
                          await fetchDraws()
                        }
                      } catch (error) {
                        console.error("Error updating winner status:", error)
                      }
                    }
                  }}
                  variant="outline"
                  className="flex-1 bg-red-600 text-white hover:bg-red-700 font-medium py-3 rounded-lg border-red-600"
                  size="lg"
                >
                  Remove
                </Button>
                <Button
                  onClick={async () => {
                    if (winnerData.winners.length > 0) {
                      const winner = winnerData.winners[0]
                      try {
                        // Update status to "present"
                        const res = await fetch(`/api/winners/${winner.id}`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ status: 'present' }),
                        })
                        if (res.ok) {
                          // Mark as present AND decrease remaining count by 1
                          // Get current prize assignment first
                          const filteredAssignments = prizeAssignments.filter(a => a.prizeId && a.prizeId.trim() !== "" && a.count > 0)
                          if (currentPrizeIndex < filteredAssignments.length) {
                            const currentAssignment = filteredAssignments[currentPrizeIndex]
                            
                            // Increment winner count and decrease remainingWinners by 1
                            setCurrentPrizeWinnerCount(prev => {
                              const newCount = prev + 1
                              
                              // Recalculate remaining winners
                              const newRemaining = Math.max(0, currentAssignment.count - newCount)
                              
                              // If remaining reaches 0 and there's a next prize, move to next prize
                              if (newRemaining === 0 && currentPrizeIndex < filteredAssignments.length - 1) {
                                const nextIndex = currentPrizeIndex + 1
                                const nextAssignment = filteredAssignments[nextIndex]
                                
                                if (nextAssignment) {
                                  // Update to next prize
                                  setCurrentPrizeIndex(nextIndex)
                                  setRemainingWinners(nextAssignment.count)
                                  const nextPrize = prizes.find(p => p.id === nextAssignment.prizeId)
                                  if (nextPrize) {
                                    setCurrentPrizeName(nextPrize.name)
                                  }
                                }
                                
                                // Reset count for next prize
                                return 0
                              } else if (newRemaining === 0 && currentPrizeIndex >= filteredAssignments.length - 1) {
                                // Last prize completed - finish drawing but stay on main view
                                setIsDrawingInProgress(false)
                                setCurrentPrizeName("")
                                setRemainingWinners(0)
                                setCurrentPrizeIndex(0)
                                setCurrentPrizeWinnerCount(0)
                                // Don't navigate to results - stay on main view
                              } else {
                                // Update remaining count for current prize
                                setRemainingWinners(newRemaining)
                              }
                              
                              return newCount
                            })
                          } else {
                            // Fallback: just decrease remainingWinners
                            setRemainingWinners(prev => Math.max(0, prev - 1))
                          }
                          // Remove winner from entries list
                          setEntries(prevEntries => prevEntries.filter(e => e.id !== winner.entry.id))
                          stopModalMusic()
                          setShowWinnerModal(false)
                          setWinnerData(null)
                          // Reset roulette to starting position
                          setAnimationOffset(0)
                          offsetRef.current = 0
                          lockedPositionRef.current = null
                          isLockedPositionRef.current = false
                          disableWrappingRef.current = false
                          await fetchDraws()
                          
                          // Ensure we stay on main view (don't navigate to results)
                          if (currentView !== "main") {
                            setCurrentView("main")
                          }
                        }
                      } catch (error) {
                        console.error("Error updating winner status:", error)
                      }
                    }
                  }}
                  className="flex-1 bg-gray-700 text-white hover:bg-gray-600 font-medium py-3 rounded-lg"
                  size="lg"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
