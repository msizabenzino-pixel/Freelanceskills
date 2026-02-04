import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCurrency } from "@/lib/currency";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Plus, 
  Trash2,
  GripVertical,
  CalendarDays,
  DollarSign,
  AlertCircle,
  Download,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "pending" | "in_progress" | "submitted" | "approved";
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  milestoneId: string;
}

export function ContractBuilder({ 
  open, 
  onClose,
  onComplete
}: { 
  open: boolean; 
  onClose: () => void;
  onComplete: (contract: any) => void;
}) {
  const { toast } = useToast();
  const { formatAmount } = useCurrency();
  const [step, setStep] = useState<"details" | "milestones" | "review">("details");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: "1", title: "", description: "", amount: 0, dueDate: "", status: "pending" }
  ]);

  const addMilestone = () => {
    setMilestones([...milestones, {
      id: Date.now().toString(),
      title: "",
      description: "",
      amount: 0,
      dueDate: "",
      status: "pending"
    }]);
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: any) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter(m => m.id !== id));
    }
  };

  const totalMilestoneAmount = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);

  const handleSubmit = () => {
    const contract = {
      projectTitle,
      projectDescription,
      totalBudget: parseFloat(totalBudget),
      milestones,
      createdAt: new Date().toISOString()
    };
    onComplete(contract);
    toast({
      title: "Contract Created!",
      description: "The contract has been sent to the client for approval.",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Create Contract
          </DialogTitle>
          <DialogDescription>
            Define project scope, milestones, and payment terms
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 py-4 border-b">
          {["details", "milestones", "review"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s ? "bg-primary text-white" : 
                ["details", "milestones", "review"].indexOf(step) > i ? "bg-green-500 text-white" : "bg-slate-200"
              }`}>
                {["details", "milestones", "review"].indexOf(step) > i ? "✓" : i + 1}
              </div>
              <span className={`text-sm ${step === s ? "font-medium" : "text-muted-foreground"}`}>
                {s === "details" ? "Project Details" : s === "milestones" ? "Milestones" : "Review"}
              </span>
              {i < 2 && <div className="w-8 h-0.5 bg-slate-200" />}
            </div>
          ))}
        </div>

        {step === "details" && (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Project Title</Label>
              <Input 
                placeholder="e.g., Complete Website Redesign"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Project Description</Label>
              <Textarea 
                placeholder="Describe the scope of work, deliverables, and requirements..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Total Budget (ZAR)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R</span>
                <Input 
                  type="number"
                  placeholder="5000"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Button 
              onClick={() => setStep("milestones")} 
              className="w-full"
              disabled={!projectTitle || !totalBudget}
              data-testid="button-continue-milestones"
            >
              Continue to Milestones
            </Button>
          </div>
        )}

        {step === "milestones" && (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Payment Milestones</h3>
                <p className="text-sm text-muted-foreground">Break the project into deliverable phases</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="font-bold">{formatAmount(parseFloat(totalBudget || "0"))}</p>
              </div>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <span className="font-medium">Milestone {index + 1}</span>
                    </div>
                    {milestones.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeMilestone(milestone.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input 
                        placeholder="e.g., Design Phase"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(milestone.id, "title", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Amount (R)</Label>
                        <Input 
                          type="number"
                          placeholder="1000"
                          value={milestone.amount || ""}
                          onChange={(e) => updateMilestone(milestone.id, "amount", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input 
                          type="date"
                          value={milestone.dueDate}
                          onChange={(e) => updateMilestone(milestone.id, "dueDate", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Deliverables</Label>
                    <Textarea 
                      placeholder="What will be delivered in this milestone..."
                      value={milestone.description}
                      onChange={(e) => updateMilestone(milestone.id, "description", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={addMilestone} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Milestone
            </Button>

            {totalMilestoneAmount !== parseFloat(totalBudget || "0") && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <p className="text-sm text-amber-700">
                  Milestone total (R{totalMilestoneAmount.toLocaleString()}) doesn't match budget (R{parseFloat(totalBudget || "0").toLocaleString()})
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={() => setStep("review")} 
                className="flex-1"
                disabled={milestones.some(m => !m.title || !m.amount)}
              >
                Review Contract
              </Button>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-6 py-4">
            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-bold text-xl">{projectTitle}</h3>
                <p className="text-muted-foreground mt-2">{projectDescription}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Payment Schedule</h4>
                <div className="space-y-3">
                  {milestones.map((m, i) => (
                    <div key={m.id} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium">{m.title}</p>
                          {m.dueDate && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              Due: {new Date(m.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-bold">{formatAmount(m.amount)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl">{formatAmount(totalMilestoneAmount)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Escrow Protected</p>
                  <p className="text-green-700">Funds for each milestone will be held securely until you approve the deliverables.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("milestones")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1 gap-2" data-testid="button-send-contract">
                <Send className="h-4 w-4" />
                Send Contract
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function MilestoneTracker({ milestones }: { milestones: Milestone[] }) {
  const { formatAmount } = useCurrency();
  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        Project Progress
      </h3>
      
      <div className="space-y-3">
        {milestones.map((milestone, index) => (
          <div 
            key={milestone.id}
            className={`relative pl-8 pb-4 ${index < milestones.length - 1 ? "border-l-2 border-slate-200 ml-3" : ""}`}
          >
            <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center ${
              milestone.status === "approved" ? "bg-green-500" :
              milestone.status === "submitted" ? "bg-amber-500" :
              milestone.status === "in_progress" ? "bg-blue-500" :
              "bg-slate-300"
            } ${index < milestones.length - 1 ? "-ml-3" : "ml-0"}`}>
              {milestone.status === "approved" ? (
                <CheckCircle className="h-4 w-4 text-white" />
              ) : (
                <span className="text-xs text-white font-medium">{index + 1}</span>
              )}
            </div>
            
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{milestone.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                </div>
                <span className="font-bold">{formatAmount(milestone.amount)}</span>
              </div>
              
              {milestone.dueDate && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  Due: {new Date(milestone.dueDate).toLocaleDateString()}
                </p>
              )}

              <div className="mt-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  milestone.status === "approved" ? "bg-green-100 text-green-700" :
                  milestone.status === "submitted" ? "bg-amber-100 text-amber-700" :
                  milestone.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {milestone.status === "approved" ? "Completed" :
                   milestone.status === "submitted" ? "Pending Review" :
                   milestone.status === "in_progress" ? "In Progress" :
                   "Upcoming"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TaskList({ 
  tasks, 
  onToggle,
  onAdd 
}: { 
  tasks: Task[]; 
  onToggle: (id: string) => void;
  onAdd: (title: string) => void;
}) {
  const [newTask, setNewTask] = useState("");

  const handleAdd = () => {
    if (newTask.trim()) {
      onAdd(newTask);
      setNewTask("");
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Task Checklist</h3>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{tasks.length} completed
        </span>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
        />
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:bg-slate-50 cursor-pointer"
            onClick={() => onToggle(task.id)}
          >
            <Checkbox checked={task.completed} />
            <span className={task.completed ? "line-through text-muted-foreground" : ""}>
              {task.title}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input 
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
