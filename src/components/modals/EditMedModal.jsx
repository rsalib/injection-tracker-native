import React from 'react';
import { EMPTY_MED, DAYS } from '../../constants.js';
import { MedForm } from './MedForm.jsx';

export function EditMedModal({ med, onClose, onSave, originElement }) {
  return (
    <MedForm
      title={`Edit: ${med.name}`}
      originElement={originElement}
      initial={{
        ...EMPTY_MED,
        ...med,
        vialTotal: String(med.vialTotal || ''),
        vialRemaining: String(med.vialRemaining || ''),
        bwAdded: String(med.bwAdded || ''),
        dose: String(med.dose || ''),
        scheduleDays: med.scheduleDays || DAYS,
        syringeMl: String(med.syringeMl || '1'),
        syringeUnits: String(med.syringeUnits || '100'),
        startDate: med.startDate || ''
      }}
      onSave={onSave}
      onClose={onClose}
    />
  );
}

export default EditMedModal;
