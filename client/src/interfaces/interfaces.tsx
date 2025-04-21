interface IPlayer {
    _id: string;
    first_name: string;
    last_name: string;
    user_photo: string;
    username: string;
    role: string;
}

interface IExample {
    _id: string;
    input: string;
    output: string;
    explanation: string;
}

interface IProblem {
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
}

interface TestCase {
    _id: string;
    input: string;
    output: string;
}
  

interface IPlayerDetails {
    _id: string;
    user_id: string;
    matches_played: number;
    rating: number;
    wins: number;
    loss: number;
    draw: number;
}

export interface IChallenge {
    _id: string;
    players: IPlayer[];
    language: string;
    time: number;
    problem_id: IProblem;
    player1_code: string;
    player2_code: string;
    player1_test_cases: number;
    player2_test_cases: number;
    winner: string;
    rating_change: Record<string, number>;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    playerDetails: IPlayerDetails[];
}
  