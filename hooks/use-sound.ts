"use client"

import { useRef, useCallback } from "react"

interface SettingsData {
  soundEnabled?: boolean
  drawSound?: string
  modalMusic?: string
  modalMusicVolume?: number
  verticalRouletteContainerHeight?: number
}

export function useSound() {
  const spinningSoundRef = useRef<OscillatorNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const modalMusicRef = useRef<HTMLAudioElement | null>(null)
  const lastEntryIndexRef = useRef<number | null>(null)
  const isSpinningRef = useRef<boolean>(false)
  const rouletteTypeRef = useRef<"vertical" | "wheel">("vertical")
  const totalEntriesRef = useRef<number>(0)

  // Get settings from localStorage
  const getSettings = useCallback((): SettingsData => {
    if (typeof window === "undefined") {
      return {
        soundEnabled: true,
        verticalRouletteContainerHeight: 70,
      }
    }
    
    const saved = localStorage.getItem("drawSettings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          soundEnabled: parsed.soundEnabled !== false,
          drawSound: parsed.drawSound,
          modalMusic: parsed.modalMusic,
          modalMusicVolume: parsed.modalMusicVolume ?? 0.5,
          verticalRouletteContainerHeight: parsed.verticalRouletteContainerHeight ?? 70,
        }
      } catch (e) {
        console.error("Error parsing settings:", e)
      }
    }
    
    return {
      soundEnabled: true,
      verticalRouletteContainerHeight: 70,
    }
  }, [])

  // Create tick sound using Web Audio API
  const playDefaultTickSound = useCallback(() => {
    const settings = getSettings()
    if (!settings.soundEnabled) return

    try {
      const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)()
      if (!audioContextRef.current) {
        audioContextRef.current = audioContext
      }

      // Resume audio context if suspended
      if (audioContext.state === "suspended") {
        audioContext.resume()
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = "sine"
      oscillator.frequency.value = 400 // Lower frequency for better audibility
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime) // Higher volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1) // Longer duration

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1) // 100ms duration
    } catch (error) {
      console.error("Error playing tick sound:", error)
    }
  }, [getSettings])

  // Check if entry passed center/indicator and play tick sound
  const checkEntryPassed = useCallback((offset: number) => {
    const settings = getSettings()
    if (!settings.soundEnabled || !isSpinningRef.current) return

    try {
      const audioContext = audioContextRef.current
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume()
      }

      if (rouletteTypeRef.current === "vertical") {
        const itemHeight = settings.verticalRouletteContainerHeight || 70
        const itemSpacing = 10
        const totalItemHeight = itemHeight + itemSpacing

        // Calculate which entry is at the center
        // Center is at offset = 0, entries are positioned at multiples of totalItemHeight
        // Entry i center is at: i * totalItemHeight
        // We need to find which entry center is closest to offset = 0
        const normalizedOffset = ((offset % (totalEntriesRef.current * totalItemHeight)) + (totalEntriesRef.current * totalItemHeight)) % (totalEntriesRef.current * totalItemHeight)
        const entryFloat = normalizedOffset / totalItemHeight
        const currentEntryIndex = Math.floor(entryFloat + 0.5) % totalEntriesRef.current
        const adjustedIndex = currentEntryIndex < 0 ? currentEntryIndex + totalEntriesRef.current : currentEntryIndex

        // Check if we've moved to a new entry
        if (lastEntryIndexRef.current !== null && lastEntryIndexRef.current !== adjustedIndex) {
          playDefaultTickSound()
        }
        lastEntryIndexRef.current = adjustedIndex
      } else {
        // Wheel roulette
        const anglePerSegment = 360 / totalEntriesRef.current
        const normalizedAngle = ((offset % 360) + 360) % 360

        // Calculate which segment center is at the arrow (0 degrees)
        // Segment centers are at: (i * anglePerSegment) - 90 + (anglePerSegment / 2)
        // After rotation R, segment i center is at: (i * anglePerSegment) - 90 + (anglePerSegment / 2) + R
        // We want this to equal 0 (where arrow is)
        // So: i = (90 - anglePerSegment/2 - R) / anglePerSegment
        const segmentCenterOffset = 90 - (anglePerSegment / 2)
        const targetAngle = (segmentCenterOffset - normalizedAngle + 360) % 360
        const entryFloat = targetAngle / anglePerSegment
        let currentSegmentIndex = Math.floor(entryFloat + 0.5) % totalEntriesRef.current
        if (currentSegmentIndex < 0) currentSegmentIndex += totalEntriesRef.current

        // Check if we've moved to a new segment
        if (lastEntryIndexRef.current !== null && lastEntryIndexRef.current !== currentSegmentIndex) {
          playDefaultTickSound()
        }
        lastEntryIndexRef.current = currentSegmentIndex
      }
    } catch (error) {
      console.error("Error checking entry passed:", error)
    }
  }, [getSettings, playDefaultTickSound])

  // Start spinning sound (only sets up state for ticking sound, no continuous whistling)
  const startSpinningSound = useCallback((initialSpeed: number, totalEntries: number, rouletteType: "vertical" | "wheel") => {
    const settings = getSettings()
    if (!settings.soundEnabled) return

    isSpinningRef.current = true
    rouletteTypeRef.current = rouletteType
    totalEntriesRef.current = totalEntries
    lastEntryIndexRef.current = null

    // Initialize audio context for ticking sounds only (no continuous sound)
    try {
      const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)()
      if (!audioContextRef.current) {
        audioContextRef.current = audioContext
      }

      if (audioContext.state === "suspended") {
        audioContext.resume()
      }
    } catch (error) {
      console.error("Error initializing audio context:", error)
    }
  }, [getSettings])

  // Update spinning sound speed (no-op, kept for compatibility but no continuous sound)
  const updateSpinSpeed = useCallback((speed: number) => {
    // No continuous sound, so this is a no-op
    // Ticking sound frequency is fixed in playDefaultTickSound
  }, [])

  // Stop spinning sound
  const stopSpinningSound = useCallback(() => {
    isSpinningRef.current = false
    lastEntryIndexRef.current = null

    // No continuous sound to stop, just reset state
    spinningSoundRef.current = null
    gainNodeRef.current = null
  }, [])

  // Play modal music
  const playModalMusic = useCallback(() => {
    const settings = getSettings()
    if (!settings.soundEnabled || !settings.modalMusic) return

    try {
      // Stop any existing modal music
      if (modalMusicRef.current) {
        modalMusicRef.current.pause()
        modalMusicRef.current = null
      }

      const audio = new Audio(settings.modalMusic)
      audio.volume = settings.modalMusicVolume ?? 0.5
      audio.loop = true
      audio.play().catch((error) => {
        console.error("Error playing modal music:", error)
      })
      modalMusicRef.current = audio
    } catch (error) {
      console.error("Error playing modal music:", error)
    }
  }, [getSettings])

  // Stop modal music
  const stopModalMusic = useCallback(() => {
    if (modalMusicRef.current) {
      try {
        modalMusicRef.current.pause()
        modalMusicRef.current.currentTime = 0
      } catch (error) {
        console.error("Error stopping modal music:", error)
      }
      modalMusicRef.current = null
    }
  }, [])

  return {
    startSpinningSound,
    stopSpinningSound,
    updateSpinSpeed,
    checkEntryPassed,
    playModalMusic,
    stopModalMusic,
  }
}
