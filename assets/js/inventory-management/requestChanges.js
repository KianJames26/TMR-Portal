$(document).ready(function () {
    $("#requestChangesBtn").on('click', function () {
        let target = $(this).attr('data-bs-target');
        $(target).modal('show');
        $("#viewInventoryModal").modal('hide');
    });
    $("#viewRequestHistoryBtn").on('click', function () {
        let target = $(this).attr('data-bs-target');
        $(target).modal('show');
        $("#requestChangesModal").modal('hide');
    });

    $("#requestChangesModal").on('hidden.bs.modal', function () {
        if (!$("#editFAModal").hasClass('show') && !$("#absoluteDeleteModal").hasClass('show') && !$("#unretireModal").hasClass('show') && !$("#viewRequestHistoryModal").hasClass('show')) {
            $("#viewInventoryModal").modal('show');
        }
    });
    $("#editFAModal").on('hidden.bs.modal', function () {
        $("#requestChangesModal").modal('show');
        $("#editFAForm").removeClass('was-validated');
        $("#editFAForm")[0].reset();
    });
    $("#absoluteDeleteModal").on('hidden.bs.modal', function () {
        $("#requestChangesModal").modal('show');
        $("#absoluteDeleteForm").removeClass('was-validated');
        $("#absoluteDeleteForm")[0].reset();
    });
    $("#unretireModal").on('hidden.bs.modal', function () {
        $("#requestChangesModal").modal('show');
        $("#unretireForm").removeClass('was-validated');
        $("#unretireForm")[0].reset();
    });
    $("#viewRequestHistoryModal").on('hidden.bs.modal', function () {
        $("#requestChangesModal").modal('show');
    });
});