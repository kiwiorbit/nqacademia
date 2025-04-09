# Deploying to GitHub Pages

Follow these steps to deploy your TajweedLearn website to GitHub Pages:

## 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "tajweed-learn")
4. Make sure it's set to "Public"
5. Click "Create repository"

## 2. Initialize Git and Push Your Code

Open a terminal/command prompt in your project directory and run:

```bash
# Initialize Git repository
git init

# Add all files to staging
git add .

# Commit the files
git commit -m "Initial commit"

# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/tajweed-learn.git

# Push to GitHub
git push -u origin main
```

Note: Replace `YOUR_USERNAME` with your actual GitHub username.

## 3. Configure GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings"
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select "main" branch
5. Click "Save"

## 4. Access Your Website

After a few minutes, your website will be available at:
```
https://YOUR_USERNAME.github.io/tajweed-learn/
```

## 5. Custom Domain (Optional)

If you have a custom domain:

1. In the GitHub Pages settings, enter your custom domain
2. Create a CNAME file in your repository with your domain name
3. Configure your domain's DNS settings as instructed by GitHub

## Troubleshooting

- If your site doesn't appear, check the GitHub Pages section in Settings for any error messages
- Make sure all file paths are relative, not absolute
- Verify that all resources (CSS, JS, images) are loading correctly by checking the browser's developer console

## Updating Your Site

To update your site after making changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

GitHub Pages will automatically rebuild and deploy your site.
