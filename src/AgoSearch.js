import React, { useState } from 'react';

function AgoSearch({ onSearch, q: initialQ = '', inline }) {
  const [q, setQ] = useState(initialQ);
  const inputGroupClass = `input-group input-group-${inline ? 'sm' : 'lg'}`;

  function onChange(e) {
    // hold onto a copy of the search term
    setQ(e.target.value);
  }

  function onSubmit(e) {
    // don't actually submit the form
    e.preventDefault();
    // call search function that was passed in as a prop
    onSearch && onSearch(q);
  }

  return (
    <form className="search-form" onSubmit={onSubmit}>
      <div className={inputGroupClass}>
        <input
          className="form-control"
          placeholder="search for items"
          value={q}
          onChange={onChange}
        />
        <div className="input-group-append">
          <button className="btn btn-secondary" type="submit">
            Search
          </button>
        </div>
      </div>
    </form>
  );
}

export default AgoSearch;
