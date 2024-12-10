/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import winston, { createLogger, transports, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import moment from 'moment-timezone';
import BaseContext from './di/BaseContext';
import IContextContainer from './di/interfaces/IContextContainer';

const { combine, timestamp, printf, colorize } = format;

export default class Logger extends BaseContext {
    private logger: winston.Logger;

    constructor(opts: IContextContainer) {
        super(opts);
        this.formatTimestamp = this.formatTimestamp.bind(this);
        this.logger = createLogger({
            level: 'debug',
            format: combine(
                timestamp({ format: this.formatTimestamp }),
                printf(
                    ({ level, message, timestamp }) =>
                        `${timestamp} ${level[0].toUpperCase()} ${message}`,
                ),
            ),
            defaultMeta: { service: 'user-service' },
            transports: [
                new DailyRotateFile({
                    filename: 'error-%DATE%.log',
                    level: 'error',
                    dirname: `${this.di.config.logger.dirPath}/error`,
                    datePattern: 'YYYY-MM-DD', // This will create a new log file daily
                    zippedArchive: true, // Optionally compress older log files
                    maxSize: '20m', // Maximum file size
                    maxFiles: '7d', // Retain logs for 7 days
                }),
                new DailyRotateFile({
                    filename: 'info-%DATE%.log',
                    level: 'info',
                    dirname: `${this.di.config.logger.dirPath}/info`,
                    datePattern: 'YYYY-MM-DD', // This will create a new log file daily
                    zippedArchive: true, // Optionally compress older log files
                    maxSize: '20m', // Maximum file size
                    maxFiles: '7d', // Retain logs for 7 days
                }),
            ],
        });
        // if (config.isDev || true) {
        if (true) {
            this.logger.add(
                new transports.Console({
                    format: combine(
                        timestamp({ format: this.formatTimestamp }),
                        printf(
                            ({ level, message, timestamp }) =>
                                `${timestamp} ${level[0].toUpperCase()} ${message}`,
                        ),
                        colorize({ all: true }),
                    ),
                }),
            );
        }
    }

    private formatTimestamp() {
        return moment()
            .tz(this.di.config.logger.timezone)
            .format('HH:mm:ss:SSS');
    }

    private getFuncFromStack(line: number = 3): string {
        const regex = /at\s*([\w\.]*).*\/([\w\.]*)\:(\d+)\:\d+.*/gm;
        const subst = `[$1:$2:$3]`;
        const err = new Error();
        const stack = (err.stack ?? '')
            .split('\n')
            .map((line) => line?.trim().replace(regex, subst));
        return stack[line];
    }

    public info = (message: string | object, callStack = false, line = 3) => {
        if(callStack) {
            this.logger.info(`${this.getFuncFromStack(line)} ${message}`);
        }
        else {
            this.logger.info(`${message}`);
        }
    }
        

    public debug = (message: string | object, callStack = false, line = 3) => {
        if(callStack) {
            this.logger.debug(`${this.getFuncFromStack(line)} ${message}`);
        }
        else {
            this.logger.debug(`${message}`);
        }
    }

    public warn = (message: string | object, callStack = false, line = 3) => {
        if(callStack) {
            this.logger.warn(`${this.getFuncFromStack(line)} ${message}`);
        }
        else {
            this.logger.warn(`${message}`);
        }
    }

    public error = (message: string | object, callStack = false, line = 3) => {
        if(callStack) {
            this.logger.error(`${this.getFuncFromStack(line)} ${message}`);
        }
        else {
            this.logger.error(`${message}`);
        }
    }

    // private truncateId(id: any) {
    //     return id.toString().substring(19);
    // }

    private createTable(
        obj:
            | Record<string, string | number>
            | Record<string, string | number>[],
        headers: {
            [header: string]:
                | string
                | number
                | { label?: string; size?: number };
        } = {},
        message: string = '',
    ) {
        const data = Array.isArray(obj) ? obj : [obj];
        const defaultSize = 15;
        const labels: string[] = [];
        const sizes: number[] = [];

        for (const key in data[0]) {
            const headerValue = headers?.[key];
            if (typeof headerValue === 'string') {
                labels.push(headerValue);
                sizes.push(defaultSize);
            } else if (typeof headerValue === 'number') {
                labels.push(key);
                sizes.push(headerValue);
            } else {
                labels.push(headerValue?.label || key);
                sizes.push(headerValue?.size || defaultSize);
            }
        }
        const labelSize = labels.map((label, i) => {
            return { label, size: sizes[i] };
        });
        let topLine = '┌';
        let middleLine = '├';
        let bottomLine = '└';
        const title = labelSize.reduce((row, item) => {
            topLine += `${'─'.repeat(item.size)}┬`;
            middleLine += `${'─'.repeat(item.size)}┼`;
            bottomLine += `${'─'.repeat(item.size)}┴`;
            // eslint-disable-next-line no-param-reassign
            row += `${truncate(item.label, item.size).padEnd(item.size)}│`;
            return row;
        }, '│');
        let table = `${message}\n${topLine.replace(
            /.$/,
            '┐',
        )}\n${title}\n${middleLine.replace(/.$/, '┤')}`;

        function truncate(str: string, size: number) {
            return str.length > size ? `${str.substring(0, size - 2)}..` : str;
        }

        for (const obj of data) {
            let count = 0;
            table += '\n│';
            for (const key in obj) {
                table += `${truncate(
                    obj[key] !== undefined && obj[key] !== null
                        ? obj[key].toString()
                        : '-',
                    sizes[count],
                ).padEnd(sizes[count])}│`;
                count++;
            }
        }
        return `${table}\n${bottomLine.replace(/.$/, '┘')}`;
    }

    private createKeyValue(
        obj: Record<string, { toString: () => string } | null | undefined>,
        opts?: { message?: string; keySize?: number; valSize?: number },
    ) {
        const message = opts?.message || '';
        const keySize = opts?.keySize || 15;
        const valSize = opts?.valSize || 25;

        const topLine = `┌${'─'.repeat(keySize)}┬${'─'.repeat(valSize)}┐`;
        const bottomLine = `└${'─'.repeat(keySize)}┴${'─'.repeat(valSize)}┘`;
        let result = `${message}\n${topLine}\n`;
        for (const key in obj) {
            result += `│${key.padEnd(keySize)}│${
                obj[key] === undefined || obj[key] === null
                    ? '-'.padEnd(valSize)
                    : obj[key].toString().padEnd(valSize)
            }│\n`;
        }
        result += bottomLine;
        return result;
    }

    public formatTime(timestamp: number) {
        return moment
            .tz(timestamp, this.di.config.logger.timezone)
            .format('HH:mm:ss:SSS');
    }

    public formatTimeDelta(timestamp: number) {
        return moment(timestamp).format('HH:mm:ss:SSS');
    }

    public formatDateTime(timestamp?: number) {
        const date = new Date(timestamp ?? Date.now());
        return moment
            .tz(date, this.di.config.logger.timezone)
            .format('MMM DD HH:mm');
    }

    public table(
        obj:
            | Record<string, string | number>
            | Record<string, string | number>[],
        headers: {
            [header: string]:
                | string
                | number
                | { label?: string; size?: number };
        } = {},
        message: string = '',
        line = 4,
    ) {
        const table = this.createTable(obj, headers, message);
        return this.info(table, true, line);
    }

    public keyValue(
        obj: Record<string, { toString: () => string } | null | undefined>,
        opts?: {
            message?: string;
            keySize?: number;
            valSize?: number;
            line?: number;
        },
    ) {
        const result = this.createKeyValue(obj, opts);
        this.info(result);
    }

    public errorController(endpoint: string, message: string, type: string = "SSR") {
        this.error(type + ": " + message, true, 4);
        this.error(endpoint)
    }

    public mailerError(title:string, message: string) {
        this.error(title + ": " + message);
    }
    

    // public cycleEvent(eventName: string, cs?: ICycleState) {
    //     this.info(eventName);
    //     if (cs) {
    //         this.showCycleState(cs);
    //     } else {
    //         this.info(eventName);
    //     }
    // }

    // public event(eventName: string, params?: Record<string, string | number>) {
    //     if (params) {
    //         this.keyValue(params as any, {
    //             keySize: 20,
    //             valSize: 40,
    //             message: eventName,
    //             line: 3,
    //         });
    //     } else {
    //         this.info(eventName);
    //     }
    // }

    // public cycleError(errorMessage: string, cs?: ICycleState) {
    //     this.error(errorMessage);
    //     if (cs) {
    //         this.showCycleState(cs);
    //     }
    // }

    // public diagnosticStepPassed(stepName: string, cs: ICycleState) {
    //     this.info(`DIAGNOSTIC: passed step: ${stepName}`);
    //     if (cs) {
    //         this.showCycleState(cs);
    //     }
    // }

    // public diagnosticFailedOnStep(
    //     stepName: string,
    //     message: string,
    //     cs: ICycleState,
    // ) {
    //     this.error(`DIAGNOSTIC: failed on step: ${stepName}`);
    //     this.error(`Error: ${message}`);
    //     if (cs) {
    //         this.showCycleState(cs);
    //     }
    // }

    // public diagnosticPassedSuccess() {
    //     this.info(`DIAGNOSTIC: passed successfully`, 4);
    // }

    // public showCycleState(cs: ICycleState) {
    //     const { params, state, ...showingValues } = cs;
    //     this.keyValue(
    //         {
    //             ...showingValues,
    //             timestamp: this.formatTime(showingValues.timestamp),
    //         },
    //         {
    //             keySize: 20,
    //             valSize: 40,
    //             line: 3,
    //         },
    //     );
    //     if (params) {
    //         const tableParams = this.createTable(
    //             params as any,
    //             {},
    //             'Zone params',
    //         );
    //         this.info(tableParams);
    //     }
    //     if (state) {
    //         this.keyValue(state as any, {
    //             message: 'Zone state',
    //             keySize: 20,
    //             valSize: 40,
    //             line: 3,
    //         });
    //         // const zoneState = this.createTable(state as any, {}, 'Zone state');
    //         // this.info(zoneState);
    //     }
    // }

    // public event(event: EventSchema, message = 'Event table') {
    //     const eventTable = this.createKeyValue(
    //         {
    //             id: this.truncateId(event._id),
    //             eventName: event.eventName,
    //             status: event.status,
    //             start: this.formatDateTime(event.startTime),
    //             test: event.testMode ? 'yes' : 'no',
    //             payment: event.isCheckRequired ? 'yes' : 'no',
    //             companyId: this.truncateId(event.companyID),
    //             startReg: this.formatDateTime(event.startRegistration),
    //             startAward: this.formatDateTime(event.startAwards),
    //         },
    //         { message },
    //     );
    //     const eventStages = event.stages.reduce((acc, stage) => {
    //         acc.push({
    //             id: this.truncateId(stage._id),
    //             stageName: stage.stageName,
    //             status: stage.status,
    //             start: this.formatDateTime(stage.startTime),
    //             delay: `${stage.delay} min`,
    //             catDelay: `${stage.categoryDelay} min`,
    //             ignoreResults: stage.ignoreResults ? 'yes' : 'no',
    //             massStart: stage.massStart ? 'yes' : 'no',
    //         });
    //         return acc;
    //     }, []);
    //     const stagesTable = this.createTable(eventStages, {
    //         id: 5,
    //         stageName: {
    //             label: 'stage name',
    //             size: 10,
    //         },
    //         ignoreResults: {
    //             label: '🥕',
    //             size: 3,
    //         },
    //         massStart: {
    //             label: 'M',
    //             size: 3,
    //         },
    //         start: 12,
    //         status: 8,
    //         delay: 6,
    //         catDelay: 8,
    //     });
    //     return this.info(eventTable + stagesTable, 4);
    // }

    // public athlete(
    //     athleteData: AthleteSchema | AthleteSchema[],
    //     message = 'Athlete table:',
    // ) {
    //     if (!Array.isArray(athleteData) || athleteData.length === 1) {
    //         const athlete = Array.isArray(athleteData)
    //             ? athleteData[0]
    //             : athleteData;
    //         return this.keyValue(
    //             {
    //                 id: this.truncateId(athlete._id),
    //                 number: athlete.number,
    //                 order: athlete.order,
    //                 rfid: athlete.rfid,
    //                 place: athlete.place,
    //                 status: athlete.status,
    //             },
    //             { message, keySize: 6, valSize: 10, line: 5 },
    //         );
    //     }
    //     const athletes = athleteData;
    //     const athleteHeaders = {
    //         id: 5,
    //         number: {
    //             label: '№',
    //             size: 4,
    //         },
    //         rfid: 10,
    //         place: 5,
    //         order: 5,
    //         status: 10,
    //     };

    //     const athletesJson = athletes.reduce((acc, athlete) => {
    //         acc.push({
    //             id: this.truncateId(athlete._id),
    //             number: athlete.number,
    //             order: athlete.order,
    //             rfid: athlete.rfid,
    //             place: athlete.place,
    //             status: athlete.status,
    //         });
    //         return acc;
    //     }, []);

    //     return this.table(athletesJson, athleteHeaders, message, 5);
    // }

    // public user(user: UserSchema, message = 'User table:') {
    //     this.keyValue(
    //         {
    //             id: this.truncateId(user._id),
    //             firstName: user.firstName,
    //             lastName: user.lastName,
    //             email: user.userEmail,
    //             gender: user.gender,
    //             phone: user.phone,
    //             role: user.role,
    //         },
    //         {
    //             keySize: 10,
    //             valSize: 15,
    //             message,
    //             line: 5,
    //         },
    //     );
    // }

    // public eventStage(
    //     stageData: stageType | stageType[number],
    //     message = 'Stage table:',
    // ) {
    //     const stages = Array.isArray(stageData) ? stageData : [stageData];
    //     const stageHeaders = {
    //         id: 5,
    //         stageName: {
    //             label: 'stage name',
    //             size: 10,
    //         },
    //         ignoreResults: {
    //             label: '🥕',
    //             size: 3,
    //         },
    //         start: 12,
    //         finish: 12,
    //         delay: 6,
    //         catDelay: 8,
    //         status: 8,
    //     };
    //     const stageJsons = stages.reduce((acc, stage) => {
    //         acc.push({
    //             id: this.truncateId(stage._id),
    //             stageName: stage.stageName,
    //             status: stage.status,
    //             start: this.formatDateTime(stage.startTime),
    //             finish: stage.finishTime
    //                 ? this.formatDateTime(stage.finishTime)
    //                 : '-',
    //             delay: `${stage.delay} min`,
    //             catDelay: `${stage.categoryDelay} min`,
    //             ignoreResults: stage.ignoreResults ? 'yes' : 'no',
    //         });
    //         return acc;
    //     }, []);
    //     this.table(stageJsons, stageHeaders, message, 5);
    // }

    // public athleteQueue(queue: any[], message = 'Athletes queue:') {
    //     const athletes = queue.reduce((acc, athlete) => {
    //         acc.push({
    //             lastName: athlete.lastName,
    //             number: athlete.number,
    //             falseStart: athlete.falseStart,
    //             caOrder: athlete?.caOrder,
    //             status: athlete?.status,
    //             cOrder: athlete?.cOrder,
    //             aOrder: athlete?.aOrder,
    //             planStart: moment(athlete?.planStartTime).format('HH:mm:ss'),
    //             start: athlete?.results.startTime
    //                 ? moment(athlete?.results.startTime).format('HH:mm:ss.SSS')
    //                 : 0,
    //             finish: athlete?.results.endTime
    //                 ? moment(athlete?.results.endTime).format('HH:mm:ss.SSS')
    //                 : 0,
    //             state: athlete?.results.duration
    //                 ? 'finished'
    //                 : athlete?.results.startTime
    //                   ? 'started'
    //                     : 'not started',
    //         });
    //         return acc;
    //     }, []);
    //     this.table(
    //         athletes,
    //         {
    //             lastName: { label: 'Last name', size: 10 },
    //             number: {
    //                 label: '№',
    //                 size: 4,
    //             },
    //             falseStart: {
    //                 label: 'FS',
    //                 size: 5,
    //             },
    //             caOrder: 7,
    //             aOrder: 6,
    //             cOrder: 6,
    //             planStart: 10,
    //         },
    //         message,
    //         5,
    //     );
    // }

    // public athleteView(athleteViews: AthleteViewType[], message?: string) {
    //     const eventName = athleteViews[0]?.eventName;
    //     const eventStatus = athleteViews[0]?.eventStatus;

    //     const views = athleteViews.reduce((acc, view) => {
    //         acc.push({
    //             id: this.truncateId(view._id),
    //             firstName: view.firstName,
    //             lastName: view.lastName,
    //             category: view.categoryName,
    //             status: view.status,
    //             rfid: view.rfid,
    //             number: view.number,
    //             order: view.order,
    //             place: view.place,
    //             exclude: view.exclude ? 'yes' : 'no',
    //             phone: view.phone,
    //             totalDuration: view.totalDuration,
    //         });
    //         return acc;
    //     }, []);
    //     this.table(
    //         views,
    //         {
    //             id: 5,
    //             firstName: 'first name',
    //             lastName: 'last name',
    //             category: 10,
    //             status: 'status',
    //             rfid: 10,
    //             number: {
    //                 label: '№',
    //                 size: 4,
    //             },
    //             order: 5,
    //             place: 5,
    //             exclude: 7,
    //             totalDuration: 'total duration',
    //         },
    //         message ||
    //             `Athlete views by event: ${eventName} with status: ${eventStatus}`,
    //         5,
    //     );
    // }

    // public company(company: any, message = 'Company table:') {
    //     this.keyValue(
    //         {
    //             id: this.truncateId(company._id),
    //             name: company.companyName,
    //             email: company.email,
    //             phone: company.phone,
    //             bot: company.telegramManageBot,
    //             tgGroup: company.telegramBot, // looks strange, but should be right.
    //             site: company.site,
    //             botActive: company.botWork ? 'yes' : 'no',
    //         },
    //         {
    //             keySize: 10,
    //             valSize: 30,
    //             message,
    //             line: 5,
    //         },
    //     );
    // }

    // public athleteStages(
    //     athletes: AthleteSchema[],
    //     message = 'Athlete table:',
    // ) {
    //     const athleteHeaders = {
    //         id: 5,
    //         number: {
    //             label: '№',
    //             size: 4,
    //         },
    //         rfid: 10,
    //         place: 5,
    //         order: 5,
    //         status: 10,
    //     };

    //     if (!athletes[0].stages?.length) {
    //         return null;
    //     }
    //     const athleteTables = athletes.reduce((acc, athlete) => {
    //         acc.push(
    //             this.createTable(
    //                 athlete.stages.reduce((stageAcc, stage) => {
    //                     stageAcc.push({
    //                         id: this.truncateId(stage._id.toString()),
    //                         number: athlete.number,
    //                         status: stage.status,
    //                         caOrder: stage.caOrder,
    //                         falseStart: stage.falseStart,
    //                     });
    //                     return stageAcc;
    //                 }, []),
    //                 {
    //                     id: 5,
    //                     caOrder: 10,
    //                     falseStart: 10,
    //                 },
    //             ),
    //         );
    //         return acc;
    //     }, []);

    //     this.info(message + athleteTables.join(''), 4);
    // }

    // public swapOrder(athletesBefore, athletesAfter) {
    //     const message = athletesBefore.reduce((acc, athlete) => {
    //         acc += `Athlete ${athlete.number} changed order from ${
    //             athlete.order
    //         } to ${
    //             athletesAfter.find(
    //                 (a) => a._id.toString() === athlete._id.toString(),
    //             )?.order
    //         }; `;
    //         return acc;
    //     }, '');
    //     this.athleteStages(athletesAfter, message);
    //     // const athletes = athletesBefore
    // }

    // public tgSession(session: ITSession, message: string) {
    //     this.keyValue(
    //         {
    //             action: session.action,
    //             eventSlug: session.eventSlug,
    //             category: session.category,
    //             user_id: session.user_id,
    //             first_name: session.first_name,
    //             last_name: session.last_name,
    //             phone_number: session.phone_number,
    //             gender: session.gender,
    //             isReceiptRequired: session.isReceiptRequired ? 'Yes' : 'No',
    //         },
    //         { message, keySize: 20, valSize: 20, line: 5 },
    //     );
    // }

    // public athletesWithFirstStage(
    //     athleteData: AthleteSchema | AthleteSchema[],
    //     message = 'Athlete table:',
    // ) {
    //     if (!Array.isArray(athleteData) || athleteData.length === 1) {
    //         const athlete = Array.isArray(athleteData)
    //             ? athleteData[0]
    //             : athleteData;
    //         return this.keyValue(
    //             {
    //                 id: this.truncateId(athlete._id),
    //                 number: athlete.number,
    //                 order: athlete.order,
    //                 rfid: athlete.rfid,
    //                 place: athlete.place,
    //                 status: athlete.status,
    //                 stStatus: athlete.stages[0]?.status,
    //                 caOrder: athlete.stages[0]?.caOrder,
    //             },
    //             { message, keySize: 6, valSize: 15, line: 5 },
    //         );
    //     }
    //     const athletes = athleteData;
    //     const athleteHeaders = {
    //         id: 5,
    //         number: {
    //             label: '№',
    //             size: 4,
    //         },
    //         rfid: 10,
    //         place: 5,
    //         order: 5,
    //         status: 10,
    //         stStatus: 10,
    //         caOrder: 7,
    //     };
    //     const StageStatuses = {
    //         'next-athlete': 'next',
    //         'first-stage': 'stage',
    //         'first-category': 'category',
    //     } as const;
    //     const athletesJson = athletes.reduce((acc, athlete) => {
    //         acc.push({
    //             id: this.truncateId(athlete._id),
    //             number: athlete.number,
    //             order: athlete.order,
    //             rfid: athlete.rfid,
    //             place: athlete.place,
    //             status: athlete.status,
    //             stStatus: StageStatuses[athlete.stages[0]?.status],
    //             caOrder: athlete.stages[0]?.caOrder,
    //         });
    //         return acc;
    //     }, []);

    //     return this.table(athletesJson, athleteHeaders, message, 5);
    // }

    // public athleteStart(
    //     athlete: AthleteSchema,
    //     startTime: number,
    //     message: string,
    // ) {
    //     this.keyValue(
    //         {
    //             athleteId: athlete._id,
    //             number: athlete.number,
    //             rfid: athlete.rfid,
    //             'start time': this.formatTime(startTime),
    //         },
    //         { message, keySize: 10, valSize: 25, line: 5 },
    //     );
    // }

    // public athleteFinish(
    //     athlete: AthleteSchema,
    //     startTime: number,
    //     endTime: number,
    //     message: string,
    // ) {
    //     this.keyValue(
    //         {
    //             athleteId: athlete._id,
    //             number: athlete.number,
    //             rfid: athlete.rfid,
    //             'start time': this.formatTime(startTime),
    //             'finish time': this.formatTime(endTime),
    //             duration: this.formatTimeDelta(endTime - startTime),
    //         },
    //         { message, keySize: 15, valSize: 25, line: 5 },
    //     );
    // }

    // public pause(pause: {
    //     uuid: string;
    //     eventId: string;
    //     stageId: string | Ref<EventStage>;
    //     pause: number;
    //     pausedAt: number;
    //     pausedStartAt: number;
    // }) {
    //     const { eventId } = pause;
    //     const { stageId } = pause;

    //     if (this.useDb) {
    //         this.di.EventService.findById(pause.eventId).then((event) => {
    //             const stage = event.stages.find(
    //                 (stage) =>
    //                     stage._id.toString() === pause.stageId.toString(),
    //             );
    //             if (pause.pausedAt) {
    //                 this.info(
    //                     `Started pause for event "${event.eventName}", stage "${stage.stageName}"`,
    //                     4,
    //                 );
    //             } else {
    //                 this.info(
    //                     `Removed pause for event "${event.eventName}", stage "${stage.stageName}"`,
    //                     4,
    //                 );
    //             }
    //         });
    //     } else if (pause.pausedAt) {
    //         this.info(
    //             `Created pause for event with id "${eventId}", stage with id "${stageId}"`,
    //             4,
    //         );
    //     } else {
    //         this.info(
    //             `Removed pause for event with id "${eventId}", stage with id "${stageId}"`,
    //             4,
    //         );
    //     }
    // }
}
