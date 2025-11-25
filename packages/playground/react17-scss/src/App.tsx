import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Theme from './pages/Theme'

export default function App() {
  return (
    <Switch>
      <Route path="/">
        <Layout>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/theme">
              <Theme />
            </Route>
          </Switch>
        </Layout>
      </Route>
    </Switch>
  )
}
