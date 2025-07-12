# CI/CD Setup Guide for Blog-Chat Application

## 🚀 Overview

This guide explains how to set up Continuous Integration/Continuous Deployment (CI/CD) for your Blog-Chat application using GitHub Actions.

## 📁 Workflow Files

### 1. `ci-cd.yml` - Full CI/CD Pipeline
- **Testing**: Backend and frontend tests
- **Security**: npm audit and Snyk security scans
- **Docker**: Build and push Docker images to GitHub Container Registry
- **Deployment**: Staging and production deployments
- **Notifications**: Success/failure notifications

### 2. `test-and-build.yml` - Simple Test & Build
- **Testing**: Backend and frontend tests with MySQL
- **Build**: Frontend build and Docker image building
- **Security**: npm audit checks

### 3. `deploy.yml` - Multi-Platform Deployment
- **Vercel**: Frontend deployment
- **Railway**: Backend deployment
- **Heroku**: Full-stack deployment
- **DigitalOcean**: App Platform deployment
- **AWS ECS**: Container deployment

## 🔧 Setup Instructions

### Step 1: Enable GitHub Actions
1. Go to your repository on GitHub
2. Click on "Actions" tab
3. GitHub will automatically detect the workflow files

### Step 2: Configure Secrets (Required)

#### For Basic Testing (test-and-build.yml):
No additional secrets required.

#### For Full CI/CD (ci-cd.yml):
```bash
# GitHub Container Registry (automatic with GITHUB_TOKEN)
# No additional setup needed
```

#### For Deployment (deploy.yml):

**Vercel (Frontend):**
```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

**Railway (Backend):**
```bash
RAILWAY_TOKEN=your_railway_token
RAILWAY_SERVICE=your_service_name
```

**Heroku:**
```bash
HEROKU_API_KEY=your_heroku_api_key
HEROKU_APP_NAME=your_app_name
HEROKU_EMAIL=your_email
```

**DigitalOcean:**
```bash
DIGITALOCEAN_ACCESS_TOKEN=your_do_token
DIGITALOCEAN_APP_NAME=your_app_name
```

**AWS ECS:**
```bash
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
```

### Step 3: Add Secrets to GitHub
1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with the exact name shown above

## 🧪 Testing Setup

### Backend Tests
Make sure your backend has test scripts in `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Frontend Tests
Make sure your frontend has test scripts in `client/package.json`:
```json
{
  "scripts": {
    "test": "react-scripts test",
    "build": "react-scripts build"
  }
}
```

## 🐳 Docker Setup

### Backend Dockerfile
Ensure your root `Dockerfile` is properly configured:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Frontend Dockerfile
Ensure your `client/Dockerfile` is properly configured:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔄 Workflow Triggers

### Automatic Triggers:
- **Push to main**: Full CI/CD pipeline
- **Push to develop**: Testing and staging deployment
- **Pull Request to main**: Testing only

### Manual Triggers:
You can also trigger workflows manually:
1. Go to Actions tab
2. Select the workflow
3. Click "Run workflow"

## 📊 Monitoring

### View Workflow Results:
1. Go to Actions tab on GitHub
2. Click on any workflow run
3. View detailed logs and results

### Common Issues:
- **Test failures**: Check test configuration and dependencies
- **Build failures**: Verify Dockerfile syntax
- **Deployment failures**: Check secrets and platform configuration

## 🚀 Deployment Options

### 1. Vercel (Recommended for Frontend)
- Free tier available
- Automatic deployments
- Great for React apps

### 2. Railway (Recommended for Backend)
- Easy deployment
- Good for Node.js apps
- Free tier available

### 3. Heroku
- Traditional platform
- Good for full-stack apps
- Free tier discontinued

### 4. DigitalOcean App Platform
- Simple deployment
- Good performance
- Pay-as-you-go

### 5. AWS ECS
- Enterprise-grade
- Highly scalable
- More complex setup

## 🔒 Security Best Practices

1. **Never commit secrets** to your repository
2. **Use environment variables** for sensitive data
3. **Regular security audits** with npm audit
4. **Keep dependencies updated**
5. **Use Snyk** for vulnerability scanning

## 📝 Customization

### Modify Workflow Files:
1. Edit `.github/workflows/*.yml` files
2. Commit and push changes
3. GitHub Actions will automatically use the new configuration

### Add Custom Steps:
```yaml
- name: Custom Step
  run: |
    echo "Your custom command here"
    # Add your custom logic
```

## 🆘 Troubleshooting

### Common Issues:

1. **Tests failing locally but passing in CI**:
   - Check environment variables
   - Verify database configuration

2. **Docker build failing**:
   - Check Dockerfile syntax
   - Verify file paths

3. **Deployment failing**:
   - Verify secrets are correctly set
   - Check platform-specific requirements

### Getting Help:
1. Check GitHub Actions logs for detailed error messages
2. Verify all secrets are correctly configured
3. Test locally before pushing to GitHub

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)

---

**Happy Deploying! 🚀** 