import {
  ASSIGNEE_ATTRIBUTES,
  COMPONENT_ATTRIBUTES,
  FilterAttributes, FilterAttributesUtil,
  FIX_VERSION_ATTRIBUTES,
  ISSUE_TYPE_ATTRIBUTES,
  LABEL_ATTRIBUTES,
  NONE_FILTER, PARALLEL_TASK_ATTRIBUTES,
  PRIORITY_ATTRIBUTES,
  PROJECT_ATTRIBUTES
} from '../../../model/board/user/board-filter/board-filter.constants';
import {BoardFilterState} from '../../../model/board/user/board-filter/board-filter.model';
import {BoardIssueVm} from './board-issue-vm';
import {List, Map, Set} from 'immutable';
import {NO_ASSIGNEE} from '../../../model/board/data/assignee/assignee.model';
import {CustomField} from '../../../model/board/data/custom-field/custom-field.model';
import {ParallelTask, ProjectState} from '../../../model/board/data/project/project.model';

export class AllFilters {
  private _project: SimpleFilter;
  private _issueType: SimpleFilter;
  private _priority: SimpleFilter;
  private _assignee: SimpleFilter;
  private _component: MultiSelectFilter;
  private _label: MultiSelectFilter;
  private _fixVersion: MultiSelectFilter;
  private _customFieldFilters: Map<string, SimpleFilter>;
  private _parallelTaskFilters: Map<string, SimpleFilter>;
  private _parallelTaskFilterIndicesByProject: Map<string, Map<string, number>>;

  constructor(boardFilters: BoardFilterState, private projectState: ProjectState) {
    this._project = new SimpleFilter(PROJECT_ATTRIBUTES, boardFilters.project);
    this._priority = new SimpleFilter(PRIORITY_ATTRIBUTES, boardFilters.priority);
    this._issueType = new SimpleFilter(ISSUE_TYPE_ATTRIBUTES, boardFilters.issueType);
    this._assignee = new SimpleFilter(ASSIGNEE_ATTRIBUTES, boardFilters.assignee);
    this._component = new MultiSelectFilter(COMPONENT_ATTRIBUTES, boardFilters.component)
    this._label = new MultiSelectFilter(LABEL_ATTRIBUTES, boardFilters.label);
    this._fixVersion = new MultiSelectFilter(FIX_VERSION_ATTRIBUTES, boardFilters.fixVersion);
    this._customFieldFilters = Map<string, SimpleFilter>().withMutations(mutable => {
      boardFilters.customField.forEach((f, k) => {
        mutable.set(k, new SimpleFilter(FilterAttributesUtil.createCustomFieldFilterAttributes(k), f));
      });
    });
    this._parallelTaskFilters = Map<string, SimpleFilter>().withMutations(mutable => {
      boardFilters.parallelTask.forEach((p, k) => {
        if (p.size > 0) {
          mutable.set(k, new SimpleFilter(PARALLEL_TASK_ATTRIBUTES, p));
        }
      });
    });
    this._parallelTaskFilterIndicesByProject = Map<string, Map<string, number>>().withMutations(mutable => {
      projectState.parallelTasks.forEach((list, project) => {
        if (list.size > 0) {
          mutable.set(project, this.createParallelTaskIndices(list));
        }
      });
    });
  }

  private createParallelTaskIndices(tasksForProject: List<ParallelTask>): Map<string, number> {
    return Map<string, number>().withMutations(mutable => {
      tasksForProject.forEach((task, index) => {
        mutable.set(task.display, index);
      });
    });
  }

  /**
   *
   * @param {BoardIssueVm} issue
   * @return {true} if it is visible, {false} otherwise
   */
  filterVisible(issue: BoardIssueVm): boolean {
    if (!this._project.doFilter(issue.projectCode)) {
      return false;
    }
    if (!this._priority.doFilter(issue.priority.name)) {
      return false;
    }
    if (!this._issueType.doFilter(issue.type.name)) {
      return false;
    }
    if (!this._assignee.doFilter(issue.assignee !== NO_ASSIGNEE ? issue.assignee.key : null)) {
      return false;
    }
    if (!this._component.doFilter(issue.components)) {
      return false;
    }
    if (!this._label.doFilter(issue.labels)) {
      return false;
    }
    if (!this._fixVersion.doFilter(issue.fixVersions)) {
      return false;
    }
    if (!this.filterVisibleCustomFields(issue)) {
      return false;
    }
    if (!this.filterVisibleParallelTasks(issue)) {
      return false;
    }

    return true;
  }

  private filterVisibleCustomFields(issue: BoardIssueVm): boolean {
    let visible = true;
    this._customFieldFilters.forEach((f, k) => {
      const cfv: CustomField = issue.customFields.get(k);
      if (!f.doFilter(cfv ? cfv.key : null)) {
        visible = false;
        return false;
      }
    });
    return visible;
  }

  private filterVisibleParallelTasks(issue: BoardIssueVm): boolean {
    let visible = true;
    const indicesForProject: Map<string, number> = this._parallelTaskFilterIndicesByProject.get(issue.projectCode);
    this._parallelTaskFilters.forEach((f, k) => {
      if (indicesForProject) {
        const index: number = indicesForProject.get(k);
        if (!issue.parallelTasks || !f.doFilter(issue.parallelTasks.get(index))) {
          visible = false;
          return false;
        }
      }
    });
    return visible;
  }
}

class SimpleFilter {
  constructor(private readonly _filterAttributes: FilterAttributes, private readonly _filter: Set<string>) {
  }

  doFilter(key: string): boolean {
    if (this._filter.size > 0) {
      let useKey: string = key;
      if (!key && this._filterAttributes.hasNone) {
        useKey = NONE_FILTER;
      }
      return this._filter.contains(useKey);
    }
    return true;
  }
}

class MultiSelectFilter {
  private _filterArray: string[];

  constructor(private readonly _filterAttributes: FilterAttributes, private readonly _filter: Set<string>) {
    this._filterArray = _filter.toArray();
  }

  doFilter(keys: Set<string>): boolean {
    if (this._filter.size > 0) {
      if (!keys) {
        return this._filter.contains(NONE_FILTER);
      } else {
        if (this._filter.size === 1 && this._filter.contains(NONE_FILTER)) {
          // All we want to match is no components, and we have some components so return that we
          // should be filtered out
          return false;
        }


        for (const key of this._filterArray) {
          if (key === NONE_FILTER) {
            // We have values and we are looking for some values, for this case ignore the
            // none filter
            continue;
          }
          if (keys.contains(key)) {
            return true;
          }
        }
        return false;
      }
    }
    return true;
  }
}

