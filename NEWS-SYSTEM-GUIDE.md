# NQ Academia News System Guide

This guide provides simple, step-by-step instructions for managing the news system on the NQ Academia website.

## Table of Contents
- [Accessing the Admin Dashboard](#accessing-the-admin-dashboard)
- [Creating News Posts](#creating-news-posts)
- [Deleting News Posts](#deleting-news-posts)
- [Saving News Posts to Your Codebase](#saving-news-posts-to-your-codebase)
- [Uploading to Your Hosting Service](#uploading-to-your-hosting-service)
- [Troubleshooting](#troubleshooting)

## Accessing the Admin Dashboard

1. Go to the News page of your website
2. Click the "Admin" button in the navigation bar
3. Enter the following credentials:
   - Username: `admin`
   - Password: `khalila`
4. Click "Login"

The admin dashboard will appear, allowing you to create and manage news posts.

## Creating News Posts

1. Log in to the admin dashboard (see above)
2. Fill in the following fields:
   - **News Title**: Enter a clear, descriptive title
   - **News Content**: Enter the main content of your news post
   - **Image** (optional): You can either:
     - Upload an image from your computer (images are automatically compressed by 30% to save space)
     - Enter an image URL

3. Click the "Publish News" button
4. Your news post will appear at the top of the news feed

## Deleting News Posts

1. Log in to the admin dashboard (see above)
2. Find the news post you want to delete
3. Click the ellipsis (three dots) menu in the top-right corner of the post
4. Select "Delete News"
5. Confirm the deletion when prompted

## Saving News Posts to Your Codebase

**IMPORTANT**: This step is required to permanently save your news posts, especially for GitHub Pages hosting.

1. Log in to the admin dashboard
2. Click the green "Export News Data" button at the top of the post creation form
3. In the export modal that appears, you have two options:
   - **Copy**: Click the "Copy" button to copy the JSON data to your clipboard
   - **Download**: Click the "Download JSON File" button to download the data as a file

4. Update your codebase:
   - Open the `data/news-data.json` file in your project
   - Replace the entire contents with the exported JSON data
   - Save the file

## Uploading to Your Hosting Service

### For GitHub Pages:

1. After updating the `data/news-data.json` file, commit and push your changes:
   ```
   git add data/news-data.json
   git commit -m "Update news posts"
   git push
   ```

2. GitHub Pages will automatically update with your new content

### For Hostinger or other hosting services:

1. After updating the `data/news-data.json` file, upload the file to your server:
   - Use FTP, SFTP, or your hosting provider's file manager
   - Upload to the same relative path on your server

2. Make sure to maintain the directory structure:
   ```
   your-website/
   ├── data/
   │   ├── news-data.json
   │   └── news-images/
   ├── api/
   ├── news.html
   └── ...
   ```

## Troubleshooting

### News posts aren't showing up after uploading

1. Check that you've uploaded the `news-data.json` file to the correct location
2. Verify that the JSON format is valid (no missing commas, brackets, etc.)
3. Clear your browser cache or try in a private/incognito window

### Images aren't displaying

1. Make sure image URLs are accessible
2. For uploaded images, check that the `data/news-images/` directory exists and has proper permissions
3. For external images, ensure the URLs are correct and the images are publicly accessible

### Image compression isn't working

1. Make sure the `js/image-compressor.min.js` file is properly included in your website
2. Check your browser console for any JavaScript errors
3. If compression fails, the system will automatically fall back to using the original image

### Can't log in to the admin dashboard

1. Verify you're using the correct credentials:
   - Username: `admin`
   - Password: `khalila`
2. Check if your browser has JavaScript enabled
3. Try clearing your browser cache or using a different browser

### Export button isn't working

1. Make sure you're logged in as admin
2. Check your browser console for any JavaScript errors
3. Try refreshing the page and logging in again

---

## Quick Reference

- **Admin Login**: Username: `admin` / Password: `khalila`
- **News Data File**: `data/news-data.json`
- **Image Directory**: `data/news-images/`
- **Important**: Always export and update your news-data.json file after making changes

For additional help, please contact the website administrator.
