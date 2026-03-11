import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { FraudFlag } from "@shared/schema";

export default function FraudDashboard() {
  const { toast } = useToast();
  const { data: flags, isLoading } = useQuery<FraudFlag[]>({
    queryKey: ["/api/admin/fraud-flags"],
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, resolution }: { id: number; resolution: string }) => {
      const res = await fetch(`/api/admin/fraud-flags/${id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution }),
      });
      if (!res.ok) throw new Error("Failed to resolve flag");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fraud-flags"] });
      toast({ title: "Flag resolved", description: "The fraud flag has been updated." });
    },
    onError: (err: any) => {
      toast({ 
        title: "Error", 
        description: err.message, 
        variant: "destructive" 
      });
    },
  });

  if (isLoading) return <div className="p-8 text-center">Loading flags...</div>;

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Fraud Review Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Booking ID</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flags?.map((flag) => (
                <TableRow key={flag.id}>
                  <TableCell>
                    {format(new Date(flag.createdAt), "MMM d, HH:mm")}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{flag.userId}</TableCell>
                  <TableCell className="font-mono text-xs">{flag.bookingId || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={flag.riskScore > 70 ? "destructive" : "outline"}>
                      {flag.riskScore}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {flag.flags.map((f, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {flag.resolvedAt ? (
                      <Badge variant="secondary">Resolved: {flag.resolution}</Badge>
                    ) : (
                      <Badge>Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!flag.resolvedAt && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          data-testid={`button-approve-${flag.id}`}
                          onClick={() => resolveMutation.mutate({ id: flag.id, resolution: "approved" })}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          data-testid={`button-reject-${flag.id}`}
                          onClick={() => resolveMutation.mutate({ id: flag.id, resolution: "rejected" })}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {flags?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No unresolved fraud flags found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
