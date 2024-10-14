<?php
session_start();
require('dbconn.php');
session_unset();

$username = $_POST['username'];
$password = $_POST['password'];

$authenticateSql = "SELECT accounts_tbl.id,
                    accounts_tbl.username,
                    accounts_tbl.password,
                    accounts_tbl.full_name,
                    accounts_tbl.role,
                    accounts_tbl.profile_picture,
                    accounts_tbl.department,
                    authorizations_tbl.*
                    FROM accounts_tbl
                    JOIN authorizations_tbl ON accounts_tbl.id = authorizations_tbl.account_id
                    WHERE username = ?";
$stmt = $conn->prepare($authenticateSql);
$stmt->bind_param("s", $username);

if (!$stmt->execute()) {
    header("Content-type: application/json");
    echo json_encode([
        "status" => "error",
        "message" => "Internal Error. Please Contact MIS"
    ]);
    $stmt->close();
    exit;
}

$accountResult = $stmt->get_result();

if ($accountResult->num_rows > 0) {
    $accountRes = $accountResult->fetch_assoc();
    $authenticatedPassword = $accountRes['password'];
    $authenticatedId = $accountRes['id'];

    if (password_verify($password, $authenticatedPassword)) {
        $_SESSION['user'] = $accountRes;

        header("Content-type: application/json");
        echo json_encode([
            "status" => "success",
            "message" => "Login Successful",
            "data" => $accountRes
        ]);
    } else {
        header("Content-type: application/json");
        echo json_encode([
            "status" => "failed",
            "message" => "Incorrect Password."
        ]);
    }
} else {
    header("Content-type: application/json");
    echo json_encode([
        "status" => "failed",
        "message" => "Account doesn't exist"
    ]);
}

$stmt->close();

// if ($result = $conn->query($authenticateSql)) {
//     if ($result->num_rows > 0) {
//         $res = $result->fetch_assoc();
//         $authenticatedPassword = $res['password'];
//         $authenticatedId = $res['id'];
//         if (password_verify($password, $authenticatedPassword)) {
//             $fetchAccountSql = "SELECT id, username, full_name, role, profile_picture, department FROM accounts WHERE id = $authenticatedId";
//             if ($accountResult = $conn->query($fetchAccountSql)) {
//                 $accountData = $accountResult->fetch_assoc();
//                 $_SESSION['user'] = $accountData;
//                 header("Content-type: application/json");
//                 echo json_encode([
//                     "status" => "success",
//                     "message" => "Login Successful",
//                     "data" => $accountData
//                 ]);
//             } else {
//                 header("Content-type: application/json");
//                 echo json_encode([
//                     "status" => "error",
//                     "message" => "Login Successful but there's an Internal Error. Please Contact MIS",
//                     "data" => $conn->error
//                 ]);
//             }
//         } else {
//             header("Content-type: application/json");
//             echo json_encode([
//                 "status" => "failed",
//                 "message" => "Incorrect Password.",
//             ]);
//         }
//     } else {
//         header("Content-type: application/json");
//         echo json_encode([
//             "status" => "failed",
//             "message" => "Username doesn't exist.",
//         ]);
//     }
// } else {
//     header("Content-type: application/json");
//     echo json_encode([
//         "status" => "error",
//         "message" => "Internal Error. Please Contact MIS",
//         "data" => $conn->error
//     ]);
// }
