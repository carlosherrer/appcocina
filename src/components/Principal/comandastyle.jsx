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
  const [statuses, setStatuses] = useState([]);
  const [updateTriggered, setUpdateTriggered] = useState(false);

  const obtenerComandas = async () => {
    try {
      const fechaActual = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${process.env.REACT_APP_API_COMANDA}/fecha/${fechaActual}`);
      setComandas(response.data);
      const uniqueStatuses = [
        ...(response.data.map((comanda) => comanda.status)),
      ];
      setStatuses(uniqueStatuses);
    } catch (error) {
      console.error("Error al obtener las comandas:", error);
    }
  };

  //? fetch - interval
  useEffect(() => {
    obtenerComandas();
    const interval = setInterval(() => {
      obtenerComandas()
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const filtered = comandas.filter((comanda) =>
      searchTerm === '' || comanda.platos.some((plato) =>
        plato.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredComandas(filtered);
  }, [comandas, searchTerm]);

  useEffect(() => {
    const allDelivered = filteredComandas.every(
      (comanda) => comanda.status === "entregado"
    );

    if (allDelivered && !updateTriggered) {
      actualizarEstadoComandas();
    }
  }, [filteredComandas, updateTriggered]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSeleccionColumnas = (num) => {
    setNumColumnas(num);
  };

  const actualizarEstadoComandas = async () => {
    try {
      const comandaIds = filteredComandas.map((comanda) => comanda._id);
      await Promise.all(
        comandaIds.map(async (comandaId) => {
          await axios.put(
            `${process.env.REACT_APP_API_COMANDA}/${comandaId}/status`,
            { nuevoStatus: "entregado" }
          );
          await axios.put(
            `${process.env.REACT_APP_API_COMANDA}/${comandaId}/estado`,
            { nuevoEstado: false }
          );
        })
      );
      obtenerComandas();
      setUpdateTriggered(true);
    } catch (error) {
      console.error("Error al actualizar el estado de las comandas:", error);
    }
  };

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
      <div className="mt-8 border-2 flex justify-center md:w-1/12 w-1/5 py-3 rounded-xl bg-red-700 text-white">
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
        } ${window.innerWidth > 3200 ? "text-2xl" : ""}`}
      >
        {filteredComandas.map((comanda, comandaIndex) => (
          <div
            key={comanda._id}
            className={`mx-4 md:mx-6 mb-8 border-4 rounded-xl border-orange-500 w-auto`}
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
                <div
                  key={plato._id}
                  className={`items-center flex flex-row mb-6`}
                >
                  <div className="w-1/4 text-center">
                    {comanda.cantidades[platoIndex]}
                  </div>
                  <div className="w-11/12 text-center">{plato.nombre}</div>
                  <div>
                    <input type="checkbox" className="w-6 h-6"/>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mb-8">
              <select onChange={(e) => actualizarEstadoComandas(comanda._id, e.target.value)}>
                <option value="preparacion">Preparación</option>
                <option value="recoger">Recoger</option>
                <option value="entregado">Entregado</option>
                <option value="nostock">No Stock</option>
              </select>
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
