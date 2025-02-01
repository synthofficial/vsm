const API = "https://valorant-api.com/v1/";

export default async function GetPlayerCard(cardId: string) {
    const response = await fetch(`${API}playercards/${cardId}`, { mode: "cors" });
    return await response.json();
}

export async function GetWeaponSkin(skinId: string) {
    const response = await fetch(`${API}weapons/skinchromas/${skinId}`, { mode: "cors" });
    return await response.json();
}

export async function GetBuddy(buddyId: string) {
    const response = await fetch(`${API}buddies/${buddyId}`, { mode: "cors" });
    return await response.json();
}

export async function FetchLatestBan(penalties: {
    ID: string,
    Expiry: string,
    IssuingGameStartUnixMillis: number,
    QueueRestrictionEffect?: {
        QueueIDs: string[]
    }
}[]) {
    const queueRestrictions = penalties.filter(penalty => penalty.QueueRestrictionEffect);
    if (!queueRestrictions.length) return null;
    
    const latestBan = queueRestrictions.sort((a, b) => 
        new Date(b.Expiry).getTime() - new Date(a.Expiry).getTime()
    )[0];
    console.log(latestBan)
    
    return latestBan.QueueRestrictionEffect?.QueueIDs.includes("competitive") ? latestBan : null;
}

export async function GetRank(rankTier: number){
    const response = await fetch(`${API}competitivetiers/${rankTier}`, { mode: "cors" });
    return await response.json();
}