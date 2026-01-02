const mongoose = require('mongoose');
const ConfigSchema = new mongoose.Schema({
  url: String,
  wrapperSelector: String,
  selectors: mongoose.Schema.Types.Mixed // keys like title, company, etc.
});
module.exports = mongoose.model('Config', ConfigSchema);
