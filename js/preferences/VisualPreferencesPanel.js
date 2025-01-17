// Copyright 2021-2022, University of Colorado Boulder

/**
 * A panel for the PreferencesDialog with controls for visual preferences. Includes freatures such as
 * "Interactive Highlights" and perhaps others in the future.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { VoicingText } from '../../../scenery/js/imports.js';
import { voicingUtteranceQueue } from '../../../scenery/js/imports.js';
import { Node } from '../../../scenery/js/imports.js';
import { Text } from '../../../scenery/js/imports.js';
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
   * @param {Object} visualModel - see PreferencesManager
   */
  constructor( visualModel ) {
    super( {

      // pdom
      tagName: 'div',
      labelTagName: 'h2',
      labelContent: 'Visual'
    } );

    const label = new Text( interactiveHighlightsString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
    const toggleSwitch = new PreferencesToggleSwitch( visualModel.interactiveHighlightsEnabledProperty, false, true, {
      labelNode: label,
      descriptionNode: new VoicingText( interactiveHighlightsDescriptionString, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        readingBlockContent: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: interactiveHighlightsString,
          description: interactiveHighlightsDescriptionString
        } )
      } ) ),
      a11yLabel: interactiveHighlightsString
    } );

    const panelSection = new PreferencesPanelSection( {
      titleNode: toggleSwitch
    } );
    this.addChild( panelSection );

    const alertEnabledChange = enabled => {

      // voicing
      const alertString = enabled ? interactiveHighlightsEnabledAlertString : interactiveHighlightsDisabledAlertString;
      voicingUtteranceQueue.addToBack( alertString );

      // pdom
      this.alertDescriptionUtterance( alertString );
    };
    visualModel.interactiveHighlightsEnabledProperty.lazyLink( alertEnabledChange );

    // @private
    this.disposeVisualPreferencesPanel = () => {
      visualModel.interactiveHighlightsEnabledProperty.unlink( alertEnabledChange );
    };
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
