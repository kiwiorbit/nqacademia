<?php
// Set headers to prevent caching and allow CORS
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Check if user is authenticated
session_start();
$isAdmin = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

if (!$isAdmin) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Create upload directory if it doesn't exist
$uploadDir = '../data/news-images/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Handle image upload
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if file was uploaded
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['image'];
        
        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.']);
            exit;
        }
        
        // Validate file size (max 2MB)
        $maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if ($file['size'] > $maxSize) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'File size exceeds the 2MB limit.']);
            exit;
        }
        
        // Generate a unique filename
        $filename = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9\.]/', '_', $file['name']);
        $filepath = $uploadDir . $filename;
        
        // Move the uploaded file to the destination
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            // Return the relative path to the file
            $relativePath = 'data/news-images/' . $filename;
            echo json_encode(['success' => true, 'message' => 'File uploaded successfully', 'filepath' => $relativePath]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
        }
    } 
    // Handle base64 image data
    else if (isset($_POST['imageData'])) {
        $imageData = $_POST['imageData'];
        
        // Extract the base64 data
        if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $matches)) {
            $imageType = $matches[1];
            $base64Data = substr($imageData, strpos($imageData, ',') + 1);
            $decodedData = base64_decode($base64Data);
            
            if ($decodedData === false) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid base64 data']);
                exit;
            }
            
            // Generate a unique filename
            $filename = uniqid() . '.' . $imageType;
            $filepath = $uploadDir . $filename;
            
            // Save the image file
            if (file_put_contents($filepath, $decodedData)) {
                // Return the relative path to the file
                $relativePath = 'data/news-images/' . $filename;
                echo json_encode(['success' => true, 'message' => 'File uploaded successfully', 'filepath' => $relativePath]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to save image']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid image data format']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No file or image data provided']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
