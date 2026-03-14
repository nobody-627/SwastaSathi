import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import MedicationCard from '../components/medications/MedicationCard'
import MedicationModal from '../components/medications/MedicationModal'
import ReminderBanner from '../components/medications/ReminderBanner'
import TodaySchedule from '../components/medications/TodaySchedule'
import { useMedicationStore } from '../store/medicationStore'

export default function Medications() {
  const {
    medications,
    loadMedications,
    addMedication,
    updateMedication,
    deleteMedication,
    markTaken,
  } = useMedicationStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    loadMedications()
  }, [loadMedications])

  const onSave = async (data) => {
    if (editing) {
      await updateMedication(editing.id, data)
    } else {
      await addMedication(data)
    }
    setModalOpen(false)
    setEditing(null)
  }

  const onToggleActive = async (med) => {
    await updateMedication(med.id, { active: !med.active })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ReminderBanner />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.06em] text-slate-400">Adherence</p>
            <h1 className="text-3xl font-bold text-slate-900">Medication Reminders</h1>
            <p className="text-sm text-slate-500">Manage daily doses, times, and instructions.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 shadow-[0_4px_12px_rgba(244,63,94,0.3)] flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Medication
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
          <div className="space-y-4">
            {medications.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500">
                No medications yet. Add your first reminder to stay on track.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medications.map((med) => (
                  <MedicationCard
                    key={med.id}
                    medication={med}
                    onEdit={(m) => { setEditing(m); setModalOpen(true) }}
                    onDelete={deleteMedication}
                    onToggleActive={onToggleActive}
                    onMarkTaken={markTaken}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <TodaySchedule />
          </div>
        </div>
      </div>

      <MedicationModal
        open={modalOpen}
        initial={editing}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSave={onSave}
      />
    </div>
  )
}
