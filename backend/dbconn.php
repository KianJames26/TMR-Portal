<?php
$db_host = "localhost";
$db_username = "root";
$db_password = "";
$db_name = "tmr_portal";
$conn = new mysqli($db_host, $db_username, $db_password, $db_name);
if ($conn->connect_error) {
    echo json_encode($conn->connect_error);
    die("Connection failed: " . $conn->connect_error);
}
date_default_timezone_set("Asia/Manila");

$conn->set_charset("utf8mb4");
