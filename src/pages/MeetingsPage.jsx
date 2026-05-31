/**
 * MeetingsPage.jsx v5
 * ─────────────────────────────────────────────────────────────
 * Änderungen:
 *   - tasks wird an MeetingDetail weitergegeben
 *   - PDF-Export kann dadurch Meeting-Aufgaben verwenden
 *   - Fehler behoben: MeetingDetail statt MeetingsPage innerhalb der Seite
 */

import { useState } from 'react';
import { LayoutList, CalendarDays, Plus } from 'lucide-react';
import MeetingList from '../components/meetings/MeetingList.jsx';
import MeetingDetail from '../components/meetings/MeetingDetail.jsx';
import MeetingCalendar from '../components/meetings/MeetingCalendar.jsx';
import MeetingModal from '../components/meetings/MeetingModal.jsx';

export default function MeetingsPage({
                                       meetings,
                                       tasks = [],
                                       selectedMeeting,
                                       loadingDetail,
                                       analyzing,
                                       onSelectMeeting,
                                       onCreateMeeting,
                                       onUpdateMeeting,
                                       onDeleteMeeting,
                                       onAnalyze,
                                     }) {
  const [activeView, setActiveView] = useState('list');
  const [modalConfig, setModalConfig] = useState(null);

  function openCreateModal(initialDate = null) {
    setModalConfig({
      mode: 'create',
      initialDate,
      meeting: null,
    });
  }

  function openEditModal(meeting) {
    setModalConfig({
      mode: 'edit',
      initialDate: null,
      meeting,
    });
  }

  function closeModal() {
    setModalConfig(null);
  }

  async function handleModalSave(formData) {
    if (modalConfig.mode === 'create') {
      await onCreateMeeting(formData);
    } else {
      await onUpdateMeeting(modalConfig.meeting.id, formData);
    }

    closeModal();
  }

  function handleCalendarMeetingClick(meetingId) {
    setActiveView('list');
    onSelectMeeting(meetingId);
  }

  return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 flex items-start justify-between gap-4 px-7 pt-6 pb-4 border-b border-[#E5EAF0] bg-white">
          <div>
            <p className="text-[10.5px] font-bold text-[#1E6FB5] uppercase tracking-[0.12em] mb-1">
              Meetings
            </p>

            <h1 className="text-[19px] font-bold text-[#111827] tracking-tight leading-tight">
              Meeting Workspace
            </h1>

            <p className="text-[12px] text-[#64748B] mt-0.5">
              Verwalte Protokolle, Termine, Transkriptionen und KI-Analysen an einem Ort.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0 pt-0.5">
            <div className="flex items-center bg-[#F5F7FA] border border-[#E5EAF0] rounded-lg p-0.5">
              <ViewTab
                  icon={LayoutList}
                  label="Liste"
                  active={activeView === 'list'}
                  onClick={() => setActiveView('list')}
              />

              <ViewTab
                  icon={CalendarDays}
                  label="Kalender"
                  active={activeView === 'calendar'}
                  onClick={() => setActiveView('calendar')}
              />
            </div>

            <button
                onClick={() => openCreateModal()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold text-white hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(30,111,181,0.28)] transition-all duration-150"
                style={{ background: 'linear-gradient(135deg, #1E6FB5, #2B7EC7)' }}
            >
              <Plus size={13} strokeWidth={2.5} />
              Neues Meeting
            </button>
          </div>
        </header>

        {/* Inhalt */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'list' ? (
              <div className="flex h-full">
                <MeetingList
                    meetings={meetings}
                    selectedId={selectedMeeting?.id ?? null}
                    onSelect={onSelectMeeting}
                    onOpenCreate={openCreateModal}
                />

                <MeetingDetail
                    meeting={selectedMeeting}
                    tasks={tasks}
                    loading={loadingDetail}
                    analyzing={analyzing}
                    onAnalyze={onAnalyze}
                    onEdit={openEditModal}
                    onDelete={onDeleteMeeting}
                    onUpdate={onUpdateMeeting}
                    onOpenCreate={openCreateModal}
                />
              </div>
          ) : (
              <MeetingCalendar
                  meetings={meetings}
                  onSelectMeeting={handleCalendarMeetingClick}
                  onOpenCreate={openCreateModal}
              />
          )}
        </div>

        {/* Modal */}
        {modalConfig && (
            <MeetingModal
                mode={modalConfig.mode}
                initialDate={modalConfig.initialDate}
                meeting={modalConfig.meeting}
                onSave={handleModalSave}
                onClose={closeModal}
            />
        )}
      </div>
  );
}

function ViewTab({ icon: Icon, label, active, onClick }) {
  return (
      <button
          onClick={onClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150 ${
              active
                  ? 'bg-white text-[#111827] shadow-sm border border-[#E5EAF0]'
                  : 'text-[#64748B] hover:text-[#111827]'
          }`}
      >
        <Icon size={13} strokeWidth={2} />
        {label}
      </button>
  );
}