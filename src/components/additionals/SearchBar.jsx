import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
    onSearch(event.target.value);
  };

  return (
    <div className="flex justify-center">
      <div className="flex items-center rounded-xl border-b border-2 border-blue-500 py-4 w-1/2">
        <input
          className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
          type="text"
          placeholder="Buscar platos..."
          value={searchTerm}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default SearchBar;