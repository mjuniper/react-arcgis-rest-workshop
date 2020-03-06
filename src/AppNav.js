import React, { useState } from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem
} from 'reactstrap';
import { NavLink } from 'react-router-dom';

function AppNav ({ title }) {
  const [ isOpen, setIsOpen ] = useState(false);

  const toggle = _ => setIsOpen(!isOpen);

  return (
    <Navbar color="dark" dark expand="md" fixed="top">
      <NavbarBrand href="#">{title}</NavbarBrand>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav navbar>
          <NavItem>
            <NavLink className="nav-link" exact to="/">
              Home
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink className="nav-link" to="/items">
              Items
            </NavLink>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  );
}

export default AppNav;
