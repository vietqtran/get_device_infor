// Import the BrowserFingerprint class
import { BrowserFingerprint } from './BrowserFingerprint.js'

// Function to collect fingerprint data
async function collectFingerprint() {
   try {
      const fingerprinter = new BrowserFingerprint()
      const fingerprintData = await fingerprinter.collectAll()
      return fingerprintData
   } catch (error) {
      console.error('Error collecting fingerprint:', error)
      return { error: error.message }
   }
}

// Function to send fingerprint data to server
async function sendFingerprintToServer(apiUrl, fingerprintData) {
   try {
      const response = await fetch(`${apiUrl}/submit-fingerprint`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(fingerprintData)
      })

      if (!response.ok) {
         throw new Error(`HTTP error: ${response.status}`)
      }

      return await response.json()
   } catch (error) {
      console.error('Error sending fingerprint to server:', error)
      throw error
   }
}

// Export functions for use in HTML
window.fingerprintUtils = {
   collectFingerprint,
   sendFingerprintToServer
}
