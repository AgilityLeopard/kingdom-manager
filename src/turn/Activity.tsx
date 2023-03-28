import { Skill } from "../sheet/skill/Skill";

export class Activity {
    name: string;
    tag: ActivityTag;
    skills: Array<Skill>;
    trainedOnly: boolean;
    requirement: string;
    description: string;
    critSuccess: string;
    success: string;
    failure: string;
    critFailure: string;
    special: string;
}