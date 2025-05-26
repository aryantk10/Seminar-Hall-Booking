
"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Mail, ShieldCheck, Building, UploadCloud, Trash2, Edit3, Save, XCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label"; // Added for form-like structure
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState(user?.name || "");
  const [editableEmail, setEditableEmail] = useState(user?.email || "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);


  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login/faculty"); 
    }
    if (user) {
      setSelectedImagePreview(user.avatarDataUrl || null);
      setEditableName(user.name);
      setEditableEmail(user.email);
    } else {
      setSelectedImagePreview(null);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limit to 2MB for dataURL feasibility
        toast({
          title: "Image Too Large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        updateUser({ avatarDataUrl: dataUrl });
        setSelectedImagePreview(dataUrl);
        toast({
          title: "Profile Picture Updated",
          description: "Your new profile picture has been set.",
        });
      };
      reader.onerror = () => {
        toast({
          title: "Error Reading File",
          description: "Could not read the selected image file.",
          variant: "destructive",
        });
      }
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = () => {
    updateUser({ avatarDataUrl: undefined });
    setSelectedImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = ""; 
    }
    toast({
      title: "Profile Picture Removed",
      description: "Your profile picture has been removed.",
    });
  }

  const handleEditToggle = () => {
    if (isEditing) { // Means 'Cancel' was effectively clicked or save completed
      setEditableName(user.name);
      setEditableEmail(user.email);
      setNameError(null);
      setEmailError(null);
    }
    setIsEditing(!isEditing);
  };

  const validateEmail = (email: string) => {
    // Basic email validation regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSaveChanges = () => {
    let isValid = true;
    if (!editableName.trim()) {
      setNameError("Full Name cannot be empty.");
      isValid = false;
    } else {
      setNameError(null);
    }

    if (!editableEmail.trim()) {
      setEmailError("Email Address cannot be empty.");
      isValid = false;
    } else if (!validateEmail(editableEmail)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (isValid) {
      updateUser({ name: editableName, email: editableEmail });
      toast({
        title: "Profile Updated",
        description: "Your name and email have been updated.",
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-primary/50 p-1 shadow-lg relative group">
            <AvatarImage 
              src={selectedImagePreview || user.avatarDataUrl || `https://avatar.vercel.sh/${user.email}.png?s=128`} 
              alt={user.name} 
              className="object-cover"
            />
            <AvatarFallback className="text-4xl">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <Input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <CardTitle className="text-3xl font-bold">{isEditing ? editableName : user.name}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground capitalize mb-3">
            {user.role} at Hall Hub
          </CardDescription>
          <div className="flex justify-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="mr-2 h-4 w-4" /> Change Picture
            </Button>
            {(selectedImagePreview || user.avatarDataUrl) && (
              <Button variant="ghost" size="sm" onClick={handleRemovePicture} className="text-destructive hover:text-destructive/80">
                <Trash2 className="mr-2 h-4 w-4" /> Remove Picture
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6 pt-4">
          {!isEditing && (
            <Button variant="outline" onClick={handleEditToggle} className="w-full sm:w-auto mb-4">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile Details
            </Button>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm text-muted-foreground flex items-center mb-1">
                  <UserIcon className="mr-2 h-5 w-5 text-primary" /> Full Name
                </Label>
                <Input
                  id="fullName"
                  value={editableName}
                  onChange={(e) => {
                    setEditableName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  placeholder="Your Full Name"
                  className={cn(nameError && "border-destructive focus-visible:ring-destructive")}
                />
                {nameError && <p className="text-xs text-destructive mt-1">{nameError}</p>}
              </div>
              <div>
                <Label htmlFor="emailAddress" className="text-sm text-muted-foreground flex items-center mb-1">
                  <Mail className="mr-2 h-5 w-5 text-primary" /> Email Address
                </Label>
                <Input
                  id="emailAddress"
                  type="email"
                  value={editableEmail}
                  onChange={(e) => {
                    setEditableEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="your.email@example.com"
                   className={cn(emailError && "border-destructive focus-visible:ring-destructive")}
                />
                {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
              </div>
              <div className="flex gap-2 pt-2 justify-end">
                <Button variant="outline" onClick={handleEditToggle}>
                  <XCircleIcon className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button onClick={handleSaveChanges}>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}

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
