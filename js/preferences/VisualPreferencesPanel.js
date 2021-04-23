// Copyright 2021, University of Colorado Boulder

/**
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import VoicingText from '../../../scenery-phet/js/accessibility/speaker/VoicingText.js';
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
const interactiveHighlightsEnabledAlertString = joistStrings.a11y.preferences.tabs.visual.interactiveHighlights.enabledAlert;
const interactiveHighlightsDisabledAlertString = joistStrings.a11y.preferences.tabs.visual.interactiveHighlights.disabledAlert;
const labelledDescriptionPatternString = joistStrings.a11y.preferences.tabs.labelledDescriptionPattern;

class VisualPreferencesPanel extends Node {

  /**
   * @param {BooleanProperty} interactiveHighlightsEnabledProperty - whether or not interactive highlights are enabled
   */
  constructor( interactiveHighlightsEnabledProperty ) {
    super();

    const label = new Text( interactiveHighlightsString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } );
    const toggleSwitch = new PreferencesToggleSwitch( interactiveHighlightsEnabledProperty, false, true, {
      labelNode: label,
      descriptionNode: new VoicingText( interactiveHighlightsDescriptionString, {
        font: PreferencesDialog.CONTENT_FONT,
        voicingText: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: interactiveHighlightsString,
          description: interactiveHighlightsDescriptionString
        } )
      } )
    } );

    const panelSection = new PreferencesPanelSection( {
      titleNode: toggleSwitch
    } );
    this.addChild( panelSection );

    // @private
    this.disposeVisualPreferencesPanel = () => {
      interactiveHighlightsEnabledProperty.unlink( alertEnabledChange );
    };

    const alertEnabledChange = enabled => {

      // voicing
      const alertString = enabled ? interactiveHighlightsEnabledAlertString : interactiveHighlightsDisabledAlertString;
      phet.joist.sim.joistVoicingUtteranceQueue.addToBack( alertString );

      // pdom
      phet.joist.sim.utteranceQueue.addToBack( alertString );
    };
    interactiveHighlightsEnabledProperty.lazyLink( alertEnabledChange );
  }

  /**
   * @public
   */
  dispose() {
    this.disposeVisualPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'VisualPreferencesPanel', VisualPreferencesPanel );
export default VisualPreferencesPanel;
