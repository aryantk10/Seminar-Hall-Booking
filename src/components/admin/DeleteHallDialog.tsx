'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Building, Users, MapPin } from 'lucide-react';

interface Hall {
  _id: string;
  name: string;
  capacity: number;
  location: string;
  facilities: string[];
  description?: string;
  images?: string[];
  isAvailable: boolean;
}

interface DeleteHallDialogProps {
  hall: Hall;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteHallDialog({ hall, open, onOpenChange, onConfirm }: DeleteHallDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleConfirm = async () => {
    if (confirmationText !== hall.name) {
      alert(`Please type "${hall.name}" to confirm deletion`);
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm();
      setConfirmationText(''); // Reset on success
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmationText(''); // Reset when dialog closes
    }
    onOpenChange(open);
  };

  if (!hall) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Delete Hall</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete this hall? This action cannot be undone.
              </p>
              
              {/* Hall Details */}
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{hall.name}</span>
                  <Badge variant={hall.isAvailable ? "default" : "secondary"}>
                    {hall.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Capacity: {hall.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{hall.location}</span>
                  </div>
                </div>
                
                {hall.facilities && hall.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {hall.facilities.slice(0, 3).map((facility: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                    {hall.facilities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{hall.facilities.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Warning */}
              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive mb-1">Warning:</p>
                    <ul className="text-destructive/80 space-y-1">
                      <li>• All associated bookings will be deleted</li>
                      <li>• Users will lose access to this hall</li>
                      <li>• This action cannot be undone</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmation">
                  Type the hall name to confirm deletion: <strong>{hall.name}</strong>
                </Label>
                <Input
                  id="confirmation"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={hall.name}
                  className="w-full"
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting || confirmationText !== hall.name}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              'Delete Hall'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
