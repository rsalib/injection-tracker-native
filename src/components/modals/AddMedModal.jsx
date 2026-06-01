import React from 'react';
import { EMPTY_MED } from '../../constants.js';
import { MedForm } from './MedForm.jsx';

export function AddMedModal({ onClose, onSave }) {
  return <MedForm title="Add Medication / Protocol" initial={EMPTY_MED} onSave={onSave} onClose={onClose} />;
}

export default AddMedModal;
