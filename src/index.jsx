import '../style';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import RcTreeSelect, { TreeNode, SHOW_ALL, SHOW_PARENT, SHOW_CHILD } from 'rc-tree-select';
import injectLocale from '@gag/locale-provider-web/injectLocale';
/*以下是为了让搜索时,显示disabled的选项,采用继承的方式复写方法,不改变基础组件*/
import SelectTrigger from 'rc-tree-select/lib/SelectTrigger.js';
import {
  getPropValue, getValuePropValue, /* isCombobox,*/
  isMultipleOrTags, isMultipleOrTagsOrCombobox,
  isSingleMode, toArray,
  UNSELECTABLE_ATTRIBUTE, UNSELECTABLE_STYLE,
  preventDefaultEvent,
  getTreeNodesStates, flatToHierarchy, filterParentPosition,
  isInclude, labelCompatible, loopAllChildren, filterAllCheckedData,
  processSimpleTreeData,
} from 'rc-tree-select/lib/util.js';


class SelectTrigger_ extends SelectTrigger{
 filterTreeNode = (input, child) => {
    if (!input) {
      return true;
    }
    const filterTreeNode = this.props.filterTreeNode;
    if (!filterTreeNode) {
      return true;
    }
    //if (child.props.disabled) {
    //  return false;
    //}
    return filterTreeNode.call(this, input, child);
  }

}
class RcTreeSelect_ extends RcTreeSelect{
  render() {
    const props = this.props;
    const multiple = isMultipleOrTags(props);
    const state = this.state;
    const { className, disabled, allowClear, prefixCls } = props;
    const ctrlNode = this.renderTopControlNode();
    let extraSelectionProps = {};
    if (!isMultipleOrTagsOrCombobox(props)) {
      extraSelectionProps = {
        onKeyDown: this.onKeyDown,
        tabIndex: 0,
      };
    }
    const rootCls = {
      [className]: !!className,
      [prefixCls]: 1,
      [`${prefixCls}-open`]: state.open,
      [`${prefixCls}-focused`]: state.open || state.focused,
      // [`${prefixCls}-combobox`]: isCombobox(props),
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-enabled`]: !disabled,
      [`${prefixCls}-allow-clear`]: !!props.allowClear,
    };

    const clear = (<span
      key="clear"
      className={`${prefixCls}-selection__clear`}
      onClick={this.onClearSelection}
    />);
    return (
      <SelectTrigger_ {...props}
        treeNodes={props.children}
        treeData={this.renderedTreeData}
        _cachetreeData={this._cachetreeData}
        _treeNodesStates={this._treeNodesStates}
        halfCheckedValues={this.halfCheckedValues}
        multiple={multiple}
        disabled={disabled}
        visible={state.open}
        inputValue={state.inputValue}
        inputElement={this.getInputElement()}
        value={state.value}
        onDropdownVisibleChange={this.onDropdownVisibleChange}
        getPopupContainer={props.getPopupContainer}
        onSelect={this.onSelect}
        ref="trigger"
      >
        <span
          style={props.style}
          onClick={props.onClick}
          className={classNames(rootCls)}
        >
          <span
            ref="selection"
            key="selection"
            className={`${prefixCls}-selection
            ${prefixCls}-selection--${multiple ? 'multiple' : 'single'}`}
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="true"
            aria-expanded={state.open}
            {...extraSelectionProps}
          >
          {ctrlNode}
          {allowClear && this.state.value.length &&
          this.state.value[0].value ? clear : null}
            {multiple || !props.showArrow ? null :
              (<span
                key="arrow"
                className={`${prefixCls}-arrow`}
                style={{ outline: 'none' }}
              >
              <b/>
            </span>)}
            {multiple ?
              this.getSearchPlaceholderElement(!!this.state.inputValue || this.state.value.length) :
              null}
          </span>
        </span>
      </SelectTrigger_>
    );
  }
}
/*以上部分是为了让搜索时,显示disabled的选项,采用继承的方式复写方法,不改变基础组件*/


class TreeSelect extends React.Component{
  static TreeNode = TreeNode;
  static SHOW_ALL = SHOW_ALL;
  static SHOW_PARENT = SHOW_PARENT;
  static SHOW_CHILD = SHOW_CHILD;

  //abstract getLocale()

  render() {
    const locale = this.getLocale();
    const {
      prefixCls,
      className,
      size,
      notFoundContent = locale.notFoundContent,
      dropdownStyle,
      ...restProps,
    } = this.props;

    const cls = classNames({
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-sm`]: size === 'small',
    }, className);

    let checkable = restProps.treeCheckable;
    if (checkable) {
      checkable = <span className={`${prefixCls}-tree-checkbox-inner`} />;
    }

    return (
      <RcTreeSelect_
        {...restProps}
        prefixCls={prefixCls}
        className={cls}
        dropdownStyle={{ maxHeight: '100vh', overflow: 'auto', ...dropdownStyle }}
        treeCheckable={checkable}
        notFoundContent={notFoundContent}
      />
    );
  }
}

// Use Select's locale
const injectSelectLocale = injectLocale('Select', {});
TreeSelect.defaultProps = {
  prefixCls: 'ant-select',
  transitionName: 'slide-up',
  choiceTransitionName: 'zoom',
  showSearch: false,
  dropdownClassName: 'ant-select-tree-dropdown',
};
TreeSelect.propTypes = {
  prefixCls: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf([ 'default','large','small']),
  notFoundContent: PropTypes.node,
  transitionName: PropTypes.string,
  choiceTransitionName: PropTypes.string,
  showSearch: PropTypes.bool,
  allowClear: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  value:PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
      ]),
  defaultValue:PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
      ]),
  multiple: PropTypes.bool,
  onSelect:PropTypes.func,
  onChange:PropTypes.func,
  onSearch:PropTypes.func,
  searchPlaceholder: PropTypes.string,
  dropdownMatchSelectWidth: PropTypes.bool,
  treeDefaultExpandAll: PropTypes.bool,
  treeCheckable:PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.node
    ]),
  treeDefaultExpandedKeys:PropTypes.arrayOf(PropTypes.string),
  filterTreeNode:PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.func
    ]),
  treeNodeFilterProp: PropTypes.string,
  treeNodeLabelProp: PropTypes.string,
  treeData:PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
    children: PropTypes.array
      })),
  treeDataSimpleMode:PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.object
    ]),
  loadData:PropTypes.func,
  showCheckedStrategy: PropTypes.oneOf([  'SHOW_ALL','SHOW_PARENT','SHOW_CHILD']),
  labelInValue: PropTypes.bool,
  treeCheckStrictly: PropTypes.bool,
  getPopupContainer:PropTypes.func,
};
TreeSelect.displayName = "TreeSelect";
module.exports=TreeSelect;
export default injectSelectLocale(TreeSelect);
