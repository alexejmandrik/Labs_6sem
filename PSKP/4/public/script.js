document.addEventListener('DOMContentLoaded', () => {
    const editField = document.getElementById('editField');
    const deleteBtn = document.getElementById('deleteBtn');

    if (editField && deleteBtn) {
        editField.addEventListener('input', () => {
            deleteBtn.disabled = true;
        });
    }
});