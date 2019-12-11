import { CrownDbObj } from "../CrownsDAO";
import { getPeakRef } from "../PeaksDAO";
import Peak from "./Peak";

export default class Crown {
    id: string;
    name: string;
    peaks: Peak[] = [];

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    async toCrownDao() {
        const { name, peaks: peaksList } = this;
        const peakRefs = await Promise.all(peaksList.map(getPeakRef));
        const peakDao: CrownDbObj = {
            name,
            peaks: peakRefs,
        }
        return peakDao;
    }

}