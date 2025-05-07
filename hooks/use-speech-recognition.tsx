"use client"

import { useState, useEffect, useCallback } from "react"

interface SpeechRecognitionHook {
  transcript: string
  isListening: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  browserSupportsSpeechRecognition: boolean
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for browser support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        setBrowserSupportsSpeechRecognition(true)
        const recognitionInstance = new SpeechRecognition()

        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = "en-US"

        recognitionInstance.onresult = (event: any) => {
          const current = event.resultIndex
          const transcript = event.results[current][0].transcript
          setTranscript(transcript)
        }

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript("")
      recognition.start()
      setIsListening(true)
    }
  }, [recognition, isListening])

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop()
      setIsListening(false)
    }
  }, [recognition, isListening])

  const resetTranscript = useCallback(() => {
    setTranscript("")
  }, [])

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  }
}
