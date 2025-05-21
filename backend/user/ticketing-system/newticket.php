<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
include('../../dbconn.php');
session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $ticket_category = isset($_POST['ticket_category']) ? $conn->real_escape_string($_POST['ticket_category']) : '';
    $ticket_subject = isset($_POST['ticket_subject']) ? $conn->real_escape_string($_POST['ticket_subject']) : '';
    $ticket_content = isset($_POST['ticket_content']) ? $conn->real_escape_string($_POST['ticket_content']) : '';
    $ticket_requestor_id = $_SESSION['user']['id'] ?? null;

    if (!$ticket_requestor_id) {
        echo json_encode(["status" => "error", "message" => "User session expired. Please log in again."]);
        exit;
    }

    // 🔍 Fetch department of the requestor
    $department = null;
    $dept_stmt = $conn->prepare("SELECT department FROM accounts_tbl WHERE id = ?");
    $dept_stmt->bind_param("i", $ticket_requestor_id);
    $dept_stmt->execute();
    $dept_stmt->bind_result($department);
    $dept_stmt->fetch();
    $dept_stmt->close();

    if ($department === null) {
        echo json_encode(["status" => "error", "message" => "Failed to retrieve department."]);
        exit;
    }

    // File upload setup
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'pdf', 'docx'];
    $max_file_size = 2 * 1024 * 1024; // 2 MB
    $upload_dir = "../../../uploads/tickets/";

    if (!is_dir($upload_dir) && !mkdir($upload_dir, 0777, true)) {
        echo json_encode(["status" => "error", "message" => "Failed to create upload directory."]);
        exit;
    }

    $date_created = date("Y-m-d H:i:s");
    $ticket_status = 'Open';
    $file_name = '';
    $new_target_path = '';

    if (isset($_FILES['ticket_attachment']) && $_FILES['ticket_attachment']['error'] == UPLOAD_ERR_OK) {
        $file = $_FILES['ticket_attachment'];
        $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if (in_array($file_extension, $allowed_extensions) && $file['size'] <= $max_file_size) {
            $file_name = uniqid('ticket_', true) . '.' . $file_extension;
            $new_target_path = $upload_dir . $file_name;

            if (!move_uploaded_file($file['tmp_name'], $new_target_path)) {
                echo json_encode(["status" => "error", "message" => "File upload failed. Please try again."]);
                exit;
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid file type or size. Upload .jpg, .png, .pdf, or .docx files under 2 MB."]);
            exit;
        }
    }

    // ✅ Insert with department
    $sql = "INSERT INTO ticket_records_tbl 
            (ticket_requestor_id, ticket_subject, ticket_type, ticket_description, ticket_status, date_created, ticket_attachment, requestor_department)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    if ($stmt) {
        $stmt->bind_param(
            "issssssi",
            $ticket_requestor_id,
            $ticket_subject,
            $ticket_category,
            $ticket_content,
            $ticket_status,
            $date_created,
            $new_target_path,
            $department
        );

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Ticket submitted successfully.", "attachment" => $new_target_path]);
        } else {
            echo json_encode(["status" => "error", "message" => "Unable to submit ticket.", "data" => $stmt->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(["status" => "error", "message" => "Database error: Unable to prepare statement.", "data" => $conn->error]);
    }

    $conn->close();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
