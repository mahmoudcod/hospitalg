


const getTrackingDataById = async (patientId) => {
  try {
    const trackingData = await electron.getTrackingData();
    const matchingData = trackingData.find((data) => data.id == patientId);

    if (!matchingData) {
      throw new Error('Matching patient data not found.');
    }

    return matchingData;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
};
// Function to display detailed patient information
const displayPatientDetails = async () => {
  const patientId = window.location.hash.substring(1);

  try {
    // Get tracking data for the specified patient
    const trackingData = await getTrackingDataById(patientId);
    const isAdmin = await electron.getUserRole();
    const cureTypeArray = JSON.parse(trackingData.cureType);
    const cureNameArray = JSON.parse(trackingData.cureName);
    const quanttyArray = JSON.parse(trackingData.quantty);
    const codeArray = JSON.parse(trackingData.code); 
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
    // Display the detailed information in the container
    patientDetailsContainer.innerHTML = `
          <button onclick="printPatientDetails()">Print</button>
      ${isAdmin ? '<button id="delete" onclick="deletePatientDetails()">Delete</button>' : ''}
      ${isAdmin ? '<button id=edit" onclick="redirectEditPage()">Edit</button> ' : ''}
    <div class="container">
    <p><span>${trackingData.date}</span></p>

      <div class="patient-details">
        <div class="left-column">
          <p> اسم الطبيب:<span>${trackingData.doctorName}</span></p>
          <p>اسم المريض: <span>${trackingData.patientName}</span></p>
          <p> دكتور التخدير: <span>${trackingData.anesthesiaDoctor}</span></p>
         <p>  التمريض: <span>${trackingData.nursing}</span></p>
         <p>  غرفة العمليات: <span>${trackingData.operationRoomNumber}</span></p>
        </div>
        <div class="right-column">
        <p>  رقم التذكرة: <span>${trackingData.ticketNumber}</span></p>
          <p>  الاجهزة: <span>${trackingData.devices}</span></p>
          <p>  تصنيف العملية: <span>${trackingData.operationCategory}</span></p>
           <p>نوع العملية: <span>${trackingData.operationType}</span></p>
          <p>زمن العملية: <span>${trackingData.operationTime}</span></p>
        </div>
      </div>
      ${Object.keys(organizedData).map(type => `
        <table border="1">
          <tr>
            <th><span>${type}</span></th>
            <th>الكود</th> 
            <th>الكمية</th>
            <th>السعر</th>
          </tr>
          ${organizedData[type].map(item => `
            <tr>
              <td><span>${item.name}</span></td>
              <td><span>${item.code}</span></td> 
              <td><span>${item.quantty}</span></td>
              <td><span></span></td>
            </tr>
          `).join('')}
        </table>
      `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    // Handle the error gracefully, e.g., display an error message to the user
    patientDetailsContainer.innerHTML = `<p>Error fetching patient details for patientId: ${patientId}</p>`;

  }
  const editPatientDetails = () => {
  const patientId = window.location.hash.substring(1);
  // Redirect to the edit page, passing the patientId as a query parameter
  window.location.href = `edit.html?patientId=${patientId}`;
};

};
const deletePatientDetails = async () => {
  const patientId = window.location.hash.substring(1);
  if (confirm('Are you sure you want to delete this patient record?')) {
    try {
      const isAdmin = await electron.getUserRole();

      if ( isAdmin) {
        const successMessage = await electron.deleteTrackingData(patientId);
        
        // Optionally, you can redirect or update the UI after successful deletion
        // For example, redirecting to a different page:
        window.location.href = 'veiw.html';
      } else {
        throw new Error('You do not have permission to delete tracking data.');
      }
    } catch (error) {
      console.error('Error deleting patient details:', error);
      // Handle the error gracefully, e.g., display an error message to the user
      alert('Error deleting patient details. Please try again.');
    }
  }
};
const redirectEditPage = () => {
  const patientId = window.location.hash.substring(1);
  // Redirect to the edit page, passing the patientId as a query parameter
  window.location.href = `edit.html?patientId=${patientId}`;
};
const printPatientDetails = () => {
  window.print();
};
document.addEventListener('DOMContentLoaded', displayPatientDetails);
