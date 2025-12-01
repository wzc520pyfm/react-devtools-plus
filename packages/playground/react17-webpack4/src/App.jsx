import { Route, Switch } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Theme from './pages/Theme'

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/theme" component={Theme} />
      </Switch>
    </Layout>
  )
}
