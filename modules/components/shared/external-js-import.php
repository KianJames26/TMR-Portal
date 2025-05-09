<?php
if (isset($_SESSION["user"])) {
    if ($_SESSION['user']['role'] == "HEAD") {
        $roleLink = '<script src="/tmr-portal/assets/js/shared/ticketing-system/user-topbar-messages.js"></script>';
    } else if ($_SESSION['user']['role'] == "USER") {
        $roleLink = '<script src="/tmr-portal/assets/js/shared/ticketing-system/user-topbar-messages.js"></script>';
    } else if ($_SESSION['user']['role'] == "S-ADMIN") {
        $roleLink = '<script src="/tmr-portal/assets/js/shared/ticketing-system/admin-topbar-messages.js"></script>';
    } else if ($_SESSION['user']['role'] == "ADMIN") {
        $roleLink = '<script src="/tmr-portal/assets/js/shared/ticketing-system/admin-topbar-messages.js"></script>';
    }
} else {
    $roleLink = "";
}

?>
<script src="/dependencies/javascript/bootstrap/v5.3.3/bootstrap.bundle.min.js"></script>
<script src="/tmr-portal/assets/vendor/jquery/jquery.min.js"></script>
<script src="/tmr-portal/assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="/tmr-portal/assets/vendor/jquery-easing/jquery.easing.min.js"></script>
<script src="/tmr-portal/assets/js/sb-admin-2.js"></script>
<script src="/dependencies/javascript/sweetalert2-11.14.2/dist/sweetalert2.all.min.js"></script>
<script src="/tmr-portal/assets/vendor/datatables/jquery.dataTables.min.js"></script>
<script src="/tmr-portal/assets/vendor/datatables/dataTables.bootstrap4.min.js"></script>
<script src="/tmr-portal/assets/js/pipes.js"></script>
<script src="/tmr-portal/assets/vendor/chart.js/Chart.js"></script>
<?= $roleLink ?>