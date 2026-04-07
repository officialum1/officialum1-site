import { useRegister } from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  
  const register = useRegister();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({ data: { email, password, name, referralCode } }, {
      onSuccess: (data) => {
        localStorage.setItem("um1_token", data.token);
        queryClient.setQueryData(["/api/users/me"], data.user);
        toast({ title: "Account Created", description: "Welcome to OfficialUM1!" });
        setLocation("/dashboard");
      },
      onError: () => {
        toast({ title: "Registration Failed", description: "Could not create account.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-xl border-primary/20 shadow-[0_0_50px_-12px_rgba(0,255,136,0.1)]">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <UserPlus className="w-6 h-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
          <CardDescription>Join the premium digital marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-background/50 focus-visible:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 focus-visible:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50 focus-visible:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referralCode">Referral Code (Optional)</Label>
              <Input 
                id="referralCode" 
                placeholder="Got a code?" 
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="bg-background/50 focus-visible:ring-primary/50"
              />
            </div>
            <Button type="submit" className="w-full mt-6" disabled={register.isPending}>
              {register.isPending ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/50 pt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
