"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { auth } from "@/lib/api";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

interface LoginFormProps {
  userType: 'faculty' | 'admin';
}

// const REGISTERED_USERS_STORAGE_KEY = "hallHubRegisteredUsers";

export default function LoginForm({ userType }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await auth.login(values);
      const userData = response.data as User;

      // Check if the user has the correct role
      if (userType === 'admin' && userData.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "This login is for administrators only.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (userType === 'faculty' && userData.role !== 'faculty') {
        toast({
          title: "Access Denied",
          description: "This login is for faculty members only.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Store the token
      localStorage.setItem('token', userData.token || '');

      // Login the user
      login(userData);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name}!`,
      });

      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Log In
        </Button>
      </form>
    </Form>
  );
}
