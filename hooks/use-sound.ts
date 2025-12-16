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
  const drawSoundRef = useRef<HTMLAudioElement | null>(null)
  const tickSoundPoolRef = useRef<HTMLAudioElement[]>([])
  const lastTickTimeRef = useRef<number>(0)
  const activeTickSoundsRef = useRef<HTMLAudioElement[]>([])
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

  // Create tick sound using Web Audio API (only default tick, custom sound plays continuously)
  const playDefaultTickSound = useCallback(() => {
    const settings = getSettings()
    if (!settings.soundEnabled) return

    // Always use default oscillator sound for ticks
    // Custom draw sound plays continuously during the draw (handled in startSpinningSound)
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      const audioContext = audioContextRef.current || (AudioContextClass ? new AudioContextClass() : null)
      if (!audioContext) {
        console.error("AudioContext not supported")
        return
      }
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
      console.error("Error playing default oscillator sound:", error)
    }
  }, [getSettings])

  // Check if entry passed center/indicator and play tick sound
  const checkEntryPassed = useCallback((offset: number) => {
    const settings = getSettings()
    if (!settings.soundEnabled || !isSpinningRef.current) return

    // If custom draw sound is playing, don't play tick sounds
    if (settings.drawSound && settings.drawSound.trim() !== "" && drawSoundRef.current) {
      return
    }

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

  // Start spinning sound - plays continuous custom sound if set, otherwise just sets up for tick sounds
  const startSpinningSound = useCallback((initialSpeed: number, totalEntries: number, rouletteType: "vertical" | "wheel") => {
    const settings = getSettings()
    if (!settings.soundEnabled) return

    isSpinningRef.current = true
    rouletteTypeRef.current = rouletteType
    totalEntriesRef.current = totalEntries
    lastEntryIndexRef.current = null

    // Initialize audio context
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      const audioContext = audioContextRef.current || (AudioContextClass ? new AudioContextClass() : null)
      if (!audioContext) {
        console.error("AudioContext not supported")
        return
      }
      if (!audioContextRef.current) {
        audioContextRef.current = audioContext
      }

      if (audioContext.state === "suspended") {
        audioContext.resume()
      }
    } catch (error) {
      console.error("Error initializing audio context:", error)
    }

    // If custom draw sound is provided, play it continuously during the draw
    if (settings.drawSound && settings.drawSound.trim() !== "") {
      try {
        // Stop any existing draw sound
        if (drawSoundRef.current) {
          try {
            drawSoundRef.current.pause()
            drawSoundRef.current.currentTime = 0
          } catch {
            // Ignore errors
          }
        }

        // Create and play continuous draw sound
        const audio = new Audio(settings.drawSound)
        audio.volume = 0.5
        audio.loop = true // Loop the sound during the draw
        drawSoundRef.current = audio

        audio.play().catch((error) => {
          console.error("Error playing continuous draw sound:", error)
        })
      } catch (error) {
        console.error("Error setting up continuous draw sound:", error)
      }
    }
  }, [getSettings])

  // Update spinning sound speed (no-op, kept for compatibility but no continuous sound)
  const updateSpinSpeed = useCallback((_speed: number) => {
    // No continuous sound, so this is a no-op
    // Ticking sound frequency is fixed in playDefaultTickSound
  }, [])

  // Stop spinning sound
  const stopSpinningSound = useCallback(() => {
    isSpinningRef.current = false
    lastEntryIndexRef.current = null
    lastTickTimeRef.current = 0

    // Stop continuous draw sound if playing
    if (drawSoundRef.current) {
      try {
        drawSoundRef.current.pause()
        drawSoundRef.current.currentTime = 0
      } catch {
        // Ignore errors
      }
      drawSoundRef.current = null
    }

    // Stop any playing tick sounds from the pool
    tickSoundPoolRef.current.forEach((audio) => {
      try {
        audio.pause()
        audio.src = ''
      } catch {
        // Ignore errors
      }
    })
    tickSoundPoolRef.current = []
    activeTickSoundsRef.current = []

    // Reset state
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
      audio.loop = false
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
    playDefaultTickSound,
  }
}
