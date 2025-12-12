"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Palette, Type } from "lucide-react"
import { useToast } from "@/components/ui/toast"
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
  companyName: string
  systemName: string
  rouletteSpeed?: number
  revealDelay?: number
  marqueeEnabled?: boolean
  marqueeText?: string
  marqueeSpeed?: number
}

export function SettingsPanel({ onSettingsChange }: { onSettingsChange: (settings: SettingsData) => void }) {
  const { showToast, ToastContainer } = useToast()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [settings, setSettings] = useState<SettingsData>({
    logo: "",
    logoType: "icon",
    primaryColor: "#000000",
    backgroundColor: "#ffffff",
    fontFamily: "Archivo",
    companyName: "Acme Inc",
    systemName: "Random Name Lucky Draw System",
    rouletteSpeed: 100,
    revealDelay: 3,
    marqueeEnabled: false,
    marqueeText: "",
    marqueeSpeed: 30,
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
        if (parsed.rouletteSpeed === undefined) parsed.rouletteSpeed = 100
        if (parsed.revealDelay === undefined) parsed.revealDelay = 3
        if (parsed.marqueeEnabled === undefined) parsed.marqueeEnabled = false
        if (parsed.marqueeText === undefined) parsed.marqueeText = ""
        if (parsed.marqueeSpeed === undefined) parsed.marqueeSpeed = 30
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
    showToast("Settings saved successfully!", "success")
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

      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="companyName">Company/Organization Name</Label>
        <Input
          id="companyName"
          value={settings.companyName}
          onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
          placeholder="Enter company name"
        />
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
        
        {/* Roulette Speed */}
        <div className="space-y-2">
          <Label htmlFor="rouletteSpeed">Roulette Speed</Label>
          <div className="flex items-center gap-3">
            <Input
              id="rouletteSpeed"
              type="number"
              min="50"
              max="300"
              step="10"
              value={settings.rouletteSpeed || 100}
              onChange={(e) => setSettings({ ...settings, rouletteSpeed: Math.max(50, Math.min(300, parseInt(e.target.value) || 100)) })}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">pixels per second</span>
            <div className="flex-1">
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={settings.rouletteSpeed || 100}
                onChange={(e) => setSettings({ ...settings, rouletteSpeed: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Adjust the speed of the roulette animation (50-300)</p>
        </div>

        {/* Reveal Delay */}
        <div className="space-y-2">
          <Label htmlFor="revealDelay">Winner Reveal Delay</Label>
          <div className="flex items-center gap-3">
            <Input
              id="revealDelay"
              type="number"
              min="1"
              max="10"
              step="1"
              value={settings.revealDelay || 3}
              onChange={(e) => setSettings({ ...settings, revealDelay: Math.max(1, Math.min(10, parseInt(e.target.value) || 3)) })}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">seconds</span>
            <div className="flex-1">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={settings.revealDelay || 3}
                onChange={(e) => setSettings({ ...settings, revealDelay: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">How long to wait before revealing the winner (1-10 seconds)</p>
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
          </>
        )}
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
      <ToastContainer />
    </div>
  )
}

