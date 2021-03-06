import {makeTypedFactory, TypedRecord} from 'typed-immutable-record';
import {List, Map, OrderedMap} from 'immutable';
import {BoardIssueView} from './board-issue-view';
import {BoardViewModel} from './board-view';
import {SwimlaneData} from './swimlane-data';
import {BoardHeader} from './board-header';
import {IssueTable} from './issue-table';
import {BoardHeaders} from './board-headers';
import {SwimlaneInfo} from './swimlane-info';
import {RankViewEntry} from './rank-view-entry';
import {initialIssueDetailState} from '../../model/board/user/issue-detail/issue-detail.model';


const DEFAULT_BOARD_HEADERS: BoardHeaders = {
  headersList: List<BoardHeader>()
};

const DEFAULT_BOARD_VIEW: BoardViewModel = {
  headers: null,    // The initial state will have this set to initialBoardHeaders, declared below
  issueTable: null,  // The initial state will have this set to initialIssueTable, declared below
  issueDetail: initialIssueDetailState
};


const DEFAULT_BOARD_HEADER: BoardHeader = {
  name: null,
  abbreviation: null,
  backlog: false,
  category: true,
  stateIndices: List<number>(),
  states: null,
  wip: 0,
  visible: false,
  totalIssues: 0,
  visibleIssues: 0,
  helpText: null
};

const DEFAULT_ISSUE_TABLE: IssueTable = {
  issues: Map<string, BoardIssueView>(),
  totalIssues: List<number>(),
  visibleIssues: List<number>(),
  rankView: List<RankViewEntry>(),
  table: List<List<BoardIssueView>>(),
  issueRanksByProject: Map<string, Map<string, number>>(),
  swimlaneInfo: null
};

const DEFAULT_SWIMLANE_INFO: SwimlaneInfo = {
  showEmpty: false,
  visibleSwimlanes: OrderedMap<string, SwimlaneData>(),
  allSwimlanes: OrderedMap<string, SwimlaneData>()
};

const SWIMLANE_HEADER_HEIGHT = 36; /* header height: 30; header bottom border: 1, column top padding: 5 */

const DEFAULT_SWIMLANE_DATA: SwimlaneData = {
  key: null,
  display: null,
  linkName: null,
  linkUrl: null,
  table: List<List<BoardIssueView>>(),
  visibleIssues: 0,
  collapsed: false,
  headerHeight: SWIMLANE_HEADER_HEIGHT,
  calculatedTotalIssuesHeight: 0
};

const DEFAULT_RANK_VIEW_ENTRY: RankViewEntry = {
  issue: null,
  boardIndex: 0,
  calculatedTotalHeight: 0
};

interface BoardViewModelRecord extends TypedRecord<BoardViewModelRecord>, BoardViewModel {
}

interface BoardHeaderRecord extends TypedRecord<BoardHeaderRecord>, BoardHeader {
}

interface BoardHeadersRecord extends TypedRecord<BoardHeadersRecord>, BoardHeaders {
}

interface IssueTableRecord extends TypedRecord<IssueTableRecord>, IssueTable {
}

interface SwimlaneInfoRecord extends TypedRecord<SwimlaneInfoRecord>, SwimlaneInfo {
}

interface SwimlaneDataRecord extends TypedRecord<SwimlaneDataRecord>, SwimlaneData {
}

interface RankViewEntryRecord extends TypedRecord<RankViewEntryRecord>, RankViewEntry {
}

const BOARD_VIEW_MODEL_FACTORY = makeTypedFactory<BoardViewModel, BoardViewModelRecord>(DEFAULT_BOARD_VIEW);
const BOARD_HEADER_FACTORY = makeTypedFactory<BoardHeader, BoardHeaderRecord>(DEFAULT_BOARD_HEADER);
const BOARD_HEADERS_FACTORY = makeTypedFactory<BoardHeaders, BoardHeadersRecord>(DEFAULT_BOARD_HEADERS);
const ISSUE_TABLE_STATE_FACTORY = makeTypedFactory<IssueTable, IssueTableRecord>(DEFAULT_ISSUE_TABLE);
const SWIMLANE_INFO_STATE_FACTORY = makeTypedFactory<SwimlaneInfo, SwimlaneInfoRecord>(DEFAULT_SWIMLANE_INFO);
const SWIMLANE_DATA_STATE_FACTORY = makeTypedFactory<SwimlaneData, SwimlaneDataRecord>(DEFAULT_SWIMLANE_DATA);
const RANK_VIEW_ENTRY_RECORD = makeTypedFactory<RankViewEntry, RankViewEntryRecord>(DEFAULT_RANK_VIEW_ENTRY);

const initialBoardHeaders: BoardHeaders = BOARD_HEADERS_FACTORY(DEFAULT_BOARD_HEADERS);
export const initialIssueTable: IssueTable = ISSUE_TABLE_STATE_FACTORY(DEFAULT_ISSUE_TABLE);
export const initialBoardViewModel: BoardViewModel = BOARD_VIEW_MODEL_FACTORY({
  headers: initialBoardHeaders,
  issueTable: initialIssueTable,
  issueDetail: initialIssueDetailState
});

export class BoardViewModelUtil {
  static updateBoardViewModel(boardViewModel: BoardViewModel, mutate: (boardViewModel: BoardViewModel) => any): BoardViewModel {
    return (<BoardViewModelRecord>boardViewModel).withMutations(mutable => {
      return mutate(mutable);

    });
  }

  static updateBoardHeaders(headersModel: BoardHeaders, mutate: (headers: BoardHeaders) => any): BoardHeaders {
    return (<BoardHeadersRecord>headersModel).withMutations(mutable => {
      return mutate(mutable);
    });
  }

  static updateBoardHeader(headerModel: BoardHeader, mutate: (header: BoardHeader) => any): BoardHeader {
    return (<BoardHeaderRecord>headerModel).withMutations(mutable => {
      return mutate(mutable);
    });
  }

  static updateSwimlaneInfo(swimlaneInfo: SwimlaneInfo, mutate: (swimlaneInfo: SwimlaneInfo) => any): SwimlaneInfo {
    return (<SwimlaneInfoRecord>swimlaneInfo).withMutations(mutable => {
      return mutate(mutable);
    });
  }

  static updateSwimlaneData(swimlaneData: SwimlaneData, mutate: (swimlaneData: SwimlaneData) => any): SwimlaneData {
    return (<SwimlaneDataRecord>swimlaneData).withMutations(mutable => {
      return mutate(mutable);
    });
  }

  static createBoardHeaders(headers: List<BoardHeader>) {
    return BOARD_HEADERS_FACTORY({
      headersList: headers
    });
  }

  static createBoardHeaderRecord(header: BoardHeader): BoardHeaderRecord {
    return BOARD_HEADER_FACTORY(header);
  }


  static createIssueTable(
    issues: Map<string, BoardIssueView>,
    totalIssues: List<number>,
    visibleIssues: List<number>,
    rankView: List<RankViewEntry>,
    tableList: List<List<BoardIssueView>>,
    issueRanksByProject: Map<string, Map<string, number>>,
    swimlaneInfo: SwimlaneInfo): IssueTable {

    const state: IssueTable = {
      issues: issues,
      totalIssues,
      visibleIssues,
      rankView: rankView,
      table: tableList,
      issueRanksByProject: issueRanksByProject,
      swimlaneInfo: swimlaneInfo
    };
    return ISSUE_TABLE_STATE_FACTORY(state);
  }

  static createSwimlaneDataView(
    key: string,
    display: string,
    linkName: string,
    linkUrl: string,
    table: List<List<BoardIssueView>>,
    visibleIssues: number,
    collapsed: boolean,
    calculatedTotalIssuesHeight): SwimlaneData {
    const state: SwimlaneData = {
      key: key,
      display: display,
      linkName: linkName,
      linkUrl: linkUrl,
      table: table,
      visibleIssues: visibleIssues,
      collapsed: collapsed,
      headerHeight: SWIMLANE_HEADER_HEIGHT,
      calculatedTotalIssuesHeight: calculatedTotalIssuesHeight
    };
    return SWIMLANE_DATA_STATE_FACTORY(state);
  }

  static createSwimlaneInfoView(
    showEmpty: boolean, visibleSwimlanes: OrderedMap<string, SwimlaneData>, allSwimlanes: OrderedMap<string, SwimlaneData>) {
    const state: SwimlaneInfo = {
      showEmpty: showEmpty,
      visibleSwimlanes: visibleSwimlanes,
      allSwimlanes: allSwimlanes,
    };

    return SWIMLANE_INFO_STATE_FACTORY(state);
  }

  static createRankViewEntry(issue: BoardIssueView, boardIndex: number) {
    // The sum of the top and bottom borders added to issues in the rank view
    const BORDER_HEIGHT = 2;
    const calculatedTotalHeight: number = issue.calculatedTotalHeight + BORDER_HEIGHT;
    return RANK_VIEW_ENTRY_RECORD({issue: issue, boardIndex: boardIndex, calculatedTotalHeight: calculatedTotalHeight});
  }
}
