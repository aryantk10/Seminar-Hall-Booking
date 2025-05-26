import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Building } from "lucide-react";
import type { ReactNode } from "react";

interface AuthFormCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footerContent?: ReactNode;
}

export default function AuthFormCard({ title, description, children, footerContent }: AuthFormCardProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Link href="/" className="mb-4 inline-flex items-center justify-center gap-2 text-2xl font-semibold text-primary">
            <Building className="h-8 w-8" />
            <span>Hall Hub</span>
          </Link>
          <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        {footerContent && (
          <div className="p-6 pt-0 text-center text-sm text-muted-foreground">
            {footerContent}
          </div>
        )}
      </Card>
    </div>
  );
}
