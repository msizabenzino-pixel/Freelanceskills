import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, Bookmark, CheckCircle2, History, MessageSquare, AlertCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type JobStatus = 'open' | 'hired' | 'in_progress' | 'delivered' | 'completed' | 'disputed';

interface JobLifecycleCardProps {
  title: string;
  freelancer?: string;
  budget: string;
  initialStatus: JobStatus;
  description: string;
}

export function JobLifecycleCard({ title, freelancer, budget, initialStatus, description }: JobLifecycleCardProps) {
  const [status, setStatus] = useState<JobStatus>(initialStatus);

  const statusConfig: Record<JobStatus, { label: string; color: string; icon: any }> = {
    open: { label: "Open for Bids", color: "bg-blue-500", icon: Clock },
    hired: { label: "Freelancer Hired", color: "bg-purple-500", icon: CheckCircle2 },
    in_progress: { label: "In Progress", color: "bg-orange-500", icon: History },
    delivered: { label: "Work Delivered", color: "bg-indigo-500", icon: MessageSquare },
    completed: { label: "Completed & Released", color: "bg-green-600", icon: CheckCircle2 },
    disputed: { label: "Under Review", color: "bg-red-500", icon: AlertCircle },
  };

  const Config = statusConfig[status];

  const handleNextStep = () => {
    if (status === 'open') setStatus('hired');
    else if (status === 'hired') setStatus('in_progress');
    else if (status === 'in_progress') setStatus('delivered');
    else if (status === 'delivered') setStatus('completed');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={cn("text-[10px] uppercase tracking-wider font-bold", Config.color)}>
                <Config.icon className="w-3 h-3 mr-1" />
                {Config.label}
              </Badge>
              {status === 'completed' && <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50 font-bold uppercase">Payment Released</Badge>}
            </div>
            <h3 className="font-display font-bold text-lg text-primary">{title}</h3>
            {freelancer && <p className="text-sm font-medium text-muted-foreground">Contractor: <span className="text-primary">{freelancer}</span></p>}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">{budget}</div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Budget Escrowed</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4 italic">
          "{description}"
        </p>
        
        <div className="relative pt-2">
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2" />
           <div className="relative flex justify-between">
              {['open', 'hired', 'in_progress', 'delivered', 'completed'].map((s, i) => {
                const isActive = ['open', 'hired', 'in_progress', 'delivered', 'completed'].indexOf(status) >= i;
                return (
                  <div key={s} className={cn(
                    "w-3 h-3 rounded-full border-2 transition-colors z-10",
                    isActive ? "bg-accent border-accent" : "bg-white border-muted"
                  )} />
                );
              })}
           </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-muted/50 flex justify-between items-center bg-muted/5">
        <div className="text-[10px] text-muted-foreground font-bold uppercase">
          {status === 'completed' ? 'Transaction Closed' : 'Action Required'}
        </div>
        
        <div className="flex gap-2">
          {status === 'delivered' && (
            <Button size="sm" variant="outline" className="text-xs h-8 text-red-600 hover:bg-red-50 border-red-100" onClick={() => setStatus('disputed')}>
              Dispute
            </Button>
          )}
          {status !== 'completed' && status !== 'disputed' && (
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold text-xs h-8 px-4" onClick={handleNextStep}>
              {status === 'open' && "Hire Freelancer"}
              {status === 'hired' && "Start Milestone"}
              {status === 'in_progress' && "Submit Work"}
              {status === 'delivered' && "Release Payment"}
            </Button>
          )}
          {status === 'disputed' && (
            <Button size="sm" variant="secondary" className="text-xs h-8" onClick={() => setStatus('delivered')}>
              Resolve
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}