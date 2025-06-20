import { Vehicle } from '../types/vehicle';
import { InspectionSettings } from '../types/inspectionSettings';
import { ProgressCalculator } from '../utils/progressCalculator';

export interface CustomerComment {
  id: string;
  section: string;
  comment: string;
  timestamp: string;
  customerName?: string;
  customerEmail?: string;
}

export interface CustomerPdfData {
  vehicle: Vehicle;
  inspectionSettings: InspectionSettings;
  customerComments: CustomerComment[];
  dealershipInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
  inspectionDate: string;
  inspectorName?: string;
}

export class PDFGenerator {
  static generateCustomerInspectionPDF(data: CustomerPdfData): string {
    const { vehicle, inspectionSettings, customerComments, dealershipInfo, inspectionDate, inspectorName } = data;
    
    // Get only customer-visible sections
    const visibleSections = inspectionSettings.sections
      .filter(section => section.isActive && section.isCustomerVisible)
      .sort((a, b) => a.order - b.order);

    // Get inspection data for this vehicle
    const savedInspections = localStorage.getItem('vehicleInspections');
    let vehicleInspection: any = {};
    if (savedInspections) {
      try {
        const inspections = JSON.parse(savedInspections);
        vehicleInspection = inspections[vehicle.id] || {};
      } catch (error) {
        console.error('Error loading inspection data:', error);
      }
    }

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const getStockNumber = (vin: string): string => {
      return vin.slice(-6);
    };

    const getRatingLabel = (rating: string) => {
      const ratingLabel = inspectionSettings.ratingLabels.find(label => label.key === rating);
      return ratingLabel ? ratingLabel.label : rating;
    };

    const getRatingColor = (rating: string) => {
      switch (rating) {
        case 'great':
          return '#10b981'; // emerald-500
        case 'fair':
          return '#f59e0b'; // amber-500
        case 'needs-attention':
          return '#ef4444'; // red-500
        default:
          return '#6b7280'; // gray-500
      }
    };

    // Generate HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Vehicle Inspection Report - ${vehicle.year} ${vehicle.make} ${vehicle.model}</title>
        <style>
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
          }
          .header h1 {
            color: #1e40af;
            margin-bottom: 5px;
          }
          .header p {
            color: #6b7280;
            margin: 5px 0;
          }
          .dealership-info {
            margin-bottom: 20px;
            font-size: 14px;
          }
          .vehicle-info {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          .vehicle-info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }
          .info-item {
            margin-bottom: 10px;
          }
          .info-item label {
            font-weight: bold;
            display: block;
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .info-item p {
            margin: 0;
            font-size: 14px;
          }
          .section {
            margin-bottom: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          .section-header {
            background-color: #f3f4f6;
            padding: 12px 15px;
            border-bottom: 1px solid #e5e7eb;
          }
          .section-header h2 {
            margin: 0;
            font-size: 18px;
            color: #1f2937;
          }
          .section-content {
            padding: 15px;
          }
          .inspection-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          .inspection-item:last-child {
            border-bottom: none;
          }
          .item-name {
            font-weight: 500;
          }
          .item-rating {
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
          }
          .rating-great {
            background-color: #d1fae5;
            color: #065f46;
          }
          .rating-fair {
            background-color: #fef3c7;
            color: #92400e;
          }
          .rating-needs-attention {
            background-color: #fee2e2;
            color: #b91c1c;
          }
          .rating-not-checked {
            background-color: #f3f4f6;
            color: #6b7280;
          }
          .section-notes {
            margin-top: 15px;
            padding: 10px;
            background-color: #f9fafb;
            border-radius: 6px;
            font-size: 14px;
          }
          .section-notes h4 {
            margin: 0 0 5px 0;
            font-size: 14px;
            color: #4b5563;
          }
          .section-notes p {
            margin: 0;
            color: #6b7280;
          }
          .customer-comments {
            margin-top: 30px;
            padding: 20px;
            background-color: #eff6ff;
            border-radius: 8px;
            border: 1px solid #dbeafe;
          }
          .customer-comments h3 {
            margin-top: 0;
            color: #1e40af;
          }
          .comment {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #dbeafe;
          }
          .comment:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }
          .comment-section {
            font-weight: 600;
            color: #1e40af;
          }
          .comment-text {
            margin: 5px 0;
          }
          .comment-meta {
            font-size: 12px;
            color: #6b7280;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .signature-line {
            display: inline-block;
            width: 200px;
            border-bottom: 1px solid #000;
            margin-bottom: 5px;
          }
          .signature-name {
            font-size: 14px;
          }
          .ready-badge {
            display: inline-block;
            background-color: #d1fae5;
            color: #065f46;
            padding: 5px 10px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 10px;
          }
          .not-ready-badge {
            display: inline-block;
            background-color: #fee2e2;
            color: #b91c1c;
            padding: 5px 10px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 10px;
          }
          .progress-container {
            width: 100%;
            background-color: #e5e7eb;
            border-radius: 10px;
            margin: 15px 0;
          }
          .progress-bar {
            height: 10px;
            border-radius: 10px;
            background: linear-gradient(to right, #3b82f6, #6366f1);
          }
          .progress-text {
            text-align: right;
            font-size: 14px;
            font-weight: 600;
            margin-top: 5px;
          }
          .vin {
            font-family: monospace;
            background-color: #f3f4f6;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 14px;
          }
          .page-break {
            page-break-after: always;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Vehicle Inspection Report</h1>
            <p>Comprehensive inspection details for your vehicle</p>
            <p>Inspection Date: ${formatDate(inspectionDate)}</p>
            ${inspectorName ? `<p>Inspector: ${inspectorName}</p>` : ''}
          </div>
          
          <div class="dealership-info">
            <h3>${dealershipInfo.name}</h3>
            <p>${dealershipInfo.address}</p>
            <p>Phone: ${dealershipInfo.phone} | Email: ${dealershipInfo.email}</p>
            ${dealershipInfo.website ? `<p>Website: ${dealershipInfo.website}</p>` : ''}
          </div>
          
          <div class="vehicle-info">
            <h2>${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''}</h2>
            <p>Stock #: ${getStockNumber(vehicle.vin)}</p>
            <p class="vin">VIN: ${vehicle.vin}</p>
            
            <div class="vehicle-info-grid">
              <div class="info-item">
                <label>Color</label>
                <p>${vehicle.color}</p>
              </div>
              <div class="info-item">
                <label>Mileage</label>
                <p>${vehicle.mileage.toLocaleString()} miles</p>
              </div>
            </div>
            
            <div class="info-item">
              <label>Reconditioning Status</label>
              ${Object.values(vehicle.status).every(status => status === 'completed') 
                ? '<p class="ready-badge">✓ Ready for Sale</p>' 
                : '<p class="not-ready-badge">⚠ In Reconditioning</p>'}
            </div>
            
            <div class="progress-container">
              <div class="progress-bar" style="width: ${ProgressCalculator.calculateDetailedProgress(vehicle.id, vehicle)}%"></div>
            </div>
            <div class="progress-text">${Math.round(ProgressCalculator.calculateDetailedProgress(vehicle.id, vehicle))}% Complete</div>
          </div>
          
          ${vehicle.notes ? `
          <div class="section">
            <div class="section-header">
              <h2>Vehicle Notes</h2>
            </div>
            <div class="section-content">
              <p>${vehicle.notes}</p>
            </div>
          </div>
          ` : ''}
          
          ${visibleSections.map(section => {
            const sectionItems = vehicleInspection[section.key] || [];
            return `
              <div class="section">
                <div class="section-header">
                  <h2>${section.icon} ${section.label}</h2>
                </div>
                <div class="section-content">
                  ${sectionItems.length > 0 ? `
                    ${sectionItems.map(item => `
                      <div class="inspection-item">
                        <div class="item-name">${item.label}</div>
                        <div class="item-rating rating-${item.rating}" style="background-color: ${this.getRatingColorLight(item.rating)}; color: ${this.getRatingColorDark(item.rating)}">
                          ${getRatingLabel(item.rating)}
                        </div>
                      </div>
                    `).join('')}
                    
                    ${vehicleInspection.sectionNotes && vehicleInspection.sectionNotes[section.key] ? `
                      <div class="section-notes">
                        <h4>Section Notes:</h4>
                        <p>${vehicleInspection.sectionNotes[section.key]}</p>
                      </div>
                    ` : ''}
                  ` : `
                    <p>No inspection data available for this section.</p>
                  `}
                </div>
              </div>
            `;
          }).join('')}
          
          ${customerComments.length > 0 ? `
            <div class="customer-comments">
              <h3>Inspection Notes</h3>
              ${customerComments.map(comment => `
                <div class="comment">
                  <div class="comment-section">${comment.section}</div>
                  <div class="comment-text">${comment.comment}</div>
                  <div class="comment-meta">
                    ${comment.customerName ? `By: ${comment.customerName} | ` : ''}
                    Date: ${formatDate(comment.timestamp)}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <div class="signature">
            <p>This document certifies that the vehicle has been inspected according to our dealership standards.</p>
            <div>
              <div class="signature-line"></div>
              <div class="signature-name">Dealership Representative</div>
            </div>
          </div>
          
          <div class="footer">
            <p>${inspectionSettings.customerPdfSettings?.footerText || ''}</p>
            <p>Report generated on ${new Date().toLocaleDateString()} by ${dealershipInfo.name}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return htmlContent;
  }

  // Helper methods for PDF generation
  static getOverallProgress(vehicle: Vehicle): number {
    // Use the new detailed progress calculator
    return ProgressCalculator.calculateDetailedProgress(vehicle.id, vehicle);
  }

  static getRatingColorLight(rating: string): string {
    switch (rating) {
      case 'great':
        return '#d1fae5'; // emerald-100
      case 'fair':
        return '#fef3c7'; // amber-100
      case 'needs-attention':
        return '#fee2e2'; // red-100
      default:
        return '#f3f4f6'; // gray-100
    }
  }

  static getRatingColorDark(rating: string): string {
    switch (rating) {
      case 'great':
        return '#065f46'; // emerald-800
      case 'fair':
        return '#92400e'; // amber-800
      case 'needs-attention':
        return '#b91c1c'; // red-800
      default:
        return '#6b7280'; // gray-500
    }
  }

  // Convert HTML to PDF and download
  static downloadPDF(htmlContent: string, fileName: string): void {
    // Create a Blob with the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // Open PDF in new tab (for preview)
  static previewPDF(htmlContent: string): void {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}