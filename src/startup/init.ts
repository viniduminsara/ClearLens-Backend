import {Express} from 'express';
import mongooseConnect from '../databases/mongodb';
import {cliLoggerService} from '../services/logger/cli-logger.service';
import {ErrorMessages} from '../shared/enums/messages/error-messages.enum';
import {InfoMessages} from '../shared/enums/messages/info-messages.enum';
import {SpecialMessages} from '../shared/enums/messages/special-messages.enum';
import {exceptionLogWrapper} from '../shared/helpers/exception-log-wrapper.helper';

const appSetup = async (app: Express) => {
    try {
        const PORT = Number(process.env.PORT) || 3000;

        app.listen(PORT, () => {
            cliLoggerService.info(`Server started on port ${PORT}`);
        });
        await Promise.all([mongooseConnect()]);
        cliLoggerService.info(InfoMessages.DatabasesConnected);
        cliLoggerService.info(SpecialMessages.DottedLine);
    } catch (error: unknown) {
        exceptionLogWrapper(error, ErrorMessages.AppStartupFail);
    }
};

export default appSetup;
