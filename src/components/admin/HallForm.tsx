'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import Image from 'next/image';

interface HallData {
  name: string;
  capacity: number | string;
  location: string;
  description: string;
  image: string;
  block: string;
  type: string;
  amenities: string[];
}

interface HallFormProps {
  initialData?: HallData;
  onSubmit: (data: HallData) => void;
  isEditing?: boolean;
}

const hallTypes = [
  'Seminar Hall',
  'Auditorium',
  'Conference Room',
  'Board Room',
  'Meeting Room',
  'Lecture Hall',
  'Training Room'
];

const blocks = [
  'ESB (Engineering Sciences Block)',
  'DES (Department of Engineering Sciences)',
  'LHC (Lecture Hall Complex)',
  'APEX Block',
  'Main Building',
  'Administrative Block'
];

const commonAmenities = [
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
    image: initialData?.image || '',
    block: initialData?.block || '',
    type: initialData?.type || '',
    amenities: initialData?.amenities || []
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAmenity = (amenity: string) => {
    if (amenity && !formData.amenities.includes(amenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
    }
    setNewAmenity('');
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
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
        ...formData,
        capacity: capacityNum,
        image: formData.image || '/images/halls/default-hall.jpg',
        // Ensure we have default values for optional fields
        description: formData.description || '',
        block: formData.block || 'Main Building',
        type: formData.type || 'Seminar Hall'
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

        {/* Block */}
        <div className="space-y-2">
          <Label htmlFor="block">Block</Label>
          <Select value={formData.block} onValueChange={(value) => handleInputChange('block', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select block" />
            </SelectTrigger>
            <SelectContent>
              {blocks.map((block) => (
                <SelectItem key={block} value={block}>
                  {block}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Hall Type</Label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {hallTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            value={formData.image}
            onChange={(e) => handleInputChange('image', e.target.value)}
            placeholder="/images/halls/hall-name.jpg"
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

      {/* Amenities */}
      <div className="space-y-2">
        <Label>Amenities</Label>
        
        {/* Quick Add Buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {commonAmenities.map((amenity) => (
            <Button
              key={amenity}
              type="button"
              variant={formData.amenities.includes(amenity) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (formData.amenities.includes(amenity)) {
                  removeAmenity(amenity);
                } else {
                  addAmenity(amenity);
                }
              }}
            >
              {amenity}
            </Button>
          ))}
        </div>

        {/* Custom Amenity Input */}
        <div className="flex gap-2">
          <Input
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            placeholder="Add custom amenity..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addAmenity(newAmenity);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => addAmenity(newAmenity)}
            disabled={!newAmenity}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Amenities */}
        {formData.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.amenities.map((amenity, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {amenity}
                <button
                  type="button"
                  onClick={() => removeAmenity(amenity)}
                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview */}
      {formData.image && (
        <div className="space-y-2">
          <Label>Image Preview</Label>
          <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
            <Image
              src={formData.image}
              alt="Hall preview"
              width={400}
              height={192}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/halls/default-hall.jpg';
              }}
            />
          </div>
        </div>
      )}

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
