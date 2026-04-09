import { useState, useRef } from "react";
import { Play, Globe, ChevronDown, Check, X, ExternalLink } from "lucide-react";
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
  duration?: string;
  thumbnail: string;
  description?: string;
  aspectRatio?: "video" | "square";
  /** YouTube video ID — e.g. "dQw4w9WgXcQ". Enables real in-page YouTube playback. */
  youtubeId?: string;
  /** Direct mp4/webm URL for HTML5 video playback. */
  videoSrc?: string;
  /** Fallback: uses a YouTube search embed when neither youtubeId nor videoSrc is set. */
  youtubeSearchQuery?: string;
}

export function VideoPlayer({
  title,
  duration,
  thumbnail,
  description,
  aspectRatio = "video",
  youtubeId,
  videoSrc,
  youtubeSearchQuery,
}: VideoPlayerProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(VIDEO_LANGUAGES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const aspectClass = aspectRatio === "video" ? "aspect-video" : "aspect-square";
  const isPlayable = Boolean(youtubeId || videoSrc || youtubeSearchQuery);

  const handlePlay = () => {
    if (isPlayable) {
      setIsPlaying(true);
    } else if (youtubeSearchQuery) {
      setIsPlaying(true);
    }
  };

  return (
    <div className="group">
      <div className={`${aspectClass} bg-slate-900 rounded-xl overflow-hidden relative`}>

        {/* ── YouTube embed ─────────────────────────────────── */}
        {isPlaying && youtubeId ? (
          <div className="absolute inset-0">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
              title={title}
            />
            <button
              className="absolute top-2 right-2 z-50 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition-colors"
              onClick={() => setIsPlaying(false)}
              aria-label="Close video"
              data-testid="btn-close-video"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        /* ── HTML5 video embed ────────────────────────────── */
        ) : isPlaying && videoSrc ? (
          <div className="absolute inset-0">
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              controls
              playsInline
              className="w-full h-full object-cover"
              onEnded={() => setIsPlaying(false)}
            />
            <button
              className="absolute top-2 right-2 z-50 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition-colors"
              onClick={() => setIsPlaying(false)}
              aria-label="Close video"
              data-testid="btn-close-video"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        /* ── Thumbnail / poster state ─────────────────────── */
        ) : isPlaying && youtubeSearchQuery ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(youtubeSearchQuery)}&autoplay=1&rel=0&modestbranding=1&cc_load_policy=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
            title={title}
          />
        ) : (
          <>
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-200"
              data-testid={`img-video-thumbnail-${title.toLowerCase().replace(/\s+/g, "-")}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Play button — only shown when there's something to play */}
            {isPlayable ? (
              <button
                className="absolute inset-0 flex items-center justify-center z-10 w-full cursor-pointer"
                onClick={handlePlay}
                aria-label={`Play ${title}`}
                data-testid={`btn-play-${title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/80 transition-all duration-200 ring-2 ring-white/40">
                  <Play className="h-8 w-8 text-white fill-white ml-1" />
                </div>
              </button>
            ) : youtubeSearchQuery ? (
              <button
                className="absolute inset-0 flex items-center justify-center z-10 w-full cursor-pointer"
                onClick={handlePlay}
                aria-label={`Play ${title}`}
                data-testid={`btn-play-${title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="text-center px-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-200">
                    <ExternalLink className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-white text-xs mt-2 font-medium bg-black/50 px-3 py-1 rounded-full inline-block">
                    Play video
                  </p>
                </div>
              </button>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <span className="text-white/80 text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full tracking-wide">
                  Video preview available soon
                </span>
              </div>
            )}

            {/* Caption bar */}
            <div className="absolute bottom-4 left-4 right-14 text-white z-10 pointer-events-none">
              <p className="font-semibold text-sm leading-tight">{title}</p>
              {(duration || selectedLanguage) && (
                <p className="text-xs text-white/70 mt-0.5">
                  {duration && <span>{duration}</span>}
                  {duration && " · "}
                  {selectedLanguage.name}
                </p>
              )}
            </div>

            {/* Language selector — shown for playable or searchable content */}
            {isPlayable && (
              <div className="absolute top-3 right-3 z-20" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 gap-1.5 bg-black/50 hover:bg-black/70 text-white border-0"
                      data-testid="btn-language-selector"
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
                        data-testid={`lang-option-${lang.code}`}
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
            )}
          </>
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
    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg px-4 py-3 border border-border">
      <Globe className="h-4 w-4 shrink-0 text-primary" />
      <span>
        Videos available in <strong>10 languages</strong> including English, Afrikaans, isiZulu, and more.
        Click the language button on any video to switch.
      </span>
    </div>
  );
}
