import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import AgoSearch from './AgoSearch';

// parse query string for search params or provide default values
function parseSearch (search) {
  const params = new URLSearchParams(search);
  const q = params.get('q') || '';
  const start = parseInt(params.get('start')) || 1;
  const num = parseInt(params.get('num')) || 10;
  return { q, start, num };
}

function buildPath(params) {
  let searchParams = new URLSearchParams(params);
  return `/items?${searchParams.toString()}`;
}

function Items() {
  const { search } = useLocation();
  const { q, start, num } = parseSearch(search);

  const history = useHistory();

  function onSearch (q) {
    const path = buildPath({
      q,
      num
    });
    history.push(path);
  }

  return (
    <>
      <AgoSearch onSearch={onSearch} q={q} inline />
      <pre><code>{JSON.stringify({ q, start, num }, null, 2)}</code></pre>
    </>
  );
}

export default Items;
