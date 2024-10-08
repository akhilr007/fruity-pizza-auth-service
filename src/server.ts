import app from './app';
import { Config } from './configs';
import { AppDataSource } from './configs/data-source';
import logger from './configs/logger';

const startServer = async () => {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();
        logger.info('Database is connected successfully');
        app.listen(PORT, () => logger.info(`Listening on PORT : ${PORT}`));
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
        }
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    }
};

startServer();
