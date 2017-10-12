import {Action} from '@ngrx/store';
import {AppState} from '../../../app-store';
import {IssueTypeActions, issueTypeMetaReducer} from './issue-type/issue-type.reducer';
import {IssueActions, issueMetaReducer} from './issue/issue.reducer';
import {AssigneeActions, assigneeMetaReducer} from './assignee/assignee.reducer';
import {PriorityActions, priorityMetaReducer} from './priority/priority.reducer';
import {HeaderActions, headerMetaReducer} from './header/header.reducer';
import {ProjectActions, projectMetaReducer} from './project/project.reducer';
import {AssigneeState} from './assignee/assignee.model';
import {DeserializeIssueLookupParams, IssueState} from './issue/issue.model';
import {IssueTypeState} from './issue-type/issue-type.model';
import {PriorityState} from './priority/priority.model';
import {ProjectState} from './project/project.model';
import {ComponentState, initialComponentState} from './component/component.model';
import {ComponentActions, componentMetaReducer} from './component/component.reducer';
import {initialLabelState, LabelState} from './label/label.model';
import {LabelActions, labelMetaReducer} from './label/label.reducer';
import {FixVersionState, initialFixVersionState} from './fix-version/fix-version.model';
import {FixVersionActions, fixVersionMetaReducer} from './fix-version/fix-version.reducer';
import {CustomFieldState, initialCustomFieldState} from './custom-field/custom-field.model';
import {CustomFieldActions, customFieldMetaReducer} from './custom-field/custom-field.reducer';
import {BlacklistState} from './blacklist/blacklist.model';
import {BlacklistActions, blacklistMetaReducer} from './blacklist/blacklist.reducer';
import {RankState} from './rank/rank.model';
import {RankActions, rankMetaReducer} from './rank/rank.reducer';
import {HeaderState} from './header/header.state';
import {BoardState} from './board';
import {BoardUtil, initialBoardState} from './board.model';


const metaReducers = {
  headers: headerMetaReducer,
  assignees: assigneeMetaReducer,
  issueTypes: issueTypeMetaReducer,
  priorities: priorityMetaReducer,
  components: componentMetaReducer,
  labels: labelMetaReducer,
  fixVersions: fixVersionMetaReducer,
  customFields: customFieldMetaReducer,
  projects: projectMetaReducer,
  ranks: rankMetaReducer,
  issues: issueMetaReducer,
  blacklist: blacklistMetaReducer
};

const CLEAR_BOARD = 'CLEAR_BOARD';
const DESERIALIZE_BOARD = 'DESERIALIZE_BOARD';
const PROCESS_BOARD_CHANGES = 'PROCESS_BOARD_CHANGES';

abstract class BoardDataAction {
  constructor(readonly type: string, readonly payload: any) {
  }
}

class ClearBoardAction implements Action {
  type = CLEAR_BOARD;
}

class DeserializeBoardAction extends BoardDataAction {
  constructor(payload: any) {
    super(DESERIALIZE_BOARD, payload);
  }
}

class ProcessBoardChangesAction extends BoardDataAction {
  constructor(payload: any) {
    super(PROCESS_BOARD_CHANGES, payload);
  }
}

export class BoardActions {

  static createClearBoard(): Action {
    return new ClearBoardAction();
  }

  static createDeserializeBoard(input: any) {
    return new DeserializeBoardAction(input);
  }

  static createChanges(input: any) {
    if (input['changes']) {
      return new ProcessBoardChangesAction(input['changes']);
    };
    return new DeserializeBoardAction(input);
  }
}

export function boardReducer(state: BoardState = initialBoardState, action: Action): BoardState {

  switch (action.type) {
    case CLEAR_BOARD: {
      return initialBoardState;
    }
    case DESERIALIZE_BOARD: {
      const input = action.payload;
      const viewId: number = input['view'];
      if (viewId === state.viewId) {
        return state;
      }
      const rankCustomFieldId = input['rank-custom-field-id'];
      const headerState: HeaderState =
        metaReducers.headers(state.headers, HeaderActions.createDeserializeHeaders(
          input['states'],
          input['headers'],
          input['backlog'] ? input['backlog'] : 0,
          input['done'] ? input['done'] : 0));

      // These will always be present
      const assigneeState: AssigneeState =
        metaReducers.assignees(state.assignees, AssigneeActions.createAddInitialAssignees(input['assignees']));
      const priorityState: PriorityState =
        metaReducers.priorities(state.priorities, PriorityActions.createDeserializePriorities(input['priorities']));
      const issueTypeState: IssueTypeState =
        metaReducers.issueTypes(state.issueTypes, IssueTypeActions.createDeserializeIssueTypes(input['issue-types']));

      // These might not be there
      const componentState: ComponentState = input['components'] ?
        metaReducers.components(state.components, ComponentActions.createDeserializeComponents(input['components']))
        : initialComponentState;
      const labelState: LabelState = input['labels'] ?
        metaReducers.labels(state.labels, LabelActions.createDeserializeLabels(input['labels']))
        : initialLabelState;
      const fixVersionState: FixVersionState = input['fix-versions'] ?
        metaReducers.fixVersions(state.fixVersions, FixVersionActions.createDeserializeFixVersions(input['fix-versions']))
        : initialFixVersionState;
      const customFieldState: CustomFieldState = input['custom'] ?
        metaReducers.customFields(state.customFields, CustomFieldActions.createDeserializeCustomFields(input['custom']))
        : initialCustomFieldState;

      // This will always be present
      const projectState: ProjectState =
        metaReducers.projects(state.projects, ProjectActions.createDeserializeProjects(input['projects']));
      const rankState: RankState =
        metaReducers.ranks(state.ranks, RankActions.createDeserializeRanks(input['projects']['main']));

      const lookupParams: DeserializeIssueLookupParams = new DeserializeIssueLookupParams()
        .setAssignees(assigneeState.assignees)
        .setPriorities(priorityState.priorities)
        .setIssueTypes(issueTypeState.types)
        .setComponents(componentState.components)
        .setLabels(labelState.labels)
        .setFixVersions(fixVersionState.versions)
        .setCustomFields(customFieldState.fields)
        .setBoardProjects(projectState.boardProjects)
        .setBoardStates(headerState.states)
        .setParallelTasks(projectState.parallelTasks);

      const issueState: IssueState =
        metaReducers.issues(state.issues, IssueActions.createDeserializeIssuesAction(input['issues'], lookupParams));

      const blacklistState: BlacklistState =
        metaReducers.blacklist(state.blacklist, BlacklistActions.createDeserializeBlacklist(input['blacklist']));

      const newState: BoardState = {
        viewId: viewId,
        rankCustomFieldId: rankCustomFieldId,
        headers: headerState,
        assignees: assigneeState,
        issueTypes: issueTypeState,
        priorities: priorityState,
        components: componentState,
        fixVersions: fixVersionState,
        labels: labelState,
        customFields: customFieldState,
        projects: projectState,
        issues: issueState,
        ranks: rankState,
        blacklist: blacklistState

      };

      return BoardUtil.recordFromObject(newState);
    }
    case PROCESS_BOARD_CHANGES: {
      const input: any = action.payload;
      const viewId: number = input['view'];

      const assigneeState: AssigneeState = input['assignees'] ?
        metaReducers.assignees(state.assignees, AssigneeActions.createAddAssignees(input['assignees']))
        : state.assignees;
      const componentState: ComponentState = input['components'] ?
        metaReducers.components(state.components, ComponentActions.createAddComponents(input['components']))
        : state.components;
      const labelState: LabelState = input['labels'] ?
        metaReducers.labels(state.labels, LabelActions.createAddLabels(input['labels']))
        : state.labels;
      const fixVersionState: FixVersionState = input['fix-versions'] ?
        metaReducers.fixVersions(state.fixVersions, FixVersionActions.createAddFixVersions(input['fix-versions']))
        : state.fixVersions;
      const customFieldState: CustomFieldState = input['custom'] ?
        metaReducers.customFields(state.customFields, CustomFieldActions.createAddCustomFields(input['custom']))
        : state.customFields;

      const deletedIssues = getDeletedIssuesForChange(input);
      let rankState: RankState;
        rankState = (input['rank'] || deletedIssues) ?
          metaReducers.ranks(state.ranks, RankActions.createRerank(input['rank'], deletedIssues))
          : rankState = state.ranks;

      const lookupParams: DeserializeIssueLookupParams = new DeserializeIssueLookupParams()
        .setAssignees(assigneeState.assignees)
        .setPriorities(state.priorities.priorities)
        .setIssueTypes(state.issueTypes.types)
        .setComponents(componentState.components)
        .setLabels(labelState.labels)
        .setFixVersions(fixVersionState.versions)
        .setCustomFields(customFieldState.fields)
        .setBoardProjects(state.projects.boardProjects)
        .setBoardStates(state.headers.states)
        .setParallelTasks(state.projects.parallelTasks);

      const issueState: IssueState = input['issues'] ?
        metaReducers.issues(state.issues, IssueActions.createChangeIssuesAction(input['issues'], lookupParams))
        : state.issues;

      const blacklistState: BlacklistState = input['blacklist'] ?
        metaReducers.blacklist(state.blacklist, BlacklistActions.createChangeBlacklist(input['blacklist']))
        : state.blacklist;

      const newState: BoardState = {
        viewId: viewId,
        rankCustomFieldId: state.rankCustomFieldId,
        headers: state.headers,
        assignees: assigneeState,
        issueTypes: state.issueTypes,
        priorities: state.priorities,
        components: componentState,
        fixVersions: fixVersionState,
        labels: labelState,
        customFields: customFieldState,
        projects: state.projects,
        issues: issueState,
        ranks: rankState,
        blacklist: blacklistState
      };

      return BoardUtil.recordFromObject(newState);
    }
    default:
      return state;
  }
}

function getDeletedIssuesForChange(input: any): string[] {
  const deletedIssues = [];
  addAll(deletedIssues, input, 'issues', 'delete');
  addAll(deletedIssues, input, 'blacklist', 'issues');
  addAll(deletedIssues, input, 'blacklist', 'removed-issues');

  return deletedIssues.length > 0 ? deletedIssues : null;
}

function addAll(result: string[], input: any, ...keys: string[]) {
  let current: any = input;
  for (const key of keys) {
    current = current[key];
    if (!current) {
      return;
    }
  }

  (<string[]>current).forEach(v => result.push(v));
}

const getBoardState = (state: AppState) => state.board;