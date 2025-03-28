var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})
// Initialize previous counts
let previousCounts = {
    overdue: 0,
    today_due: 0,
    open: 0,
    for_approval: 0,
    unassigned: 0,
    finished: 0,
    all: 0
};
function formatDate(dateString) {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const month = date.getMonth() + 1; // Months are zero-based
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year

    return `${formattedHours}:${formattedMinutes} ${ampm} ${month}-${day}-${year}`;
}

function calculateRemainingTime(dueDate) {
    if (!dueDate) {
        return 'N/A';
    }

    const now = new Date();
    const due = new Date(dueDate);

    if (isNaN(due.getTime())) {
        return 'N/A';
    }

    const diff = due - now;

    if (diff <= 0) {
        return `${formatDate(dueDate)}`;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
}

function updateTimers() {
    document.querySelectorAll('.ticket-due-timer').forEach(timer => {
        const dueDate = timer.getAttribute('data-due-date');
        if (dueDate) {
            timer.innerText = calculateRemainingTime(dueDate);
        } else {
            timer.innerText = 'N/A';
        }
    });
}

setInterval(updateTimers, 1000);


$(document).ready(function () {
    // Fetch ticket counts from the backend
    $.ajax({
        url: '../../../backend/admin/ticketing-system/fetch_ticket_counts.php', // Adjust the path as needed
        method: 'GET',
        success: function (response) {
            if (response.status === 'success') {
                const data = response.data;
                // Set previousCounts to the initial data values
                previousCounts = {
                    overdue: data.overdue || 0,
                    today_due: data.today_due || 0,
                    open: data.open || 0,
                    for_approval: data.all_for_approval || 0,
                    all_overdue: data.all_overdue || 0,
                    all_today_due: data.all_today_due || 0,
                    all_open: data.open || 0,
                    all_for_approval: data.all_for_approval || 0,
                    unassigned: data.unassigned || 0,
                    finished: data.finished || 0,
                    all_reopen: data.all_reopen || 0,
                    all: data.all || 0
                };
                // Update the numbers in the cards
                $('#overdue-tasks').text(data.overdue || 0);
                $('#today-due-tickets').text(data.today_due || 0);
                $('#open-tickets').text(data.open || 0);
                $('#for-approval-tickets').text(data.for_approval || 0);
                $('#unassigned-tickets').text(data.unassigned || 0);
                $('#closed-tickets').text(data.finished || 0);
                $('#all-tickets').text(data.all || 0);
                $('#all-overdue-tasks').text(data.all_overdue || 0);
                $('#all-today-due-tickets').text(data.all_today_due || 0);
                $('#all-open-tickets').text(data.all_open || 0);
                $('#reopen-tickets').text(data.all_reopen || 0);
                $('#all-for-approval-tickets').text(data.all_for_approval || 0);
            } else {
                console.error('Error:', response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX error:', error);
        }
    });
});




// Function to handle card click (fetch tickets and show table modal)
function fetchAndShowTickets(card) {
    const category = card.getAttribute('data-category');
    const modalTitle = {
        'overdue': 'Overdue Tasks',
        'today-due': 'Tickets Due Today',
        'open': 'Open Tickets',
        'for-approval': 'For Approval Tickets',
        'unassigned': 'Unassigned Tickets',
        'finished': 'Closed Tickets',
        'all-overdue': 'All Overdue Tasks',
        'all-today-due': 'All Tickets Due Today',
        'all-open': 'All Open Tickets',
        'all-for-approval': 'All For Approval Tickets',
        'reopen-tickets': 'Request Reopen',
        'all': 'All Tickets'
    };

    // Update modal title
    document.getElementById('ticketModalLabel').innerText = modalTitle[category];

    // Fetch data from the backend
    $.ajax({
        url: '../../../backend/admin/ticketing-system/fetch_tickets.php', // Adjust the path as needed
        method: 'GET',
        data: { category: category },
        success: function (response) {
            if (response.status === 'success') {
                const tableBody = document.querySelector('#ticketTable tbody');
                tableBody.innerHTML = ''; // Clear existing rows

                // Populate table with tickets
                response.data.forEach(ticket => {
                    const attachmentLink = ticket.ticket_attachment
                        ? `<a target="_blank" class="badge badge-info">Attachment</a>`
                        : '';
                    const formattedDueDate = ticket.ticket_due_date ? formatDate(ticket.ticket_due_date) : 'N/A';
                    const formattedDateCreated = ticket.date_created ? formatDate(ticket.date_created) : 'N/A';
                    const row = `
                        <tr class="clickable-row" data-ticket='${JSON.stringify(ticket)}'>
                            <td>${ticket.ticket_id}</td>
                            <td>${ticket.full_name} - ${ticket.department}</td>
                            <td>${formattedDateCreated}</td>
                            <td>${ticket.ticket_subject}</td>
                            <td>${ticket.ticket_status}</td>
                            <td class="ticket-due-timer" data-due-date="${ticket.ticket_due_date}">${formattedDueDate}</td>
                            <td>${attachmentLink}</td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
                });

                // Initialize DataTables
                $('#ticketTable').DataTable();

                if (category === 'finished') { // Add event listener for row click
                    document.querySelectorAll('.clickable-row').forEach(row => {
                        row.addEventListener('click', function () {
                            const ticket = JSON.parse(this.getAttribute('data-ticket'));
                            showClosedTicketDetails(ticket);
                        });
                    });
                }
                else if (category === 'unassigned') {
                    document.querySelectorAll('.clickable-row').forEach(row => {
                        row.addEventListener('click', function () {
                            const ticket = JSON.parse(this.getAttribute('data-ticket'));
                            showUnassignedTicketDetails(ticket);
                        });
                    });
                } else if (category === 'reopen-tickets') {
                    document.querySelectorAll('.clickable-row').forEach(row => {
                        row.addEventListener('click', function () {
                            const ticket = JSON.parse(this.getAttribute('data-ticket'));
                            showReopenTicketDetails(ticket);
                        });
                    });
                } else {
                    // Add event listener for row click
                    document.querySelectorAll('.clickable-row').forEach(row => {
                        row.addEventListener('click', function () {
                            const ticket = JSON.parse(this.getAttribute('data-ticket'));
                            showTicketDetails(ticket);
                        });
                    });
                }


                // Show the modal
                $('#ticketModal').modal('show');
            } else {
                console.error('Error:', response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX error:', error);
        }
    });
}

// Function to handle row click and show closed ticket details modal
function showClosedTicketDetails(ticket) {
    // Populate modal with ticket details

    const attachmentLink = ticket.ticket_attachment
        ? `<a href="../../../${ticket.ticket_attachment.replace(/^(\.\.\/)+/, '')}" target="_blank" class="badge badge-info">View Attachment</a>`
        : 'N/A';
    document.getElementById('closedticketId').innerText = ticket.ticket_id;
    document.getElementById('closedticketRequestorId').innerText = ticket.full_name || 'N/A';
    document.getElementById('closedticketRequestorDepartment').innerText = ticket.department || 'N/A';
    document.getElementById('closedticketSubject').innerText = ticket.ticket_subject || 'N/A';
    document.getElementById('closedticketDescription').innerText = ticket.ticket_description || 'N/A';
    document.getElementById('closedticketType').innerText = ticket.ticket_type || 'N/A';
    document.getElementById('closedticketAttachment').innerHTML = attachmentLink;
    document.getElementById('closedticketConclusion').innerText = ticket.ticket_conclusion || 'N/A';
    // Check if ticket_id exists in ticket_convo_tbl
    $.ajax({
        url: '../../../backend/shared/ticketing-system/check_ticket_convo.php', // Replace with your actual endpoint
        method: 'POST',
        data: { ticket_id: ticket.ticket_id },
        success: function (response) {
            if (response.exists) {
                $('#openChatButtonClosed').removeClass('btn-outline-secondary').addClass('btn-primary');
            } else {
                $('#openChatButtonClosed').removeClass('btn-primary').addClass('btn-outline-secondary');
            }
        }
    });
    $('#openChatButtonClosed').data('id', ticket.ticket_id).data('requestor', ticket.ticket_requestor_id).data('title', 'T#' + ticket.ticket_id + ' | ' + ticket.ticket_subject); // Set ticket ID and title for chat button
    $('#ticketModal').modal('hide');
    // Show the details modal
    $('#closedTicketDetailsModal').modal('show');

}

// Function to handle row click and show approve/reject reopen modal
function showReopenTicketDetails(ticket) {
    // Populate modal with ticket details
    const attachmentLink = ticket.ticket_attachment
        ? `<a href="../../../${ticket.ticket_attachment.replace(/^(\.\.\/)+/, '')}" target="_blank" class="badge badge-info">View Attachment</a>`
        : 'N/A';
    document.getElementById('approveRejectReopenTicketId').innerText = ticket.ticket_id;
    document.getElementById('approveRejectReopenRequestorId').innerText = ticket.full_name || 'N/A';
    document.getElementById('approveRejectReopenRequestorDepartment').innerText = ticket.department || 'N/A';
    document.getElementById('approveRejectReopenSubject').innerText = ticket.ticket_subject || 'N/A';
    document.getElementById('approveRejectReopenDescription').innerText = ticket.ticket_description || 'N/A';

    document.getElementById('approveRejectReopenDescription').innerText = ticket.ticket_changes_description || 'N/A';
    document.getElementById('approveRejectReopenHandler').innerText = ticket.handler_name || 'N/A';
    $.ajax({
        url: '../../../backend/shared/ticketing-system/check_ticket_convo.php', // Replace with your actual endpoint
        method: 'POST',
        data: { ticket_id: ticket.ticket_id },
        success: function (response) {
            if (response.exists) {
                $('#openChatButton').removeClass('btn-outline-secondary').addClass('btn-primary');
            } else {
                $('#openChatButton').removeClass('btn-primary').addClass('btn-outline-secondary');
            }
        }
    });
    $('#openChatButton').data('id', ticket.ticket_id).data('requestor', ticket.ticket_requestor_id).data('title', 'T#' + ticket.ticket_id + ' | ' + ticket.ticket_subject); // Set ticket ID and title for chat button
    $('#ticketModal').modal('hide');
    // Show the approve/reject reopen modal
    $('#approveRejectReopenModal').modal('show');
}

// Function to handle row click and show ticket details modal
function showTicketDetails(ticket) {
    // Populate modal with ticket details
    const attachmentLink = ticket.ticket_attachment
        ? `<a href="../../../${ticket.ticket_attachment.replace(/^(\.\.\/)+/, '')}" target="_blank" class="badge badge-info">View Attachment</a>`
        : 'N/A';
    document.getElementById('ticketId').innerText = ticket.ticket_id;
    document.getElementById('ticketRequestorId').innerText = ticket.full_name || 'N/A';
    document.getElementById('ticketRequestorDepartment').innerText = ticket.department || 'N/A';
    document.getElementById('ticketSubject').innerText = ticket.ticket_subject || 'N/A';
    document.getElementById('ticketDescription').innerText = ticket.ticket_description || 'N/A';
    document.getElementById('ticketType').innerText = ticket.ticket_type || 'N/A';
    document.getElementById('ticketAttachment').innerHTML = attachmentLink;
    document.getElementById('ticketConclusion').innerText = ticket.ticket_conclusion || 'N/A';
    $.ajax({
        url: '../../../backend/shared/ticketing-system/check_ticket_convo.php', // Replace with your actual endpoint
        method: 'POST',
        data: { ticket_id: ticket.ticket_id },
        success: function (response) {
            if (response.exists) {
                $('#openChatButton').removeClass('btn-outline-secondary').addClass('btn-primary');
            } else {
                $('#openChatButton').removeClass('btn-primary').addClass('btn-outline-secondary');
            }
        }
    });
    $('#openChatButton').data('id', ticket.ticket_id).data('requestor', ticket.ticket_requestor_id).data('title', 'T#' + ticket.ticket_id + ' | ' + ticket.ticket_subject); // Set ticket ID and title for chat button
    // Show the details modal
    $('#ticketModal').modal('hide');
    $('#ticketDetailsModal').modal('show');
}

// Function to handle row click and show ticket details modal
function showUnassignedTicketDetails(ticket) {
    // Populate modal with ticket details
    const unassignedAttachmentLink = ticket.ticket_attachment
        ? `<a href="../../../${ticket.ticket_attachment.replace(/^(\.\.\/)+/, '')}" target="_blank" class="badge badge-info">View Attachment</a>`
        : 'N/A';
    document.getElementById('unassignedticketId').innerText = ticket.ticket_id;
    document.getElementById('unassignedticketRequestorId').innerText = ticket.full_name || 'N/A';
    document.getElementById('unassignedticketRequestorDepartment').innerText = ticket.department || 'N/A';
    document.getElementById('unassignedticketSubject').innerText = ticket.ticket_subject || 'N/A';
    document.getElementById('unassignedticketDescription').innerText = ticket.ticket_description || 'N/A';
    document.getElementById('unassignedticketType').innerText = ticket.ticket_type || 'N/A';
    document.getElementById('unassignedticketAttachment').innerHTML = unassignedAttachmentLink;
    $.ajax({
        url: '../../../backend/shared/ticketing-system/check_ticket_convo.php', // Replace with your actual endpoint
        method: 'POST',
        data: { ticket_id: ticket.ticket_id },
        success: function (response) {
            if (response.exists) {
                $('#openChatButtonUnassigned').removeClass('btn-outline-secondary').addClass('btn-primary');
            } else {
                $('#openChatButtonUnassigned').removeClass('btn-primary').addClass('btn-outline-secondary');
            }
        }
    });
    $('#openChatButtonUnassigned').data('id', ticket.ticket_id).data('requestor', ticket.ticket_requestor_id).data('title', 'T#' + ticket.ticket_id + ' | ' + ticket.ticket_subject); // Set ticket ID and title for chat button
    // Show the details modal
    $('#ticketModal').modal('hide');
    $('#unassignedticketDetailsModal').modal('show');
}



// Function to claim the ticket
function claimTicket() {
    const ticketId = document.getElementById('unassignedticketId').innerText;
    const forApproval = document.getElementById('forApprovalCheckbox').checked;
    const ticketStatus = forApproval ? 'FOR APPROVAL' : 'OPEN';
    // Send updated details to the backend
    $.ajax({
        url: '../../../backend/admin/ticketing-system/update_ticket.php', // Adjust the path as needed
        method: 'POST',
        data: {
            ticket_id: ticketId,
            ticket_status: ticketStatus,
        },
        success: function (response) {
            if (response.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Ticket claimed successfully',
                    showConfirmButton: false,
                    timer: 1500
                });
                refreshTicketList();
                $('#unassignedticketDetailsModal').modal('hide');
                fetchAndShowTickets();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.fire({
                icon: 'error',
                title: 'AJAX error',
                text: error
            });
        }
    });
}

// Function to enable editing of ticket details
function enableEditing() {
    document.getElementById('ticketDueDate').disabled = false;
    document.getElementById('ticketStatus').disabled = false;
    document.getElementById('closeTicketButton').style.display = 'none';
    document.getElementById('saveButton').style.display = 'inline-block';
    document.getElementById('cancelsaveButton').style.display = 'inline-block';
}
// Function to cancel enable editing of ticket details
// function cancelTicketDetails() {
//     document.getElementById('ticketDueDate').disabled = true;
//     document.getElementById('ticketStatus').disabled = true;
//     document.getElementById('closeTicketButton').style.display = 'inline-block';
//     document.getElementById('saveButton').style.display = 'none';
//     document.getElementById('cancelsaveButton').style.display = 'none';
// }

function enableUnassignedEditing() {
    document.getElementById('unassignedticketDueDate').disabled = false;
    document.getElementById('unassignedticketStatus').disabled = false;
    document.getElementById('unassignedticketHandlerId').disabled = false;
    document.getElementById('unassignededitButton').style.display = 'none';
    document.getElementById('unassignedsaveButton').style.display = 'inline-block';
    document.getElementById('unassignedcancelsaveButton').style.display = 'inline-block';
}

function cancelUnassignedTicketDetails() {
    document.getElementById('unassignedticketDueDate').disabled = true;
    document.getElementById('unassignedticketStatus').disabled = true;
    document.getElementById('unassignedticketHandlerId').disabled = true;
    document.getElementById('unassignededitButton').style.display = 'inline-block';
    document.getElementById('unassignedsaveButton').style.display = 'none';
    document.getElementById('unassignedcancelsaveButton').style.display = 'none';
}
function showConclusionTextArea() {
    let textArea = document.getElementById('conclusionTextArea');
    let saveButton = document.getElementById('saveConclusionButton');
    let closeButton = document.getElementById('closeTicketButton');
    let cancelButton = document.getElementById('cancelsaveButton');

    // Remove 'd-none' class to show elements
    textArea.classList.remove('fade', 'd-none');
    textArea.classList.add('show');
    saveButton.classList.remove('d-none');
    cancelButton.classList.remove('d-none');

    // Hide Close Ticket button
    closeButton.classList.add('d-none');
}

// Function to cancel editing of ticket details
function cancelTicketDetails() {
    let textArea = document.getElementById('conclusionTextArea');
    let cancelButton = document.getElementById('cancelsaveButton');
    let saveConclusionButton = document.getElementById('saveConclusionButton');
    let closeButton = document.getElementById('closeTicketButton');

    // Hide text area and buttons
    textArea.classList.add('d-none');
    cancelButton.classList.add('d-none');
    saveConclusionButton.classList.add('d-none');

    // Show Close Ticket button
    closeButton.classList.remove('d-none');
}



// Function to save edited ticket details
function saveTicketDetails() {
    const ticketId = document.getElementById('ticketId').innerText;
    const ticketDueDate = document.getElementById('ticketDueDate').value;
    const ticketStatus = document.getElementById('ticketStatus').value;
    const ticketHandlerId = document.getElementById('ticketHandlerId').value;

    // Send updated details to the backend
    $.ajax({
        url: '../../../backend/admin/ticketing-system/update_ticket.php', // Adjust the path as needed
        method: 'POST',
        data: {
            ticket_id: ticketId,
            ticket_due_date: ticketDueDate,
            ticket_status: ticketStatus,
            ticket_handler_id: ticketHandlerId
        },
        success: function (response) {
            if (response.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Ticket details updated successfully',
                    showConfirmButton: false,
                    timer: 1500
                });
                refreshTicketList();
                $('#ticketDetailsModal').modal('hide');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.fire({
                icon: 'error',
                title: 'AJAX error',
                text: error
            });
        }
    });

    document.getElementById('ticketDueDate').disabled = true;
    document.getElementById('ticketStatus').disabled = true;
    // document.getElementById('ticketHandlerId').disabled = true;
    document.getElementById('editButton').style.display = 'inline-block';
    document.getElementById('saveButton').style.display = 'none';
}


function saveUnassignedTicketDetails() {
    const ticketId = document.getElementById('unassignedticketId').innerText;
    const ticketDueDate = document.getElementById('unassignedticketDueDate').value;
    const ticketStatus = document.getElementById('unassignedticketStatus').value;
    const ticketHandlerId = document.getElementById('unassignedticketHandlerId').value;
    // Send updated details to the backend
    $.ajax({
        url: '../../../backend/admin/ticketing-system/update_ticket.php', // Adjust the path as needed
        method: 'POST',
        data: {
            ticket_id: ticketId,
            ticket_due_date: ticketDueDate,
            ticket_status: ticketStatus,
            ticket_handler_id: ticketHandlerId
        },
        success: function (response) {
            if (response.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Ticket details updated successfully',
                    showConfirmButton: false,
                    timer: 1500
                });
                refreshTicketList();
                $('#unassignedticketDetailsModal').modal('hide');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.fire({
                icon: 'error',
                title: 'AJAX error',
                text: error
            });
        }
    });

    document.getElementById('ticketDueDate').disabled = true;
    document.getElementById('ticketStatus').disabled = true;
    document.getElementById('editButton').style.display = 'inline-block';
    document.getElementById('saveButton').style.display = 'none';
}

// Function to reopen ticket
function requestReopen() {
    const closedticketId = document.getElementById('closedticketId').innerText;
    const closedticketDueDate = document.getElementById('closedticketDueDate').value;
    const closedticketStatus = "REOPEN";
    const closedticketHandlerId = document.getElementById('closedticketHandlerId').value;

    // Send updated details to the backend
    $.ajax({
        url: '../../../backend/admin/ticketing-system/update_ticket.php', // Adjust the path as needed
        method: 'POST',
        data: {
            ticket_id: closedticketId,
            ticket_due_date: closedticketDueDate,
            ticket_status: closedticketStatus,
            ticket_handler_id: closedticketHandlerId
        },
        success: function (response) {
            if (response.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Ticket details updated successfully',
                    showConfirmButton: false,
                    timer: 1500
                });
                refreshTicketList();
                $('#closedticketDetailsModal').modal('hide');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.fire({
                icon: 'error',
                title: 'AJAX error',
                text: error
            });
        }
    });
}


// Function to save the conclusion and update the ticket status to "CLOSED"
function saveConclusion() {
    const ticketId = document.getElementById('ticketId').innerText;
    const conclusion = document.getElementById('conclusionTextArea').value;

    // Send updated details to the backend
    $.ajax({
        url: '../../../backend/admin/ticketing-system/close_ticket.php', // Adjust the path as needed
        method: 'POST',
        data: {
            ticket_id: ticketId,
            ticket_status: 'CLOSED',
            ticket_conclusion: conclusion
        },
        success: function (response) {
            if (response.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Ticket closed successfully',
                    showConfirmButton: false,
                    timer: 1500
                });
                refreshTicketList();
                $('#ticketDetailsModal').modal('hide');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.fire({
                icon: 'error',
                title: 'AJAX error',
                text: error
            });
        }
    });

    document.getElementById('conclusionTextArea').style.display = 'none';
    document.getElementById('saveConclusionButton').style.display = 'none';
    document.getElementById('closeTicketButton').style.display = 'inline-block';
}

//request for reopen
$(document).ready(function () {
    // Show changes section when "Make Changes" button is clicked
    $('#showChangesButton').on('click', function () {
        $('#changesSection').show();
    });

    // Handle submission of changes
    $('#submitChangesButton').on('click', function () {
        const ticketId = $('#closedticketId').text();
        const changesDescription = $('#ticketChangesDescription').val();

        if (changesDescription.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'Please enter a description for the changes.'
            });
            return;
        }

        $.ajax({
            url: '../../../backend/admin/ticketing-system/reopen_ticket.php',
            type: 'POST',
            data: {
                ticket_id: ticketId,
                changes_description: changesDescription
            },
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Ticket updated successfully!'
                    }).then(() => {
                        $('#closedTicketDetailsModal').modal('hide');
                        // Optionally, refresh the ticket list or perform other actions
                        refreshTicketList();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error: ' + response.message
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error updating ticket. Please try again later.'
                });
            }
        });
    });

    // Handle cancellation of changes
    $('#cancelChangesButton').on('click', function () {
        $('#changesSection').hide();
        $('#ticketChangesDescription').val('');
    });
});

$(document).ready(function () {
    // Show approve/reject reopen modal when "Request Reopen" button is clicked
    $('#showReopenChangesButton').on('click', function () {
        $('#approveRejectReopenModal').modal('show');
    });

    // Handle approval of reopen request
    $('#approveReopenRequestButton').on('click', function () {
        const ticketId = $('#approveRejectReopenTicketId').text();
        const reopenReasonDescription = $('#approveRejectReopenReasonDescription').val();

        if (reopenReasonDescription.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'Please enter a reason for reopening the ticket.'
            });
            return;
        }

        $.ajax({
            url: '../../../backend/s-admin/ticketing-system/approve_reopen_ticket.php',
            type: 'POST',
            data: {
                ticket_id: ticketId,
                reopen_reason_description: reopenReasonDescription,
                action: 'OPEN'
            },
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Ticket reopen request approved successfully!'
                    }).then(() => {
                        $('#approveRejectReopenModal').modal('hide');
                        // Optionally, refresh the ticket list or perform other actions
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error: ' + response.message
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error approving reopen request. Please try again later.'
                });
            }
        });
    });

    // Handle rejection of reopen request
    $('#rejectReopenRequestButton').on('click', function () {
        const ticketId = $('#approveRejectReopenTicketId').text();
        const reopenReasonDescription = $('#approveRejectReopenReasonDescription').val();

        if (reopenReasonDescription.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'Please enter a reason for rejecting the reopen request.'
            });
            return;
        }

        $.ajax({
            url: '../../../backend/s-admin/ticketing-system/approve_reopen_ticket.php',
            type: 'POST',
            data: {
                ticket_id: ticketId,
                reopen_reason_description: reopenReasonDescription,
                action: 'CLOSED'
            },
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Ticket reopen request rejected successfully!'
                    }).then(() => {
                        $('#approveRejectReopenModal').modal('hide');
                        // Optionally, refresh the ticket list or perform other actions
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error: ' + response.message
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error rejecting reopen request. Please try again later.'
                });
            }
        });
    });
});



// Function to refresh the list of ticket details
function refreshTicketList() {
    // Fetch ticket counts from the backend
    $.ajax({
        url: '../../../backend/admin/ticketing-system/fetch_ticket_counts.php', // Adjust the path as needed
        method: 'GET',
        success: function (response) {
            if (response.status === 'success') {
                const data = response.data;
                var ticket = "";
                // Update the numbers in the cards
                $('#overdue-tasks').text(data.overdue || 0);
                $('#today-due-tickets').text(data.today_due || 0);
                $('#open-tickets').text(data.open || 0);
                $('#for-approval-tickets').text(data.for_approval || 0);
                $('#unassigned-tickets').text(data.unassigned || 0);
                $('#finished-tickets').text(data.finished || 0);
                $('#closed-tickets').text(data.finished || 0);
                $('#all-tickets').text(data.all || 0);
                $('#all-overdue-tasks').text(data.all_overdue || 0);
                $('#all-today-due-tickets').text(data.all_today_due || 0);
                $('#all-open-tickets').text(data.all_open || 0);
                $('#all-for-approval-tickets').text(data.all_for_approval || 0);

                if (data.overdue > 1 || data.today_due > 1) {
                    ticket = "tickets";
                } else {
                    ticket = "ticket";
                }
                // Check for new tickets in specific categories and play alert tone
                if (data.overdue > previousCounts.overdue) {
                    speakAlert('You have ' + data.overdue + ' new overdue ' + ticket + '.');
                    showNotification('You have ' + data.overdue + ' new overdue ' + ticket + '.');
                }
                if (data.today_due > previousCounts.today_due) {
                    speakAlert('You have ' + data.today_due + ' new ' + ticket + ' due today.');
                    showNotification('You have ' + data.today_due + ' new ' + ticket + ' due today.');
                }
                if (data.open > previousCounts.open) {
                    speakAlert('You have ' + data.open + ' new open ' + ticket + '.');
                    showNotification('You have ' + data.open + ' new open ' + ticket + '.');
                }

                // Update previous counts
                previousCounts = data;

                // Refresh the displayed data
                const activeCard = document.querySelector('.card.active');
                if (activeCard) {
                    const category = activeCard.getAttribute('data-category');
                    fetchAndShowTickets(activeCard);
                } else {
                    console.error('No active card found');
                }
            } else {
                console.error('Error:', response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX error:', error);
        }
    });
}

// Function to use text-to-speech for alerts with Microsoft Zira as default
function speakAlert(message) {
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = 'en-US';

    // Get the list of available voices
    const voices = window.speechSynthesis.getVoices();

    // Find the Microsoft Zira voice
    const femaleVoice = voices.find(voice => voice.name === 'Google UK English Female');

    // Set the Microsoft Zira voice if found
    if (femaleVoice) {
        speech.voice = femaleVoice;
    }

    window.speechSynthesis.speak(speech);
}

// window.speechSynthesis.onvoiceschanged = () => {
//     console.log(window.speechSynthesis.getVoices());
// };

// Set interval to refresh tickets every 30 seconds
setInterval(refreshTicketList, 10000);



function showNotification(message) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;

    container.appendChild(notification);

    // Show the notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Hide the notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            container.removeChild(notification);
        }, 500);
    }, 5000);
}

$("#closedTicketDetailsModal").on('hidden.bs.modal', function () {
    $('#ticketModal').modal('show');
});
$("#reopenTicketDetailsModal").on('hidden.bs.modal', function () {
    $('#ticketModal').modal('show');
});
$("#unassignedticketDetailsModal").on('hidden.bs.modal', function () {
    $('#ticketModal').modal('show');
});
$("#ticketDetailsModal").on('hidden.bs.modal', function () {
    $('#ticketModal').modal('show');
});
$("#confirmReopenModal").on('hidden.bs.modal', function () {
    $('#ticketModal').modal('show');
});

$(document).ready(function () {
    // Open chatbox
    $(document).on('click', '#openChatButton, #openChatButtonUnassigned, #openChatButtonClosed', function () {
        const ticketId = $(this).data('id');
        const ticketTitle = $(this).data('title');
        const ticketRequestor = $(this).data('requestor');
        $("#closedTicketDetailsModal").modal('hide');
        $("#reopenTicketDetailsModal").modal('hide');
        $("#unassignedticketDetailsModal").modal('hide');
        $("#ticketDetailsModal").modal('hide');
        $("#confirmReopenModal").modal('hide');
        $('#ticketModal').modal('hide');
        openChatbox(ticketId, ticketTitle, ticketRequestor);
    });

    // Function to open chatbox
    function openChatbox(ticketId, ticketTitle, ticketRequestor) {
        $('#chatboxTitle').text(ticketTitle);
        $('#chatbox').data('ticket-id', ticketId).data('requestor', ticketRequestor).show();
        fetchChatboxMessages(ticketId);
    }

    // Close chatbox
    $('#closeChatbox').on('click', function () {
        $('#chatbox').hide();
    });

    // Fetch chatbox messages
    function fetchChatboxMessages(ticketId) {
        $.ajax({
            url: '../../../backend/admin/ticketing-system/fetch_chat_messages.php',
            type: 'GET',
            data: { ticket_id: ticketId },
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    const chatboxMessages = $('#chatboxMessages');
                    chatboxMessages.empty();
                    response.data.forEach(message => {
                        const formattedDateTime = formatDateTime(message.ticket_convo_date);
                        const readStatus = message.is_read ? 'read' : 'unread';
                        const messageElement = `
                        <div class="chat-message ${readStatus}">
                            <strong>${message.full_name}:</strong> ${message.ticket_messages}
                            <div class="small text-gray-500">${formattedDateTime}</div>
                        </div>
                        <hr>`;
                        chatboxMessages.append(messageElement);
                    });

                    // Auto-scroll to bottom when new messages load
                    scrollToBottom();
                } else {
                    console.error(response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error fetching chat messages: ", error);
            },
            complete: function () {
                // Fetch new messages every 3 seconds
                setTimeout(() => fetchChatboxMessages(ticketId), 1000);
            }
        });
    }

    // Send chatbox message
    $('#sendChatboxMessage').on('click', function () {
        const ticketId = $('#chatbox').data('ticket-id');
        const ticketRequestor = $('#chatbox').data('requestor');
        const message = $('#chatboxInput').val();
        if (message.trim() !== '') {
            $.ajax({
                url: '../../../backend/admin/ticketing-system/send_chat_message.php', // Change this to your PHP endpoint
                type: 'POST',
                data: { ticket_id: ticketId, message: message, requestor: ticketRequestor },
                dataType: 'json',
                success: function (response) {
                    if (response.status === 'success') {
                        $('#chatboxInput').val('');
                        fetchChatboxMessages(ticketId, ticketRequestor); // Refresh chat messages
                    } else {
                        console.error(response.message);
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Error sending chat message: ", error);
                }
            });
        }
    });

    // Function to format date and time
    function formatDateTime(dateTime) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
        const formattedDateTime = new Date(dateTime).toLocaleString('en-US', options);
        return formattedDateTime.replace(',', ' |');
    }
});