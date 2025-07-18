# GitHub Pages Deployment Guide

This project is configured to automatically build and deploy to GitHub Pages using GitHub Actions.

## Setup Instructions

### 1. Enable GitHub Pages
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The workflow will automatically deploy when you push to the `main` or `master` branch

### 2. Repository Settings
Make sure your repository has the following settings:
- **Repository name**: `platform-2` (this affects the base URL)
- **Visibility**: Public (required for free GitHub Pages)
- **Branch**: `main` or `master` (whichever you're using)

### 3. Workflow Details
The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:
- Trigger on pushes to `main`/`master` branch
- Install Node.js 18 and dependencies
- Build the React app using `npm run build`
- Deploy the built files to GitHub Pages

### 4. Base URL Configuration
The app is configured to work with GitHub Pages by setting the base URL to `/platform-2/` in production. If you change your repository name, update the `base` field in `vite.config.ts`.

## Local Development
- Run `npm run dev` for local development
- Run `npm run build` to test the production build locally
- Run `npm run preview` to preview the production build

## Troubleshooting
- If the deployment fails, check the Actions tab in your GitHub repository
- Make sure all dependencies are properly listed in `package.json`
- Verify that the build completes successfully locally before pushing

## Custom Domain (Optional)
If you want to use a custom domain:
1. Add your domain to the GitHub Pages settings
2. Update the `base` field in `vite.config.ts` to `'/'`
3. Add a `CNAME` file in the `public` directory with your domain 