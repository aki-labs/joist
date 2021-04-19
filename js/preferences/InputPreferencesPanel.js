// Copyright 2021, University of Colorado Boulder

/**
 * The panel of the PreferencesDialog related to options related to user input.
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
const gestureControlsString = joistStrings.preferences.tabs.input.gestureControls;

class InputPreferencesPanel extends Node {
  constructor( gestureControlsEnabledProperty ) {
    super();

    const label = new Text( gestureControlsString, { font: PreferencesDialog.CONTENT_FONT } );
    const toggleSwitch = new PreferencesToggleSwitch( gestureControlsEnabledProperty, false, true, {
      labelNode: label
    } );

    const panelSection = new PreferencesPanelSection( {
      titleNode: toggleSwitch
    } );
    this.addChild( panelSection );
  }
}

joist.register( 'InputPreferencesPanel', InputPreferencesPanel );
export default InputPreferencesPanel;
