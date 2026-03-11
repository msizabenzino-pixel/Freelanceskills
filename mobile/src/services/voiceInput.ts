import * as Speech from 'expo-speech';

export const VoiceInputService = {
  speak: async (text: string) => {
    Speech.speak(text);
  },
  
  stop: async () => {
    Speech.stop();
  },

  isSpeaking: async () => {
    return Speech.isSpeakingAsync();
  }
};

// Note: For voice-to-text, expo-speech only handles text-to-voice.
// Real voice input would usually use expo-speech-recognition or similar.
// Since we are building a prototype, we'll stub the transcription part.
export const transcribeVoice = async () => {
  // Stub for voice to text conversion
  return "This is a transcribed voice message";
};
