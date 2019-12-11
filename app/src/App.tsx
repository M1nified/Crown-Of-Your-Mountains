import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.scss';
import AdminView from './views/admin/AdminView';
import HomeView from './views/home/HomeView';
import 'bootstrap/dist/css/bootstrap.min.css'
// import 'bootstrap/dist/js/bootstrap';

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={HomeView} />
        <Route exact path="/crown/:crownToDisplayId" component={HomeView} />
        <Route path="/admin" component={AdminView} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;