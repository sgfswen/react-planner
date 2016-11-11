"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Viewer2D;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactSvgPanZoom = require('react-svg-pan-zoom');

var _constants = require('../../constants');

var constants = _interopRequireWildcard(_constants);

var _scene = require('./scene');

var _scene2 = _interopRequireDefault(_scene);

var _snap = require('./snap');

var _snap2 = _interopRequireDefault(_snap);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mode2Tool(mode) {
  switch (mode) {
    case constants.MODE_2D_PAN:
      return _reactSvgPanZoom.TOOL_PAN;
    case constants.MODE_2D_ZOOM_IN:
      return _reactSvgPanZoom.TOOL_ZOOM_IN;
    case constants.MODE_2D_ZOOM_OUT:
      return _reactSvgPanZoom.TOOL_ZOOM_OUT;
    default:
      return _reactSvgPanZoom.TOOL_NONE;
  }
}

function mode2PointerEvents(mode) {
  switch (mode) {
    case constants.MODE_WAITING_DRAWING_LINE:
    case constants.MODE_DRAWING_LINE:
    case constants.MODE_DRAWING_HOLE:
    case constants.MODE_DRAWING_ITEM:
    case constants.MODE_DRAGGING_HOLE:
    case constants.MODE_DRAGGING_ITEM:
    case constants.MODE_DRAGGING_LINE:
    case constants.MODE_DRAGGING_VERTEX:
      return { pointerEvents: 'none' };

    default:
      return {};
  }
}

function mode2Cursor(mode) {
  switch (mode) {
    case constants.MODE_DRAGGING_HOLE:
    case constants.MODE_DRAGGING_LINE:
    case constants.MODE_DRAGGING_VERTEX:
    case constants.MODE_DRAGGING_ITEM:
      return { cursor: 'move' };

    case constants.MODE_ROTATING_ITEM:
      return { cursor: 'ew-resize' };

    default:
      return { cursor: 'crosshair' };
  }
}

function mode2DetectAutopan(mode) {
  switch (mode) {
    case constants.MODE_DRAWING_LINE:
    case constants.MODE_DRAGGING_LINE:
    case constants.MODE_DRAGGING_VERTEX:
    case constants.MODE_DRAGGING_HOLE:
    case constants.MODE_DRAGGING_ITEM:
    case constants.MODE_DRAWING_HOLE:
    case constants.MODE_DRAWING_ITEM:
      return true;

    default:
      return false;
  }
}

function extractElementData(node) {
  while (!node.attributes.getNamedItem('data-element-root') && node.tagName !== 'svg') {
    node = node.parentNode;
  }
  if (node.tagName === 'svg') return null;

  return {
    part: node.attributes.getNamedItem('data-part') ? node.attributes.getNamedItem('data-part').value : undefined,
    layer: node.attributes.getNamedItem('data-layer').value,
    prototype: node.attributes.getNamedItem('data-prototype').value,
    selected: node.attributes.getNamedItem('data-selected').value === 'true',
    id: node.attributes.getNamedItem('data-id').value
  };
}

function Viewer2D(_ref, _ref2) {
  var state = _ref.state,
      width = _ref.width,
      height = _ref.height;
  var editingActions = _ref2.editingActions,
      viewer2DActions = _ref2.viewer2DActions,
      linesActions = _ref2.linesActions,
      holesActions = _ref2.holesActions,
      verticesActions = _ref2.verticesActions,
      itemsActions = _ref2.itemsActions,
      areaActions = _ref2.areaActions,
      projectActions = _ref2.projectActions;
  var viewer2D = state.viewer2D,
      mode = state.mode,
      activeSnapElement = state.activeSnapElement,
      snapElements = state.snapElements,
      scene = state.scene;


  var layerID = scene.selectedLayer;

  var mapCursorPosition = function mapCursorPosition(_ref3) {
    var x = _ref3.x,
        y = _ref3.y;

    return { x: x, y: -y + scene.height };
  };

  var onClick = function onClick(event) {
    event.originalEvent.preventDefault();

    var _mapCursorPosition = mapCursorPosition(event),
        x = _mapCursorPosition.x,
        y = _mapCursorPosition.y;

    switch (mode) {
      case constants.MODE_IDLE:
        var elementData = extractElementData(event.originalEvent.target);

        if (elementData && elementData.selected) return;

        switch (elementData ? elementData.prototype : 'none') {
          case 'areas':
            areaActions.selectArea(elementData.layer, elementData.id);
            break;

          case 'lines':
            linesActions.selectLine(elementData.layer, elementData.id);
            break;

          case 'holes':
            holesActions.selectHole(elementData.layer, elementData.id);
            break;

          case 'items':
            itemsActions.selectItem(elementData.layer, elementData.id);
            break;

          case 'none':
            projectActions.unselectAll();
            break;
        }
        break;

      case constants.MODE_WAITING_DRAWING_LINE:
        linesActions.beginDrawingLine(layerID, x, y);
        break;

      case constants.MODE_DRAWING_LINE:
        linesActions.endDrawingLine(x, y);
        break;

      case constants.MODE_DRAWING_HOLE:
        holesActions.endDrawingHole(layerID, x, y);
        break;

      case constants.MODE_DRAWING_ITEM:
        itemsActions.endDrawingItem(layerID, x, y);
        break;
    }
  };

  var onMouseMove = function onMouseMove(event) {
    event.originalEvent.preventDefault();

    var _mapCursorPosition2 = mapCursorPosition(event),
        x = _mapCursorPosition2.x,
        y = _mapCursorPosition2.y;

    switch (mode) {
      case constants.MODE_DRAWING_LINE:
        linesActions.updateDrawingLine(x, y);
        break;

      case constants.MODE_DRAWING_HOLE:
        holesActions.updateDrawingHole(layerID, x, y);
        break;

      case constants.MODE_DRAWING_ITEM:
        itemsActions.updateDrawingItem(layerID, x, y);
        break;

      case constants.MODE_DRAGGING_HOLE:
        holesActions.updateDraggingHole(x, y);
        break;

      case constants.MODE_DRAGGING_LINE:
        linesActions.updateDraggingLine(x, y);
        break;

      case constants.MODE_DRAGGING_VERTEX:
        verticesActions.updateDraggingVertex(x, y);
        break;

      case constants.MODE_DRAGGING_ITEM:
        itemsActions.updateDraggingItem(x, y);
        break;

      case constants.MODE_ROTATING_ITEM:
        itemsActions.updateRotatingItem(x, y);
    }
  };

  var onMouseDown = function onMouseDown(event) {
    event.originalEvent.preventDefault();

    var _mapCursorPosition3 = mapCursorPosition(event),
        x = _mapCursorPosition3.x,
        y = _mapCursorPosition3.y;

    switch (mode) {
      case constants.MODE_IDLE:

        var elementData = extractElementData(event.originalEvent.target);
        if (!(elementData && elementData.selected)) return;

        switch (elementData ? elementData.prototype : 'none') {
          case 'lines':
            linesActions.beginDraggingLine(elementData.layer, elementData.id, x, y);
            break;

          case 'vertices':
            verticesActions.beginDraggingVertex(elementData.layer, elementData.id, x, y);
            break;

          case 'items':
            if (elementData.part === 'rotation-anchor') itemsActions.beginRotatingItem(elementData.layer, elementData.id, x, y);else itemsActions.beginDraggingItem(elementData.layer, elementData.id, x, y);
            break;

          case 'holes':
            holesActions.beginDraggingHole(elementData.layer, elementData.id, x, y);
            break;
        }
    }
  };

  var onMouseUp = function onMouseUp(event) {
    event.originalEvent.preventDefault();

    var _mapCursorPosition4 = mapCursorPosition(event),
        x = _mapCursorPosition4.x,
        y = _mapCursorPosition4.y;

    switch (mode) {
      case constants.MODE_DRAGGING_LINE:
        linesActions.endDraggingLine(x, y);
        break;

      case constants.MODE_DRAGGING_VERTEX:
        verticesActions.endDraggingVertex(x, y);
        break;

      case constants.MODE_DRAGGING_ITEM:
        itemsActions.endDraggingItem(x, y);
        break;

      case constants.MODE_DRAGGING_HOLE:
        holesActions.endDraggingHole(x, y);
        break;

      case constants.MODE_ROTATING_ITEM:
        itemsActions.endRotatingItem(x, y);
        break;
    }
  };

  activeSnapElement = activeSnapElement ? _react2.default.createElement(_snap2.default, { snap: activeSnapElement, width: scene.width, height: scene.height }) : null;
  // snapElements = snapElements.map((snap,id) => <Snap key={id} snap={snap} width={scene.width} height={scene.height}/>);
  snapElements = null; //only for debug purpose

  var onChangeValue = function onChangeValue(value) {
    return viewer2DActions.updateCameraView(value);
  };
  var onChangeTool = function onChangeTool(tool) {
    switch (tool) {
      case _reactSvgPanZoom.TOOL_NONE:
        editingActions.selectToolEdit();
        break;

      case _reactSvgPanZoom.TOOL_PAN:
        viewer2DActions.selectToolPan();
        break;

      case _reactSvgPanZoom.TOOL_ZOOM_IN:
        viewer2DActions.selectToolZoomIn();
        break;

      case _reactSvgPanZoom.TOOL_ZOOM_OUT:
        viewer2DActions.selectToolZoomOut();
        break;
    }
  };

  return _react2.default.createElement(
    _reactSvgPanZoom.ReactSVGPanZoom,
    {
      width: width, height: height,

      value: viewer2D.isEmpty() ? null : viewer2D.toJS(),
      onChangeValue: onChangeValue,

      tool: mode2Tool(mode),
      onChangeTool: onChangeTool,

      detectAutoPan: mode2DetectAutopan(mode),

      onClick: onClick,
      onMouseDown: onMouseDown,
      onMouseMove: onMouseMove,
      onMouseUp: onMouseUp,
      toolbarPosition: 'right' },
    _react2.default.createElement(
      'svg',
      { width: scene.width, height: scene.height },
      _react2.default.createElement(
        'g',
        { style: mode2Cursor(mode) },
        _react2.default.createElement('rect', { x: '0', y: '0', width: width, height: height, fill: '#fff' }),
        _react2.default.createElement(
          'g',
          { transform: 'translate(0, ' + scene.height + ') scale(1, -1)', style: mode2PointerEvents(mode) },
          _react2.default.createElement(_scene2.default, { scene: scene, mode: mode }),
          activeSnapElement,
          snapElements
        )
      )
    )
  );
}

Viewer2D.propTypes = {
  state: _react.PropTypes.object.isRequired,
  width: _react.PropTypes.number.isRequired,
  height: _react.PropTypes.number.isRequired
};

Viewer2D.contextTypes = {
  viewer2DActions: _react.PropTypes.object.isRequired,
  editingActions: _react.PropTypes.object.isRequired,
  linesActions: _react.PropTypes.object.isRequired,
  holesActions: _react.PropTypes.object.isRequired,
  verticesActions: _react.PropTypes.object.isRequired,
  itemsActions: _react.PropTypes.object.isRequired,
  areaActions: _react.PropTypes.object.isRequired,
  projectActions: _react.PropTypes.object.isRequired
};