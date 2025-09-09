// PDF utility functions for order management

// Download blob as file
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Handle PDF download with error handling
export const handlePDFDownload = async (pdfFunction, orderId, filename, setSnackbar) => {
  try {
    const blob = await pdfFunction(orderId);

    if (blob) {
      downloadBlob(blob, filename);
      setSnackbar({
        open: true,
        message: `${filename} downloaded successfully`,
        severity: 'success',
      });
    } else {
      throw new Error('PDF generation failed');
    }
  } catch (error) {
    console.error('Error downloading PDF:', error);
    setSnackbar({
      open: true,
      message: `Failed to download ${filename}`,
      severity: 'error',
    });
  }
};

// Print styles for order details
export const getPrintStyles = () => `
  @media print {
    .no-print {
      display: none !important;
    }
    .print-only {
      display: block !important;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      margin: 0;
      padding: 20px;
    }
    .MuiPaper-root {
      box-shadow: none !important;
      border: 1px solid #ddd !important;
      margin-bottom: 20px;
    }
    .MuiTable-root {
      font-size: 11px;
    }
    .MuiTableCell-root {
      padding: 8px 4px;
    }
    .order-header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    .order-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .order-info-section {
      flex: 1;
      margin-right: 20px;
    }
    .order-items {
      margin: 20px 0;
    }
    .order-total {
      text-align: right;
      margin-top: 20px;
      font-weight: bold;
      font-size: 14px;
    }
    .page-break {
      page-break-before: always;
    }
  }
`;

// Inject print styles into document
export const injectPrintStyles = () => {
  const existingStyle = document.getElementById('order-print-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  const styleSheet = document.createElement('style');
  styleSheet.id = 'order-print-styles';
  styleSheet.type = 'text/css';
  styleSheet.innerText = getPrintStyles();
  document.head.appendChild(styleSheet);
};

// Enhanced print function
export const printOrderDetails = () => {
  injectPrintStyles();
  window.print();
};
