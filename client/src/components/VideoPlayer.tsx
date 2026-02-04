import { useState } from "react";
import { Play, Globe, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const VIDEO_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "af", name: "Afrikaans", flag: "🇿🇦" },
  { code: "zu", name: "isiZulu", flag: "🇿🇦" },
  { code: "xh", name: "isiXhosa", flag: "🇿🇦" },
  { code: "st", name: "Sesotho", flag: "🇿🇦" },
  { code: "tn", name: "Setswana", flag: "🇧🇼" },
  { code: "ss", name: "siSwati", flag: "🇸🇿" },
  { code: "pt", name: "Português", flag: "🇲🇿" },
  { code: "es", name: "Español", flag: "🌍" },
  { code: "fr", name: "Français", flag: "🌍" },
];

interface VideoPlayerProps {
  title: string;
  duration: string;
  thumbnail: string;
  description?: string;
  aspectRatio?: "video" | "square";
}

export function VideoPlayer({ 
  title, 
  duration, 
  thumbnail, 
  description,
  aspectRatio = "video" 
}: VideoPlayerProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(VIDEO_LANGUAGES[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="group">
      <div 
        className={`${aspectRatio === "video" ? "aspect-video" : "aspect-square"} bg-slate-900 rounded-xl overflow-hidden relative cursor-pointer`}
        onClick={() => setIsPlaying(true)}
      >
        {!isPlaying ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-white ml-1" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <img 
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity"
            />
            <div className="absolute bottom-4 left-4 right-4 text-white z-10">
              <p className="font-semibold">{title}</p>
              <p className="text-xs text-white/70">{duration} • {selectedLanguage.name}</p>
            </div>
            
            {/* Language selector */}
            <div className="absolute top-3 right-3 z-20" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-8 gap-1.5 bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span className="text-xs">{selectedLanguage.flag} {selectedLanguage.code.toUpperCase()}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Choose Video Language
                  </div>
                  {VIDEO_LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang)}
                      className="cursor-pointer"
                    >
                      <span className="mr-2">{lang.flag}</span>
                      <span className="flex-1">{lang.name}</span>
                      {selectedLanguage.code === lang.code && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800">
            <div className="text-center text-white p-6">
              <Play className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">{title}</p>
              <p className="text-sm text-white/70 mt-1">
                Playing in {selectedLanguage.name}
              </p>
              <p className="text-xs text-white/50 mt-4">
                Video content coming soon
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(false);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}

export function VideoLanguageInfo() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-slate-100 rounded-lg px-4 py-2">
      <Globe className="h-4 w-4" />
      <span>
        Videos available in <strong>10 languages</strong> including English, Afrikaans, isiZulu, and more. 
        Click the language button on any video to switch.
      </span>
    </div>
  );
}
