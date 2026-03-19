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
import useMLPrediction from '../hooks/useMLPrediction'
import PredictionCard from '../components/ml/PredictionCard'
import RiskRadarChart from '../components/ml/RiskRadarChart'
import PredictionBanner from '../components/ml/PredictionBanner'

export default function Home() {
  useMLPrediction()

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <PredictionCard />
          <RiskRadarChart />
        </div>
      </div>
      <Pricing />
      <CTA />
      <Footer />
      <PredictionBanner />
    </>
  )
}
