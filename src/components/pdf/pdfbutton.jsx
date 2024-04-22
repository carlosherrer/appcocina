import React from "react";
import jsPDF from "jspdf";

const PDFButton = ({ data }) => {
  const generatePDF = () => {
    const doc = new jsPDF();

    if (!data || data.length === 0) {
      // Si no hay datos, agregar un mensaje y guardar el PDF
      doc.setFontSize(12);
      doc.text("No hay datos disponibles", 10, 20);
      doc.save("informe_ventas.pdf");
      return;
    }

    // Inicializar variables para el cálculo de totales
    let totalPlatos = 0;
    const dineroPorMesa = {};
    let dineroTotal = 0;
    const ventasPorMozo = {}; // Objeto para almacenar las ventas por mozo
    const cantidadesPorCategoria = {};

    // Realizar los cálculos basados en los datos recibidos del API
    data.forEach((comanda) => {
      let totalComanda = 0; // Variable para el total de la comanda actual

      comanda.cantidades.forEach((cantidad, index) => {
        totalPlatos += cantidad;
        const plato = comanda.platos[index];
        if (plato && plato.categoria) { // Verificar que plato y plato.categoria estén definidos
          const categoria = plato.categoria;
          if (!cantidadesPorCategoria[categoria]) {
            cantidadesPorCategoria[categoria] = {};
          }
          cantidadesPorCategoria[categoria][plato.nombre] =
            (cantidadesPorCategoria[categoria][plato.nombre] || 0) + cantidad;
        }
      });

      comanda.platos.forEach((plato, index) => {
        const precio = parseFloat(plato.precio) || 0;
        const cantidad = parseInt(comanda.cantidades[index]) || 0;
        totalComanda += precio * cantidad; // Calcular el total de la comanda actual
      });

      const mesa = comanda.mesas.nummesa;
      dineroPorMesa[mesa] = (dineroPorMesa[mesa] || 0) + totalComanda; // Agregar al total de la mesa
      dineroTotal += totalComanda; // Agregar al total de todas las comandas

      // Calcular las ventas por mozo
      const mozoId = comanda.mozos.id;
      ventasPorMozo[mozoId] = (ventasPorMozo[mozoId] || 0) + totalComanda;
    });

    const pdfWidth = doc.internal.pageSize.getWidth();

    // Función para agregar las cantidades por categoría a la página actual
    const addCantidadesPorCategoriaToPDF = (cantidadesPorCategoria, startY) => {
      let y = startY;
      Object.keys(cantidadesPorCategoria).forEach((categoria) => {
        doc.text(`${categoria}:`, 10, y);
        y += 10;
        Object.keys(cantidadesPorCategoria[categoria]).forEach((plato) => {
          if (y + 13 > doc.internal.pageSize.height - 10) {
            // Si no hay suficiente espacio en la página actual, agregar una nueva página
            doc.addPage();
            y = 20;
          }
          doc.text(
            `${cantidadesPorCategoria[categoria][plato]} : ${plato}`,
            20,
            y
          );
          y += 13;
        });
        y += 5; // Espacio entre tablas
      });
      return y;
    };

    // Agregar los datos al PDF
    doc.setFontSize(18);
    const titleText = "Informe de Ventas";
    const titleWidth =
      (doc.getStringUnitWidth(titleText) * doc.internal.getFontSize()) /
      doc.internal.scaleFactor;
    const titleX = (pdfWidth - titleWidth) / 2;
    doc.text(titleText, titleX, 20);

    doc.setFontSize(12);
    let y = 35;

    // Agregar las cantidades por categoría a la página actual
    y = addCantidadesPorCategoriaToPDF(cantidadesPorCategoria, y);

    // Agregar las ventas por mozo al PDF
    y += 5;
    doc.text("Ventas por Mozo:", 10, y);
    y += 10;
    Object.keys(ventasPorMozo).forEach((mozoId) => {
      const mozoName = data.find(
        (comanda) => comanda.mozos.id === parseInt(mozoId)
      ).mozos.name;
      if (y + 10 > doc.internal.pageSize.height - 10) {
        // Si no hay suficiente espacio en la página actual, agregar una nueva página
        doc.addPage();
        y = 20;
      }
      doc.text(`Mozo ${mozoName}: $${ventasPorMozo[mozoId].toFixed(2)}`, 20, y);
      y += 10;
    });

    // Agregar el dinero total de todas las comandas al PDF
    y += 5;
    doc.text(
      `Dinero Total de Todas las Comandas: $${dineroTotal.toFixed(2)}`,
      10,
      y
    );
    y += 10;

    // Agregar el dinero total por mesa al PDF
    Object.keys(dineroPorMesa).forEach((mesa) => {
      if (y + 10 > doc.internal.pageSize.height - 10) {
        // Si no hay suficiente espacio en la página actual, agregar una nueva página
        doc.addPage();
        y = 20;
      }
      doc.text(
        `Dinero Total por Mesa ${mesa}: $${dineroPorMesa[mesa].toFixed(2)}`,
        20,
        y
      );
      y += 10;
    });

    // Guardar el PDF
    doc.save("informe_ventas.pdf");
  };

  return <button onClick={generatePDF}>Reporte del día</button>;
};

export default PDFButton;