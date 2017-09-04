import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';
import {Assignee, NO_ASSIGNEE} from '../assignee/assignee.model';
import {Priority} from '../priority/priority.model';
import {IssueType} from '../issue-type/issue-type.model';
import {fromJS, List, Map} from 'immutable';

export interface IssueState {
  issues: Map<string, BoardIssue>;
}


export interface Issue {
  key: string;
  summary: string;
}

export interface BoardIssue extends Issue {
  assignee: Assignee;
  priority: Priority;
  type: IssueType;
  components: List<string>;
  linkedIssues: List<Issue>;
}

const DEFAULT_STATE: IssueState = {
  issues: Map<string, BoardIssue>()
};

const DEFAULT_ISSUE: BoardIssue = {
  key: null,
  summary: null,
  assignee: null,
  priority: null,
  type: null,
  components: null,
  linkedIssues: List<Issue>()
};

const DEFAULT_LINKED_ISSUE: Issue = {
  key: null,
  summary: null
};



interface BoardIssueRecord extends TypedRecord<BoardIssueRecord>, BoardIssue {
}

interface LinkedIssueRecord extends TypedRecord<LinkedIssueRecord>, Issue {
}

interface IssueStateRecord extends TypedRecord<IssueStateRecord>, IssueState {
}

const ISSUE_FACTORY = makeTypedFactory<BoardIssue, BoardIssueRecord>(DEFAULT_ISSUE);
const LINKED_ISSUE_FACTORY = makeTypedFactory<Issue, LinkedIssueRecord>(DEFAULT_LINKED_ISSUE);
const STATE_FACTORY = makeTypedFactory<IssueState, IssueStateRecord>(DEFAULT_STATE);
export const initialIssueState: IssueState = STATE_FACTORY(DEFAULT_STATE);

export class IssueFactory {

  static fromJS(input: any, assignees: Assignee[], priorities: Priority[], issueTypes: IssueType[], components: List<string>): BoardIssue {
    // Rework the data as needed before deserializing
    if (input['linked-issues']) {
      input['linkedIssues'] = input['linked-issues'];
    }
    delete input['linked-issues'];

    if (input['assignee'] || input['assignee'] === 0) {
      input['assignee'] = assignees[input['assignee']];
    } else {
      input['assignee'] = NO_ASSIGNEE;
    }

    // priority and issue-type will never be null
    input['priority'] = priorities[input['priority']];
    input['type'] = issueTypes[input['type']];

    if (input['components']) {
      const componentIndices: number[] = input['components'];
      const componentNames: string[] = new Array<string>(componentIndices.length);
      componentIndices.forEach((c, i) => componentNames[i] = components.get(c));
      input['components'] = componentNames;
    }

    const temp: any = fromJS(input, (key, value) => {
      if (key === 'linkedIssues') {
        const tmp: List<any> = value.toList();
        return tmp.withMutations(mutable => {
          tmp.forEach((li, i) => {
            mutable.set(i, LINKED_ISSUE_FACTORY(<any>li));
          });
        });
      }
      return value;
    });
    return ISSUE_FACTORY(temp);
  }
};


export class IssueStateModifier {
  static update(state: IssueState, updater: (copy: IssueState) => void) {
    return (<IssueStateRecord>state).withMutations(updater);
  }
}
