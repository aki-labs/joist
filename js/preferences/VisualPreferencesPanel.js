// Copyright 2021, University of Colorado Boulder

/**
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';

// constants
const interactiveHighlightsString = joistStrings.preferences.tabs.visual.interactiveHighlights;
const interactiveHighlightsDescriptionString = joistStrings.preferences.tabs.visual.interactiveHighlightsDescription;

class VisualPreferencesPanel extends Node {

  /**
   * @param {BooleanProperty} interactiveHighlightsEnabledProperty - whether or not interactive highlights are enabled
   */
  constructor( interactiveHighlightsEnabledProperty ) {
    super();

    const label = new Text( interactiveHighlightsString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } );
    const toggleSwitch = new PreferencesToggleSwitch( interactiveHighlightsEnabledProperty, false, true, {
      labelNode: label,
      descriptionNode: new Text( interactiveHighlightsDescriptionString, {
        font: PreferencesDialog.CONTENT_FONT
      } )
    } );

    const panelSection = new PreferencesPanelSection( {
      titleNode: toggleSwitch
    } );
    this.addChild( panelSection );
  }
}

joist.register( 'VisualPreferencesPanel', VisualPreferencesPanel );
export default VisualPreferencesPanel;
