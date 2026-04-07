import { useState } from "react";
import { useListTickets, useCreateTicket } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { LifeBuoy, MessageSquare, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  
  const { data: tickets, isLoading } = useListTickets();
  const createTicket = useCreateTicket();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket.mutate({ data: { subject, message, priority } }, {
      onSuccess: () => {
        toast({ title: "Ticket Created", description: "Support will respond shortly." });
        setSubject("");
        setMessage("");
        setPriority("normal");
      }
    });
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <LifeBuoy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Support Center</h1>
          <p className="text-muted-foreground">Manage your support tickets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="bg-card/50 border-border/50 sticky top-24">
            <CardHeader>
              <CardTitle>Create Ticket</CardTitle>
              <CardDescription>Need help? Open a new ticket.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required className="bg-background/50 resize-none" rows={4} />
                </div>
                <Button type="submit" className="w-full" disabled={createTicket.isPending}>
                  {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="bg-card/30 border-border/50 h-full">
            <CardHeader>
              <CardTitle>Your Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : tickets && tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="p-4 rounded-lg bg-background border border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div>
                        <div className="flex gap-2 items-center mb-1">
                          <span className="font-semibold text-foreground">#{ticket.id}</span>
                          <span className="font-medium">{ticket.subject}</span>
                          <Badge variant="outline" className={
                            ticket.status === 'open' ? 'border-primary text-primary' : 
                            ticket.status === 'resolved' ? 'border-muted text-muted-foreground' : ''
                          }>
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {ticket.replies.length} replies • {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="secondary" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>You don't have any support tickets yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
