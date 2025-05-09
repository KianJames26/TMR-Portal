<?php
session_start();
require '../dbconn.php';

$inventoryId = $_POST['inventoryId'];
$unretireReason = $_POST['unretireReason'];

$requestorId = $_SESSION['user']['id'];
$requestName = "Unretire";
$requestedAssetId = $inventoryId;
$requestReason = $unretireReason;
$requestDateTime = date("Y-m-d H:i:s");
$requestSql = "UPDATE inventory_records_tbl SET status = 'Active' WHERE id = $requestedAssetId";

$sql = "INSERT INTO inventory_requests_tbl (requestor_id, request_name, requested_asset_id, request_reason, request_datetime) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    header('Content-Type: application/json');
    echo json_encode([
        "status" => "internal-error",
        "message" => "Failed to Add Unretire Request. Please Contact the Programmer",
        "data" => $conn->error
    ]);
} else {
    $stmt->bind_param("isiss", $requestorId, $requestName, $requestedAssetId, $requestReason, $requestDateTime);
    if (!$stmt->execute()) {
        header('Content-Type: application/json');
        echo json_encode([
            "status" => "internal-error",
            "message" => "Failed to Add Unretire Request. Please Contact the Programmer",
            "data" => $stmt->error
        ]);
    } else {
        $requestId = $conn->insert_id;
        header('Content-Type: application/json');
        echo json_encode([
            "status" => "success",
            "message" => "Unretire Request Sent Successfully!",
            "data" => [
                "requestId" => $requestId
            ]
        ]);
    }
}
