import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { logAdminActivity } from '@/lib/logger';
import { RowDataPacket } from 'mysql2';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get('format') || 'csv').toLowerCase();
    const ids = searchParams.get('ids');
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || 'all';
    const food = searchParams.get('food') || 'all';
    const dateRange = searchParams.get('dateRange') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const isTrash = searchParams.get('trash') === 'true';

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (ids) {
      const idList = ids
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));
      if (idList.length > 0) {
        conditions.push(`id IN (${idList.map(() => '?').join(',')})`);
        params.push(...idList);
      }
    } else {
      if (isTrash) {
        conditions.push('deleted_at IS NOT NULL');
      } else {
        conditions.push('deleted_at IS NULL');
      }

      if (search) {
        conditions.push(
          '(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR mobile LIKE ? OR town LIKE ? OR post_code LIKE ?)'
        );
        const searchWild = `%${search}%`;
        params.push(searchWild, searchWild, searchWild, searchWild, searchWild, searchWild);
      }

      if (status !== 'all' && ['new', 'confirmed', 'cancelled'].includes(status)) {
        conditions.push('status = ?');
        params.push(status);
      }

      if (food !== 'all' && ['Veg Food', 'Non Veg Food'].includes(food)) {
        conditions.push('food_preference = ?');
        params.push(food);
      }

      if (dateRange === 'today') {
        conditions.push('DATE(created_at) = CURDATE()');
      } else if (dateRange === '7days') {
        conditions.push('created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
      } else if (dateRange === '30days') {
        conditions.push('created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
      } else if (dateRange === 'custom' && startDate && endDate) {
        conditions.push('DATE(created_at) BETWEEN ? AND ?');
        params.push(startDate, endDate);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT id, first_name, last_name, address, town, post_code, email, mobile,
             food_preference, gdpr_consent, status, notes, created_at, updated_at
      FROM registrations
      ${whereClause}
      ORDER BY id ASC
    `;

    const rows = await query<RowDataPacket[]>(sql, params);
    const dateStr = new Date().toISOString().split('T')[0];

    // Compute catering metrics
    const totalCount = rows.length;
    const vegCount = rows.filter((r) => r.food_preference === 'Veg Food').length;
    const nonVegCount = rows.filter((r) => r.food_preference === 'Non Veg Food').length;
    const confirmedCount = rows.filter((r) => r.status === 'confirmed').length;
    const newCount = rows.filter((r) => r.status === 'new').length;
    const cancelledCount = rows.filter((r) => r.status === 'cancelled').length;

    // Log Activity
    await logAdminActivity({
      adminId: session.adminId,
      adminEmail: session.email,
      action: 'EXPORT_CREATED',
      entityType: 'export',
      description: `Exported ${rows.length} registration records in ${format.toUpperCase()} format`,
    });

    // -------------------------------------------------------------------------
    // 1. EXCEL EXPORT (.xlsx)
    // -------------------------------------------------------------------------
    if (format === 'excel' || format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Unity 101 Community Radio';
      workbook.lastModifiedBy = session.email;
      workbook.created = new Date();
      workbook.modified = new Date();

      // Sheet 1: Main Register
      const sheet = workbook.addWorksheet('Gala Registrations', {
        pageSetup: { orientation: 'landscape', paperSize: 9 },
        views: [{ state: 'frozen', ySplit: 4 }],
      });

      // Banner Row 1: Title
      sheet.mergeCells('A1:N1');
      const titleCell = sheet.getCell('A1');
      titleCell.value = 'UNITY 101 COMMUNITY RADIO — OFFICIAL GALA GUEST REGISTER';
      titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2F0846' }, // Deep Unity purple
      };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getRow(1).height = 32;

      // Banner Row 2: Subtitle & Metrics
      sheet.mergeCells('A2:N2');
      const subCell = sheet.getCell('A2');
      subCell.value = `20th Anniversary Gala Dinner • Generated on ${new Date().toLocaleString()} • Total Guests: ${totalCount} (Veg: ${vegCount}, Non-Veg: ${nonVegCount}) | Confirmed: ${confirmedCount}`;
      subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FFF59E0B' } }; // Gold text
      subCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF160624' },
      };
      subCell.alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getRow(2).height = 20;

      // Row 3: Blank separator
      sheet.getRow(3).height = 8;

      // Header Row 4: Column Titles
      const columnHeaders = [
        'Ref ID',
        'First Name',
        'Last Name',
        'Full Name',
        'Street Address',
        'Town / City',
        'Post Code',
        'Email Address',
        'Mobile Phone',
        'Meal Choice',
        'GDPR Consent',
        'Guest Status',
        'Admin Notes',
        'Registration Date',
      ];
      const headerRow = sheet.getRow(4);
      headerRow.values = columnHeaders;
      headerRow.height = 24;
      headerRow.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF481268' }, // Brand royal purple
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF7E22CE' } },
          bottom: { style: 'medium', color: { argb: 'FFF59E0B' } }, // Gold bottom border
          left: { style: 'thin', color: { argb: 'FF3B0764' } },
          right: { style: 'thin', color: { argb: 'FF3B0764' } },
        };
      });

      // Data Rows
      rows.forEach((r, idx) => {
        const rowNum = idx + 5;
        const row = sheet.getRow(rowNum);
        const fullName = `${r.first_name} ${r.last_name}`.trim();
        const dateFormatted = r.created_at ? new Date(r.created_at).toLocaleString('en-GB') : '';

        row.values = [
          `#${String(r.id).padStart(4, '0')}`,
          r.first_name,
          r.last_name,
          fullName,
          r.address,
          r.town,
          r.post_code,
          r.email,
          r.mobile,
          r.food_preference,
          r.gdpr_consent ? 'Yes' : 'No',
          (r.status || 'new').toUpperCase(),
          r.notes || '',
          dateFormatted,
        ];

        row.height = 20;

        // Alternating row background
        const isEven = idx % 2 === 0;
        const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF0F172A' } };
          cell.alignment = { vertical: 'middle' };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: rowBg },
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          };

          // Ref ID centered
          if (colNumber === 1) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF481268' } };
          }

          // Meal Choice highlight
          if (colNumber === 10) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            if (r.food_preference === 'Veg Food') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Light amber
              cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF92400E' } };
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }; // Light red
              cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF991B1B' } };
            }
          }

          // Status highlight
          if (colNumber === 12) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            if (r.status === 'confirmed') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
              cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF065F46' } };
            } else if (r.status === 'cancelled') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
              cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF991B1B' } };
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
              cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF1E40AF' } };
            }
          }
        });
      });

      // Auto-fit column widths
      sheet.columns.forEach((col, i) => {
        if (!col) return;
        const header = columnHeaders[i] || '';
        let maxLen = header.length;
        rows.forEach((r) => {
          let val = '';
          if (i === 0) val = `#${r.id}`;
          else if (i === 1) val = r.first_name || '';
          else if (i === 2) val = r.last_name || '';
          else if (i === 3) val = `${r.first_name} ${r.last_name}`;
          else if (i === 4) val = r.address || '';
          else if (i === 5) val = r.town || '';
          else if (i === 6) val = r.post_code || '';
          else if (i === 7) val = r.email || '';
          else if (i === 8) val = r.mobile || '';
          else if (i === 9) val = r.food_preference || '';
          else if (i === 10) val = r.gdpr_consent ? 'Yes' : 'No';
          else if (i === 11) val = r.status || '';
          else if (i === 12) val = r.notes || '';
          else if (i === 13) val = '2026-09-30 00:00:00';
          if (val.length > maxLen) maxLen = val.length;
        });
        col.width = Math.max(maxLen + 4, 12);
      });
      sheet.autoFilter = 'A4:N4';

      // Sheet 2: Catering & Event Summary
      const summarySheet = workbook.addWorksheet('Catering & Event Summary');
      summarySheet.views = [{ showGridLines: true }];

      summarySheet.mergeCells('A1:D1');
      const sumTitle = summarySheet.getCell('A1');
      sumTitle.value = 'UNITY 101 GALA DINNER — CATERING & ATTENDANCE SUMMARY';
      sumTitle.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
      sumTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F0846' } };
      sumTitle.alignment = { horizontal: 'center', vertical: 'middle' };
      summarySheet.getRow(1).height = 28;

      const metricsData = [
        ['Total Registered Guests', totalCount],
        ['Confirmed Attendees', confirmedCount],
        ['New / Pending Registrations', newCount],
        ['Cancelled Registrations', cancelledCount],
        ['Vegetarian Meal Preference', vegCount],
        ['Non-Vegetarian Meal Preference', nonVegCount],
        ['Venue Capacity Utilization', `${Math.round((totalCount / 500) * 100)}% (${totalCount} / 500)`],
        ['Remaining Gala Seats', `${Math.max(0, 500 - totalCount)}`],
      ];

      metricsData.forEach((item, idx) => {
        const rNum = idx + 3;
        const row = summarySheet.getRow(rNum);
        row.values = [item[0], item[1]];
        row.height = 22;

        const cellA = summarySheet.getCell(`A${rNum}`);
        const cellB = summarySheet.getCell(`B${rNum}`);

        cellA.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E293B' } };
        cellB.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF481268' } };
        cellB.alignment = { horizontal: 'right' };

        cellA.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
        cellB.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      });

      summarySheet.getColumn(1).width = 32;
      summarySheet.getColumn(2).width = 24;

      const excelBuffer = await workbook.xlsx.writeBuffer();
      const filename = `unity101_gala_registrations_${dateStr}.xlsx`;

      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // -------------------------------------------------------------------------
    // 2. PDF EXPORT (.pdf)
    // -------------------------------------------------------------------------
    if (format === 'pdf') {
      // Landscape A4: 841.89 x 595.28 pt
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Top Decorative Header Bar
      doc.setFillColor(47, 8, 70); // #2f0846
      doc.rect(0, 0, pageWidth, 68, 'F');

      // Top Gold Accent Line
      doc.setFillColor(245, 158, 11); // #f59e0b
      doc.rect(0, 68, pageWidth, 3, 'F');

      // Header Typography
      doc.setTextColor(245, 158, 11);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('UNITY 101 COMMUNITY RADIO', 28, 28);

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('20th Anniversary Gala Dinner • Official Guest Master Register', 28, 46);

      // Top Right Metric Snapshot
      doc.setFontSize(8.5);
      doc.setTextColor(226, 232, 240);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - 28, 24, { align: 'right' });
      doc.text(`Total Guests: ${totalCount}  |  Veg: ${vegCount}  |  Non-Veg: ${nonVegCount}`, pageWidth - 28, 38, { align: 'right' });
      doc.text(`Confirmed: ${confirmedCount}  |  Pending: ${newCount}  |  Cancelled: ${cancelledCount}`, pageWidth - 28, 52, { align: 'right' });

      // Build Table Data
      const tableHeaders = [
        ['Ref ID', 'Guest Name', 'Town / City', 'Postcode', 'Mobile Phone', 'Email Address', 'Meal Choice', 'Status', 'Date'],
      ];

      const tableBody = rows.map((r) => [
        `#${String(r.id).padStart(4, '0')}`,
        `${r.first_name} ${r.last_name}`.trim(),
        r.town || '—',
        r.post_code || '—',
        r.mobile || '—',
        r.email || '—',
        r.food_preference || '—',
        (r.status || 'new').toUpperCase(),
        r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB') : '—',
      ]);

      autoTable(doc, {
        head: tableHeaders,
        body: tableBody,
        startY: 85,
        margin: { left: 24, right: 24, bottom: 40 },
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 4.5,
          textColor: [15, 23, 42],
          lineColor: [226, 232, 240],
          lineWidth: 0.5,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [72, 18, 104], // #481268
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5,
          halign: 'left',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // #f8fafc
        },
        columnStyles: {
          0: { cellWidth: 50, halign: 'center', fontStyle: 'bold', textColor: [72, 18, 104] },
          1: { cellWidth: 115, fontStyle: 'bold' },
          2: { cellWidth: 80 },
          3: { cellWidth: 55, halign: 'center' },
          4: { cellWidth: 85 },
          5: { cellWidth: 155 },
          6: { cellWidth: 85, halign: 'center' },
          7: { cellWidth: 70, halign: 'center', fontStyle: 'bold' },
          8: { cellWidth: 65, halign: 'center' },
        },
        didParseCell: (data) => {
          // Highlight Food
          if (data.section === 'body' && data.column.index === 6) {
            if (data.cell.raw === 'Veg Food') {
              data.cell.styles.textColor = [180, 83, 9]; // Amber
              data.cell.styles.fontStyle = 'bold';
            } else if (data.cell.raw === 'Non Veg Food') {
              data.cell.styles.textColor = [185, 28, 28]; // Red
              data.cell.styles.fontStyle = 'bold';
            }
          }
          // Highlight Status
          if (data.section === 'body' && data.column.index === 7) {
            if (data.cell.raw === 'CONFIRMED') {
              data.cell.styles.textColor = [5, 150, 105]; // Emerald
            } else if (data.cell.raw === 'CANCELLED') {
              data.cell.styles.textColor = [220, 38, 38]; // Red
            } else {
              data.cell.styles.textColor = [37, 99, 235]; // Blue
            }
          }
        },
        didDrawPage: (data) => {
          // Bottom Footer Bar
          const str = `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`;
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(
            'Unity 101 Community Radio • Confidential Official Gala Guest Manifest',
            28,
            pageHeight - 16
          );
          doc.text(str, pageWidth - 28, pageHeight - 16, { align: 'right' });
        },
      });

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      const filename = `unity101_gala_registrations_${dateStr}.pdf`;

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // -------------------------------------------------------------------------
    // 3. XML EXPORT (.xml)
    // -------------------------------------------------------------------------
    if (format === 'xml') {
      const escapeXml = (unsafe?: unknown): string => {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      };

      const xmlRows = rows
        .map((r) => {
          const refCode = `U101-${String(r.id).padStart(5, '0')}`;
          return `    <Guest>
      <Id>${r.id}</Id>
      <Reference>${refCode}</Reference>
      <FirstName>${escapeXml(r.first_name)}</FirstName>
      <LastName>${escapeXml(r.last_name)}</LastName>
      <FullName>${escapeXml(`${r.first_name} ${r.last_name}`.trim())}</FullName>
      <Address>${escapeXml(r.address)}</Address>
      <Town>${escapeXml(r.town)}</Town>
      <Postcode>${escapeXml(r.post_code)}</Postcode>
      <Email>${escapeXml(r.email)}</Email>
      <Mobile>${escapeXml(r.mobile)}</Mobile>
      <FoodPreference>${escapeXml(r.food_preference)}</FoodPreference>
      <GDPRConsent>${r.gdpr_consent ? 'true' : 'false'}</GDPRConsent>
      <Status>${escapeXml(r.status || 'new')}</Status>
      <Notes>${escapeXml(r.notes || '')}</Notes>
      <RegistrationDate>${r.created_at ? new Date(r.created_at).toISOString() : ''}</RegistrationDate>
    </Guest>`;
        })
        .join('\n');

      const xmlOutput = `<?xml version="1.0" encoding="UTF-8"?>
<Unity101GuestManifest generated="${new Date().toISOString()}" total="${totalCount}">
  <Summary>
    <TotalGuests>${totalCount}</TotalGuests>
    <Confirmed>${confirmedCount}</Confirmed>
    <Pending>${newCount}</Pending>
    <Cancelled>${cancelledCount}</Cancelled>
    <Vegetarian>${vegCount}</Vegetarian>
    <NonVegetarian>${nonVegCount}</NonVegetarian>
  </Summary>
  <Guests>
${xmlRows}
  </Guests>
</Unity101GuestManifest>`;

      const filename = `unity101_registrations_${dateStr}.xml`;

      return new NextResponse(xmlOutput, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // -------------------------------------------------------------------------
    // 4. CSV EXPORT (.csv) - Default
    // -------------------------------------------------------------------------
    const headers = [
      'Registration ID',
      'Reference Code',
      'First Name',
      'Last Name',
      'Full Name',
      'Street Address',
      'Town / City',
      'Postcode',
      'Email Address',
      'Mobile Phone',
      'Meal Choice',
      'GDPR Consent',
      'Status',
      'Admin Notes',
      'Registration Date',
      'Last Updated',
    ];

    const csvLines = [headers.map(escapeCsvField).join(',')];

    for (const r of rows) {
      const refCode = `U101-${String(r.id).padStart(5, '0')}`;
      csvLines.push(
        [
          r.id,
          refCode,
          r.first_name,
          r.last_name,
          `${r.first_name} ${r.last_name}`.trim(),
          r.address,
          r.town,
          r.post_code,
          r.email,
          r.mobile,
          r.food_preference,
          r.gdpr_consent ? 'Yes' : 'No',
          r.status,
          r.notes || '',
          r.created_at ? new Date(r.created_at).toLocaleString('en-GB') : '',
          r.updated_at ? new Date(r.updated_at).toLocaleString('en-GB') : '',
        ]
          .map(escapeCsvField)
          .join(',')
      );
    }

    const csvOutput = '\uFEFF' + csvLines.join('\r\n'); // Add UTF-8 BOM for Excel compatibility
    const filename = `unity101_registrations_${dateStr}.csv`;

    return new NextResponse(csvOutput, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate export file' }, { status: 500 });
  }
}
