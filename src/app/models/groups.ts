export class Group {
  key: string;
  name: string;
  userNames: string[];
}

export class Team extends Group {}
export class Project extends Group {}