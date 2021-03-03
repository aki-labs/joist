// Copyright 2021, University of Colorado Boulder

/**
 * The tabs for the PreferencesDialog. Activating a tab will select a PreferencesTabPanel to be displayed to the user.
 * The actual tabs are implemented as radio buttons, styled to look like flat like a set of tabs.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import FocusHighlightPath from '../../../scenery/js/accessibility/FocusHighlightPath.js';
import RectangularRadioButtonGroup from '../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import joist from '../joist.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Line from '../../../scenery/js/nodes/Line.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';

// constants
const generalTitleString = joistStrings.preferences.tabs.general.title;
const visualTitleString = joistStrings.preferences.tabs.visual.title;
const audioTitleString = joistStrings.preferences.tabs.audio.title;
const inputTitleString = joistStrings.preferences.tabs.input.title;

// options used for the tab RadioButtons so that they look flat
const RADIO_BUTTON_OPTIONS = {
  orientation: 'horizontal',
  spacing: 10,
  baseColor: 'transparent',
  buttonContentYMargin: 0,
  selectedStroke: null,
  deselectedStroke: null,
  selectedLineWidth: 0,
  deselectedLineWidth: 0
};

class PreferencesTabs extends Node {

  /**
   * @param {PreferencesConfiguration} preferencesConfiguration
   * @param {PreferencesTab[]} supportedTabs - list of tabs the Dialog should include
   * @param {EnumerationProperty.<PreferencesDialog.PreferenceTab>} selectedPanelProperty
   */
  constructor( preferencesConfiguration, supportedTabs, selectedPanelProperty ) {
    super();

    // @private {EnumerationProperty.<PreferencesDialog.PreferenceTab>}
    this.selectedPanelProperty = selectedPanelProperty;

    const content = [];
    const addTabIfSupported = ( preferenceTab, titleString ) => {
      _.includes( supportedTabs, preferenceTab ) && content.push( this.createButtonContent( titleString, preferenceTab ) );
    };
    addTabIfSupported( PreferencesDialog.PreferencesTab.GENERAL, generalTitleString );
    addTabIfSupported( PreferencesDialog.PreferencesTab.VISUAL, visualTitleString );
    addTabIfSupported( PreferencesDialog.PreferencesTab.AUDIO, audioTitleString );
    addTabIfSupported( PreferencesDialog.PreferencesTab.INPUT, inputTitleString );

    const radioButtonGroup = new RectangularRadioButtonGroup( selectedPanelProperty, content, RADIO_BUTTON_OPTIONS );
    this.addChild( radioButtonGroup );

    // if there is only one tab, it is not interactive
    if ( supportedTabs.length === 1 ) {
      this.focusable = false;
      this.inputEnabledProperty.value = false;
    }
  }

  /**
   * Creates content for one of the tabs, including a Text label and  Line Node that will be displayed when a tab
   * is selected. Returns an object compatible with RectangularRadioButtonGroup, and passed to that type to create
   * tab radio buttons.
   * @private
   *
   * @param {string} label - for the displayed label
   * @param {PreferencesDialog.PreferenceTab} value - value for the tab
   * @returns {{node: Node, value: PreferencesDialog.PreferenceTab}}
   */
  createButtonContent( label, value ) {
    const textNode = new Text( label, {
      font: PreferencesDialog.TAB_FONT
    } );
    const underlineNode = new Line( 0, 0, textNode.width, 0, {
      stroke: FocusHighlightPath.INNER_FOCUS_COLOR,
      lineWidth: 5,
      centerTop: textNode.centerBottom.plusXY( 0, 5 )
    } );
    const contentNode = new Node( {
      children: [ textNode, underlineNode ]
    } );
    this.selectedPanelProperty.link( selectedValue => {
      underlineNode.visible = selectedValue === value;
    } );
    return {
      node: contentNode,
      value: value
    };
  }
}

joist.register( 'PreferencesTabs', PreferencesTabs );
export default PreferencesTabs;