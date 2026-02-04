import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Lock, Star, AlertTriangle, ThumbsUp, ThumbsDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CONCERN_LABELS: Record<string, string> = {
  arrived_late: "Arrived late",
  left_early: "Left before completing work",
  poor_communication: "Poor communication",
  unprofessional_behavior: "Unprofessional behavior",
  work_quality_issues: "Work quality issues",
  overcharged: "Tried to overcharge",
  asked_for_cash: "Asked for cash payment",
  tried_to_take_offline: "Tried to take work offline",
  misrepresented_skills: "Skills didn't match profile",
  safety_concerns: "Safety concerns",
  property_damage: "Property damage",
  no_show: "Didn't show up",
};

interface PrivateFeedbackFormProps {
  bookingId: string;
  freelancerName: string;
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function PrivateFeedbackForm({ 
  bookingId, 
  freelancerName,
  open, 
  onClose,
  onComplete 
}: PrivateFeedbackFormProps) {
  const { toast } = useToast();
  const [privateRating, setPrivateRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [wouldHireAgain, setWouldHireAgain] = useState<boolean | null>(null);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [privateComments, setPrivateComments] = useState("");
  const [concernsRaised, setConcernsRaised] = useState<string[]>([]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/bookings/${bookingId}/private-feedback`, {
        method: "POST",
        body: JSON.stringify({
          privateRating,
          wouldRecommend,
          wouldHireAgain,
          communicationRating,
          professionalismRating,
          qualityRating,
          valueRating,
          privateComments,
          concernsRaised,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Thank you for your feedback",
        description: "Your private feedback helps us maintain quality on the platform.",
      });
      onComplete();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5"
          >
            <Star 
              className={`h-6 w-6 transition-colors ${
                star <= value ? "text-amber-400 fill-amber-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const toggleConcern = (concern: string) => {
    setConcernsRaised(prev => 
      prev.includes(concern) 
        ? prev.filter(c => c !== concern)
        : [...prev, concern]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Private Feedback
          </DialogTitle>
          <DialogDescription>
            Just between us - this feedback is confidential and helps us maintain quality.
            It will not be shown to {freelancerName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium">Why private feedback?</p>
            <p className="text-blue-700 mt-1">
              This helps us identify patterns and protect other users. 
              Your honest feedback improves the platform for everyone.
            </p>
          </div>

          <StarRating 
            value={privateRating} 
            onChange={setPrivateRating} 
            label="Overall Experience (Private)" 
          />

          <div className="grid grid-cols-2 gap-4">
            <StarRating 
              value={communicationRating} 
              onChange={setCommunicationRating} 
              label="Communication" 
            />
            <StarRating 
              value={professionalismRating} 
              onChange={setProfessionalismRating} 
              label="Professionalism" 
            />
            <StarRating 
              value={qualityRating} 
              onChange={setQualityRating} 
              label="Work Quality" 
            />
            <StarRating 
              value={valueRating} 
              onChange={setValueRating} 
              label="Value for Money" 
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Would you recommend?</label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={wouldRecommend === true ? "default" : "outline"}
                size="sm"
                onClick={() => setWouldRecommend(true)}
                className="flex-1"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Yes
              </Button>
              <Button
                type="button"
                variant={wouldRecommend === false ? "destructive" : "outline"}
                size="sm"
                onClick={() => setWouldRecommend(false)}
                className="flex-1"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                No
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Would you hire again?</label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={wouldHireAgain === true ? "default" : "outline"}
                size="sm"
                onClick={() => setWouldHireAgain(true)}
                className="flex-1"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Definitely
              </Button>
              <Button
                type="button"
                variant={wouldHireAgain === false ? "destructive" : "outline"}
                size="sm"
                onClick={() => setWouldHireAgain(false)}
                className="flex-1"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                No
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Any concerns? (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CONCERN_LABELS).map(([key, label]) => (
                <label 
                  key={key}
                  className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-sm transition-colors ${
                    concernsRaised.includes(key) 
                      ? "bg-red-50 border-red-200 text-red-700" 
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Checkbox
                    checked={concernsRaised.includes(key)}
                    onCheckedChange={() => toggleConcern(key)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Additional private comments (Optional)
            </label>
            <Textarea
              value={privateComments}
              onChange={(e) => setPrivateComments(e.target.value)}
              placeholder="Share anything else you think we should know..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Skip for now
            </Button>
            <Button 
              onClick={() => submitMutation.mutate()}
              disabled={privateRating === 0 || submitMutation.isPending}
              className="flex-1"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
