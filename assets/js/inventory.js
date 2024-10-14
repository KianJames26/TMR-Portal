//? DATA TABLES
$(document).ready(function() {
    $('#inventoryTable').DataTable({
        "columnDefs": [{
            "targets": [5],
            "type": "date",
            "orderDataType": "dom-data-order"
        }],
        "order": [
            [0, "desc"]
        ]
    });

    // $(".modalBtn").click(function (e) { 
    //     e.preventDefault();
        
    //     const modalId = $(this).data('bsTarget');

    //     $(modalId).modal('show');
    // });
});