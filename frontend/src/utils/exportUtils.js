import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const getFileName = (type, ext) => {
    const date = new Date().toISOString().split('T')[0];
    const name = type === 'student_performance' ? 'Student_Performance' :
        type === 'training_status' ? 'Training_Status' :
            (type || 'Report').replace(/\s+/g, '_');
    return `EduTrack_${name}_${date}.${ext}`;
};

export const exportToPDF = (reportType, data, filters) => {
    if (!data || data.length === 0) {
        alert("No data to export.");
        return;
    }

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // Title
    doc.setFontSize(18);
    doc.text('EduTrack Report', 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(100);
    const title = reportType === 'student_performance' ? 'Student Performance Report' : 'Training Program Status';
    doc.text(title, 14, 32);
    doc.text(`Generated on: ${date}`, 14, 38);

    // Filter Info
    let filterText = 'Filters: ';
    if (!filters || Object.keys(filters).length === 0) filterText += 'None';
    else {
        Object.entries(filters).forEach(([key, value]) => {
            if (value) filterText += `${key}: ${value}, `;
        });
        filterText = filterText.slice(0, -2);
    }
    doc.setFontSize(10);
    doc.text(filterText, 14, 44);

    // Table
    if (reportType === 'student_performance') {
        const tableColumn = ["Roll No", "Name", "Program", "Year", "Assignments", "Completed", "Avg Progress", "Score"];
        const tableRows = [];

        data.forEach(row => {
            const rowData = [
                row.rollNo,
                `${row.firstName} ${row.lastName}`,
                row.program,
                row.year,
                row.totalAssignments,
                row.completedAssignments,
                `${row.averageProgress}%`,
                row.totalScore
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 50,
        });
    } else if (reportType === 'training_status') {
        const tableColumn = ["Title", "Status", "Start Date", "Enrolled", "Active", "Pending", "Completed"];
        const tableRows = [];

        data.forEach(row => {
            const rowData = [
                row.title,
                row.status,
                row.startDate,
                row.totalEnrolled,
                row.active,
                row.pendingEvaluation,
                row.completed
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 50,
        });
    }

    doc.save(getFileName(reportType, 'pdf'));
};

export const exportStudentProfileToPDF = (profile) => {
    if (!profile) return;
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(20);
    doc.text('Student Profile Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${date}`, 14, 28);
    doc.text('EduTrack System', 14, 33);

    let yPos = 45;

    // Personal Info
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Personal Information', 14, yPos);
    yPos += 10;

    const personalData = [
        ['Name', `${profile.personal?.firstName} ${profile.personal?.lastName}`],
        ['Roll No', profile.personal?.rollNo],
        ['Email', profile.personal?.email],
        ['Phone', profile.personal?.phone],
        ['Program', `${profile.personal?.program} (${profile.personal?.year} Year)`]
    ];

    autoTable(doc, {
        body: personalData,
        startY: yPos,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Academic Records
    doc.setFontSize(14);
    doc.text('Academic Records', 14, yPos);
    yPos += 5;

    const academicRows = profile.academic?.map(rec => [
        rec.qualification,
        rec.institution,
        rec.year,
        `${rec.obtainedScore}/${rec.totalScore}`
    ]) || [];

    if (academicRows.length > 0) {
        autoTable(doc, {
            head: [['Qualification', 'Institution', 'Year', 'Score']],
            body: academicRows,
            startY: yPos,
            headStyles: { fillColor: [66, 133, 244] }
        });
        yPos = doc.lastAutoTable.finalY + 15;
    } else {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('No academic records found.', 14, yPos + 10);
        yPos += 20;
    }

    // Training Details
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Training & Projects', 14, yPos);
    yPos += 5;

    const trainingRows = profile.training?.map(t => [
        t.trainingTitle,
        t.companyName,
        t.status,
        `${t.progress}%`,
        t.score || 'N/A'
    ]) || [];

    if (trainingRows.length > 0) {
        autoTable(doc, {
            head: [['Training', 'Company', 'Status', 'Progress', 'Score']],
            body: trainingRows,
            startY: yPos,
            headStyles: { fillColor: [66, 133, 244] }
        });
    } else {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('No training records found.', 14, yPos + 10);
    }

    doc.save(getFileName(`${profile.personal?.firstName}_${profile.personal?.lastName}_Profile`, 'pdf'));
};

export const exportTrainingStudentsToPDF = (trainingTitle, students) => {
    if (!students || students.length === 0) return;
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(18);
    doc.text(`Training Report: ${trainingTitle}`, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${date}`, 14, 28);
    doc.text('EduTrack System', 14, 33);

    const tableColumn = ["Roll No", "Student Name", "Status", "Progress", "Score"];
    const tableRows = [];

    students.forEach(student => {
        const rowData = [
            student.rollNo,
            student.studentName,
            student.status,
            `${student.progress}%`,
            student.score || '-'
        ];
        tableRows.push(rowData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        headStyles: { fillColor: [66, 133, 244] }
    });

    doc.save(getFileName(`${trainingTitle}_Students`, 'pdf'));
};

export const exportToExcel = (reportType, data) => {
    if (!data || data.length === 0) {
        alert("No data to export.");
        return;
    }

    // Clean data for Excel (remove internal IDs if needed, or just dump as is)
    // For better UX, we can map it to user-friendly keys if we want, but raw dump is usually fine.
    // Let's ensure we are not passing circular structures.
    const cleanData = data.map(item => {
        const { id, studentId, trainingId, ...rest } = item; // Exclude internal IDs
        return rest;
    });

    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, getFileName(reportType, 'xlsx'));
};
