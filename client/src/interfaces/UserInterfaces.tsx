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
    profileImage?:string;
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

export interface IUserBlogSummary {
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    tags: string[];
    views: number;
    pings: number;
    comments: number;
    firstContent: string;
    publishedAgo: string;
    author?:string;
    authorId?:{
        username:string;
        id:string;
    }
}

export interface IUserProfile {
    userStreaks: IUserStreaks;
    profileCardInfo: IProfileCardInfo;
    dailyMatches:Record<string, IDailyMatchRecord>;
    userFavourites:IFavorites[];
    userSocials:ISocials[];
    userMatches: IUserMatch[];
    userBlogs:IUserBlogSummary[];
    userSolvedQuestions:IUserQuestionsSolved[];
}

export interface IUserQuestionsSolved {
    language:string[];
    question:{
        _id:string;
        title:string;
        description:string;
        tags:string[];
        difficulty:string;
    }
    solved_at:Date;
}
