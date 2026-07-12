// Supported languages with Twilio <Say> voice + speech recognition locales.
export interface LanguageDef {
  code: string;
  name: string;
  nativeName: string;
  twilioLocale: string; // for <Gather language="...">
  twilioVoice: string; // Amazon Polly voices via Twilio
}

export const LANGUAGES: LanguageDef[] = [
  { code: "en", name: "English", nativeName: "English", twilioLocale: "en-US", twilioVoice: "Polly.Joanna" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", twilioLocale: "hi-IN", twilioVoice: "Polly.Aditi" },
  { code: "es", name: "Spanish", nativeName: "Español", twilioLocale: "es-ES", twilioVoice: "Polly.Conchita" },
  { code: "fr", name: "French", nativeName: "Français", twilioLocale: "fr-FR", twilioVoice: "Polly.Celine" },
  { code: "de", name: "German", nativeName: "Deutsch", twilioLocale: "de-DE", twilioVoice: "Polly.Marlene" },
  { code: "it", name: "Italian", nativeName: "Italiano", twilioLocale: "it-IT", twilioVoice: "Polly.Carla" },
  { code: "pt", name: "Portuguese", nativeName: "Português", twilioLocale: "pt-BR", twilioVoice: "Polly.Camila" },
  { code: "ja", name: "Japanese", nativeName: "日本語", twilioLocale: "ja-JP", twilioVoice: "Polly.Mizuki" },
];

export function getLanguage(code: string): LanguageDef {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
