import firebase from './../firebase';
import { getCrownsAll } from './CrownsDAO';
import { User, UserCrown, UserCrownsObj, VisitedPeak } from './models/User';
import { getPeakRef, getPeakForRef } from './PeaksDAO';
import { firestore } from 'firebase';

const db = firebase.firestore();
const usersCollection = db.collection('users');

export type UserDbObj = {

}

export type VisitedPeakDbObj = {
    peakRef: firebase.firestore.DocumentReference,
    visited: boolean,
    visitDate?: Date,
}

export const getCurrentUser = async () => {
    const { currentUser } = firebase.auth();
    if (!currentUser)
        return;
    const userId = currentUser.uid;
    try {
        const visitedPeakDaos = await usersCollection.doc(userId).collection('visitedPeaks').get()
            .then(collection => collection.docs.map(docRef => docRef.data())) as VisitedPeakDbObj[]
        const crowns = await getCrownsAll();
        const userCrownsObj: UserCrownsObj = {};
        const userCrowns = crowns.map(crown => {
            const visitedPeaks = crown.peaks.map(peak => {
                const visitedPeakDao = visitedPeakDaos.find(vpd => vpd.peakRef.id === peak.id && vpd.visited)
                if (visitedPeakDao) {
                    return {
                        peak,
                        visited: visitedPeakDao.visited,
                        visitDate: visitedPeakDao.visitDate,
                    } as VisitedPeak
                } else {
                    return undefined;
                }
            }).filter(x => x) as VisitedPeak[]
            return { crown, visitedPeaks } as UserCrown
        });
        userCrowns.forEach(userCrown => {
            userCrownsObj[userCrown.crown.id] = userCrown;
        })
        const visitedPeaks = (await Promise.all(visitedPeakDaos.map(async vpd => {
            try {
                const { visited, visitDate, peakRef } = vpd;
                const peak = await getPeakForRef(peakRef);
                return {
                    peak,
                    visited,
                    visitDate,
                } as VisitedPeak;
            } catch (err) {
                return undefined;
            }
        }))).filter(x => x) as VisitedPeak[];
        const user = new User();
        user.crowns = userCrownsObj;
        user.visitedPeaks = visitedPeaks;
        return user;
    } catch (err) {
        console.error(err);
        return;
    }
}

export const saveUser = async (user: User) => {
    try {
        const { currentUser } = firebase.auth();
        if (!currentUser)
            return;
        const userId = currentUser.uid;
        const userDocQs = await usersCollection.doc(userId).get();
        if (!userDocQs.exists) {
            await usersCollection.doc(userId).set({});
        }
        const vpCollection = usersCollection.doc(userId).collection('visitedPeaks');
        const vpUpdatePromises = user.visitedPeaks.map(async ({ peak, visited, visitDate }) => {
            const peakRef = await getPeakRef(peak);
            const vpQs = await vpCollection.where('peakRef', '==', peakRef).get()
            const newVpDbObj = {
                peakRef,
                visited,
            } as VisitedPeakDbObj;
            if (visitDate) {
                newVpDbObj.visitDate = visitDate;
            }
            if (vpQs.empty) {
                return await vpCollection.add(newVpDbObj);
            } else {
                const docId = vpQs.docs[0].id;
                return await vpCollection.doc(docId).set(newVpDbObj);
            }
        })
        await Promise.all(vpUpdatePromises);
    } catch (err) {
        console.error(err);
    }
}
