import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Monitor,
  Users,
  Calendar,
  Clock,
  Copy,
  Check,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoCallProps {
  open: boolean;
  onClose: () => void;
  recipientName?: string;
  recipientAvatar?: string;
}

export function VideoCallDialog({ open, onClose, recipientName = "Client" }: VideoCallProps) {
  const { toast } = useToast();
  const [callState, setCallState] = useState<"schedule" | "waiting" | "active" | "ended">("schedule");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [copied, setCopied] = useState(false);

  const generateMeetingLink = () => {
    const id = Math.random().toString(36).substr(2, 9);
    return `https://meet.freelanceskill.co.za/${id}`;
  };

  const handleScheduleCall = () => {
    const link = generateMeetingLink();
    setMeetingLink(link);
    setCallState("waiting");
  };

  const handleStartCall = () => {
    setCallState("active");
  };

  const handleEndCall = () => {
    setCallState("ended");
    toast({
      title: "Call Ended",
      description: `Your call with ${recipientName} has ended.`,
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!", description: "Share this link with your client." });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            Video Call
          </DialogTitle>
          <DialogDescription>
            {callState === "schedule" && "Schedule or start a video call"}
            {callState === "waiting" && "Waiting for participant to join"}
            {callState === "active" && `In call with ${recipientName}`}
            {callState === "ended" && "Call ended"}
          </DialogDescription>
        </DialogHeader>

        {callState === "schedule" && (
          <div className="space-y-6 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <button 
                onClick={handleScheduleCall}
                className="p-6 bg-primary/5 rounded-xl border-2 border-primary/20 hover:border-primary transition-colors text-left"
              >
                <Video className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Start Instant Call</h3>
                <p className="text-sm text-muted-foreground">
                  Generate a meeting link and start a call now
                </p>
              </button>

              <button 
                className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-colors text-left"
              >
                <Calendar className="h-8 w-8 text-slate-600 mb-3" />
                <h3 className="font-semibold mb-1">Schedule for Later</h3>
                <p className="text-sm text-muted-foreground">
                  Set a date and time for your meeting
                </p>
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Video Call Features</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  HD Video Quality
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Screen Sharing
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  In-call Chat
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Recording (Pro)
                </div>
              </div>
            </div>
          </div>
        )}

        {callState === "waiting" && (
          <div className="space-y-6 py-4">
            <div className="bg-slate-100 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Your meeting is ready</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Share this link with {recipientName} to join
              </p>
              
              <div className="flex items-center gap-2 bg-white rounded-lg p-2 border">
                <Input 
                  value={meetingLink}
                  readOnly
                  className="border-0 bg-transparent"
                />
                <Button variant="outline" size="sm" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleStartCall} className="flex-1 gap-2">
                <Video className="h-4 w-4" />
                Join Meeting
              </Button>
            </div>
          </div>
        )}

        {callState === "active" && (
          <div className="space-y-4 py-4">
            {/* Video Preview */}
            <div className="relative bg-slate-900 rounded-xl aspect-video overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {isVideoOn ? (
                  <div className="text-white text-center">
                    <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl font-bold">{recipientName.charAt(0)}</span>
                    </div>
                    <p>{recipientName}</p>
                  </div>
                ) : (
                  <div className="text-white text-center">
                    <VideoOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-70">Camera off</p>
                  </div>
                )}
              </div>

              {/* Self preview */}
              <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-800 rounded-lg border-2 border-white/20 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-xs">You</span>
                </div>
              </div>

              {/* Call timer */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                00:42
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant={isMicOn ? "outline" : "destructive"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={() => setIsMicOn(!isMicOn)}
              >
                {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </Button>

              <Button 
                variant={isVideoOn ? "outline" : "destructive"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>

              <Button 
                variant={isScreenSharing ? "default" : "outline"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={() => setIsScreenSharing(!isScreenSharing)}
              >
                <Monitor className="h-6 w-6" />
              </Button>

              <Button 
                variant="outline"
                size="lg"
                className="rounded-full w-14 h-14"
              >
                <MessageSquare className="h-6 w-6" />
              </Button>

              <Button 
                variant="destructive"
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={handleEndCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}

        {callState === "ended" && (
          <div className="space-y-6 py-4 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Phone className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Call Ended</h3>
              <p className="text-sm text-muted-foreground">Duration: 12:34</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              <Button onClick={() => setCallState("schedule")} className="flex-1">
                Start New Call
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function VideoCallButton({ 
  recipientName,
  variant = "default" 
}: { 
  recipientName: string;
  variant?: "default" | "outline" | "ghost";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)} className="gap-2" data-testid="button-video-call">
        <Video className="h-4 w-4" />
        Video Call
      </Button>
      <VideoCallDialog 
        open={open} 
        onClose={() => setOpen(false)}
        recipientName={recipientName}
      />
    </>
  );
}
