"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Mail, ShieldCheck, Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login/faculty"); // Redirect if not logged in
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading profile...</p>
      </div>
    );
  }

  const getInitials = (name: string = "") => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'P';
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4 border-2 border-primary p-1 shadow-md">
            <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png?s=96`} alt={user.name} />
            <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground capitalize">
            {user.role} at Hall Hub
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center p-4 border rounded-lg bg-background hover:bg-muted/50 transition-colors shadow-sm">
            <UserIcon className="mr-4 h-6 w-6 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium text-foreground">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center p-4 border rounded-lg bg-background hover:bg-muted/50 transition-colors shadow-sm">
            <Mail className="mr-4 h-6 w-6 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Email Address</p>
              <p className="font-medium text-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center p-4 border rounded-lg bg-background hover:bg-muted/50 transition-colors shadow-sm">
            <ShieldCheck className="mr-4 h-6 w-6 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium text-foreground capitalize">{user.role}</p>
            </div>
          </div>
           <div className="flex items-center p-4 border rounded-lg bg-background hover:bg-muted/50 transition-colors shadow-sm">
            <Building className="mr-4 h-6 w-6 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Account ID</p>
              <p className="font-medium text-foreground text-xs">{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
