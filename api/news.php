<?php
// Set headers to prevent caching and allow CORS
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Path to the news data file
$dataFile = '../data/news-data.json';

// Create data directory if it doesn't exist
if (!file_exists('../data')) {
    mkdir('../data', 0755, true);
}

// Function to read news data
function readNewsData() {
    global $dataFile;

    if (file_exists($dataFile)) {
        $jsonData = file_get_contents($dataFile);
        return json_decode($jsonData, true);
    }

    // Return empty array if file doesn't exist
    return [];
}

// Function to write news data
function writeNewsData($data) {
    global $dataFile;

    $jsonData = json_encode($data, JSON_PRETTY_PRINT);
    return file_put_contents($dataFile, $jsonData);
}

// Handle different request methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all news data
        $newsData = readNewsData();
        echo json_encode($newsData);
        break;

    case 'POST':
        // Check if user is authenticated
        session_start();
        $isAdmin = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

        // Get the JSON data from the request
        $jsonData = file_get_contents('php://input');
        $data = json_decode($jsonData, true);

        // If this is an admin login request
        if (isset($data['action']) && $data['action'] === 'login') {
            // Include the auth file
            require_once('auth.php');

            // Verify credentials
            $username = $data['username'] ?? '';
            $password = $data['password'] ?? '';

            if (verifyCredentials($username, $password)) {
                $_SESSION['admin_logged_in'] = true;
                echo json_encode(['success' => true, 'message' => 'Login successful']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
            }
            break;
        }

        // If this is a logout request
        if (isset($data['action']) && $data['action'] === 'logout') {
            $_SESSION['admin_logged_in'] = false;
            session_destroy();
            echo json_encode(['success' => true, 'message' => 'Logout successful']);
            break;
        }

        // For adding/updating news, check if user is admin
        if (!$isAdmin) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            break;
        }

        // If this is a saveAll request (bulk save all news)
        if (isset($data['action']) && $data['action'] === 'saveAll' && isset($data['news'])) {
            $newsData = $data['news'];

            // Ensure the news directory exists
            if (!file_exists('../data/news')) {
                mkdir('../data/news', 0755, true);
            }

            // Ensure the news-images directory exists
            if (!file_exists('../data/news-images')) {
                mkdir('../data/news-images', 0755, true);
            }

            // Save the news data
            if (writeNewsData($newsData)) {
                echo json_encode(['success' => true, 'message' => 'All news saved successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to save news data']);
            }
            break;
        }

        // Add or update a single news item
        $newsData = readNewsData();

        // Create new news object
        $newNews = [
            'id' => isset($data['id']) ? $data['id'] : (count($newsData) > 0 ? max(array_column($newsData, 'id')) + 1 : 1),
            'title' => $data['title'],
            'content' => $data['content'],
            'author' => $data['author'],
            'timestamp' => $data['timestamp'] ?? date('c'), // ISO 8601 date format
            'image' => $data['image']
        ];

        // If updating existing news
        if (isset($data['id'])) {
            foreach ($newsData as $key => $news) {
                if ($news['id'] == $data['id']) {
                    $newsData[$key] = $newNews;
                    break;
                }
            }
        } else {
            // Add new news to the beginning of the array
            array_unshift($newsData, $newNews);
        }

        // Save the updated news data
        if (writeNewsData($newsData)) {
            echo json_encode(['success' => true, 'message' => 'News saved successfully', 'news' => $newNews]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save news']);
        }
        break;

    case 'DELETE':
        // Check if user is authenticated
        session_start();
        $isAdmin = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

        if (!$isAdmin) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            break;
        }

        // Get the news ID from the query string
        $newsId = $_GET['id'] ?? null;

        if (!$newsId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'News ID is required']);
            break;
        }

        // Read the current news data
        $newsData = readNewsData();

        // Find and remove the news with the given ID
        $found = false;
        foreach ($newsData as $key => $news) {
            if ($news['id'] == $newsId) {
                // If the news has an image that's stored locally, delete it
                if (isset($news['image']) && strpos($news['image'], 'data/news-images/') !== false) {
                    $imagePath = '../' . $news['image'];
                    if (file_exists($imagePath)) {
                        unlink($imagePath);
                    }
                }

                // Remove the news from the array
                array_splice($newsData, $key, 1);
                $found = true;
                break;
            }
        }

        if (!$found) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'News not found']);
            break;
        }

        // Save the updated news data
        if (writeNewsData($newsData)) {
            echo json_encode(['success' => true, 'message' => 'News deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to delete news']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}
?>
