import { createLogger, format, transports } from 'winston';

import { Config } from '.';

const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} ${label} [${level}]: ${message}`; // LOG FORMAT
});

// Console format (with colors)
const consoleFormat = combine(
    format.colorize(),
    label({ label: 'DEV' }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    myFormat,
);

// File format (without colors)
const fileFormat = combine(
    label({ label: 'DEV' }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json(),
);

const logger = createLogger({
    level: 'info',
    defaultMeta: {
        serviceName: 'auth-service',
    },
    transports: [
        new transports.File({
            dirname: 'logs',
            filename: 'combined.log',
            level: 'info',
            silent: Config.NODE_ENV === 'test',
            format: fileFormat,
        }),
        new transports.File({
            dirname: 'logs',
            filename: 'error.log',
            level: 'error',
            silent: Config.NODE_ENV === 'test',
            format: fileFormat,
        }),
        new transports.Console({
            level: 'info',
            silent: Config.NODE_ENV === 'test',
            format: consoleFormat,
        }),
    ],
});

export default logger;
