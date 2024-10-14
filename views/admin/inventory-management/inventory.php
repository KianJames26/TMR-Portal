<?php
session_start();

require('../../../backend/dbconn.php');
require('../../../backend/middleware/pipes.php');
require('../../../backend/middleware/authorize.php');

authorize($_SESSION['user']['role'] == "ADMIN");

$authId = $_SESSION['user']['id'];
$authUsername = $_SESSION['user']['username'];
$authFullName = $_SESSION['user']['full_name'];
$authRole = $_SESSION['user']['role'];
$authPP = $_SESSION['user']['profile_picture'];
$authDepartment = $_SESSION['user']['department'];

$authorizations = setAuthorizations($_SESSION['user']);
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>Invertory Management</title>

    <link rel="stylesheet" href="http://172.16.14.44/dependencies/css/bootstrap/v5.3.3/bootstrap.min.css">
    <link rel="stylesheet" href="../../../assets/vendor/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link
        href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i"
        rel="stylesheet">
    <link rel="stylesheet" href="../../../assets/css/sb-admin-2.css">
    <link rel="stylesheet" href="../../../assets/vendor/datatables/dataTables.bootstrap4.min.css">
    <link rel="stylesheet" href="../../../assets/css/custom/global.css">
    <link rel="stylesheet" href="../../../assets/css/custom/admin/inventory-management/inventory.css">
</head>

<body id="page-top">
    <div id="wrapper">
        <?php include "../../components/sidebar.php" ?>
        <div id="content-wrapper" class="d-flex flex-column">
            <div id="content">
                <?php include "../../components/topbar.php" ?>
                <div class="container-fluid">
                    <h1 class="h3 mb-2 text-gray-800">Inventory Management</h1>
                    <div class="card shadow mb-4">
                        <div class="card-header py-3 d-flex align-items-center justify-content-between">
                            <h6 class="m-0 font-weight-bold text-primary">Inventory</h6>
                            <div class="actions d-flex flex-row-reverse gap-3">
                                <button class="btn btn-primary modalBtn" data-bs-toggle="modal" data-bs-target="#createInventoryModal"><i class="fas fa-circle-plus"></i> Add Item</button>
                                <button class="btn btn-success modalBtn" data-bs-toggle="modal" data-bs-target="#"><i class="fas fa-file-import"></i> Import Data</button>
                                <button class="btn btn-warning modalBtn" data-bs-toggle="modal" data-bs-target="#createInventoryModal"><i class="fas fa-file-export"></i> Export Data</button>
                                <button class="btn btn-secondary modalBtn" data-bs-toggle="modal" data-bs-target="#createInventoryModal"><i class="fas fa-print"></i> Print</button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-bordered" id="inventoryTable" width="100%" cellspacing="0">
                                    <thead>
                                        <tr>
                                            <th>Asset No.</th>
                                            <th>Item type</th>
                                            <th>Item name</th>
                                            <th>Brand</th>
                                            <th>Model</th>
                                            <th>Date Acquired</th>
                                            <th>Supplier</th>
                                            <th>Serial Number</th>
                                            <th>User</th>
                                            <th>Department</th>
                                            <th>Status</th>
                                            <th>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php
                                        $inventorySql = "SELECT * FROM inventory_records_tbl";
                                        $stmt = $conn->prepare($inventorySql);

                                        if ($stmt == false) {
                                            echo $conn->error;
                                        } else {
                                            if (!$stmt->execute()) {
                                                echo $stmt->error;
                                            } else {
                                                $inventoryResult = $stmt->get_result();
                                                while ($inventoryRow = $inventoryResult->fetch_assoc()) {
                                                    $faNumber = $inventoryRow['fa_number'];
                                                    $itemType = $inventoryRow['item_type'];
                                                    $itemName = $inventoryRow['item_name'];
                                                    $brand = $inventoryRow['brand'];
                                                    $model = $inventoryRow['model'];
                                                    $dateAcquired = $inventoryRow['date_acquired'];
                                                    $supplier = $inventoryRow['supplier'];
                                                    $serialNumber = $inventoryRow['serial_number'];
                                                    $user = $inventoryRow['user'];
                                                    $department = $inventoryRow['department'];
                                                    $status = $inventoryRow['status'];
                                                    $remarks = $inventoryRow['remarks'];
                                        ?>
                                                    <tr>
                                                        <td><?= $faNumber ?></td>
                                                        <td><?= $itemType ?></td>
                                                        <td><?= $itemName ?></td>
                                                        <td><?= $brand ?></td>
                                                        <td><?= $model ?></td>
                                                        <td data-order="<?= convertToDate($dateAcquired) ?>"><?= convertToReadableDate($dateAcquired) ?></td>
                                                        <td><?= $supplier ?></td>
                                                        <td><?= $serialNumber ?></td>
                                                        <td><?= $user ?></td>
                                                        <td><?= $department ?></td>
                                                        <td><?= $status ?></td>
                                                        <td><?= $remarks ?></td>
                                                    </tr>
                                        <?php }
                                            }
                                        }
                                        ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="createInventoryModal" tabindex="-1" aria-labelledby="createInventoryModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="createInventoryModalLabel">Add New Item</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="createInventoryForm">

                    </form>
                </div>
            </div>
        </div>
    </div>
</body>

<script src="http://172.16.14.44/dependencies/javascript/bootstrap/v5.3.3/bootstrap.bundle.js"></script>
<script src="../../../assets/vendor/jquery/jquery.min.js"></script>
<script src="../../../assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="../../../assets/vendor/jquery-easing/jquery.easing.min.js"></script>
<script src="../../../assets/js/sb-admin-2.min.js"></script>
<script src="../../../assets/vendor/datatables/jquery.dataTables.min.js"></script>
<script src="../../../assets/vendor/datatables/dataTables.bootstrap4.min.js"></script>
<script src="../../../assets/js/inventory.js"></script>

</html>