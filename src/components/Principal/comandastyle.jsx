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
import moment from "moment-timezone";
import PDFComanda from "../pdf/pdfcomanda";

const ComandaStyle = () => {
  const [comandas, setComandas] = useState([]);
  const [filteredComandas, setFilteredComandas] = useState([]);
  const [numColumnas, setNumColumnas] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");

  const obtenerComandas = async () => {
    try {
      const fechaActual = moment().tz("America/Lima").format("YYYY-MM-DD");
      const response = await axios.get(
        `${process.env.REACT_APP_API_COMANDA}/fechastatus/${fechaActual}`
      );
      setComandas(response.data);
    } catch (error) {
      console.error("Error al obtener las comandas:", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      obtenerComandas();
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const filtered = comandas.filter(
      (comanda) =>
        searchTerm === "" ||
        comanda.platos.some((plato) =>
          plato.plato.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredComandas(filtered);
  }, [comandas, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSeleccionColumnas = (num) => {
    setNumColumnas(num);
  };

  const verificarYActualizarEstadoComanda = async (comanda) => {
    const todosEntregados = comanda.platos.every(
      (plato) => plato.estado === "entregado"
    );

    if (todosEntregados) {
      try {
        await axios.put(
          `${process.env.REACT_APP_API_COMANDA}/${comanda._id}/status`,
          { nuevoStatus: "entregado" }
        );
        obtenerComandas();
      } catch (error) {
        console.error("Error al actualizar el estado de la comanda:", error);
      }
    }
  };

  const handleSelectChange = async (e, comandaIndex, platoIndex) => {
    const nuevoEstado = e.target.value;
    const comandaId = comandas[comandaIndex]._id;
    const platoId = comandas[comandaIndex].platos[platoIndex].plato._id;

    try {
      if (nuevoEstado === "nostock") {
        const updatedComandas = [...comandas];
        updatedComandas[comandaIndex].platos = updatedComandas[
          comandaIndex
        ].platos.filter((_, index) => index !== platoIndex);
        updatedComandas[comandaIndex].cantidades = updatedComandas[
          comandaIndex
        ].cantidades.filter((_, index) => index !== platoIndex);

        await axios.put(
          `${process.env.REACT_APP_API_COMANDA}/${comandaId}`,
          updatedComandas[comandaIndex]
        );

        setComandas(updatedComandas);
        setFilteredComandas(updatedComandas);
      } else if (nuevoEstado === "entregado") {
        const response = await axios.put(
          `${process.env.REACT_APP_API_COMANDA}/${comandaId}/plato/${platoId}/estado`,
          { nuevoEstado }
        );
        const updatedComandas = [...comandas];
        updatedComandas[comandaIndex].platos[platoIndex].estado = nuevoEstado;
        setComandas(updatedComandas);
        setFilteredComandas(updatedComandas);
        await verificarYActualizarEstadoComanda(updatedComandas[comandaIndex]);
      } else {
        const response = await axios.put(
          `${process.env.REACT_APP_API_COMANDA}/${comandaId}/plato/${platoId}/estado`,
          { nuevoEstado }
        );
        const updatedComandas = [...comandas];
        updatedComandas[comandaIndex].platos[platoIndex].estado = nuevoEstado;
        setComandas(updatedComandas);
        setFilteredComandas(updatedComandas);
      }
    } catch (error) {
      console.error("Error al cambiar el estado del plato:", error);
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
          className="cursor-pointer md:text-4xl text-2xl"
        />
        <Bs4SquareFill
          onClick={() => handleSeleccionColumnas(4)}
          className="cursor-pointer md:text-4xl text-2xl"
        />
      </div>
      <div className="mt-8 px-4 hidden w-full gap-4 md:gap-10 justify-end sm:hidden lg:hidden md:hidden xl:hidden 2xl:flex">
        <Bs3SquareFill
          onClick={() => handleSeleccionColumnas(3)}
          className="cursor-pointer md:text-4xl text-2xl"
        />
        <Bs4SquareFill
          onClick={() => handleSeleccionColumnas(4)}
          className="cursor-pointer md:text-4xl text-2xl"
        />
        <Bs5SquareFill
          onClick={() => handleSeleccionColumnas(5)}
          className="cursor-pointer md:text-4xl text-2xl"
        />
      </div>
      <div className="mt-8">
        <SearchBar onSearch={handleSearch} />
      </div>
      <div className="flex">
        <div className="mt-8 border-2 flex justify-center md:w-1/12 w-1/5 py-3 rounded-xl bg-red-700 text-white">
          <PDFButton data={comandas} />
        </div>
        <div className="mt-8 border-2 flex justify-center md:w-1/12 w-1/5 py-3 rounded-xl bg-yellow-500 text-white">
          <PDFComanda data={comandas} />
        </div>
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
            <div className="mt-4 justify-center flex flex-row gap-6 text-sm font-bold">
              <p>Nro: {comanda.comandaNumber}</p>
              <p>Mozo: {comanda.mozos.name}</p>
              <p>Mesa: {comanda.mesas.nummesa}</p>
            </div>
            <div className="mt-4 justify-center md:mx-4 flex flex-col gap-4">
              <div className="flex justify-start flex-row font-bold">
                <div className="text-center">Cnt</div>
                <div className="w-8/12 text-center">Plato</div>
              </div>
              {comanda.platos.map((plato, platoIndex) => (
                <div
                  key={plato._id}
                  className={`items-center flex flex-row mb-6`}
                >
                  <div className="w-1/12 text-center">
                    {comanda.cantidades[platoIndex]}
                  </div>
                  <div className="w-11/12 px-4 text-center">
                    {plato.plato.nombre}
                  </div>
                  <div className="flex justify-center">
                    <select
                      value={plato.estado}
                      onChange={(e) =>
                        handleSelectChange(e, comandaIndex, platoIndex)
                      }
                      disabled={plato.estado === "entregado"}
                    >
                      <option value="ingresante" className="text-center bg-orange-400">
                        ingresante
                      </option>
                      <option value="preparacion" className="text-center bg-sky-300">
                        Preparacion
                      </option>
                      <option value="recoger" className="text-center bg-yellow-400">
                        Recoger
                      </option>
                      <option value="entregado" className="text-center bg-green-400">
                        Entregado
                      </option>
                      <option value="nostock" className="text-center bg-red-600">
                        No Stock
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
