$(document).ready(function () {
    $("#togglePassword").on('click', function () {
        if ($(this).hasClass('fa-eye-slash')) {
            $(this).removeClass('fa-eye-slash');
            $(this).addClass('fa-eye');
            $("#password").attr('type', 'text');
        } else if ($(this).hasClass('fa-eye')) {
            $(this).removeClass('fa-eye');
            $(this).addClass('fa-eye-slash');
            $("#password").attr('type', 'password');
        }
    });
});

let alertTimeout

$("#loginForm").submit(function (e) {
    e.preventDefault();

    const formData = $(this).serialize();

    $.ajax({
        type: "POST",
        url: "backend/authenticate.php",
        data: formData,
        dataType: "json",
        success: function (loginStatus) {
            if (loginStatus.status === "success") {
                window.location.href = "modules/shared/dashboard.php";
                console.log(loginStatus);
            } else if (loginStatus.status === "failed") {
                $("#errorModal").empty();
                $('#errorModal').append(`
                    <div class="alert alert-danger alert-dismissible text--white fade" role="alert" style="z-index: 1;" id="alert">
                        <strong>${loginStatus.message}</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `);
                if (alertTimeout) {
                    clearTimeout(alertTimeout);
                }
                setTimeout(() => {
                    $("#alert").toggleClass('show');
                }, 100);

                alertTimeout = setTimeout(() => {
                    $("#alert").removeClass('show');
                    setTimeout(() => {
                        $("#alert").remove();
                    }, 250);
                }, 3000);
            }
        },
        error: function (xhr, status, error) {
            $("#errorModal").empty();
            $('#errorModal').append(`
                <div class="alert alert-danger alert-dismissible text--white fade" role="alert" style="z-index: 1;" id="alert">
                    <strong>An internal error occurred. Please contact MIS.</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `);
            if (alertTimeout) {
                clearTimeout(alertTimeout);
            }
            setTimeout(() => {
                $("#alert").toggleClass('show');
            }, 100);

            alertTimeout = setTimeout(() => {
                $("#alert").removeClass('show');
                setTimeout(() => {
                    $("#alert").remove();
                }, 250);
            }, 3000);

            console.error("AJAX Request Error: ", error);
            console.log("Status: ", status);
            console.log("XHR: ", xhr.responseText);
        }
    });
});
