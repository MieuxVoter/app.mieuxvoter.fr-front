import jsPDF from "jspdf";
import QRCode from 'qrcode';

export const buildQRCodesPDF = async (voteUrls: URL[]): Promise<jsPDF> => {
    const doc = new jsPDF('p', 'mm', 'a4', true);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const qrCodeSize = 47; // Taille de chaque QR code
    const margin = 7; // Marge autour des QR codes
    const qrCodesPerRow = Math.floor((pageWidth - margin * 2) / qrCodeSize);
    const qrCodesPerColumn = Math.floor((pageHeight - margin * 2) / qrCodeSize);
    const qrCodesPerPage = qrCodesPerRow * qrCodesPerColumn;

    const totalSpaceX = pageWidth - (margin * 2) - qrCodesPerRow * qrCodeSize;
    const totalSpaceY = pageHeight - (margin * 2) - qrCodesPerColumn * qrCodeSize;
    const spaceX = totalSpaceX / (qrCodesPerRow - 1);
    const spaceY = totalSpaceY / (qrCodesPerColumn - 1);

    let currentX = margin;
    let currentY = margin;

    const drawDashGrid = () => {
      doc.setLineDashPattern([2, 2], 0);
      doc.setDrawColor(100, 100, 100);
  
      for (let x = 0; x < qrCodesPerRow -1; ++x) {
        const currentX  = margin + qrCodeSize + qrCodeSize * x + spaceX * x + spaceX / 2;
        doc.line(currentX, 0, currentX, pageHeight);
      }
  
      for (let y = 0; y < qrCodesPerColumn - 1; ++y) {
        const currentY = margin + qrCodeSize + qrCodeSize * y + spaceY * y + spaceY / 2;
        doc.line(0, currentY, pageWidth, currentY);
      }
    }

    for (let i = 0; i < voteUrls.length; i++) {
      const url = voteUrls[i];
      const qrCodeDataUrl = await QRCode.toDataURL(url.href);

      doc.addImage(qrCodeDataUrl, 'PNG', currentX, currentY, qrCodeSize, qrCodeSize);
      
      currentX += qrCodeSize + spaceX;
      const nextIndex = i + 1;

      if (nextIndex % qrCodesPerPage === 0 && i !== voteUrls.length - 1) {
        drawDashGrid();
        doc.addPage();
        currentX = margin;
        currentY = margin;
      } else if (nextIndex % qrCodesPerRow === 0) {
        currentX = margin;
        currentY += qrCodeSize + spaceY;
      }
    }

    drawDashGrid();

    return doc;
  };

export const generateQRCodesPDF = async (voteUrls: URL[]) => {
    const doc = await buildQRCodesPDF(voteUrls);
    await doc.save('urls_with_qr_codes.pdf', { returnPromise: true });
  };
