# 🔄 CI/CD Workflows Documentation

## 📋 Active Workflows

### 1. **Main CI/CD Pipeline** (`ci.yml`)
**Trigger**: Push to `main`, `develop`, `feature/*` branches, PRs, manual
**Purpose**: Primary CI/CD pipeline for testing, building, and deploying

**Jobs**:
- 🔍 **Code Quality**: ESLint, TypeScript check, security audit
- 🧪 **Testing**: Matrix testing across Node.js 18 & 20
- 🏗️ **Build**: Docker image creation and registry push
- 🚀 **Deploy Staging**: Automatic staging deployment
- 🔒 **Security**: Trivy vulnerability scanning

### 2. **Production Deployment** (`deploy.yml`)
**Trigger**: After Main CI/CD Pipeline completes successfully, manual
**Purpose**: Production deployment with security scanning

**Jobs**:
- 🚀 **Deploy**: Production environment deployment
- 🔍 **Health Checks**: Post-deployment verification
- 🔒 **Security Scan**: Trivy container scanning
- 📢 **Notifications**: Deployment status alerts

### 3. **Basic Monitoring & Health Checks** (`basic-monitoring.yml`)
**Trigger**: Every 30 minutes, manual
**Purpose**: Continuous monitoring and health verification

**Jobs**:
- 💓 **Health Check**: Frontend, API, database status
- 🔒 **Security Check**: Dependency vulnerability scanning
- 📊 **Monitoring Summary**: Consolidated health report
- 🚨 **Incident Creation**: Automatic issue creation on failures

### 4. **Notification System** (`notifications.yml`)
**Trigger**: After other workflows complete, manual
**Purpose**: Multi-channel alerting and communication

**Jobs**:
- 💬 **Slack Notification**: Team alerts via Slack
- 📧 **Email Notification**: Critical failure emails
- 📝 **GitHub Issues**: Automatic issue creation
- 📊 **Summary**: Notification delivery status

### 5. **Legacy CI (Disabled)** (`main.yml`)
**Trigger**: Manual only (disabled)
**Purpose**: Original simple CI - kept for reference
**Status**: ⚠️ Disabled - use Main CI/CD Pipeline instead

## 🔄 Workflow Execution Flow

```
Push to main
     ↓
Main CI/CD Pipeline
     ↓ (on success)
Production Deployment
     ↓
Notification System

Schedule (every 30min)
     ↓
Basic Monitoring
     ↓ (on failure)
Notification System
```

## 🎯 Workflow Triggers Summary

| Workflow | Push | PR | Schedule | Manual | Workflow Run |
|----------|------|----|---------|---------|----|
| Main CI/CD | ✅ | ✅ | ❌ | ✅ | ❌ |
| Production Deploy | ❌ | ❌ | ❌ | ✅ | ✅ |
| Monitoring | ❌ | ❌ | ✅ | ✅ | ❌ |
| Notifications | ❌ | ❌ | ❌ | ✅ | ✅ |
| Legacy CI | ❌ | ❌ | ❌ | ✅ | ❌ |

## 🚀 How to Use

### For Development:
1. **Push code** → Main CI/CD Pipeline runs automatically
2. **Create PR** → Testing and validation runs
3. **Merge to main** → Full pipeline + production deployment

### For Operations:
1. **Monitor health** → Check Basic Monitoring workflow
2. **Manual deployment** → Run Production Deployment workflow
3. **Test notifications** → Run Notification System workflow

### For Debugging:
1. **Check workflow logs** in Actions tab
2. **Manual triggers** available for all workflows
3. **Legacy CI** available for simple testing

## 📊 Expected Execution Pattern

**Normal Push to Main:**
- ✅ Main CI/CD Pipeline (3-5 minutes)
- ✅ Production Deployment (2-3 minutes)
- ✅ Notification System (30 seconds)

**Pull Request:**
- ✅ Main CI/CD Pipeline (testing only, 2-3 minutes)

**Scheduled Monitoring:**
- ✅ Basic Monitoring (1-2 minutes, every 30 minutes)

## 🔧 Troubleshooting

### Multiple Workflows Running:
- ✅ **Fixed**: Only Main CI/CD runs on push now
- ✅ **Sequential**: Production deployment waits for CI/CD
- ✅ **Conditional**: Notifications only on completion

### Workflow Failures:
1. Check the specific job that failed
2. Review logs for error details
3. Use manual triggers to retry
4. Check GitHub Issues for auto-created incidents

### Performance:
- **Parallel jobs** in Main CI/CD for speed
- **Change detection** to skip unnecessary builds
- **Caching** for faster dependency installation
- **Matrix testing** runs in parallel
