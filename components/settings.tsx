"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Palette, Type, Volume2, Music, Plus, X } from "lucide-react"
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
  systemName: string
  revealDelay?: number
  spinTime?: number
  marqueeEnabled?: boolean
  marqueeText?: string
  marqueeSpeed?: number
  logos?: string[] // Array of logo URLs
  soundEnabled?: boolean
  drawSound?: string // Draw/roulette sound (data URL or file path), default is ticking sound
  modalMusic?: string
  modalMusicVolume?: number
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
    systemName: "Random Name Lucky Draw System",
    revealDelay: 3,
    spinTime: 5,
    marqueeEnabled: false,
    marqueeText: "",
    marqueeSpeed: 30,
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
        if (parsed.marqueeText === undefined) parsed.marqueeText = ""
        if (parsed.marqueeSpeed === undefined) parsed.marqueeSpeed = 30
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
          </>
        )}
      </div>

      {/* Logo Settings */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold">Logo Settings</h3>
        
        <div className="space-y-2">
          <Label>Logos (Displayed below marquee)</Label>
          <p className="text-xs text-muted-foreground">Add multiple logos to display below the marquee. Each logo will be 64px in size.</p>
          
          <div className="space-y-3">
            {(settings.logos || []).map((logo, index) => (
              <div key={index} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={logo}
                    onChange={(e) => {
                      const newLogos = [...(settings.logos || [])]
                      newLogos[index] = e.target.value
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
                          newLogos[index] = dataUrl
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
                {/* Logo Preview */}
                {logo && logo.trim() && (
                  <div className="flex items-center justify-center p-2 bg-gray-50 rounded border">
                    <img
                      src={logo}
                      alt={`Logo preview ${index + 1}`}
                      className="max-w-full max-h-32 object-contain"
                      onError={(e) => {
                        // Hide broken images
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newLogos = [...(settings.logos || []), ""]
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
                    showToast(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.`, "error")
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
                      showToast(data.error || "Failed to upload file", "error")
                      return
                    }
                    
                    // Store only the URL path in settings (not the full file)
                    const newSettings = { ...settings, drawSound: data.url }
                    setSettings(newSettings)
                    localStorage.setItem("drawSettings", JSON.stringify(newSettings))
                    onSettingsChange(newSettings)
                    showToast("Draw sound uploaded successfully!", "success")
                  } catch (error: any) {
                    console.error("Error uploading file:", error)
                    showToast("Failed to upload sound file. Please try again.", "error")
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
      <ToastContainer />
    </div>
  )
}

