export interface AccountProps{
    accountName : string,
    accountNumber : number,
    riotName : string,
    riotTag : string,
    region : string,
    lastUsed : string;
    ranked: {
        Version : number;
        Subject : string;
        Matches: {
            MatchID: string;
            MapID: string;
            SeasonID: string;
            MatchStartTime : number;
            TierAfterUpdate : number;
            TierBeforeUpdate : number;
            RankedRatingBeforeUpdate : number;
            RankedRatingAfterUpdate : number;
            RankedRatingEarned : number;
            AFKPenalty : number;
            WasDerankProtected : boolean;
        }[]
    };
    loadout: {
        Subject : string;
        Version : number;
        Guns: {
            ID : string;
            SkinID : string;
            SkinLevelID : string;
            ChromaID : string;
            CharmID? : string;
            CharmLevelID? : string;
            Attachments: {

            }[]
        }[];
        Sprays: {
            EquipSlotID : string;
            SprayID : string;
            SprayLevelID : string;
        }[]
        Identity: {
            PlayerCardID : string;
            PreferredLevelBorderID : string;
            PlayerTitleID : string;
            AccountLevel : number;
            HideAccountLevel : boolean;
        }
    };
    penalties: {
        Subject : string;
        Version : number;
        Penalties: {
            ID : string;
            Expiry : string;
            IssuingGameStartUnixMillis: number;
        }[];
    },
    mmr: {
        LatestCompetitiveUpdate: {
            TierAfterUpdate : number;
            RankedRatingAfterUpdate : number;
        }
    }
}