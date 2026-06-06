function buildUpdateContent(template, detail) {
  const value = detail || '15';

  switch (template) {
    case 'waiting':
      return `Waiting at ${detail || 'the selected'} bus stop`;
    case 'driver':
      return `Driver not arrived at ${detail || 'the selected'} bus stop`;
    case 'delay':
      return `Bus delay for ${value} minutes`;
    case 'arrived':
      return `Bus arrived at ${detail || 'the selected'} bus stop`;
    case 'general':
      return detail || 'General trip update';
    default:
      return 'Trip update';
  }
}

module.exports = {
  buildUpdateContent,
};
