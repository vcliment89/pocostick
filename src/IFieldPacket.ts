export interface IFieldPacket {
    catalog: string;
    charsetNr: number;
    db: string;
    decimals: number;
    default: any;
    flags: number;
    length: number;
    name: string;
    orgName: string;
    protocol41: boolean;
    table: string;
    type: number;
    zeroFill: boolean;
}