import ComandaStyle from "./Principal/comandastyle";
function App() {
  return (
    <div className="mt-10 flex-row justify-center">
      <div className="mt-14 text-3xl md:text-8xl font-bold flex justify-center font-serif">
        <p>Pedidos</p>
      </div>
      <div className="flex flex-row">
        <ComandaStyle />
      </div>
    </div>
  );
}

export default App;
