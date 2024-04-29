const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const annualRecordSchema = new Schema({
  establishment: {
    type: Schema.Types.ObjectId,
    ref: 'Establishment',
    required: true
  },
  year: { type: Number, required: true },
  listType: { type: String, enum: ['Positive', 'Negative'], required: true },
  inspectionDate: { type: Date, required: true },
  // Fields for positive type, required only if listType is 'Positive'
  registrationDate: { type: Date, required: function() { return this.listType === 'Positive'; } },
  orNumber: { type: String, required: function() { return this.listType === 'Positive'; } },
  certificationAmount: { type: Number, required: function() { return this.listType === 'Positive'; } },
  releaseDate: { type: Date, required: function() { return this.listType === 'Positive'; } },
  certificationStatus: { type: String, required: function() { return this.listType === 'Positive'; } },
  // Field for negative type, required only if listType is 'Negative'
  defectsDeficiencies: { type: String, required: function() { return this.listType === 'Negative'; } },
});

const AnnualRecord = mongoose.model('AnnualRecord', annualRecordSchema);
module.exports = AnnualRecord;

