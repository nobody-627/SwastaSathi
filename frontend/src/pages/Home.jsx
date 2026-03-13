import Hero from '../components/Hero'
import {
  TrustStrip,
  Features,
  HowItWorks,
  Testimonials,
  Pricing,
  CTA,
  Footer,
} from '../components/LandingComponents'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </>
  )
}
