document.addEventListener('DOMContentLoaded', async () => {
  const cureNameInput = document.getElementById('cureName');
  const cureTypeSelect = document.getElementById('cureType');
  const saveButton = document.getElementById('saveButton');
  const tablesContainer = document.getElementById('tablesContainer');

  // Display the existing data when the page loads
  displayDataTables(await electron.getAllCures());

  saveButton.addEventListener('click', async () => {
    // Validate input fields
    if (cureNameInput.value.trim() === '' || cureTypeSelect.value.trim() === '') {
      alert('Please fill out all fields.');
      return;
    }

    const cureData = {
      name: cureNameInput.value,
      type: cureTypeSelect.value,
      userId: electron.getUserID(),
      date: new Date().toISOString(),
    };

    try {
      const response = await electron.addCure(cureData.name, cureData.type, cureData.userId, cureData.date);

      // Update the displayed data after submitting
      displayDataTables(await electron.getAllCures());

      // Clear input fields after submission
      cureNameInput.value = '';
      cureTypeSelect.value = '';

      alert('Cure added successfully');
    } catch (error) {
      console.error(error);
      alert('Error adding cure: ' + error.message);
    }
  });

  // Function to display data in tables
  function displayDataTables(allCures) {
    // Clear previous tables
    tablesContainer.innerHTML = '';

    // Create tables based on cure type
    const cureTypes = Array.from(new Set(allCures.map(cure => cure.type)));
    cureTypes.forEach(cureType => {
      const cureTypeCures = allCures.filter(cure => cure.type === cureType);

      if (cureTypeCures.length > 0) {
        const table = document.createElement('table');
        table.innerHTML = `<thead><tr><th>${cureType}</th><th>Action</th></tr></thead>`;
        const tbody = document.createElement('tbody');

        cureTypeCures.forEach(cure => {
          const row = document.createElement('tr');
          row.innerHTML = `<td>${cure.name}</td><td><button class="deleteButton" data-cure-id="${cure.id}">Delete</button></td>`;
          tbody.appendChild(row);
        });

        table.appendChild(tbody);
        tablesContainer.appendChild(table);
      }
    });

    // Add click event listener for delete buttons
    const deleteButtons = document.querySelectorAll('.deleteButton');
    deleteButtons.forEach(button => {
      button.addEventListener('click', async () => {
        const cureId = button.getAttribute('data-cure-id');
        if (confirm('Are you sure you want to delete this cure?')) {
          try {
            await electron.deleteCure(cureId);
            // Update the displayed data after deletion
            displayDataTables(await electron.getAllCures());
            alert('Cure deleted successfully');
          } catch (error) {
            console.error(error);
            alert('Error deleting cure: ' + error.message);
          }
        }
      });
    });
  }
});
