"use client"

import { useState, useEffect, useCallback } from "react"

interface SpeechSynthesisHook {
  speak: (text: string) => void
  cancel: () => void
  speaking: boolean
  voices: SpeechSynthesisVoice[]
  setVoice: (voice: SpeechSynthesisVoice) => void
  currentVoice: SpeechSynthesisVoice | null
}

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Get the list of voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
        if (availableVoices.length > 0) {
          setVoices(availableVoices)
          // Set default to a natural sounding English voice if available
          const defaultVoice =
            availableVoices.find(
              (voice) => (voice.lang.includes("en") && voice.name.includes("Google")) || voice.name.includes("Natural"),
            ) || availableVoices[0]
          setCurrentVoice(defaultVoice)
        }
      }

      loadVoices()

      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
    }
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)

        if (currentVoice) {
          utterance.voice = currentVoice
        }

        utterance.rate = 1.0
        utterance.pitch = 1.0

        utterance.onstart = () => setSpeaking(true)
        utterance.onend = () => setSpeaking(false)
        utterance.onerror = () => setSpeaking(false)

        window.speechSynthesis.speak(utterance)
      }
    },
    [currentVoice],
  )

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
  }, [])

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice)
  }, [])

  return {
    speak,
    cancel,
    speaking,
    voices,
    setVoice,
    currentVoice,
  }
}
