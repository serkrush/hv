import getConfig from "next/config";
import BaseClientContext from "./di/baseClientContext";
import * as actionTypes from '@/store/types/actionTypes';

const TICK_TIME = 500;

const {
    publicRuntimeConfig: {HASH_CLEANER_WORKING_INTERVAL, OUT_OF_DATE_HASH_TIME},
} = getConfig();

interface Task {
    id: string;
    interval: number;
    lastRun: number;
    callback: () => void;
}
export default class JobHandler extends BaseClientContext {
    private isStarted: boolean;

    private tickTimeout?: NodeJS.Timeout;

    private tasks: Task[];

    constructor(opts: any) {
        super(opts);
        this.isStarted = false;
        this.tasks = [];
        this.addTask(
            'hashCleaner',
            HASH_CLEANER_WORKING_INTERVAL,
            this.hashCleaner.bind(this),
        );
    }

    public start = () => {
        if (typeof document !== 'undefined' && !this.isStarted) {
            this.tickTimeout = setInterval(this.tick, TICK_TIME);
        }
    };

    public stop = () => {
        this.isStarted = false;
        clearTimeout(this.tickTimeout);
    };

    public addTask = (id: string, interval: number, callback: () => void) => {
        this.tasks.push({
            id,
            interval,
            lastRun: Date.now(),
            callback,
        });
    };

    private tick = () => {
        const currentTime = Date.now();

        this.tasks.forEach((task) => {
            if (currentTime - task.lastRun >= task.interval) {
                task.callback();
                task.lastRun = currentTime;
            }
        });
    };

    // ------------------ tasks implementations ---------------------------
    private hashCleaner() {
        const {redux} = this.di;
        redux.dispatch(actionTypes.clearOutOfDate(OUT_OF_DATE_HASH_TIME));
    }

}
