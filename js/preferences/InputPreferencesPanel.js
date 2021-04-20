// Copyright 2021, University of Colorado Boulder

/**
 * The panel of the PreferencesDialog related to options related to user input.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Node from '../../../scenery/js/nodes/Node.js';
import RichText from '../../../scenery/js/nodes/RichText.js';
import Text from '../../../scenery/js/nodes/Text.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';

// constants
const gestureControlsString = joistStrings.preferences.tabs.input.gestureControls.title;
const gestureControlsDescriptionString = joistStrings.preferences.tabs.input.gestureControls.description;
const gestureControlEnabledAlertString = joistStrings.a11y.preferences.tabs.input.gestureControl.enabledAlert;
const gestureControlDisabledAlertString = joistStrings.a11y.preferences.tabs.input.gestureControl.disabledAlert;

class InputPreferencesPanel extends Node {
  constructor( gestureControlsEnabledProperty ) {
    super();

    const toggleSwitch = new PreferencesToggleSwitch( gestureControlsEnabledProperty, false, true, {
      labelNode: new Text( gestureControlsString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } ),
      descriptionNode: new RichText( gestureControlsDescriptionString, {
        font: PreferencesDialog.CONTENT_FONT,
        lineWrap: 350
      } )
    } );

    const panelSection = new PreferencesPanelSection( {
      titleNode: toggleSwitch
    } );
    this.addChild( panelSection );

    gestureControlsEnabledProperty.lazyLink( enabled => {
      const alert = enabled ? gestureControlEnabledAlertString : gestureControlDisabledAlertString;
      phet.joist.sim.joistVoicingUtteranceQueue.addToBack( alert );
    } );
  }
}

joist.register( 'InputPreferencesPanel', InputPreferencesPanel );
export default InputPreferencesPanel;
