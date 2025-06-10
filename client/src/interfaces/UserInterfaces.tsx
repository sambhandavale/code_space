export interface IUserStreaks {
    currentLoginStreak: number;
    longestLoginStreak: number;
    highestRating: number;
    totalMatches: number;
}

export interface IProfileCardInfo {
    userBio: string;
    userEmail: string;
    joinedOn: string;
    userRating:number;
    userTitle:string;
    fullName:string;
    username:string;
}

export interface IDailyMatchRecord {
    challenges: string[];
    count: number;
    _id: string;
}

export interface IFavorites {
    category: string; // e.g., "Language", "F1 Driver", "Footballer"
    value: string;
}

export interface ISocials {
    platform: string; // e.g., "GitHub", "LinkedIn", "Twitter", "Portfolio"
    url: string;
}

export interface IUserMatch {
    challengeId:string;
    opponentName: string;
    language: string;
    time: number;
    result: 'Win' | 'Loss' | 'Draw';
    startTime: string;
}


export interface IUserProfile {
    userStreaks: IUserStreaks;
    profileCardInfo: IProfileCardInfo;
    dailyMatches:Record<string, IDailyMatchRecord>;
    userFavourites:IFavorites[];
    userSocials:ISocials[];
    userMatches: IUserMatch[];
}
