// formSubmission.js
// Arrays to store cure types, names, codes, and quantities globally
let cureTypes = [];
let cureNames = [];
let cureCodes = [];
let cureQuantities = [];

// Helper function to get selected devices
function getSelectedDevices() {
  const deviceCheckboxes = document.querySelectorAll('input[name="devices"]:checked');
  const selectedDevices = Array.from(deviceCheckboxes).map((checkbox) => checkbox.value);
  return selectedDevices;
}

// Function to fetch and display cure data in tables by type
async function displayCureData() {
  try {
    // Call the getAllCures function from the context bridge
    const cures = await window.electron.getAllCures();

    // Group cures by type
    const curesByType = {};
    cures.forEach((cure) => {
      const type = cure.type;
      if (!curesByType[type]) {
        curesByType[type] = [];
      }
      curesByType[type].push(cure.name);
    });

    // Get the container element where tables will be appended
    const container = document.getElementById('cureTablesContainer');
    container.innerHTML = ''; // Clear existing content

    // Create tables for each cure type
    for (const type in curesByType) {
      const typeTable = document.createElement('table');
      typeTable.id = `table${type}`; // Set an id for the table

      // Create table headers
      const headerRow = typeTable.insertRow(0);
      const headers = [type, 'Code', 'Quantity']; // Headers for name, code, and quantity
      headers.forEach((headerText, index) => {
        const cell = headerRow.insertCell(index);
        cell.textContent = headerText;
      });

      // Fill the table with cure data for the current type
      curesByType[type].forEach((cureName, rowIndex) => {
        const row = typeTable.insertRow(rowIndex + 1);
        row.dataset.type = cureName;
        row.dataset.name = type;

        // Cells for name, code, and quantity
        const cellName = row.insertCell(0);
        cellName.textContent = cureName;

        const cellCode = row.insertCell(1);
        const inputCode = document.createElement('input');
        inputCode.type = 'text';
        inputCode.placeholder = 'Enter Code';
        inputCode.classList.add('code-input')
        inputCode.addEventListener('input', function () {
          cureCodes[rowIndex] = inputCode.value;
        });
        cellCode.appendChild(inputCode);

        const cellQuantity = row.insertCell(2);
        const inputQuantity = document.createElement('input');
        inputQuantity.type = 'text';
        inputQuantity.placeholder = 'Enter Quantity';
         inputQuantity.classList.add('quantity-input')
        inputQuantity.addEventListener('input', function () {
          cureQuantities[rowIndex] = inputQuantity.value;
        });
        cellQuantity.appendChild(inputQuantity);
      });

      // Append the table to the container
      container.appendChild(typeTable);
    }
  } catch (error) {
    console.error('Error displaying cure data:', error);
  }
}
 const user =  window.electron.getUserInfo();


// Event listener for form submission
document.getElementById('inputForm').addEventListener('submit', async function (event) {
  event.preventDefault(); // Prevent the default form submission
  const formData = {
    code:cureCodes,
    doctorName: document.getElementById('doctorName').value,
    patientName: document.getElementById('patientName').value,
    anesthesiaDoctor: document.getElementById('anesthesiaDoctor').value,
    nursing: document.getElementById('nursing').value,
    ticketNumber: document.getElementById('ticketNumber').value,
    operationTime: document.getElementById('operationTime').value,
    operationCategory: document.getElementById('operationCategory').value,
    operationType: document.getElementById('operationType').value,
    operationRoomNumber: document.getElementById('operationRoomNumber').value,
    username:user.username,
    devices: getSelectedDevices(),
    cureTypes: cureTypes,
    cureNames: cureNames,
    quantty: cureQuantities,
  };

  try {
    // Call the addTrackingData function from the context bridge
    const result = await window.electron.addTrackingData(formData,  cureTypes, cureNames,);
    // Clear the form fields after submitting
    document.getElementById('inputForm').reset();

    // After submitting the form, update the displayed cure data
    await displayCureData();
  } catch (error) {
    console.error('Error submitting form:', error);
  }

  // Clear arrays after form submission
  cureTypes = [];
  cureNames = [];
  cureCodes = [];
  cureQuantities = [];
 window.print();


});

document.getElementById('cureTablesContainer').addEventListener('click', function (event) {
  const selectedRow = event.target.closest('tr');
  if (selectedRow) {
    const selectedType = selectedRow.dataset.type;
    const selectedName = selectedRow.dataset.name;

    // Toggle class to visually indicate selection
    selectedRow.classList.toggle('selected');

    // Update the data directly in the row's dataset
    selectedRow.dataset.selected = selectedRow.classList.contains('selected');

    // Update the data arrays based on the selected rows
    updateDataArrays();
  }
});

// Function to update data arrays based on selected rows
function updateDataArrays() {
  // Clear the arrays
  cureTypes = [];
  cureNames = [];
  cureCodes = [];
  cureQuantities = [];

  // Iterate through rows to populate arrays
  const allRows = document.querySelectorAll('#cureTablesContainer tr');
  allRows.forEach((row, rowIndex) => {
    if (row.dataset.selected === 'true') {
      const type = row.dataset.name;
      const name = row.dataset.type;

      // Use unique input elements for each row
      const codeInput = row.querySelector('.code-input');
      const quantityInput = row.querySelector('.quantity-input');

      const code = codeInput.value;
      const quantity = quantityInput.value;

      cureTypes.push(type);
      cureNames.push(name);
      cureCodes.push(code);
      cureQuantities.push(quantity);
    }
  });
}

// Call the updateDataArrays function initially to set the initial state
updateDataArrays();


// Call the displayCureData function when the page loads
window.onload = displayCureData;