export interface Host {
  name: string;
  meta: {
    logo: string;
    website: string;
  };
  _id: string;
}

export interface IContest {
  _id: string;
  title: string;
  desc: string; // Markdown string
  slug: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  limit: number;
  languages: string[];
  rounds: number;
  type: "contest" | "tournament";
  duration: number;
  rated: boolean;
  host: Host;
  registrationDeadline: string; // ISO date string
  status: "upcoming" | "ongoing" | "ended";
  visibility: "public" | "private";
  rules: string; // Markdown string
  tags: string[];
  questions_tags: string[];
  backdrop: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export interface I3ContestParticipants{
    _id: string;
    name: string;
    email: string;
    profile_image:string;
}
