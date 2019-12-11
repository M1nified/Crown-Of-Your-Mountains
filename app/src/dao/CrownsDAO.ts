import { isNullOrUndefined } from 'util';
import firebase from './../firebase';
import Crown from './models/Crown';
import Peak from './models/Peak';
import { peakFromDocumentSnapshot } from './PeaksDAO';

const db = firebase.firestore();
const crownsCollection = db.collection('crowns');

export type CrownDbObj = {
    name: string,
    peaks: firebase.firestore.DocumentReference[],
}

export const crownFromDocumentSnapshot = async (doc: firebase.firestore.DocumentSnapshot) => {
    const data = doc.data();
    if (!data) return;
    const { name, peaks: peakRefs } = data;
    const crown = new Crown(doc.id, name);
    if(peakRefs){
        const peaksQSs: firebase.firestore.QueryDocumentSnapshot[] = await Promise.all(
            peakRefs.map((peak: any) => {
                const querySnapshot: Promise<firebase.firestore.QuerySnapshot> = peak.get();
                return querySnapshot;
            })
        );
        const peaks = peaksQSs.map(doc => peakFromDocumentSnapshot(doc));
        crown.peaks = peaks.filter(x => !isNullOrUndefined(x)) as Peak[];
    }else{
        crown.peaks = [];
    }
    return crown;
}

export const getCrownsAll = async () => {
    const querySnapshot = await crownsCollection.get();
    const crownPromieses = querySnapshot.docs.map(crownFromDocumentSnapshot);
    const crowns = (await Promise.all(crownPromieses)).filter(x => x instanceof Crown) as Crown[];
    return crowns;
}

export const postCrown = async (crown: CrownDbObj | Crown) => {
    try {
        if (crown instanceof Crown) {
            await crownsCollection.doc(crown.id).set(await crown.toCrownDao());
            return crown;
        } else {
            const crownToSend = { ...crown };
            const newCrownRef = await crownsCollection.add(crownToSend);
            const newCrown = crownFromDocumentSnapshot(await newCrownRef.get());
            return newCrown;
        }
    } catch (e) {
        console.error(e);
        return;
    }
}
