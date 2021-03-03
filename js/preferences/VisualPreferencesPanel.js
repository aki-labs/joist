// Copyright 2021, University of Colorado Boulder

/**
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';

// constants
const interactiveHighlightsString = joistStrings.preferences.tabs.visual.interactiveHighlights;

class VisualPreferencesPanel extends Node {

  /**
   * @param {BooleanProperty} interactiveHighlightsEnabledProperty - whether or not interactive highlights are enabled
   */
  constructor( interactiveHighlightsEnabledProperty ) {
    super();

    const label = new Text( interactiveHighlightsString, { font: PreferencesDialog.CONTENT_FONT } );
    const checkbox = new Checkbox( label, interactiveHighlightsEnabledProperty );

    const panelSection = new PreferencesPanelSection( {
      titleNode: checkbox
    } );
    this.addChild( panelSection );
  }
}

joist.register( 'VisualPreferencesPanel', VisualPreferencesPanel );
export default VisualPreferencesPanel;
