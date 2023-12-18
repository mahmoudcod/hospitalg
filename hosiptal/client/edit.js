

const getTrackingDataById = async (patientId) => {
  try {
    const trackingData = await window.electron.getTrackingData();
    const matchingData = trackingData.find((data) => data.id == patientId);

    if (!matchingData) {
      console.log(`Matching data not found for patientId: ${patientId}`);
      throw new Error('Matching patient data not found.');
    }

    return matchingData;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
};

const getPatientDataForEdit = async () => {
  const patientId = window.location.hash.substring(1);
  try {
    const trackingData = await getTrackingDataById(patientId);
    // Add additional logic if needed to prepare the data for editing
    return trackingData;
  } catch (error) {
    console.error('Error fetching patient details for editing:', error);
    // Handle the error gracefully, e.g., display an error message to the user
    // You can also redirect to an error page or take appropriate action
  }
};

const populateEditForm = (patientData) => {
  // Assuming you have a form with input fields, update their values here
  document.getElementById('doctorName').value = patientData.doctorName;
  document.getElementById('patientName').value = patientData.patientName;
  document.getElementById('anesthesiaDoctor').value = patientData.anesthesiaDoctor;
  document.getElementById('nursing').value = patientData.nursing;
  document.getElementById('ticketNumber').value = patientData.ticketNumber;
  document.getElementById('operationTime').value = patientData.operationTime;
  document.getElementById('operationCategory').value = patientData.operationCategory;
  document.getElementById('operationType').value = patientData.operationType;
  document.getElementById('operationRoomNumber').value = patientData.operationRoomNumber;

  // Check the devices based on patientData.devices
  const devices = document.getElementsByName('devices');
  devices.forEach((device) => {
    device.checked = patientData.devices.includes(device.value);
  });

  // Assuming you have a function to populate cure tables
  populateCureTables(patientData);
};

const populateCureTables = (patientData) => {
  const cureTablesContainer = document.getElementById('cureTablesContainer');
  const cureTypeArray = JSON.parse(patientData.cureType);
  const cureNameArray = JSON.parse(patientData.cureName);
  const quanttyArray = JSON.parse(patientData.quantty);
  const codeArray = JSON.parse(patientData.code);

  // Organize data by cureType
  const organizedData = {};
  cureTypeArray.forEach((type, index) => {
    if (!organizedData[type]) {
      organizedData[type] = [];
    }
    organizedData[type].push({
      name: cureNameArray[index],
      quantty: quanttyArray[index],
      code: codeArray[index],
    });
  });

  cureTablesContainer.innerHTML = Object.keys(organizedData)
    .map(
      (type) => `
        <table border="1">
          <tr>
            <th><span>${type}</span></th>
            <th>الكود</th>
            <th>الكمية</th>
            <th>السعر</th>
          </tr>
          ${organizedData[type]
            .map(
              (item) => `
                <tr>
                  <td><span>${item.name}</span></td>
                  <td><span>${item.code}</span></td>
                  <td><span>${item.quantty}</span></td>
                  <td><span></span></td>
                </tr>
              `
            )
            .join('')}
        </table>
      `
    )
    .join('');
};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const patientData = await getPatientDataForEdit();
    populateEditForm(patientData);
  } catch (error) {
    // Handle the error if necessary
  }
});

const saveChanges = () => {
  // Add logic to save changes, if needed
  // This function can be called when the user clicks the "Submit" button
  // You can retrieve the updated values from the form and take appropriate action
};
