import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePrescriptionPDF = (patientName, doctorName, appointmentDate, summary, prescriptions) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text('Prescription', 105, 20, null, null, 'center');

  // Basic Info
  doc.setFontSize(12);
  doc.text(`Patient Name: ${patientName}`, 20, 40);
  doc.text(`Doctor Name: ${doctorName}`, 20, 50);
  doc.text(`Appointment Date: ${appointmentDate}`, 20, 60);

  // Summary Section
  doc.setFontSize(12);
  doc.text('Summary:', 20, 80);
  doc.setFontSize(11);
  
  // Adding the summary with a defined max width and ensuring line breaks
  const summaryLines = doc.splitTextToSize(summary, 170); // Split summary into lines
  doc.text(summaryLines, 20, 90);

  // Calculate the Y position for the table to avoid overlap
  const summaryHeight = (summaryLines.length * 10) + 20; // Approximate height of the summary
  const tableStartY = 90 + summaryHeight; // Set the starting Y position for the table

  // Prescriptions Table Header
  doc.text('Prescriptions:', 20, tableStartY - 10); // Position header above the table

  // Prepare the data for the table
  const prescriptionData = prescriptions.map((prescription, index) => [
    index + 1,
    prescription.name,
    prescription.dosage,
    prescription.usage_instructions,
  ]);

  // Add a table with jsPDF-AutoTable
  autoTable(doc, {
    startY: tableStartY, // Use calculated Y position for the table
    head: [['#', 'Medicine', 'Dosage', 'Instructions']],
    body: prescriptionData,
    margin: { left: 20, right: 20 },
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Save the generated PDF
  doc.save(`Prescription_${patientName}.pdf`);
};
