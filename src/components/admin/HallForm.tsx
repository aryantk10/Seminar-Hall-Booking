'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface HallData {
  name: string;
  capacity: number | string;
  location: string;
  description?: string;
  images?: string[];
  facilities: string[];
}

interface HallFormProps {
  initialData?: HallData;
  onSubmit: (data: HallData) => void;
  isEditing?: boolean;
}



const commonFacilities = [
  'Projector',
  'Screen',
  'Audio System',
  'Microphone',
  'Wi-Fi',
  'Air Conditioning',
  'Whiteboard',
  'Smart Board',
  'Video Conferencing',
  'Parking',
  'Accessibility',
  'Recording Equipment'
];

export function HallForm({ initialData, onSubmit, isEditing = false }: HallFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    capacity: initialData?.capacity || '',
    location: initialData?.location || '',
    description: initialData?.description || '',
    images: initialData?.images || [],
    facilities: initialData?.facilities || []
  });

  const [newFacility, setNewFacility] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addFacility = (facility: string) => {
    if (facility && !formData.facilities.includes(facility)) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, facility]
      }));
    }
    setNewFacility('');
  };

  const removeFacility = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter(f => f !== facility)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.capacity || !formData.location) {
        alert('Please fill in all required fields: Hall Name, Capacity, and Location');
        return;
      }

      // Validate capacity is a positive number
      const capacityNum = parseInt(formData.capacity.toString());
      if (isNaN(capacityNum) || capacityNum <= 0) {
        alert('Please enter a valid capacity (positive number)');
        return;
      }

      // Prepare submission data
      const submitData = {
        name: formData.name,
        capacity: capacityNum,
        location: formData.location,
        facilities: formData.facilities,
        description: formData.description || '',
        images: formData.images.length > 0 ? formData.images : ['/images/halls/default-hall.jpg']
      };

      console.log('📝 Submitting hall form:', submitData);
      await onSubmit(submitData);
    } catch (error: unknown) {
      console.error('❌ Form submission error:', error);
      alert('Failed to save hall. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hall Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Hall Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., ESB Seminar Hall - I"
            required
          />
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity *</Label>
          <Input
            id="capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => handleInputChange('capacity', e.target.value)}
            placeholder="e.g., 100"
            min="1"
            required
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="e.g., Ground Floor, Room 101"
            required
          />
        </div>


      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Brief description of the hall and its features..."
          rows={3}
        />
      </div>

      {/* Facilities */}
      <div className="space-y-2">
        <Label>Facilities</Label>

        {/* Quick Add Buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {commonFacilities.map((facility) => (
            <Button
              key={facility}
              type="button"
              variant={formData.facilities.includes(facility) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (formData.facilities.includes(facility)) {
                  removeFacility(facility);
                } else {
                  addFacility(facility);
                }
              }}
            >
              {facility}
            </Button>
          ))}
        </div>

        {/* Custom Facility Input */}
        <div className="flex gap-2">
          <Input
            value={newFacility}
            onChange={(e) => setNewFacility(e.target.value)}
            placeholder="Add custom facility..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addFacility(newFacility);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => addFacility(newFacility)}
            disabled={!newFacility}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Facilities */}
        {formData.facilities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.facilities.map((facility, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {facility}
                <button
                  type="button"
                  onClick={() => removeFacility(facility)}
                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>



      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Update Hall' : 'Create Hall'
          )}
        </Button>
      </div>
    </form>
  );
}
