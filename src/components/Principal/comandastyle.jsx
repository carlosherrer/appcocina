import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Bs1SquareFill,
  Bs2SquareFill,
  Bs3SquareFill,
  Bs4SquareFill,
  Bs5SquareFill,
} from "react-icons/bs";
import SearchBar from "../additionals/SearchBar";
import PDFButton from "../pdf/pdfbutton";

const ComandaStyle = () => {
  const [comandas, setComandas] = useState([]);
  const [filteredComandas, setFilteredComandas] = useState([]);
  const [numColumnas, setNumColumnas] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedComanda, setSelectedComanda] = useState(null);

  useEffect(() => {
    obtenerComandas();
  }, []);

  const obtenerComandas = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_API_COMANDA);
      setComandas(response.data);
    } catch (error) {
      console.error("Error al obtener las comandas:", error);
    }
  };

  useEffect(() => {
    obtenerComandas();
    const interval = setInterval(() => {
      obtenerComandas();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Filtrar comandas basadas en el término de búsqueda
    const filtered = comandas.filter((comanda) =>
      comanda.platos.some((plato) =>
        plato.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredComandas(filtered);
  }, [comandas, searchTerm]);

  // Función para manejar el cambio en el término de búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Función para manejar el clic en los iconos de selección de columnas
  const handleSeleccionColumnas = (num) => {
    setNumColumnas(num);
  };

  // Función para manejar el cambio en la opción seleccionada
  const handleSelectChange = async (comandaIndex, platoIndex, value) => {
    // Si el valor seleccionado es "nostock"
    if (value === "sinstock") {
      const updatedComandas = [...filteredComandas];
      const updatedPlatos = [...updatedComandas[comandaIndex].platos];
      const updatedCantidades = [...updatedComandas[comandaIndex].cantidades];
      // Eliminar la fila que tiene "nostock"
      updatedPlatos.splice(platoIndex, 1);
      updatedCantidades.splice(platoIndex, 1);
      updatedComandas[comandaIndex].platos = updatedPlatos;
      updatedComandas[comandaIndex].cantidades = updatedCantidades;
      setFilteredComandas(updatedComandas);
      console.log(
        `Fila eliminada: comanda ${comandaIndex}, plato ${platoIndex}`
      );
      // Actualizar la comanda en la base de datos
      try {
        await axios.put(
          `${process.env.REACT_APP_API_COMANDA}/${filteredComandas[comandaIndex]._id}`,
          {
            platos: updatedPlatos,
            cantidades: updatedCantidades,
          }
        );
        console.log("Comanda actualizada en la base de datos.");
      } catch (error) {
        console.error(
          "Error al actualizar la comanda en la base de datos:",
          error
        );
      }
    } else {
      // De lo contrario, actualiza las opciones seleccionadas normalmente
      const updatedOptions = [...selectedOptions];
      updatedOptions[comandaIndex] = {
        ...updatedOptions[comandaIndex],
        [platoIndex]: value,
      };
      setSelectedOptions(updatedOptions);
      console.log(
        `Comanda: ${comandaIndex}, Fila: ${platoIndex}, Valor seleccionado: ${value}`
      );
    }
  };

  const todasFilasEntregadas = (comandaIndex) => {
    const comanda = filteredComandas[comandaIndex];
    if (!selectedOptions[comandaIndex]) return false;
    const selectedPlatos = Object.values(selectedOptions[comandaIndex]);
    return (
      selectedPlatos.length === comanda.platos.length &&
      selectedPlatos.every((value) => value === "entregado")
    );
  };

  // Efecto para mostrar la información de la comanda seleccionada
  useEffect(() => {
    if (selectedComanda) {
      console.log("Información de la comanda seleccionada:", selectedComanda);
    }
  }, [selectedComanda]);

  return (
    <div className="w-full">
      <div className="mt-8 px-4 hidden w-full gap-4 md:gap-10 justify-end sm:hidden md:flex lg:flex xl:hidden">
        <Bs1SquareFill
          onClick={() => handleSeleccionColumnas(1)}
          className="cursor-pointer md:text-5xl text-2xl"
        />
        <Bs2SquareFill
          onClick={() => handleSeleccionColumnas(2)}
          className="cursor-pointer md:text-5xl text-2xl"
        />
      </div>
      <div className="mt-8 px-4 hidden w-full gap-4 md:gap-10 justify-end lg:hidden md:hidden xl:flex 2xl:hidden">
        <Bs3SquareFill
          onClick={() => handleSeleccionColumnas(3)}
          className="cursor-pointer md:text-5xl text-2xl"
        />
        <Bs4SquareFill
          onClick={() => handleSeleccionColumnas(4)}
          className="cursor-pointer md:text-5xl text-2xl"
        />
      </div>
      <div className="mt-8 px-4 hidden w-full gap-4 md:gap-10 justify-end sm:hidden lg:hidden md:hidden xl:hidden 2xl:flex">
        <Bs3SquareFill
          onClick={() => handleSeleccionColumnas(3)}
          className="cursor-pointer md:text-5xl text-2xl"
        />
        <Bs4SquareFill
          onClick={() => handleSeleccionColumnas(4)}
          className="cursor-pointer md:text-5xl text-2xl"
        />
        <Bs5SquareFill
          onClick={() => handleSeleccionColumnas(5)}
          className="cursor-pointer md:text-5xl text-2xl"
        />
      </div>
      <div className="mt-8">
        <SearchBar onSearch={handleSearch} />
      </div>
      <div className="mt-8 border-2 flex justify-center w-1/12 py-3 rounded-xl bg-red-700 text-white">
        <PDFButton data={comandas} />
      </div>
      <div
        className={`mt-10 flex flex-row flex-wrap justify-center ${
          numColumnas === 1
            ? "grid grid-cols-1"
            : numColumnas === 2
            ? "md:grid grid-cols-2"
            : numColumnas === 3
            ? "xl:grid grid-cols-3"
            : numColumnas === 4
            ? "xl:grid grid-cols-4"
            : "xl:grid grid-cols-5"
        }`}
      >
        {filteredComandas.map((comanda, comandaIndex) => (
          <div
            key={comanda._id}
            className={`mx-4 md:mx-6 mb-8 border-4 rounded-xl border-orange-500 w-auto`}
            style={{
              display: todasFilasEntregadas(comandaIndex) ? "none" : "block",
            }}
          >
            <div className="mt-4 justify-start flex flex-row gap-6 ml-6 font-bold">
              <p>Mozo: {comanda.mozos.name}</p>
              <p>Mesa: {comanda.mesas.nummesa}</p>
            </div>
            <div className="mt-4 justify-center md:mx-4 flex flex-col gap-4">
              <div className="ml-2 flex justify-start flex-row font-bold">
                <div className="text-center">Cantidad</div>
                <div className="w-8/12 text-center">Plato</div>
              </div>
              {comanda.platos.map((plato, platoIndex) => (
                <div key={plato._id} className={`items-center flex flex-row`}>
                  <div className="w-1/4 text-center">
                    {comanda.cantidades[platoIndex]}
                  </div>
                  <div className="w-11/12 text-center">{plato.nombre}</div>
                  <div>
                    <select
                      className="bg-white border border-gray-300 rounded-md px-4 py-2 mt-4 mb-4"
                      value={
                        (selectedOptions[comandaIndex] &&
                          selectedOptions[comandaIndex][platoIndex]) ||
                        ""
                      }
                      onChange={(e) =>
                        handleSelectChange(
                          comandaIndex,
                          platoIndex,
                          e.target.value
                        )
                      }
                      disabled={
                        selectedOptions[comandaIndex] &&
                        selectedOptions[comandaIndex][platoIndex] === "entregado"
                      }
                    >
                      <option value="preparacion" className="bg-yellow-200">
                        Preparación
                      </option>
                      <option value="recoger" className="bg-blue-400">
                        Recoger
                      </option>
                      <option value="entregado" className="bg-green-400">
                        Entregado
                      </option>
                      <option value="sinstock" className="bg-red-400">
                        Sin Stock
                      </option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            {comanda.observaciones && comanda.observaciones.trim() !== "" && (
              <div className="mt-4 text-center font-bold">Observaciones</div>
            )}
            {comanda.observaciones && comanda.observaciones.trim() !== "" && (
              <div className="flex mt-6 mb-8 mx-2 text-center rounded-xl border-4 border-blue-500">
                <p className="mt-4 mb-4 px-3">{comanda.observaciones}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComandaStyle;
