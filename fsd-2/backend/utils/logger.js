const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = {
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] INFO: ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
    console.log(logEntry.trim());
    fs.appendFileSync(path.join(logDir, 'app.log'), logEntry);
  },
  
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ERROR: ${message}${error ? ' ' + error.stack : ''}\n`;
    console.error(logEntry.trim());
    fs.appendFileSync(path.join(logDir, 'error.log'), logEntry);
  },
  
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] WARN: ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
    console.warn(logEntry.trim());
    fs.appendFileSync(path.join(logDir, 'app.log'), logEntry);
  }
};

module.exports = logger;