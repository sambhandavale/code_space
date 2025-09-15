interface IPlayer {
    _id: string;
    first_name: string;
    last_name: string;
    full_name:string;
    user_photo: string;
    username: string;
    email: string;
}

interface IExample {
    _id: string;
    input: string;
    output: string;
    explanation: string;
}

export interface IProblem {
    _id: string;
    title: string;
    description: string;
    difficulty: string;
    task: string;
    input_format: string;
    constraints: string;
    output_format: string;
    time: number;
    examples: IExample[];
    test_cases:TestCase[];
    template: Record<string, string>;
    tags:string[];
}

interface TestCase {
    _id: string;
    input: string;
    output: string;
}
  

interface IPlayerDetails {
    _id: string;
    user_id: IPlayer;
    matches_played: number;
    rating: number;
    wins: number;
    loss: number;
    draw: number;
}

export interface IChallenge {
    _id: string;
    players: string[];
    language: string;
    time: number;
    problem_id: IProblem;
    winner: string;
    rating_change: Record<string, number>;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    playerDetails: IPlayerDetails[];
    status: string;
    is_private: boolean;
    room_code: string;
    codes: {
        user_id: string;
        code: string;
        passed_test_cases: number;
    }[];
}

  