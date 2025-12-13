"use client"

import { useRef, useEffect, useState } from "react"

interface SoundSettings {
  modalMusic: string // URL or path to music file
  modalMusicVolume: number // 0-1
  drawSound?: string // Custom draw sound (data URL or file path), empty means use default ticking
  enabled: boolean // Master toggle
}

const defaultSettings: SoundSettings = {
  modalMusic: "",
  modalMusicVolume: 0.5,
  drawSound: "", // Empty means use default ticking sound
  enabled: true,
}

interface SpinningSoundRef {
  audioContext?: AudioContext
  createTickSound?: () => void
  oscillator?: OscillatorNode | AudioBufferSourceNode
  gainNode?: GainNode
  filter?: BiquadFilterNode
  lastEntryIndex?: number
}

export function useSound() {
  const modalMusicAudioRef = useRef<HTMLAudioElement | null>(null)
  const spinningSoundRef = useRef<SpinningSoundRef | null>(null)
  const customDrawSoundRef = useRef<HTMLAudioElement | null>(null) // For looping custom draw sound
  const [settings, setSettings] = useState<SoundSettings>(defaultSettings)
  const [isSpinning, setIsSpinning] = useState(false)
  const isSpinningRef = useRef<boolean>(false) // Ref for immediate access without waiting for state update
  const [spinSpeed, setSpinSpeed] = useState(100)
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastPositionRef = useRef<number>(0)
  const entriesCountRef = useRef<number>(0)
  const rouletteTypeRef = useRef<"vertical" | "wheel">("vertical")
  const lastTootTimeRef = useRef<number>(0)

  // Function to load settings
  const loadSettings = () => {
    // First check soundSettings
    const soundSettings = localStorage.getItem("soundSettings")
    if (soundSettings) {
      try {
        const parsed = JSON.parse(soundSettings)
        // Ensure enabled defaults to true if not explicitly set to false
        const loadedSettings = { 
          ...defaultSettings, 
          ...parsed,
          enabled: parsed.enabled !== undefined ? parsed.enabled : true
        }
        setSettings(loadedSettings)
        return
      } catch (e) {
        console.error("Error loading sound settings:", e)
      }
    }
    
    // Fallback to drawSettings for backward compatibility
    const drawSettings = localStorage.getItem("drawSettings")
    if (drawSettings) {
      try {
        const parsed = JSON.parse(drawSettings)
        if (parsed.soundEnabled !== undefined || parsed.modalMusic) {
          const soundSettingsFromDraw = {
            enabled: parsed.soundEnabled !== false,
            modalMusic: parsed.modalMusic || "",
            modalMusicVolume: parsed.modalMusicVolume ?? 0.5,
          }
          setSettings({ ...defaultSettings, ...soundSettingsFromDraw })
          // Save to soundSettings for future use
          localStorage.setItem("soundSettings", JSON.stringify(soundSettingsFromDraw))
        } else {
          // No sound settings in drawSettings, use defaults
          setSettings(defaultSettings)
        }
      } catch (e) {
        console.error("Error loading draw settings:", e)
        // On error, use defaults
        setSettings(defaultSettings)
      }
    } else {
      // No settings found, use defaults
      setSettings(defaultSettings)
    }
  }

  // Load settings on mount
  useEffect(() => {
    loadSettings()
    
    // Listen for settings updates
    const handleSettingsUpdate = () => {
      loadSettings()
    }
    
    window.addEventListener("settingsUpdated", handleSettingsUpdate)
    window.addEventListener("storage", handleSettingsUpdate)
    
    return () => {
      window.removeEventListener("settingsUpdated", handleSettingsUpdate)
      window.removeEventListener("storage", handleSettingsUpdate)
    }
  }, [])

  // Initialize spinning sound - create a simple tick sound
  useEffect(() => {
    if (!spinningSoundRef.current) {
      // Initialize the ref with an object to store audio context
      spinningSoundRef.current = {}
      
      // Create a simple beep sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        // Resume audio context on first user interaction (required by browser autoplay policy)
        const resumeAudioContext = async () => {
          if (audioContext.state === 'suspended') {
            try {
              await audioContext.resume()
              console.log("Audio context resumed on user interaction")
            } catch (e) {
              console.error("Error resuming audio context:", e)
            }
          }
        }
        
        // Add event listeners for user interaction to resume audio context
        const events = ['click', 'touchstart', 'keydown']
        events.forEach(event => {
          document.addEventListener(event, resumeAudioContext, { once: true })
        })
        
        const createTootSound = () => {
          try {
            // Create "toot toot" - two quick beeps
            const playToot = (delay: number) => {
              const oscillator = audioContext.createOscillator()
              const gainNode = audioContext.createGain()
              
              oscillator.connect(gainNode)
              gainNode.connect(audioContext.destination)
              
              oscillator.frequency.value = 600 // Pleasant toot frequency
              oscillator.type = 'sine'
              gainNode.gain.setValueAtTime(0.25, audioContext.currentTime + delay)
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.06)
              
              oscillator.start(audioContext.currentTime + delay)
              oscillator.stop(audioContext.currentTime + delay + 0.06)
            }
            
            // Play two toots in quick succession
            playToot(0)
            playToot(0.08) // Second toot 80ms after first
          } catch (e) {
            console.error("Error creating toot sound:", e)
          }
        }
        
        // Default ticking sound function
        const playDefaultTickSound = (ctx: AudioContext) => {
          try {
            console.log("playDefaultTickSound called, context state:", ctx.state)
            // Ensure context is running
            if (ctx.state === 'suspended') {
              ctx.resume().catch(() => {})
            }
            
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)
            
            // Tick sound - short, sharp click (louder for better audibility)
            oscillator.frequency.value = 800 // Lower frequency for better audibility
            oscillator.type = 'sine' // Softer sound, more audible
            gainNode.gain.setValueAtTime(0.8, ctx.currentTime) // Higher volume
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1) // Longer duration
            
            oscillator.start(ctx.currentTime)
            oscillator.stop(ctx.currentTime + 0.1)
            
            console.log("✓ Default tick sound played successfully", { frequency: 800, volume: 0.8, duration: 0.1 })
          } catch (e) {
            console.error("✗ Error playing default tick sound:", e)
          }
        }
        
        // Create ticking sound function
        const createTickSound = () => {
          try {
            // Get current settings from localStorage
            const drawSettings = localStorage.getItem("drawSettings")
            let drawSound = ""
            if (drawSettings) {
              try {
                const parsed = JSON.parse(drawSettings)
                drawSound = parsed.drawSound || ""
              } catch (e) {
                console.error("Error reading draw sound from settings:", e)
              }
            }
            
            // Only play default ticking sound if no custom draw sound is set
            // Custom draw sound is handled separately in the useEffect hook with looping
            if (!drawSound || !drawSound.trim()) {
              // Ensure audio context is resumed before playing
              const playTick = async () => {
                try {
                  if (audioContext.state === 'suspended') {
                    await audioContext.resume()
                  }
                  // Use default ticking sound
                  playDefaultTickSound(audioContext)
                } catch (e) {
                  console.error("Error resuming audio context for tick:", e)
                  // Try to play anyway if resume fails
                  try {
                    playDefaultTickSound(audioContext)
                  } catch (playError) {
                    console.error("Error playing tick sound:", playError)
                  }
                }
              }
              // Don't await - play asynchronously to avoid blocking
              playTick().catch((e) => {
                console.error("Error in playTick promise:", e)
              })
            }
            // If custom sound is set, it's already looping in the useEffect, so don't play it here
          } catch (e) {
            console.error("Error creating tick sound:", e)
            // Fallback to default if anything fails
            if (spinningSoundRef.current?.audioContext) {
              try {
                playDefaultTickSound(spinningSoundRef.current.audioContext)
              } catch (fallbackError) {
                console.error("Error in fallback tick sound:", fallbackError)
              }
            }
          }
        }
        
        // Now we can safely set properties since ref is initialized
        if (spinningSoundRef.current) {
          spinningSoundRef.current.audioContext = audioContext as AudioContext
          spinningSoundRef.current.createTickSound = createTickSound
        }
      } catch (e) {
        console.error("Web Audio API not supported:", e)
      }
    }
  }, [])

  // Update roulette info for entry detection
  const updateRouletteInfo = (entriesCount: number, rouletteType: "vertical" | "wheel") => {
    entriesCountRef.current = entriesCount
    rouletteTypeRef.current = rouletteType
  }

  // Reset entry tracking when spinning starts
  useEffect(() => {
    // Sync ref with state
    isSpinningRef.current = isSpinning
    if (isSpinning && spinningSoundRef.current) {
      // Reset last entry index when starting to spin
      spinningSoundRef.current.lastEntryIndex = undefined
      lastTootTimeRef.current = 0
    }
  }, [isSpinning])
  
  // Handle custom draw sound looping during spin
  useEffect(() => {
    if (!settings.enabled) {
      // Stop custom sound if disabled
      if (customDrawSoundRef.current) {
        customDrawSoundRef.current.pause()
        customDrawSoundRef.current = null
      }
      return
    }

    if (isSpinning) {
      // Get custom draw sound from settings
      const drawSettings = localStorage.getItem("drawSettings")
      let drawSound = ""
      if (drawSettings) {
        try {
          const parsed = JSON.parse(drawSettings)
          drawSound = parsed.drawSound || ""
        } catch (e) {
          console.error("Error reading draw sound from settings:", e)
        }
      }

      // If custom draw sound is set, play it in a loop (like ticking sound)
      if (drawSound && drawSound.trim()) {
        try {
          // Stop any existing custom sound
          if (customDrawSoundRef.current) {
            customDrawSoundRef.current.pause()
            customDrawSoundRef.current = null
          }

          // Create and play custom sound in loop
          const audio = new Audio(drawSound)
          audio.volume = 0.5
          audio.loop = true // Loop continuously during spin, like ticking sound
          audio.play().catch((e) => {
            console.error("Error playing custom draw sound:", e)
          })
          customDrawSoundRef.current = audio
        } catch (e) {
          console.error("Error setting up custom draw sound:", e)
        }
      }
    } else {
      // Stop custom sound when spinning stops
      if (customDrawSoundRef.current) {
        customDrawSoundRef.current.pause()
        customDrawSoundRef.current = null
      }
    }

    return () => {
      // Cleanup on unmount or when dependencies change
      if (customDrawSoundRef.current) {
        customDrawSoundRef.current.pause()
        customDrawSoundRef.current = null
      }
    }
  }, [isSpinning, settings.enabled])

  // Check if an entry passed the center/indicator and play tick sound
  const checkEntryPassed = (currentPosition: number) => {
    // Debug: Log first few calls to verify it's being invoked
    const callCount = (checkEntryPassed as any).callCount = ((checkEntryPassed as any).callCount || 0) + 1
    if (callCount <= 5 || callCount % 50 === 0) {
      console.log(`checkEntryPassed #${callCount}:`, { currentPosition, enabled: settings.enabled, isSpinning, hasRef: !!spinningSoundRef.current })
    }
    
    if (!settings.enabled) {
      if (callCount <= 5) console.log("checkEntryPassed: Sound disabled")
      return
    }
    
    // Use ref for immediate check (state updates are async)
    if (!isSpinningRef.current && !isSpinning) {
      if (callCount <= 10) console.log("checkEntryPassed: Not spinning - isSpinning =", isSpinning, "isSpinningRef =", isSpinningRef.current)
      return
    }
    
    if (!spinningSoundRef.current) {
      console.warn("checkEntryPassed: spinningSoundRef.current is null")
      return
    }
    
    const audioContext = spinningSoundRef.current.audioContext
    const createTickSound = spinningSoundRef.current.createTickSound
    
    if (!audioContext) {
      console.warn("checkEntryPassed: No audio context")
      return
    }
    
    if (!createTickSound) {
      console.warn("checkEntryPassed: No createTickSound function")
      return
    }
    
    const entriesCount = entriesCountRef.current
    const rouletteType = rouletteTypeRef.current
    
    if (entriesCount === 0) {
      return
    }
    
    // Ensure audio context is resumed
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch((e) => {
        console.error("Error resuming audio context in checkEntryPassed:", e)
      })
    }
    
    try {
      
      let currentEntryIndex: number
      
      if (rouletteType === "vertical") {
        // Get container height from settings (default to 70 if not set)
        let itemHeight = 70
        try {
          const drawSettings = localStorage.getItem("drawSettings")
          if (drawSettings) {
            const parsed = JSON.parse(drawSettings)
            if (parsed.verticalRouletteContainerHeight) {
              itemHeight = parsed.verticalRouletteContainerHeight
            }
          }
        } catch (e) {
          // Use default if error reading settings
        }
        const itemSpacing = 10
        const totalItemHeight = itemHeight + itemSpacing
        const loopHeight = entriesCount * totalItemHeight
        
        // Normalize position to 0-loopHeight range
        const normalizedPos = ((currentPosition % loopHeight) + loopHeight) % loopHeight
        
        // Calculate which entry is at the center
        // The center indicator is at 50% of the container
        // Entry i center is at: i * totalItemHeight + itemHeight/2
        // We need to find which entry's center is closest to the current position
        // Adjust position to account for entry center offset
        // Entry i center is at: i * totalItemHeight + itemHeight/2
        // When normalizedPos = i * totalItemHeight + itemHeight/2, entry i is centered
        const adjustedPos = normalizedPos - (itemHeight / 2)
        const entryFloat = adjustedPos / totalItemHeight
        currentEntryIndex = Math.round(entryFloat) % entriesCount // Round to nearest entry
        if (currentEntryIndex < 0) currentEntryIndex += entriesCount
        
        // Debug logging for vertical roulette (log occasionally to avoid spam)
        if (rouletteType === "vertical" && Math.random() < 0.05) { // Log 5% of calls
          console.log("Vertical entry detection:", { 
            currentPosition, 
            normalizedPos, 
            adjustedPos,
            entryFloat, 
            currentEntryIndex, 
            itemHeight, 
            totalItemHeight, 
            loopHeight, 
            entriesCount 
          })
        }
        
        // Debug logging (remove in production)
        // console.log("Vertical entry detection:", { currentPosition, normalizedPos, entryFloat, currentEntryIndex, itemHeight, totalItemHeight, loopHeight })
      } else {
        // Wheel roulette - arrow is at 0 degrees (right side)
        const anglePerSegment = 360 / entriesCount
        const normalizedAngle = ((currentPosition % 360) + 360) % 360
        
        // Calculate which segment center is at the arrow (0 degrees)
        // Segment centers are at: (i * anglePerSegment) - 90 + (anglePerSegment / 2)
        // After rotation R, segment i center is at: (i * anglePerSegment) - 90 + (anglePerSegment / 2) + R
        // We want this to equal 0 (where arrow is)
        // So: i = (90 - anglePerSegment/2 - R) / anglePerSegment
        const segmentCenterOffset = 90 - (anglePerSegment / 2)
        const targetAngle = (segmentCenterOffset - normalizedAngle + 360) % 360
        const entryFloat = targetAngle / anglePerSegment
        currentEntryIndex = Math.floor(entryFloat + 0.5) % entriesCount
        if (currentEntryIndex < 0) currentEntryIndex += entriesCount
      }
      
      // Check if we've moved to a new entry
      const lastEntryIndex = spinningSoundRef.current.lastEntryIndex ?? -1
      const now = Date.now()
      const timeSinceLastTick = now - lastTootTimeRef.current
      
      // Check if custom draw sound is set
      const drawSettings = localStorage.getItem("drawSettings")
      let drawSound = ""
      if (drawSettings) {
        try {
          const parsed = JSON.parse(drawSettings)
          drawSound = parsed.drawSound || ""
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      // Only play default ticking sound if no custom draw sound is set
      // Custom draw sound loops continuously in the useEffect, so we don't need to play it here
      const shouldPlayTick = (!drawSound || !drawSound.trim()) && currentEntryIndex !== lastEntryIndex && (lastEntryIndex === -1 || timeSinceLastTick > 30)
      
      // Debug logging (log every 10th call to avoid spam)
      if (Math.random() < 0.1) {
        console.log("checkEntryPassed debug:", {
          currentPosition,
          currentEntryIndex,
          lastEntryIndex,
          rouletteType,
          entriesCount,
          drawSound: drawSound ? "set" : "not set",
          shouldPlayTick,
          timeSinceLastTick,
          audioContextState: audioContext.state
        })
      }
      
      if (shouldPlayTick) {
        // Entry passed center/indicator! Play default tick sound
        console.log("✓ Playing tick sound:", { currentEntryIndex, lastEntryIndex, rouletteType, entriesCount, audioContextState: audioContext.state, timeSinceLastTick })
        try {
          // Audio context is already active, play immediately
          if (createTickSound) {
            createTickSound()
            lastTootTimeRef.current = now
            if (spinningSoundRef.current) {
              spinningSoundRef.current.lastEntryIndex = currentEntryIndex
            }
            console.log("✓ Tick sound function called")
          } else {
            console.error("✗ createTickSound is null!")
          }
        } catch (e) {
          console.error("✗ Error playing tick sound:", e)
        }
      } else if (drawSound && drawSound.trim()) {
        // If custom sound is set, just update the entry index (sound is already looping)
        if (spinningSoundRef.current) {
          spinningSoundRef.current.lastEntryIndex = currentEntryIndex
        }
      }
      
      lastPositionRef.current = currentPosition
    } catch (e) {
      console.error("Error checking entry passed:", e)
    }
  }

  // Initialize modal music
  useEffect(() => {
    if (settings.modalMusic) {
      modalMusicAudioRef.current = new Audio(settings.modalMusic)
      modalMusicAudioRef.current.volume = settings.modalMusicVolume
      modalMusicAudioRef.current.loop = false // Play once, don't loop
      modalMusicAudioRef.current.preload = "auto"
    }

    return () => {
      if (modalMusicAudioRef.current) {
        modalMusicAudioRef.current.pause()
        modalMusicAudioRef.current = null
      }
    }
  }, [settings.modalMusic, settings.modalMusicVolume])

  // Start spinning sound - syncs with roulette animation
  const startSpinningSound = async (speed: number = 100, entriesCount: number = 0, rouletteType: "vertical" | "wheel" = "vertical") => {
    console.log("startSpinningSound called", { speed, entriesCount, rouletteType, enabled: settings.enabled })
    
    if (!settings.enabled) {
      console.log("Sound is disabled, not starting")
      return
    }
    
    // Update roulette info for accurate entry detection
    entriesCountRef.current = entriesCount
    rouletteTypeRef.current = rouletteType
    console.log("Updated roulette info:", { entriesCount, rouletteType, hasAudioContext: !!spinningSoundRef.current?.audioContext, hasCreateTickSound: !!spinningSoundRef.current?.createTickSound })
    
    // Reset last entry index to start fresh
    if (spinningSoundRef.current) {
      spinningSoundRef.current.lastEntryIndex = undefined
    }
    lastTootTimeRef.current = 0
    lastPositionRef.current = 0
    
    // Resume audio context if needed (browser autoplay policy)
    if (spinningSoundRef.current?.audioContext) {
      try {
        const context = spinningSoundRef.current.audioContext
        console.log("Audio context state before resume:", context.state)
        if (context.state === 'suspended') {
          await context.resume()
          console.log("Audio context resumed, new state:", context.state)
        } else {
          console.log("Audio context already running")
        }
      } catch (e) {
        console.error("Error resuming audio context:", e)
      }
    } else {
      console.warn("Audio context not available!")
    }
    
    console.log("Setting isSpinning to true with speed:", speed)
    isSpinningRef.current = true // Set ref immediately for synchronous access
    setIsSpinning(true)
    setSpinSpeed(speed)
  }

  // Stop spinning sound
  const stopSpinningSound = () => {
    isSpinningRef.current = false // Set ref immediately
    setIsSpinning(false)
    setSpinSpeed(0)
    // Stop custom draw sound if playing
    if (customDrawSoundRef.current) {
      customDrawSoundRef.current.pause()
      customDrawSoundRef.current = null
    }
    // Reset tracking
    if (spinningSoundRef.current) {
      spinningSoundRef.current.lastEntryIndex = undefined
    }
    lastPositionRef.current = 0
    lastTootTimeRef.current = 0
  }

  // Update spinning speed (for syncing with animation)
  const updateSpinSpeed = (speed: number) => {
    if (isSpinning) {
      setSpinSpeed(speed)
    }
  }

  // Play modal music
  const playModalMusic = () => {
    console.log("playModalMusic called", { enabled: settings.enabled, hasMusic: !!settings.modalMusic, musicUrl: settings.modalMusic })
    
    if (!settings.enabled) {
      console.log("Sound is disabled, not playing modal music")
      return
    }
    
    if (!settings.modalMusic) {
      console.log("No modal music URL set")
      return
    }

    try {
      // Stop any currently playing music
      if (modalMusicAudioRef.current) {
        modalMusicAudioRef.current.pause()
        modalMusicAudioRef.current.currentTime = 0
      }
      
      // Create new audio instance to ensure it plays
      modalMusicAudioRef.current = new Audio(settings.modalMusic)
      modalMusicAudioRef.current.volume = settings.modalMusicVolume
      modalMusicAudioRef.current.loop = false // Play once, don't loop
      modalMusicAudioRef.current.preload = "auto"
      
      // Play the music
      const playPromise = modalMusicAudioRef.current.play()
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Modal music started playing successfully")
          })
          .catch((error) => {
            console.error("Error playing modal music:", error)
            // Try to resume audio context if it's suspended
            if (spinningSoundRef.current?.audioContext) {
              spinningSoundRef.current.audioContext.resume().then(() => {
                // Retry playing
                modalMusicAudioRef.current?.play().catch((e) => {
                  console.error("Error retrying modal music after resume:", e)
                })
              })
            }
          })
      }
    } catch (error) {
      console.error("Error playing modal music:", error)
    }
  }

  // Stop modal music
  const stopModalMusic = () => {
    if (modalMusicAudioRef.current) {
      modalMusicAudioRef.current.pause()
      modalMusicAudioRef.current.currentTime = 0
    }
  }

  // Update settings
  const updateSettings = (updates: Partial<SoundSettings>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    localStorage.setItem("soundSettings", JSON.stringify(newSettings))
  }

  return {
    startSpinningSound,
    stopSpinningSound,
    updateSpinSpeed,
    checkEntryPassed,
    updateRouletteInfo,
    playModalMusic,
    stopModalMusic,
    settings,
    updateSettings,
  }
}
