export class Log {
    constructor(
        public id: number,
        public tableName: string,
        public operation: string,
        public oldData: Record<string, unknown> | null,
        public newData: Record<string, unknown> | null,
        public changedBy: string,
        public changedAt: string
    ) {}
}
