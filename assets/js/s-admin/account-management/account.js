$(document).ready(function () {
    const accountsTable = $('#accountsTable').DataTable({
        ajax: {
            url: "../../../backend/s-admin/account-management/getAllAccounts.php",
            type: "GET",
            dataSrc: function (json) {
                const roles = [...new Set(json.data.map(item => item.role))]
                const filterRole = $("#filterRole");
                filterRole.empty().append(new Option("All", ""));
                roles.forEach(role => {
                    filterRole.append(new Option(role, role));
                });

                const departments = [...new Set(json.data.map(item => item.department))]
                const filterDepartment = $("#filterDepartment");
                filterDepartment.empty().append(new Option("All", ""));
                departments.forEach(department => {
                    filterDepartment.append(new Option(department, department));
                });

                const statuses = [...new Set(json.data.map(item => item.status))]
                const filterStatus = $("#filterStatus");
                filterStatus.empty().append(new Option("All", ""));
                statuses.forEach(status => {
                    filterStatus.append(new Option(status, status));
                });

                return json.data;
            }
        },
        columns: [
            {
                data: "fullName",
                render: function (data, type, row) {
                    return `
                    <div class="d-flex align-items-center" style="gap: 8px;">
                        <img width="50px" class="rounded-circle" src="${row.profilePic ? row.profilePic : '../../../assets/img/no-profile.png'}"/>
                        ${data}
                    </div>
                    `;
                }
            },
            { data: "username" },
            { data: "role" },
            { data: "department" },
            { data: "status" },
            {
                data: "id",
                render: function (data, type, row) {
                    return `<div class="d-flex align-items-center justify-content-center" style="gap: 16px;">
                                <i class="fas fa-2x fa-eye text-primary"
                                    role="button"
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title="View Account"
                                    data-account-id="${data}" 
                                    data-bs-toggle="modal"]
                                    data-bs-target="#viewAccountModal">
                                </i>
                                    <i class="fas fa-2x ${row.status === "Active" ? "fa-lock-keyhole text-warning" : "fa-lock-keyhole-open"}"
                                    role="button"
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title="${row.status === "Active" ? "Lock Account" : "Unlock Account"}"
                                    data-account-id="${data}" 
                                    data-bs-toggle="modal"]
                                    data-bs-target="${row.status === "Active" ? "#lockAccountModal" : "#unlockAccountModal"}">
                                </i>
                                    <i class="fas fa-2x fa-key text-danger"
                                    role="button"
                                    data-toggle="tooltip"
                                    data-placement="top"
                                    title="Reset Password"
                                    data-account-id="${data}" 
                                    data-bs-toggle="modal"]
                                    data-bs-target="#resetPasswordModal">
                                </i>
                            </div>`;
                }
            }
        ],
        columnDefs: [
            {
                targets: [2, 3, 4, 5],
                orderable: false
            }
        ],
        destroy: true,
        serverSide: false,
        processing: true,
    });

    $("#filterDepartment, #filterRole, #filterStatus").on('change', function () {
        const role = $("#filterRole").val();
        if (role) {
            accountsTable.column(2).search(`^${role}$`, true, false).draw();
        } else {
            accountsTable.column(2).search("").draw();
        }

        const department = $("#filterDepartment").val();
        if (department) {
            accountsTable.column(3).search(department).draw();
        } else {
            accountsTable.column(3).search("").draw();
        }

        const status = $("#filterStatus").val();
        if (status) {
            accountsTable.column(4).search(`^${status}$`, true, false).draw();
        } else {
            accountsTable.column(4).search("").draw();
        }
    });

    accountsTable.on('draw', function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
});