# Getting started

## Clone this repository and get it running

- `git clone https://github.com/mjuniper/react-arcgis-rest-workshop.git`
- `cd react-arcgis-rest-workshop`
- `npm i`
- start app (`npm start`)

You should see the base app in your browser.

# Add items search

## Search items with [@esri/arcgis-rest-portal](https://esri.github.io/arcgis-rest-js/api/portal/)

### Install @esri/arcgis-rest-portal and dependencies

- `npm install --save @esri/arcgis-rest-portal @esri/arcgis-rest-auth@^2.0.0  @esri/arcgis-rest-request@^2.0.0`

### Search for items
- visit http://localhost:3000/items?q=test
- in `src/Items.js`:
  - **insert** `, { useEffect, useState }` after `React`
  - **insert** `import { searchItems } from '@esri/arcgis-rest-portal';` at the _bottom_ of the `import` statements
  - **insert** the following _above_ the `Items()` function:
  ```jsx
  const defaultResponse = {
    results: [],
    total: 0
  };
  ```
  - **insert** the following _above_ the `return` statement in the `Items()` function:
  ```jsx
  const [response, setResponse] = useState(defaultResponse);
  const { results, total } = response;

  useEffect(() => {
    if (!q) {
      // invalid search term, emulate an empty response rather than sending a request
      setResponse(defaultResponse);
    } else {
      // execute search and update state
      searchItems({ q, start, num })
      .then(setResponse);
    }
  }, [q, num, start]);
  ```
  - **replace** the `return` statement in the `Items()` function with:
  ```jsx
  return <>
    <div className="row mb-2">
      <div className="col-9">
        <h2>
          Your search for &quot;{q}&quot; yielded {total} items
        </h2>
      </div>
      <div className="col-3">
        {/* TODO: inline search form goes here */}
      </div>
    </div>
    <div className="row">
      <div className="col-12">
        {results && JSON.stringify(results)}
      </div>
    </div>
  </>;
  ```

Now when we change query parameters and reload the page we'll see the response data in the page. Open up Developer Tools and verify that the application is making the expected network requests.

#### Notes:
- [`useEffect()`](https://reactjs.org/docs/hooks-effect.html) is for side effects like loading data

## Format the response data

- create a new `ItemsTable.js` file with the following content:
```jsx
import React from 'react';

function ItemsTable({ items }) {
  return (
    <table className="table table-striped table-bordered table-hover">
      <thead className="thead-dark">
        <tr>
          <th>Title</th>
          <th>Type</th>
          <th>Owner</th>
        </tr>
      </thead>
      <tbody>
        {items &&
          items.map(item => {
            return (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.type}</td>
                <td>{item.owner}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}

export default ItemsTable;
```
- in `src/Items.js`:
  - **insert** `import ItemsTable from './ItemsTable';` at the _bottom_ of the `import` statements
  - **replace** `{results && JSON.stringify(results)}` with `<ItemsTable items={results} />`

Now the results are nicely formated in a table with Bootstrap styles.

## Add a paging control

### Install a library with a paging component

[react-arcgis-hub](https://www.npmjs.com/package/react-arcgis-hub) has a paging component we can use.

- stop app (`ctrl+C`)
- run 'npm install --save react-arcgis-hub`

### Add the paging component below the table
- start app (`npm start`)
- in `/src/Items.js`
  - **insert** `import { ItemPager } from 'react-arcgis-hub';` at the _bottom_ of the `import` statements
  - **insert** the following _above_ the `onSearch()` function (within the `Items()` function):
  ```jsx
  const pageNumber = (start - 1) / num + 1;

  function changePage (page) {
    const newStart = ((page - 1) * num) + 1;
    const path = buildPath({
      q,
      num,
      start: newStart
    });
    history.push(path);
  }
  ```
  - **insert** the following _below_ the `<ItemsTable>` component:
  ```jsx
  <ItemPager
    pageSize={num}
    totalCount={total}
    pageNumber={pageNumber}
    changePage={changePage}
  />
  ```
- visit the items route and initiate a search
- use the links at the bottom to page through the results.

#### Notes:
- `react-arcgis-hub` _just works_ because it shares the same [dependencies](https://www.npmjs.com/package/react-arcgis-hub#dependencies) as our application

# Authentication

We already installed `@esri/arcgis-rest-auth`, but now we will actually use it to sign users into our application.

## Register your app with ArcGIS.com

Sign in at https://developers.arcgis.com and click the "+" dropdown and then "New Application".

Give your app a name, tags and a description and click the "Register" button.

The app item will be created in your ArcGIS Org, and the browser will now show information - including the `Client Id`. Copy that, but leave the browser tab open.

We also need to add a "Redirect URI". Click on the Authentication Tab, then scroll down, and paste `http://localhost:3000` into the Redirect URI box and click `Add`. (Keep this window open, or take note of the itemId for future reference in the Deployment section).

Create a new `.env` file with the following content:

```
REACT_APP_CLIENT_ID=<PASTE-YOUR-CLIENT-ID-HERE>
```

We'll use this environment variable later.

## Adding Sign-In to Our app

First, let's add the user menu.

- start app (`npm start`)
- create a new `src/UserMenu.js` with the following contents:
```jsx
import React from 'react';
import {
  NavItem,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

function UserMenu({ onSignIn, onSignOut, session }) {
  const name = session && session.username;
  if (!name) {
    // show sign in link
    return (
      <NavItem className="ml-auto">
        <Button color="link" onClick={onSignIn} className="nav-link">
          Sign In
        </Button>
      </NavItem>
    );
  }
  // show user menu
  return (
    <UncontrolledDropdown nav inNavbar>
      <DropdownToggle nav caret>
        {name}
      </DropdownToggle>
      <DropdownMenu right>
        <DropdownItem onClick={onSignOut}>Sign Out</DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

export default UserMenu;
```

Now we need to add the `onSignIn` and `onSignOut` callbacks to the application component.

- in `src/App.js`:
  - **insert** `import UserMenu from './UserMenu';` at the _bottom_ of the `import` statements
  - **insert** the following _above_ the `return` statement
  ```jsx
  const onSignIn = () => {
    console.log('sign in');
  }
  const onSignOut = () => {
    console.log('sign out');
  }
  const userMenu = (
    <UserMenu
      onSignIn={onSignIn}
      onSignOut={onSignOut}
    />
  );
  ```
- in `src/AppNav.js`:
  - **replace** `const { title } = this.props;` with `const { title, userMenu } = this.props;`
  - **insert** the following _after_ the `<Nav navbar>`:
  ```jsx
  <Nav navbar className="ml-auto">
    {userMenu}
  </Nav>
  ```

Now let's run our app and see how things work. `npm start`, open `http://localhost:3000` in your browser, and open dev tools.

You should see your "Sign In" link in the nav bar. Clicking on it, should add messages to the console.

#### Notes:
We bind the user menu component to the callbacks and pass it to the nav menu [in order to avoid prop drilling](https://reactjs.org/docs/context.html#before-you-use-context).

## Hooking up Sign In
In order to use `@esri/arcgis-rest-auth` we need to first add a redirect page before we add the code to sign in...

- stop app (`ctrl+C`)
- create a new `public/redirect.html` with the following contents:
```html
<!DOCTYPE html>
<html>
<head>
  <!-- arcgis-rest-js script to complete user sign in -->
  <!-- NOTE: this JS file is copied from node_modules by a package.json script -->
  <script src="./auth.umd.min.js"></script>
  <script>
    function loadHandler() {
      // get client id from url hash
      const match = window.location.href.match(/&state=([^&]+)/);
      const clientId = match && match[1];
      // complete the oauth flow
      session = arcgisRest.UserSession.completeOAuth2({
        clientId: clientId,
      });
    }
  </script>
</head>
<body onload="loadHandler();">
</body>
</html>
```
- in `package.json`:
  - **insert** the following at the _top_ of the `scripts`:
  ```json
    "copy:auth": "cp ./node_modules/@esri/arcgis-rest-auth/dist/umd/auth.umd.min.js ./public/auth.umd.min.js",
    "prestart": "npm run copy:auth",
  ```
- **insert** the following at the _bottom_ of `.gitignore`:
```
# auth
.env
public/auth.umd.min.js
```

Now that we've added a redirect page and configured our scripts to copy the script it needs, we can add code to the application to sign in.

- start app (`npm start`)
- create a new `src/util/session.js` file w/ the following contents:
```js
import { UserSession } from '@esri/arcgis-rest-auth';
/**
 * sign in using OAuth pop up
 */
export function signIn() {
  const clientId = process.env.REACT_APP_CLIENT_ID;
  return UserSession.beginOAuth2({
    clientId,
    popup: true,
    redirectUri: `${window.location.origin}/redirect.html`
  });
}
```
- in `src/App.js`
  - **replace** `import React from 'react';` with `import React, { useState, useMemo } from 'react';`
  - **insert** `import { signIn } from './util/session';` at the _bottom_ of the `import` statements
  - **insert** `const [session, setSession] = useState(null);` _above_ the `onSignIn()` function
  - **replace** `console.log('sign in');` with `signIn().then(setSession);`
  - **replace** `console.log('sign out');` with `setSession(null);`
  - **insert**  `session={session}` _inside_ the `<UserMenu>` component

Now, clicking the "Sign In" link should open a pop-up window. Sign In with valid credentials, and you should see your user name with a drop down menu. Clicking the the "Sign Out" link in the drop down shows the "Sign In" link once again.

#### Notes
- CRA makes environment variables that start with `REACT_APP_` [available at runtime via a `process.env` global](https://create-react-app.dev/docs/adding-custom-environment-variables/).

## Making it Better...

At this point we have basic authentication working and our session has all our ArcGIS Online information and we can call the API etc.

But... the user experience is weak. So let's show the current user in the header and move Sign Out into a dropdown.

- in `/src/UserMenu.js`
  - **replace** `import React from 'react';` with `import React, { useEffect, useState } from 'react';`
  - **replace** `const name = session && session.username;` with the following:
  ```jsx
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (session) {
      session.getUser().then(setUser);
    } else {
      setUser(null);
    }
  }, [session]);
  const name = user && user.fullName;
  ```

## Persisting Session
At this point you've likely gotten sick of having to sign in every time the app refreshes, so let's fix that.

`@esri/arcgis-rest-auth` provide methods to serialize and de-serialize a user session, but has no opinion on how you persist the serialized session (i.e. cookies, local storage, etc).

We'll use cookies for our app, and to make that easier we'll start by installing a library for working with cookies.

- stop app (`ctrl+C`)
- run `npm install --save js-cookie`

Now we can add the code that writes the cookie every time the user signs in/out.

- start app (`npm start`)
- in `src/util/session.js`
  - **insert** the following _below_ the `import` statements:
  ```js
  import * as Cookies from 'js-cookie';

  // this name is arbitrary, but should be relatively unique
  const SESSION_COOKIE_NAME = `eaa_session`;
  ```
  - **insert** the following at _the bottom_ of the file:
  ```js
  // save session & user for next time the user loads the app
  function saveSession(session) {
    // use session expiration as cookie expiration
    const expires = session.tokenExpires;
    Cookies.set(SESSION_COOKIE_NAME, session.serialize(), { expires });
    return session;
  }

  /**
  * make sure the user is not logged in the next time they load the app
  */
  export function signOut() {
    Cookies.remove(SESSION_COOKIE_NAME);
  }
  ```
  - **replace** the _last line_ of the `signIn()` function (`});`) with `}).then(saveSession);`

Now sign in and look in devtools, on the "Application" tab, click on Local Storage on the left, and click on `http://localhost:3000`. If you are signed in, you will see a key called `eaa_session` that holds the serialized session as a string.

Now we need to check for that cookie when the user first visits the application. A good place for this kind of code is in `src/index.js` because that happens before the the application renders. First though we'll add a utility function to read the cookie and de-serialize the session.

- in `src/util/session.js`
  - **insert** the following at _the bottom_ of the file:
  ```js
  /**
  * restore a previously saved session
  */
  export function restoreSession() {
    const serializedSession = Cookies.get(SESSION_COOKIE_NAME);
    const session =
      serializedSession && UserSession.deserialize(serializedSession);
    return session;
  }
  ```
- in `index.js`:
  - **insert** the following _below_ the `import` statements:
  ```js
  import { restoreSession } from './util/session';

  const prevSession = restoreSession();
  ```
  - **replace** `<App />` with `<App prevSession={prevSession} />`
- in `src/App.js`:
  - **replace** `function App() {` with `function App({ prevSession }) {`
  - **replace** `const [session, setSession] = useState(null);` with `const [session, setSession] = useState(prevSession);`

At this point you should have an app that allows a user to sign in with ArcGIS.com credentials, shows their name in the UI, and allows them to sign out. If the close the browser or refresh the page while signed in, the app will load their saved token information from localStorage and automatically sign them in.

## Passing credentials with search requests

Showing the user their own name is nice, but the primary reason we made them sign in is so that we can send their credentials (i.e. a token) along with search requests.

The `searchItems()` function has an [`authentication`](https://esri.github.io/arcgis-rest-js/api/portal/ISearchOptions/#authentication) option that you can use to pass the user session and make authenticated requests.

- in `src/App.js`:
  - **replace** `<Items />` with `<Items session={session} />`
- in `src/Items.js`:
  - **replace** `function Items() {` with `function Items({ session }) {`
  - **replace** `searchItems({ q, start, num })` with `searchItems({ q, start, num, authentication: session })`
  - **replace** `}, [q, num, start]);` with `}, [q, num, start, session]);`

Now when you're signed in and you perform a search, if you inspect the network requests you'll see that a token is passes along with the search params.

The most visual way to test this is to search for a private item. When you are not signed in, it won't show up in the results, then when you sign in it should appear in the list without you having to re-submit the search form.
