"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Palette, Type, Volume2, Music, Plus, X } from "lucide-react"
import { toast } from "react-toastify"
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

interface SettingsData {
  logo: string
  logoType: "text" | "image" | "icon"
  primaryColor: string
  backgroundColor: string
  fontFamily: string
  systemName: string
  revealDelay?: number
  spinTime?: number
  marqueeEnabled?: boolean
  marqueeText?: string
  marqueeSpeed?: number
  marqueeBackgroundColor?: string // Custom background color for marquee
  marqueeFontSize?: number // Custom font size for marquee text
  marqueeBackgroundSize?: number // Custom padding/height for marquee background
  prizeTitleBackgroundColor?: string // Custom background color for prize title banner
  prizeTitleFontSize?: number // Custom font size for prize title text
  prizeTitleBackgroundSize?: number // Custom padding/height for prize title background
  verticalRouletteTextSize?: number // Custom font size for vertical roulette entry names
  verticalRouletteContainerHeight?: number // Custom height for vertical roulette entry containers
  logos?: Array<{ url: string; size: number; opacity?: number }> // Array of logo objects with URL, size, and opacity
  soundEnabled?: boolean
  drawSound?: string // Draw/roulette sound (data URL or file path), default is ticking sound
  modalMusic?: string
  modalMusicVolume?: number
}

export function SettingsPanel({ onSettingsChange }: { onSettingsChange: (settings: SettingsData) => void }) {
  // Toast notifications using react-toastify
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [settings, setSettings] = useState<SettingsData>({
    logo: "",
    logoType: "icon",
    primaryColor: "#000000",
    backgroundColor: "#ffffff",
    fontFamily: "Archivo",
    systemName: "Random Name Lucky Draw System",
    revealDelay: 3,
    spinTime: 5,
    marqueeEnabled: false,
    marqueeText: "",
    marqueeSpeed: 30,
    marqueeBackgroundColor: "#9ca3af", // Default gray-400
    marqueeFontSize: 18, // Default font size in px
    marqueeBackgroundSize: 12, // Default padding in px (py-3 = 12px)
    prizeTitleBackgroundColor: "#9ca3af", // Default gray-400
    prizeTitleFontSize: 48, // Default font size in px (text-5xl)
    prizeTitleBackgroundSize: 12, // Default padding in px (p-3 = 12px)
    verticalRouletteTextSize: 18, // Default font size in px (text-lg)
    verticalRouletteContainerHeight: 70, // Default container height in px
    logos: [],
    soundEnabled: true,
    modalMusic: "",
    modalMusicVolume: 0.5,
  })

  useEffect(() => {
    // Load saved settings from localStorage
    const saved = localStorage.getItem("drawSettings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure systemName exists (for backward compatibility)
        if (!parsed.systemName) {
          parsed.systemName = "Random Name Lucky Draw System"
        }
        // Always use icon type for logo
        parsed.logoType = "icon"
        parsed.logo = ""
        // Set default values for animation settings if not present
        if (parsed.revealDelay === undefined) parsed.revealDelay = 3
        if (parsed.spinTime === undefined) parsed.spinTime = 5
        if (parsed.marqueeEnabled === undefined) parsed.marqueeEnabled = false
        if (parsed.logos === undefined) parsed.logos = []
        // Convert old string array format to new object format for backward compatibility
        if (parsed.logos && parsed.logos.length > 0 && typeof parsed.logos[0] === 'string') {
          parsed.logos = (parsed.logos as string[]).map((logo: string) => ({ url: logo, size: 64, opacity: 100 }))
        }
        // Ensure opacity exists for existing logo objects
        if (parsed.logos && parsed.logos.length > 0 && typeof parsed.logos[0] === 'object' && parsed.logos[0] && !('opacity' in parsed.logos[0])) {
          parsed.logos = parsed.logos.map((logo: any) => ({ ...logo, opacity: logo.opacity || 100 }))
        }
        if (parsed.marqueeText === undefined) parsed.marqueeText = ""
        if (parsed.marqueeSpeed === undefined) parsed.marqueeSpeed = 30
        if (parsed.marqueeBackgroundColor === undefined) parsed.marqueeBackgroundColor = "#9ca3af" // Default gray-400
        if (parsed.marqueeFontSize === undefined) parsed.marqueeFontSize = 18 // Default font size
        if (parsed.marqueeBackgroundSize === undefined) parsed.marqueeBackgroundSize = 12 // Default padding
        if (parsed.prizeTitleBackgroundColor === undefined) parsed.prizeTitleBackgroundColor = "#9ca3af" // Default gray-400
        if (parsed.prizeTitleFontSize === undefined) parsed.prizeTitleFontSize = 48 // Default font size
        if (parsed.prizeTitleBackgroundSize === undefined) parsed.prizeTitleBackgroundSize = 12 // Default padding
        if (parsed.verticalRouletteTextSize === undefined) parsed.verticalRouletteTextSize = 18 // Default font size
        if (parsed.verticalRouletteContainerHeight === undefined) parsed.verticalRouletteContainerHeight = 70 // Default container height
        if (parsed.soundEnabled === undefined) parsed.soundEnabled = true
        if (parsed.modalMusic === undefined) parsed.modalMusic = ""
        if (parsed.modalMusicVolume === undefined) parsed.modalMusicVolume = 0.5
        setSettings(parsed)
        onSettingsChange(parsed)
      } catch (e) {
        console.error("Error loading settings:", e)
      }
    }
  }, [onSettingsChange])

  const handleSave = () => {
    setShowConfirmDialog(true)
  }

  const confirmSave = () => {
    localStorage.setItem("drawSettings", JSON.stringify(settings))
    onSettingsChange(settings)
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("settingsUpdated"))
    setShowConfirmDialog(false)
    toast.success("Settings saved successfully!")
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="size-5" />
        <h2 className="text-2xl font-bold">Settings & Customization</h2>
      </div>

      {/* System Name */}
      <div className="space-y-2">
        <Label htmlFor="systemName">System Name</Label>
        <Input
          id="systemName"
          value={settings.systemName}
          onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
          placeholder="Random Name Lucky Draw System"
        />
        <p className="text-sm text-muted-foreground">This name will appear in the top bar</p>
      </div>

      {/* Logo Info */}
      <div className="space-y-2">
        <Label>Logo</Label>
        <p className="text-sm text-muted-foreground">Using Trophy icon with green background</p>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="primaryColor">
            <Palette className="size-4 inline mr-2" />
            Primary Color
          </Label>
          <div className="flex gap-2">
            <Input
              id="primaryColor"
              type="color"
              value={settings.primaryColor}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={settings.primaryColor}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
              placeholder="#000000"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="backgroundColor">Background Color</Label>
          <div className="flex gap-2">
            <Input
              id="backgroundColor"
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={settings.backgroundColor}
              onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <Label htmlFor="fontFamily">
          <Type className="size-4 inline mr-2" />
          Font Family
        </Label>
        <select
          id="fontFamily"
          value={settings.fontFamily}
          onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="Archivo">Archivo</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Courier New">Courier New</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="Impact">Impact</option>
        </select>
      </div>

      {/* Animation Settings */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold">Animation Settings</h3>
        
        {/* Reveal Delay */}
        <div className="space-y-2">
          <Label htmlFor="revealDelay">Winner Reveal Delay</Label>
          <div className="flex items-center gap-3">
            <Input
              id="revealDelay"
              type="number"
              min="1"
              max="60"
              step="1"
              value={settings.revealDelay || 3}
              onChange={(e) => setSettings({ ...settings, revealDelay: Math.max(1, Math.min(60, parseInt(e.target.value) || 3)) })}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">seconds</span>
            <div className="flex-1">
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={settings.revealDelay || 3}
                onChange={(e) => setSettings({ ...settings, revealDelay: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">How long to wait before revealing the winner (1-60 seconds)</p>
        </div>

        {/* Spin Time */}
        <div className="space-y-2">
          <Label htmlFor="spinTime">Spin Time (Animation Duration)</Label>
          <div className="flex items-center gap-3">
            <Input
              id="spinTime"
              type="number"
              min="1"
              max="60"
              step="1"
              value={settings.spinTime || 5}
              onChange={(e) => setSettings({ ...settings, spinTime: Math.max(1, Math.min(60, parseInt(e.target.value) || 5)) })}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">seconds</span>
            <div className="flex-1">
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={settings.spinTime || 5}
                onChange={(e) => setSettings({ ...settings, spinTime: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">How long the roulette spins before stopping (1-60 seconds, works for both vertical and wheel)</p>
        </div>
      </div>

      {/* Marquee Settings */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold">Marquee Settings</h3>
        
        {/* Marquee Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="marqueeEnabled">Enable Marquee</Label>
            <input
              type="checkbox"
              id="marqueeEnabled"
              checked={settings.marqueeEnabled || false}
              onChange={(e) => {
                const newSettings = { ...settings, marqueeEnabled: e.target.checked }
                setSettings(newSettings)
                // Auto-save marquee settings
                localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                onSettingsChange(newSettings)
              }}
              className="size-4 cursor-pointer"
            />
          </div>
          <p className="text-xs text-muted-foreground">Display scrolling text at the bottom of the main view</p>
        </div>

        {/* Marquee Text Field - Only show when enabled */}
        {settings.marqueeEnabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="marqueeText">Marquee Text</Label>
              <Input
                id="marqueeText"
                value={settings.marqueeText || ""}
                onChange={(e) => {
                  const newSettings = { ...settings, marqueeText: e.target.value }
                  setSettings(newSettings)
                  // Auto-save marquee settings
                  localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                  onSettingsChange(newSettings)
                }}
                placeholder="Enter marquee text here..."
              />
              <p className="text-xs text-muted-foreground">Text will scroll continuously at the bottom</p>
            </div>

            {/* Marquee Speed */}
            <div className="space-y-2">
              <Label htmlFor="marqueeSpeed">Marquee Speed</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="marqueeSpeed"
                  type="number"
                  min="5"
                  max="120"
                  step="5"
                  value={settings.marqueeSpeed || 30}
                  onChange={(e) => {
                    const newSettings = { ...settings, marqueeSpeed: Math.max(5, Math.min(120, parseInt(e.target.value) || 30)) }
                    setSettings(newSettings)
                    // Auto-save marquee settings
                    localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                    onSettingsChange(newSettings)
                  }}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">seconds per cycle</span>
                <div className="flex-1">
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={settings.marqueeSpeed || 30}
                      onChange={(e) => {
                        const newSettings = { ...settings, marqueeSpeed: parseInt(e.target.value) }
                        setSettings(newSettings)
                        // Auto-save marquee settings
                        localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                        onSettingsChange(newSettings)
                      }}
                      className="w-full"
                    />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Lower values = faster scrolling (5-120 seconds)</p>
            </div>

            {/* Marquee Background Color */}
            <div className="space-y-2">
              <Label htmlFor="marqueeBackgroundColor">Marquee Background Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="marqueeBackgroundColor"
                  type="color"
                  value={settings.marqueeBackgroundColor || "#9ca3af"}
                  onChange={(e) => {
                    const newSettings = { ...settings, marqueeBackgroundColor: e.target.value }
                    setSettings(newSettings)
                    localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                    onSettingsChange(newSettings)
                  }}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={settings.marqueeBackgroundColor || "#9ca3af"}
                  onChange={(e) => {
                    const newSettings = { ...settings, marqueeBackgroundColor: e.target.value }
                    setSettings(newSettings)
                    localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                    onSettingsChange(newSettings)
                  }}
                  placeholder="#9ca3af"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">Customize the background color of the marquee banner</p>
            </div>

            {/* Marquee Font Size */}
            <div className="space-y-2">
              <Label htmlFor="marqueeFontSize">Marquee Font Size</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="marqueeFontSize"
                  type="number"
                  min="8"
                  max="72"
                  value={settings.marqueeFontSize || 18}
                  onChange={(e) => {
                    const newSettings = { ...settings, marqueeFontSize: Math.max(8, Math.min(72, parseInt(e.target.value) || 18)) }
                    setSettings(newSettings)
                    localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                    onSettingsChange(newSettings)
                  }}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">px (8-72)</span>
                <div className="flex-1">
                  <input
                    type="range"
                    min="8"
                    max="72"
                    step="1"
                    value={settings.marqueeFontSize || 18}
                    onChange={(e) => {
                      const newSettings = { ...settings, marqueeFontSize: parseInt(e.target.value) }
                      setSettings(newSettings)
                      localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                      onSettingsChange(newSettings)
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Marquee Background Size (Padding) */}
            <div className="space-y-2">
              <Label htmlFor="marqueeBackgroundSize">Marquee Background Size (Padding)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="marqueeBackgroundSize"
                  type="number"
                  min="4"
                  max="48"
                  value={settings.marqueeBackgroundSize || 12}
                  onChange={(e) => {
                    const newSettings = { ...settings, marqueeBackgroundSize: Math.max(4, Math.min(48, parseInt(e.target.value) || 12)) }
                    setSettings(newSettings)
                    localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                    onSettingsChange(newSettings)
                  }}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">px (4-48)</span>
                <div className="flex-1">
                  <input
                    type="range"
                    min="4"
                    max="48"
                    step="2"
                    value={settings.marqueeBackgroundSize || 12}
                    onChange={(e) => {
                      const newSettings = { ...settings, marqueeBackgroundSize: parseInt(e.target.value) }
                      setSettings(newSettings)
                      localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                      onSettingsChange(newSettings)
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Prize Title Banner Settings */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold">Prize Title Banner Settings</h3>
        <div className="space-y-2">
          <Label htmlFor="prizeTitleBackgroundColor">Prize Title Background Color</Label>
          <div className="flex items-center gap-3">
            <Input
              id="prizeTitleBackgroundColor"
              type="color"
              value={settings.prizeTitleBackgroundColor || "#9ca3af"}
              onChange={(e) => {
                const newSettings = { ...settings, prizeTitleBackgroundColor: e.target.value }
                setSettings(newSettings)
                localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                onSettingsChange(newSettings)
              }}
              className="w-20 h-10 cursor-pointer"
            />
            <Input
              type="text"
              value={settings.prizeTitleBackgroundColor || "#9ca3af"}
              onChange={(e) => {
                const newSettings = { ...settings, prizeTitleBackgroundColor: e.target.value }
                setSettings(newSettings)
                localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                onSettingsChange(newSettings)
              }}
              placeholder="#9ca3af"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">Customize the background color of the prize title banner</p>
        </div>

        {/* Prize Title Font Size */}
        <div className="space-y-2">
          <Label htmlFor="prizeTitleFontSize">Prize Title Font Size</Label>
          <div className="flex items-center gap-3">
            <Input
              id="prizeTitleFontSize"
              type="number"
              min="12"
              max="120"
              value={settings.prizeTitleFontSize || 48}
              onChange={(e) => {
                const newSettings = { ...settings, prizeTitleFontSize: Math.max(12, Math.min(120, parseInt(e.target.value) || 48)) }
                setSettings(newSettings)
                localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                onSettingsChange(newSettings)
              }}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">px (12-120)</span>
            <div className="flex-1">
              <input
                type="range"
                min="12"
                max="120"
                step="2"
                value={settings.prizeTitleFontSize || 48}
                onChange={(e) => {
                  const newSettings = { ...settings, prizeTitleFontSize: parseInt(e.target.value) }
                  setSettings(newSettings)
                  localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                  onSettingsChange(newSettings)
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Prize Title Background Size (Padding) */}
        <div className="space-y-2">
          <Label htmlFor="prizeTitleBackgroundSize">Prize Title Background Size (Padding)</Label>
          <div className="flex items-center gap-3">
            <Input
              id="prizeTitleBackgroundSize"
              type="number"
              min="4"
              max="48"
              value={settings.prizeTitleBackgroundSize || 12}
              onChange={(e) => {
                const newSettings = { ...settings, prizeTitleBackgroundSize: Math.max(4, Math.min(48, parseInt(e.target.value) || 12)) }
                setSettings(newSettings)
                localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                onSettingsChange(newSettings)
              }}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">px (4-48)</span>
            <div className="flex-1">
              <input
                type="range"
                min="4"
                max="48"
                step="2"
                value={settings.prizeTitleBackgroundSize || 12}
                onChange={(e) => {
                  const newSettings = { ...settings, prizeTitleBackgroundSize: parseInt(e.target.value) }
                  setSettings(newSettings)
                  localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                  onSettingsChange(newSettings)
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Roulette Settings */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold">Vertical Roulette Settings</h3>
        <p className="text-xs text-muted-foreground">Customize the appearance of the vertical roulette entries (text size and container height)</p>
        
        {/* Vertical Roulette Text Size */}
        <div className="space-y-2">
          <Label htmlFor="verticalRouletteTextSize">Vertical Roulette Text Size</Label>
          <div className="flex items-center gap-3">
            <Input
              id="verticalRouletteTextSize"
              type="number"
              min="8"
              max="48"
              value={settings.verticalRouletteTextSize || 18}
              onChange={(e) => {
                const newSettings = { ...settings, verticalRouletteTextSize: Math.max(8, Math.min(48, parseInt(e.target.value) || 18)) }
                setSettings(newSettings)
                localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                onSettingsChange(newSettings)
              }}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">px (8-48)</span>
            <div className="flex-1">
              <input
                type="range"
                min="8"
                max="48"
                step="1"
                value={settings.verticalRouletteTextSize || 18}
                onChange={(e) => {
                  const newSettings = { ...settings, verticalRouletteTextSize: parseInt(e.target.value) }
                  setSettings(newSettings)
                  localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                  onSettingsChange(newSettings)
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Vertical Roulette Container Height */}
        <div className="space-y-2">
          <Label htmlFor="verticalRouletteContainerHeight">Vertical Roulette Container Height</Label>
          <div className="flex items-center gap-3">
            <Input
              id="verticalRouletteContainerHeight"
              type="number"
              min="40"
              max="150"
              value={settings.verticalRouletteContainerHeight || 70}
              onChange={(e) => {
                const newSettings = { ...settings, verticalRouletteContainerHeight: Math.max(40, Math.min(150, parseInt(e.target.value) || 70)) }
                setSettings(newSettings)
                localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                onSettingsChange(newSettings)
              }}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">px (40-150)</span>
            <div className="flex-1">
              <input
                type="range"
                min="40"
                max="150"
                step="5"
                value={settings.verticalRouletteContainerHeight || 70}
                onChange={(e) => {
                  const newSettings = { ...settings, verticalRouletteContainerHeight: parseInt(e.target.value) }
                  setSettings(newSettings)
                  localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                  onSettingsChange(newSettings)
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logo Settings */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold">Logo Settings</h3>
        
        <div className="space-y-2">
          <Label>Logos (Displayed below marquee)</Label>
          <p className="text-xs text-muted-foreground">Add multiple logos to display below the marquee. Customize the size for each logo.</p>
          
          <div className="space-y-3">
            {(settings.logos || []).map((logoItem, index) => {
              // Handle backward compatibility: if logo is a string, convert to object
              const logo = typeof logoItem === 'string' ? { url: logoItem, size: 64, opacity: 100 } : { ...logoItem, opacity: logoItem.opacity || 100 }
              return (
                <div key={index} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={logo.url}
                      onChange={(e) => {
                        const newLogos = [...(settings.logos || [])]
                        // Ensure we're working with object format
                        const currentLogo = typeof newLogos[index] === 'string' 
                          ? { url: newLogos[index] as string, size: 64, opacity: 100 }
                          : { ...(newLogos[index] as { url: string; size: number; opacity?: number }), opacity: (newLogos[index] as any)?.opacity || 100 }
                        newLogos[index] = { ...currentLogo, url: e.target.value }
                        const newSettings = { ...settings, logos: newLogos }
                        setSettings(newSettings)
                        localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                        onSettingsChange(newSettings)
                      }}
                      placeholder="Enter logo URL or upload file..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newLogos = (settings.logos || []).filter((_, i) => i !== index)
                        const newSettings = { ...settings, logos: newLogos }
                        setSettings(newSettings)
                        localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                        onSettingsChange(newSettings)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            const dataUrl = event.target?.result as string
                            const newLogos = [...(settings.logos || [])]
                            // Ensure we're working with object format
                            const currentLogo = typeof newLogos[index] === 'string' 
                              ? { url: newLogos[index] as string, size: 64, opacity: 100 }
                              : { ...(newLogos[index] as { url: string; size: number; opacity?: number }), opacity: (newLogos[index] as any)?.opacity || 100 }
                            newLogos[index] = { ...currentLogo, url: dataUrl }
                            const newSettings = { ...settings, logos: newLogos }
                            setSettings(newSettings)
                            localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                            onSettingsChange(newSettings)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="flex-1 text-sm"
                    />
                    <span className="text-xs text-muted-foreground">or upload file</span>
                  </div>
                  {/* Size Control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Size: {logo.size}px</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="range"
                        min="16"
                        max="200"
                        value={logo.size}
                        onChange={(e) => {
                          const newLogos = [...(settings.logos || [])]
                          // Ensure we're working with object format
                          const currentLogo = typeof newLogos[index] === 'string' 
                            ? { url: newLogos[index] as string, size: 64, opacity: 100 }
                            : { ...(newLogos[index] as { url: string; size: number; opacity?: number }), opacity: (newLogos[index] as any)?.opacity || 100 }
                          newLogos[index] = { ...currentLogo, size: parseInt(e.target.value) }
                          const newSettings = { ...settings, logos: newLogos }
                          setSettings(newSettings)
                          localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                          onSettingsChange(newSettings)
                        }}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min="16"
                        max="200"
                        value={logo.size}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 64
                          const clampedValue = Math.min(200, Math.max(16, value))
                          const newLogos = [...(settings.logos || [])]
                          // Ensure we're working with object format
                          const currentLogo = typeof newLogos[index] === 'string' 
                            ? { url: newLogos[index] as string, size: 64, opacity: 100 }
                            : { ...(newLogos[index] as { url: string; size: number; opacity?: number }), opacity: (newLogos[index] as any)?.opacity || 100 }
                          newLogos[index] = { ...currentLogo, size: clampedValue }
                          const newSettings = { ...settings, logos: newLogos }
                          setSettings(newSettings)
                          localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                          onSettingsChange(newSettings)
                        }}
                        className="w-20"
                      />
                    </div>
                  </div>
                  {/* Opacity Control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Opacity: {logo.opacity || 100}%</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={logo.opacity || 100}
                        onChange={(e) => {
                          const newLogos = [...(settings.logos || [])]
                          // Ensure we're working with object format
                          const currentLogo = typeof newLogos[index] === 'string' 
                            ? { url: newLogos[index] as string, size: 64, opacity: 100 }
                            : { ...(newLogos[index] as { url: string; size: number; opacity?: number }), opacity: (newLogos[index] as any)?.opacity || 100 }
                          newLogos[index] = { ...currentLogo, opacity: parseInt(e.target.value) }
                          const newSettings = { ...settings, logos: newLogos }
                          setSettings(newSettings)
                          localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                          onSettingsChange(newSettings)
                        }}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={logo.opacity || 100}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 100
                          const clampedValue = Math.min(100, Math.max(0, value))
                          const newLogos = [...(settings.logos || [])]
                          // Ensure we're working with object format
                          const currentLogo = typeof newLogos[index] === 'string' 
                            ? { url: newLogos[index] as string, size: 64, opacity: 100 }
                            : { ...(newLogos[index] as { url: string; size: number; opacity?: number }), opacity: (newLogos[index] as any)?.opacity || 100 }
                          newLogos[index] = { ...currentLogo, opacity: clampedValue }
                          const newSettings = { ...settings, logos: newLogos }
                          setSettings(newSettings)
                          localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                          onSettingsChange(newSettings)
                        }}
                        className="w-20"
                      />
                    </div>
                  </div>
                  {/* Logo Preview */}
                  {logo.url && logo.url.trim() && (
                    <div className="flex items-center justify-center p-2 bg-gray-50 rounded border">
                      <img
                        src={logo.url}
                        alt={`Logo preview ${index + 1}`}
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
                  )}
                </div>
              )
            })}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newLogos = [...(settings.logos || []), { url: "", size: 64, opacity: 100 }]
                const newSettings = { ...settings, logos: newLogos }
                setSettings(newSettings)
                localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                onSettingsChange(newSettings)
              }}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Logo
            </Button>
          </div>
        </div>
      </div>

      {/* Sound Settings */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Volume2 className="size-5" />
          Sound Settings
        </h3>
        
        {/* Sound Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="soundEnabled">Enable Sounds</Label>
            <input
              type="checkbox"
              id="soundEnabled"
              checked={settings.soundEnabled !== false}
              onChange={(e) => {
                const newSettings = { ...settings, soundEnabled: e.target.checked }
                setSettings(newSettings)
                // Auto-save sound settings
                localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                onSettingsChange(newSettings)
                // Also update sound settings in localStorage
                const soundSettings = JSON.parse(localStorage.getItem("soundSettings") || "{}")
                localStorage.setItem("soundSettings", JSON.stringify({ ...soundSettings, enabled: e.target.checked }))
              }}
              className="size-4 cursor-pointer"
            />
          </div>
          <p className="text-xs text-muted-foreground">Enable or disable all sound effects and music</p>
        </div>

        {/* Draw Sound */}
        <div className="space-y-2">
          <Label htmlFor="drawSound">Draw Sound (Roulette Ticking)</Label>
          <p className="text-xs text-muted-foreground">Upload a custom sound for the roulette ticking effect (max 10MB). Files are saved to the public folder. Leave empty to use default ticking sound.</p>
          
          <div className="space-y-2">
            <Input
              type="text"
              value={settings.drawSound || ""}
              onChange={(e) => {
                const newSettings = { ...settings, drawSound: e.target.value }
                setSettings(newSettings)
                localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                onSettingsChange(newSettings)
              }}
              placeholder="Enter sound URL or upload file (default: ticking sound)"
              className="flex-1"
            />
            <Input
              type="file"
              accept="audio/*"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // Check file size (limit to 10MB)
                  const maxSize = 10 * 1024 * 1024 // 10MB
                  if (file.size > maxSize) {
                    toast.error(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.`)
                    return
                  }
                  
                  try {
                    // Upload file to server
                    const formData = new FormData()
                    formData.append('file', file)
                    
                    const response = await fetch('/api/upload-sound', {
                      method: 'POST',
                      body: formData,
                    })
                    
                    const data = await response.json()
                    
                    if (!response.ok) {
                      toast.error(data.error || "Failed to upload file")
                      return
                    }
                    
                    // Store only the URL path in settings (not the full file)
                    const newSettings = { ...settings, drawSound: data.url }
                    setSettings(newSettings)
                    localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                    onSettingsChange(newSettings)
                    toast.success("Draw sound uploaded successfully!")
                  } catch (error: any) {
                    console.error("Error uploading file:", error)
                    toast.error("Failed to upload sound file. Please try again.")
                  }
                }
              }}
              className="text-sm"
            />
            {settings.drawSound && settings.drawSound.trim() && (
              <div className="p-2 bg-gray-50 rounded border">
                <p className="text-xs text-muted-foreground">Custom sound is set. Clear the field above to use default ticking sound.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newSettings = { ...settings, drawSound: "" }
                    setSettings(newSettings)
                    localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                    onSettingsChange(newSettings)
                  }}
                  className="mt-2"
                >
                  Use Default Ticking Sound
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Music */}
        <div className="space-y-2">
          <Label htmlFor="modalMusic">
            <Music className="size-4 inline mr-2" />
            Winner Modal Music
          </Label>
          <div className="flex gap-2">
            <Input
              id="modalMusic"
              type="text"
              value={settings.modalMusic || ""}
              onChange={(e) => {
                const newSettings = { ...settings, modalMusic: e.target.value }
                setSettings(newSettings)
                localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                onSettingsChange(newSettings)
                // Also update sound settings in localStorage
                const soundSettings = JSON.parse(localStorage.getItem("soundSettings") || "{}")
                localStorage.setItem("soundSettings", JSON.stringify({ ...soundSettings, modalMusic: e.target.value }))
              }}
              placeholder="Enter music file URL or path (e.g., /sounds/winner-music.mp3)"
              className="flex-1"
            />
            <Input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    const dataUrl = event.target?.result as string
                    const newSettings = { ...settings, modalMusic: dataUrl }
                    setSettings(newSettings)
                    localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                    onSettingsChange(newSettings)
                    // Also update sound settings in localStorage
                    const soundSettings = JSON.parse(localStorage.getItem("soundSettings") || "{}")
                    localStorage.setItem("soundSettings", JSON.stringify({ ...soundSettings, modalMusic: dataUrl }))
                  }
                  reader.readAsDataURL(file)
                }
              }}
              className="w-32"
            />
          </div>
          <p className="text-xs text-muted-foreground">Music played when winner modal appears (loops continuously)</p>
          
          {/* Modal Music Volume */}
          <div className="space-y-2">
            <Label htmlFor="modalMusicVolume">Modal Music Volume</Label>
            <div className="flex items-center gap-3">
              <Input
                id="modalMusicVolume"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={settings.modalMusicVolume ?? 0.5}
                onChange={(e) => {
                  const newSettings = { ...settings, modalMusicVolume: Math.max(0, Math.min(1, parseFloat(e.target.value) || 0.5)) }
                  setSettings(newSettings)
                  localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                  onSettingsChange(newSettings)
                  // Also update sound settings in localStorage
                  const soundSettings = JSON.parse(localStorage.getItem("soundSettings") || "{}")
                  localStorage.setItem("soundSettings", JSON.stringify({ ...soundSettings, modalMusicVolume: newSettings.modalMusicVolume }))
                }}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">0.0 - 1.0</span>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.modalMusicVolume ?? 0.5}
                  onChange={(e) => {
                    const newSettings = { ...settings, modalMusicVolume: parseFloat(e.target.value) }
                    setSettings(newSettings)
                    localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                    onSettingsChange(newSettings)
                    // Also update sound settings in localStorage
                    const soundSettings = JSON.parse(localStorage.getItem("soundSettings") || "{}")
                    localStorage.setItem("soundSettings", JSON.stringify({ ...soundSettings, modalMusicVolume: newSettings.modalMusicVolume }))
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} className="w-full">
        Save Settings
      </Button>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Settings?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these settings? This will update your system configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast Container */}
    </div>
  )
}

