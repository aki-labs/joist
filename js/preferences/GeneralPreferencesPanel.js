// Copyright 2021, University of Colorado Boulder

/**
 * The content for the "General" tab in the PreferencesDialog. This is always present. Contains an introductory
 * sentence about accessible simulations, and any simulation-specific settings if provided.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import RichText from '../../../scenery/js/nodes/RichText.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import SimControlsTabPanelSection from './SimControlsPanelSection.js';

// constants
const accessibilityIntroString = joistStrings.preferences.tabs.general.accessibilityIntro;
const moreAccessibilityString = joistStrings.preferences.tabs.general.moreAccessibility;

class GeneralPreferencesPanel extends VBox {

  /**
   * @param {Object} generalConfiguration - configuration for the Tab, see PreferencesConfiguration for entries
   */
  constructor( generalConfiguration ) {
    super( {
      align: 'left',
      spacing: 40
    } );

    const panelChildren = [];
    if ( generalConfiguration.simControls ) {
      panelChildren.push( new SimControlsTabPanelSection( generalConfiguration.simControls ) );
    }

    const introParagraphs = new VBox( { spacing: 10, align: 'left' } );
    const introTextOptions = { font: PreferencesDialog.CONTENT_FONT, lineWrap: 600 };
    introParagraphs.children = [
      new RichText( accessibilityIntroString, introTextOptions ),
      new RichText( moreAccessibilityString, introTextOptions )
    ];
    panelChildren.push( introParagraphs );

    this.children = panelChildren;
  }
}

joist.register( 'GeneralPreferencesPanel', GeneralPreferencesPanel );
export default GeneralPreferencesPanel;