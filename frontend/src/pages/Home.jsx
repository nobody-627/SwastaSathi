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
import ReminderBanner from '../components/medications/ReminderBanner'
import TodaySchedule from '../components/medications/TodaySchedule'

export default function Home() {
  return (
    <>
      <ReminderBanner />
      <Hero />
      <TrustStrip />
      <Features />
      <HowItWorks />
      <Testimonials />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <TodaySchedule title="Today's Medications" />
      </div>
      <Pricing />
      <CTA />
      <Footer />
    </>
  )
}
