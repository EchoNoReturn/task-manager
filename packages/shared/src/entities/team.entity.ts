export interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'leader' | 'member';
  joinedAt: Date;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
}
