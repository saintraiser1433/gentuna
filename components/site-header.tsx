"use client"

import { useEffect, useState } from "react"
import { Sparkles, Trophy, Settings, Sun, Moon, Users, Gift, FileText, Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"

type View = "main" | "entries" | "prizes" | "settings" | "results"

interface SiteHeaderProps {
  currentView: View
  onViewChange: (view: View) => void
  entriesCount: number
  prizesCount?: number
}

export function SiteHeader({ currentView, onViewChange, entriesCount, prizesCount = 0 }: SiteHeaderProps) {
  const [logo, setLogo] = useState<{ type: "text" | "image" | "icon"; value: string } | null>(null)
  const [systemName, setSystemName] = useState("Random Name Lucky Draw System")
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem("drawSettings")
      if (saved) {
        try {
          const settings = JSON.parse(saved)
          setLogo({ type: settings.logoType || "icon", value: settings.logo || "" })
          setSystemName(settings.systemName || "Random Name Lucky Draw System")
        } catch (e) {
          console.error("Error loading header settings:", e)
        }
      } else {
        // Default values - icon type with Trophy
        setLogo({ type: "icon", value: "" })
        setSystemName("Random Name Lucky Draw System")
      }
    }

    loadSettings()
    // Listen for storage changes (when settings are updated in other tabs)
    window.addEventListener("storage", loadSettings)
    // Listen for custom event (when settings are updated in same tab)
    window.addEventListener("settingsUpdated", loadSettings)
    // Also check periodically as fallback
    const interval = setInterval(loadSettings, 1000)
    
    return () => {
      window.removeEventListener("storage", loadSettings)
      window.removeEventListener("settingsUpdated", loadSettings)
      clearInterval(interval)
    }
  }, [])

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const initialTheme = prefersDark ? "dark" : "light"
      setTheme(initialTheme)
      document.documentElement.classList.toggle("dark", initialTheme === "dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

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

  const toggleFullscreen = async () => {
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
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error)
    }
  }

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full flex-col border-b">
      <div className="flex h-(--header-height) w-full items-center gap-4 px-4">
        <div className="flex items-center gap-2">
          {logo?.type === "image" && logo.value ? (
            <img src={logo.value} alt="Logo" className="h-8 w-auto" />
          ) : logo?.type === "text" && logo.value ? (
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <span className="text-xs font-bold">{logo.value}</span>
            </div>
          ) : (
            <div className="bg-green-500 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
              <Trophy className="size-5" />
            </div>
          )}
          <span className="font-medium">{systemName}</span>
        </div>
        
        {/* Navigation Tabs */}
        <div className="ml-auto flex items-center gap-2 overflow-x-auto">
          <Button
            variant={currentView === "main" ? "default" : "ghost"}
            onClick={() => onViewChange("main")}
            className="whitespace-nowrap"
            size="sm"
          >
            <Sparkles className="size-4 mr-2" />
            Main
          </Button>
          <Button
            variant={currentView === "entries" ? "default" : "ghost"}
            onClick={() => onViewChange("entries")}
            className="whitespace-nowrap"
            size="sm"
          >
            <Users className="size-4 mr-2" />
            Entries
            {entriesCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 text-xs font-semibold">
                {entriesCount}
              </span>
            )}
          </Button>
          <Button
            variant={currentView === "prizes" ? "default" : "ghost"}
            onClick={() => onViewChange("prizes")}
            className="whitespace-nowrap"
            size="sm"
          >
            <Gift className="size-4 mr-2" />
            Prizes
            {prizesCount > 0 && (
              <span className="ml-2 bg-orange-100 text-orange-600 rounded-full px-2 py-0.5 text-xs font-semibold">
                {prizesCount}
              </span>
            )}
          </Button>
          <Button
            variant={currentView === "results" ? "default" : "ghost"}
            onClick={() => onViewChange("results")}
            className="whitespace-nowrap"
            size="sm"
          >
            <FileText className="size-4 mr-2" />
            Results
          </Button>
          <Button
            variant={currentView === "settings" ? "default" : "ghost"}
            onClick={() => onViewChange("settings")}
            className="whitespace-nowrap"
            size="sm"
          >
            <Settings className="size-4 mr-2" />
            Settings
          </Button>
          
          {/* Theme Toggle and Fullscreen */}
          <div className="ml-2 border-l pl-2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="size-9"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="size-5" />
              ) : (
                <Sun className="size-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="size-9"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="size-5" />
              ) : (
                <Maximize className="size-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
