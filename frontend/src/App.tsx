import './index.css'
import Navbar from './components/global/Navbar'
import Hero from './pages/Hero'
import Works from './pages/Works'
import WhatImOffering from './pages/Offering'
import TechnicalArsenal from './pages/Arsenal'
import MyJourney from './pages/Journey'
import ContactAndResume from './pages/Contact'
import Footer from './pages/Footer'

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Works />
      <WhatImOffering />
      <TechnicalArsenal />
      <MyJourney />
      <ContactAndResume />
      <Footer />
    </>
  )
}

export default App
