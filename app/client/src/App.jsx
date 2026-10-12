import React from 'react';
import {Route, Routes, useParams} from 'react-router-dom';
import {SiteProvider} from './context.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Books from './pages/Books.jsx';
import About from './pages/About.jsx';
import Gallery from './pages/Gallery.jsx';
import Collection from './pages/Collection.jsx';
import Entry from './pages/Entry.jsx';
import Contact from './pages/Contact.jsx';
import Search from './pages/Search.jsx';
import Checkout from './pages/Checkout.jsx';
import Sitemap from './pages/Sitemap.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminApp from './admin/AdminApp.jsx';
import {COLLECTIONS} from './collections.js';

const EntryRoute = ({section}) => <Entry section={section} slug={useParams().slug}/>;

export default function App() {
  return <Routes>
    <Route path="/admin/*" element={<AdminApp/>}/>
    <Route element={<SiteProvider><Layout/></SiteProvider>}>
      <Route index element={<Home/>}/>
      <Route path="books" element={<Books/>}/>
      <Route path="about" element={<About/>}/>
      <Route path="gallery" element={<Gallery/>}/>
      <Route path="contact" element={<Contact/>}/>
      <Route path="checkout" element={<Checkout/>}/>
      <Route path="sitemap" element={<Sitemap/>}/>
      <Route path="search" element={<Search/>}/>
      {COLLECTIONS.flatMap(c => [
        <Route key={c.type} path={c.path.slice(1)} element={<Collection section={c.path.slice(1)}/>}/>,
        <Route key={c.type + '-e'} path={`${c.path.slice(1)}/:slug`} element={<EntryRoute section={c.path.slice(1)}/>}/>
      ])}
      <Route path="*" element={<NotFound/>}/>
    </Route>
  </Routes>;
}
