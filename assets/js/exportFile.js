$(document).ready(function () {
    $("#exportInventoryModalBtn").on('click', function () {
        //! CHANGE ITEM TYPES VALUE
        $('#itemType_export').find('option').not('[value="all"]').remove();
        $('#itemType_export').val('all');
        
        $.ajax({
            type: "GET",
            url: "../../../backend/admin/inventory-management/getItemTypes.php",
            dataType: "json",
            success: function (response) {
                console.log(response);
                if(response.status === 'internal-error'){
                    Swal.fire({
                        title: 'Error!',
                        text: `${response.message}`,
                        icon: 'error',
                        confirmButtonColor: 'var(--bs-danger)'
                    })
                }else{
                    response.forEach((itemType) => {
                        $("#itemType_export").append(
                            $('<option>',{
                                value: itemType,
                                text: itemType
                            })
                        );
                    })
                }
            }
        });

        //! FETCH OLDEST DATE ACQUIRED
        $.ajax({
            type: "GET",
            url: "../../../backend/admin/inventory-management/getOldestDateAcquired.php",
            dataType: "json",
            success: function (response) {
                if(response.status === 'internal-error'){
                    Swal.fire({
                        title: 'Error!',
                        text: `${response.message}`,
                        icon: 'error',
                        confirmButtonColor: 'var(--bs-danger)'
                    })
                }else{
                    $('#dateFrom').attr('min', response);
                    $('#dateTo').attr('min', response);
                }
            }
        });
    });

    $("#dateFrom").on('change', function () {
        if($(this).val() === ''){
            $.ajax({
                type: "GET",
                url: "../../../backend/admin/inventory-management/getOldestDateAcquired.php",
                dataType: "json",
                success: function (response) {
                    if(response.status === 'internal-error'){
                        Swal.fire({
                            title: 'Error!',
                            text: `${response.message}`,
                            icon: 'error',
                            confirmButtonColor: 'var(--bs-danger)'
                        })
                    }else{
                        $('#dateTo').attr('min', response);
                    }
                }
            });
        }else{
            $('#dateTo').attr('min', $(this).val());
        }
    });
    $("#dateTo").on('change', function () {
        if($(this).val() === ''){
            let today = new Date();

            let formattedDate = today.getFullYear() + '-' +
                        String(today.getMonth() + 1).padStart(2, '0') + '-' +
                        String(today.getDate()).padStart(2, '0');
            $('#dateFrom').attr('max', formattedDate);
        }else{
            $('#dateFrom').attr('max', $(this).val());
        }
    });
    $("#exportAllDate").on('change', function () {
        if($(this).is(':checked')){
            $('#dateFrom').attr('disabled', true);
            $('#dateTo').attr('disabled', true);

            $('#dateFrom').val('');
            $('#dateTo').val('');
        }else{
            $('#dateFrom').attr('disabled', false);
            $('#dateTo').attr('disabled', false);
        }
    });
});