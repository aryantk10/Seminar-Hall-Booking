# GitHub Setup Instructions

## 1. Create GitHub Repository

1. Go to https://github.com
2. Click "New repository" or go to https://github.com/new
3. Repository name: `seminar-hall-booking`
4. Description: `Comprehensive seminar hall booking system with Docker and CI/CD`
5. Make it **Public** (for GitHub Actions to work with free tier)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## 2. Connect Local Repository to GitHub

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/seminar-hall-booking.git

# Rename main branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## 3. Set Up GitHub Actions Secrets

Go to your repository on GitHub:
1. Click "Settings" tab
2. Click "Secrets and variables" → "Actions"
3. Add these secrets:

### Required Secrets:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Your JWT secret key

### Optional Secrets (for deployment):
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password
- `DEPLOY_HOST`: Your deployment server IP
- `DEPLOY_USER`: Your deployment server username
- `DEPLOY_KEY`: Your SSH private key for deployment

## 4. Enable GitHub Container Registry

The CI/CD pipeline uses GitHub Container Registry (ghcr.io) which is free.
No additional setup needed - it will work automatically.

## 5. Test the CI/CD Pipeline

After pushing to GitHub:
1. Go to "Actions" tab in your repository
2. You should see the CI/CD workflow running
3. It will:
   - Run tests
   - Build Docker images
   - Push images to GitHub Container Registry
   - Run security scans

## 6. Update Repository URL in Files

After creating the repository, update these files with your actual GitHub username:

### In README.md:
```bash
git clone https://github.com/YOUR_USERNAME/seminar-hall-booking.git
```

### In docker-compose.prod.yml:
```yaml
image: ghcr.io/YOUR_USERNAME/seminar-hall-booking-frontend:latest
image: ghcr.io/YOUR_USERNAME/seminar-hall-booking-backend:latest
```

### In .env.example:
```env
GITHUB_REPOSITORY=YOUR_USERNAME/seminar-hall-booking
```

## 7. Commands to Run

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/seminar-hall-booking.git
git branch -M main
git push -u origin main
```

## 8. Verify Setup

After pushing:
1. Check that files are visible on GitHub
2. Go to Actions tab - CI/CD should start automatically
3. Check Packages tab - Docker images will appear after successful build
4. Star your repository! ⭐

## 9. Next Steps

- Set up branch protection rules
- Add collaborators if needed
- Configure deployment environments
- Set up monitoring and alerts
- Add issue templates
- Create pull request templates
