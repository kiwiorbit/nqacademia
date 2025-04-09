# NQ Academia News System - Quick Reference Guide

## Admin Login
- **Username**: `admin`
- **Password**: `khalila`
- Access via the "Admin" button in the navigation bar on the News page

## Creating News Posts
1. Log in as admin
2. Fill in title and content (image is optional)
3. Images are automatically compressed by 30% to save space
4. Click "Publish News"

## Deleting News Posts
1. Log in as admin
2. Click the ellipsis (⋮) menu on any post
3. Select "Delete News" and confirm

## IMPORTANT: Saving Posts Permanently
1. Click the green "Export News Data" button
2. Copy or download the JSON data
3. Replace the contents of `data/news-data.json` with this data
4. Upload the updated file to your hosting service

## Common Issues
- **Posts not showing**: Check that `news-data.json` is properly updated and uploaded
- **Images not displaying**: Ensure image URLs are accessible
- **Can't log in**: Verify credentials and clear browser cache

Remember: Without exporting and updating the news-data.json file, your changes will only be saved locally!
