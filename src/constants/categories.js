export const PRESET_CATEGORIES = [
  { id: 'Development', name: 'Development', color: '#10b981', badgeClass: 'badge-dev' },
  { id: 'Communication', name: 'Communication', color: '#3b82f6', badgeClass: 'badge-comms' },
  { id: 'Productivity', name: 'Productivity', color: '#06b6d4', badgeClass: 'badge-prod' },
  { id: 'Media & Audio', name: 'Media & Audio', color: '#f43f5e', badgeClass: 'badge-media' },
  { id: 'Design & Creative', name: 'Design & Creative', color: '#a855f7', badgeClass: 'badge-design' },
  { id: 'General', name: 'General', color: '#64748b', badgeClass: 'badge-general' },
];

export const getCategoryColor = (categoryName) => {
  const found = PRESET_CATEGORIES.find(
    (c) => c.name.toLowerCase() === (categoryName || '').toLowerCase()
  );
  return found ? found.color : '#64748b';
};

export const inferDefaultCategory = (name = '') => {
  const n = name.toLowerCase();
  if (
    n.includes('code') ||
    n.includes('antigravity') ||
    n.includes('agy') ||
    n.includes('terminal') ||
    n.includes('powershell') ||
    n.includes('cmd') ||
    n.includes('github') ||
    n.includes('postman') ||
    n.includes('dbeaver') ||
    n.includes('sqldeveloper')
  ) {
    return 'Development';
  }
  if (
    n.includes('teams') ||
    n.includes('slack') ||
    n.includes('discord') ||
    n.includes('outlook') ||
    n.includes('mail') ||
    n.includes('gmail')
  ) {
    return 'Communication';
  }
  if (
    n.includes('openproject') ||
    n.includes('notion') ||
    n.includes('chatgpt') ||
    n.includes('claude') ||
    n.includes('trello') ||
    n.includes('linear') ||
    n.includes('jira') ||
    n.includes('excel') ||
    n.includes('docuflow')
  ) {
    return 'Productivity';
  }
  if (
    n.includes('music') ||
    n.includes('spotify') ||
    n.includes('youtube') ||
    n.includes('media') ||
    n.includes('stream') ||
    n.includes('sound')
  ) {
    return 'Media & Audio';
  }
  if (
    n.includes('figma') ||
    n.includes('canva') ||
    n.includes('photoshop') ||
    n.includes('illustrator') ||
    n.includes('design')
  ) {
    return 'Design & Creative';
  }
  return 'General';
};
