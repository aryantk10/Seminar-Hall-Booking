# 📸 How to Add Seminar Hall Images

## 🎯 Quick Guide

### **Step 1: Prepare Your Images**
- **Format**: JPG or PNG
- **Size**: 800x500 pixels (recommended)
- **Quality**: High resolution for professional appearance
- **File size**: Under 500KB each for fast loading

### **Step 2: Name Your Images Exactly**
Use these **exact filenames** (case-sensitive):

#### **Auditorium:**
1. `apex-auditorium.jpg`

#### **ESB Seminar Halls:**
2. `esb-seminar-hall-1.jpg`
3. `esb-seminar-hall-2.jpg`
4. `esb-seminar-hall-3.jpg`

#### **DES Seminar Halls:**
5. `des-seminar-hall-1.jpg`
6. `des-seminar-hall-2.jpg`

#### **LHC Seminar Halls:**
7. `lhc-seminar-hall-1.jpg`
8. `lhc-seminar-hall-2.jpg`

### **Step 3: Add Images to This Folder**
Place all images in: `public/images/halls/`

### **Step 4: Restart Frontend (if needed)**
```bash
docker restart seminar-hall-frontend-dev
```

## 🎠 What Happens Next

Once you add the images:
- ✅ Carousel will automatically use your local images
- ✅ Fallback to Unsplash images if local images not found
- ✅ Auto-advance every 5 seconds
- ✅ Pause on hover
- ✅ Navigation arrows and dots work
- ✅ Professional overlay with hall information

## 📱 Current Status

- ✅ **Carousel**: Working with auto-advance and navigation
- ✅ **Fallback Images**: High-quality Unsplash images
- ✅ **Docker**: Fully containerized and running
- ✅ **Backend**: API working on port 5000
- ✅ **Frontend**: UI working on port 9002

## 🔧 Troubleshooting

**Images not showing?**
1. Check exact filenames (case-sensitive)
2. Ensure images are in `public/images/halls/`
3. Restart frontend container
4. Hard refresh browser (Ctrl + F5)

**Need to resize images?**
- Use any image editor to resize to 800x500 pixels
- Maintain aspect ratio for best results
