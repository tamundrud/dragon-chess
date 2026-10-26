import base from '../playwright.config.js';
const executablePath = process.env.DRAGON_CHESS_CHROMIUM;
export default {
  ...base,
  testDir: '.',
  testMatch: 'fireworm_continuity_record.js',
  projects: base.projects.map(project => ({...project, use: {...project.use,
    launchOptions: executablePath ? {executablePath} : undefined}})),
};
