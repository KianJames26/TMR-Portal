let queriedId;
let editAccountValidationTimeout;
$(document).ready(function () {
    $(document).on('click', '.viewAccountBtn', function (e) {
        e.preventDefault();
        // $("#editAccountForm")[0].reset();
        if (editAccountValidationTimeout) {
            clearTimeout(editAccountValidationTimeout);
        }
        $("#editAccountForm").removeClass('was-validated');
        if (!$("#fullName_edit").prop('disabled')) {
            toggleEditModal();
        }
        if ($("#editAccountActionGroup").hasClass('d-flex')) {
            $("#viewAccountActionGroup").removeClass('d-none');
            $("#viewAccountActionGroup").addClass('d-flex');
            $("#editAccountActionGroup").removeClass('d-flex');
            $("#editAccountActionGroup").addClass('d-none');
        }
        $("#collapseAuthorizations_edit").collapse('hide');
        $("#toggleAuthorizationsBtn_edit").attr('aria-expanded', 'false');

        queriedId = $(this).data('account-id');
        $.ajax({
            type: "GET",
            url: "../../backend/account-management/getAllDepartments.php",
            success: function (response) {
                if (response.status === 'success') {
                    $("#department_edit").empty();
                    $("#department_edit").append(`<option value="" selected hidden>--Select Department--</option>`);
                    for (let i = 0; i < response.data.length; i++) {
                        $("#department_edit").append(`<option value="${response.data[i].department_id}">${response.data[i].department_name}</option>`);
                    }

                    $.ajax({
                        type: "GET",
                        url: "../../backend/account-management/getAccount.php",
                        data: {
                            queriedId
                        },
                        success: function (response) {
                            if (response.status === "internal-error") {
                                Swal.fire({
                                    title: 'Error!',
                                    text: `${response.message}`,
                                    icon: 'error',
                                    confirmButtonColor: 'var(--bs-danger)'
                                });
                            } else if (response.status === "success") {
                                const data = response.data[0];

                                $("#fullName_edit").val(data.full_name);
                                $("#username_edit").val(data.username);
                                $("#role_edit").val(data.role);
                                $("#department_edit").val(data.department);
                                $("#inventoryView_edit").prop('checked', data.inventory_view_auth);
                                $("#inventoryEdit_edit").prop('checked', data.inventory_edit_auth);
                                $("#inventorySuper_edit").prop('checked', data.inventory_super_auth);
                                $("#accountsView_edit").prop('checked', data.accounts_view_auth);
                                $("#accountsEdit_edit").prop('checked', data.accounts_edit_auth);
                                $("#accountsSuper_edit").prop('checked', data.accounts_super_auth);
                                $("#id_edit").val(data.id);

                                $.ajax({
                                    type: "GET",
                                    url: "../../backend/account-management/getSections.php",
                                    data: {
                                        departmentId: data.department
                                    },
                                    success: function (response) {
                                        if (response.status === 'success') {
                                            $("#section_edit").empty();
                                            $("#section_edit").append(`<option value="" selected hidden>--Select Section--</option>`);
                                            for (let i = 0; i < response.data.length; i++) {
                                                $("#section_edit").append(`<option value="${response.data[i].section_id}">${response.data[i].section_name}</option>`);
                                            }
                                        } else {
                                            $("#section_edit").empty();
                                            $("#section_edit").append(`<option value="" selected hidden>--Select Section--</option>`);
                                        }
                                        $("#section_edit").val(data.section);
                                    }
                                });
                                $("#department_edit").on('change', function () {
                                    $.ajax({
                                        type: "GET",
                                        url: "../../backend/account-management/getSections.php",
                                        data: {
                                            departmentId: this.value
                                        },
                                        success: function (response) {
                                            if (response.status === 'success') {
                                                $("#section_edit").empty();
                                                $("#section_edit").append(`<option value="" selected hidden>--Select Section--</option>`);
                                                for (let i = 0; i < response.data.length; i++) {
                                                    $("#section_edit").append(`<option value="${response.data[i].section_id}">${response.data[i].section_name}</option>`);
                                                }
                                            } else {
                                                $("#section_edit").empty();
                                                $("#section_edit").append(`<option value="" selected hidden>--Select Section--</option>`);
                                            }
                                            $("#section_edit").val("");
                                        }
                                    });
                                });
                            }
                        }
                    });
                } else if (response.status === 'internal-error') {
                    Swal.fire({
                        title: 'Error!',
                        text: `${response.message}`,
                        icon: 'error',
                        confirmButtonColor: 'var(--bs-danger)'
                    }).then(() => {
                        $("#department_edit").empty();
                        $("#department_edit").append(`<option value="" selected hidden>--Select Department--</option>`);
                    });
                }
            }
        });
    });

    $("#editAccountButton").on('click', function () {
        toggleEditModal();
        $("#viewAccountActionGroup").removeClass('d-flex');
        $("#viewAccountActionGroup").addClass('d-none');
        $("#editAccountActionGroup").removeClass('d-none');
        $("#editAccountActionGroup").addClass('d-flex');
    });
    $("#cancelEditAccountButton").on('click', function () {
        toggleEditModal();
        $("#viewAccountActionGroup").removeClass('d-none');
        $("#viewAccountActionGroup").addClass('d-flex');
        $("#editAccountActionGroup").removeClass('d-flex');
        $("#editAccountActionGroup").addClass('d-none');

        $.ajax({
            type: "GET",
            url: "../../backend/account-management/getAccount.php",
            data: {
                queriedId
            },
            success: function (response) {
                if (response.status === "internal-error") {
                    Swal.fire({
                        title: 'Error!',
                        text: `${response.message}`,
                        icon: 'error',
                        confirmButtonColor: 'var(--bs-danger)'
                    });
                } else if (response.status === "success") {
                    const data = response.data[0];

                    $("#fullName_edit").val(data.full_name);
                    $("#username_edit").val(data.username);
                    $("#role_edit").val(data.role);
                    $("#department_edit").val(data.department);
                    $("#section_edit").val(data.section);
                    $("#inventoryView_edit").prop('checked', data.inventory_view_auth);
                    $("#inventoryEdit_edit").prop('checked', data.inventory_edit_auth);
                    $("#inventorySuper_edit").prop('checked', data.inventory_super_auth);
                    $("#accountsView_edit").prop('checked', data.accounts_view_auth);
                    $("#accountsEdit_edit").prop('checked', data.accounts_edit_auth);
                    $("#accountsSuper_edit").prop('checked', data.accounts_super_auth);
                    $("#id_edit").val(data.id);
                }
            }
        });
    });

    const toggleEditModal = () => {
        $("#fullName_edit").prop('disabled', !$("#fullName_edit").prop('disabled'));
        $("#username_edit").prop('disabled', !$("#username_edit").prop('disabled'));
        $("#role_edit").prop('disabled', !$("#role_edit").prop('disabled'));
        $("#department_edit").prop('disabled', !$("#department_edit").prop('disabled'));
        $("#section_edit").prop('disabled', !$("#section_edit").prop('disabled'));
        $("#inventoryView_edit").prop('disabled', !$("#inventoryView_edit").prop('disabled'));
        $("#inventoryEdit_edit").prop('disabled', !$("#inventoryEdit_edit").prop('disabled'));
        $("#inventorySuper_edit").prop('disabled', !$("#inventorySuper_edit").prop('disabled'));
        $("#accountsView_edit").prop('disabled', !$("#accountsView_edit").prop('disabled'));
        $("#accountsEdit_edit").prop('disabled', !$("#accountsEdit_edit").prop('disabled'));
        $("#accountsSuper_edit").prop('disabled', !$("#accountsSuper_edit").prop('disabled'));
    }

    $(document).on('click', '#lockAccountBtn', function () {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to lock this account?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--bs-danger)',
            cancelButtonColor: 'var(--bs-secondary)',
            confirmButtonText: 'Yes, lock it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: "../../backend/account-management/lockAccount.php",
                    data: {
                        id: $(this).data('account-id')
                    },
                    success: function (response) {
                        if (response.status === "internal-error") {
                            Swal.fire({
                                title: 'Error!',
                                text: `${response.message}`,
                                icon: 'error',
                                confirmButtonColor: 'var(--bs-danger)'
                            });
                        } else if (response.status === "success") {
                            Swal.fire({
                                title: 'Success!',
                                text: `${response.message}`,
                                icon: 'success',
                                confirmButtonColor: 'var(--bs-success)'
                            }).then(() => {
                                $('#accountsTable').DataTable().ajax.reload();
                            });
                        }
                    }
                });
            }
        })
    });
    $(document).on('click', '#unlockAccountBtn', function () {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to unlock this account?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--bs-success)',
            cancelButtonColor: 'var(--bs-danger)',
            confirmButtonText: 'Yes, unlock it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: "../../backend/account-management/unlockAccount.php",
                    data: {
                        id: $(this).data('account-id')
                    },
                    success: function (response) {
                        if (response.status === "internal-error") {
                            Swal.fire({
                                title: 'Error!',
                                text: `${response.message}`,
                                icon: 'error',
                                confirmButtonColor: 'var(--bs-danger)'
                            });
                        } else if (response.status === "success") {
                            Swal.fire({
                                title: 'Success!',
                                text: `${response.message}`,
                                icon: 'success',
                                confirmButtonColor: 'var(--bs-success)'
                            }).then(() => {
                                $('#accountsTable').DataTable().ajax.reload();
                            });
                        }
                    }
                });
            }
        })
    });
    $(document).on('click', '#resetPasswordBtn', function () {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to reset the password of this account?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--bs-success)',
            cancelButtonColor: 'var(--bs-danger)',
            confirmButtonText: 'Yes, reset it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: "../../backend/account-management/resetPassword.php",
                    data: {
                        id: $(this).data('account-id')
                    },
                    success: function (response) {
                        if (response.status === "internal-error") {
                            Swal.fire({
                                title: 'Error!',
                                text: `${response.message}`,
                                icon: 'error',
                                confirmButtonColor: 'var(--bs-danger)'
                            });
                        } else if (response.status === "success") {
                            Swal.fire({
                                title: 'Success!',
                                html: `${response.message}`,
                                icon: 'success',
                                confirmButtonColor: 'var(--bs-success)'
                            }).then(() => {
                                $('#accountsTable').DataTable().ajax.reload();
                            });
                        }
                    }
                });
            }
        })
    });
});