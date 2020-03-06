import React from 'react';
import AppNav from './AppNav';
import { Route, Switch } from 'react-router-dom';
import Home from './Home';
import Items from './Items';

function App() {
  return (
    <>
      <AppNav title="React ArcGIS REST Workshop" />
      <div className="container mt-5">
        <Switch>
          <Route path="/items">
            <Items />
          </Route>
          <Route exact path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </>
  );
}

export default App;
