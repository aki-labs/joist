// Copyright 2021, University of Colorado Boulder

/**
 * The content for the "General" tab in the PreferencesDialog. This is always present. Contains an introductory
 * sentence about accessible simulations, and any simulation-specific settings if provided.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import RichText from '../../../scenery/js/nodes/RichText.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import SimControlsTabPanelSection from './SimControlsPanelSection.js';

// constants
const accessibilityIntroPatternString = joistStrings.preferences.tabs.general.accessibilityIntroPattern;
const accessibilityIntroWithoutLinksPattern = joistStrings.preferences.tabs.general.accessibilityIntroWithoutLinksPattern;
const accessibilityIntroLinkString = joistStrings.preferences.tabs.general.accessibilityIntroLink;

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
    panelChildren.push( new RichText( this.getLinkText(), {
      font: PreferencesDialog.CONTENT_FONT,
      links: {
        url: this.getAccessibilityPageLink()
      },
      lineWrap: 600
    } ) );

    this.children = panelChildren;
  }

  /**
   * Returns the URL for the accessible simulations page.
   * @private
   *
   * @returns {string}
   */
  getAccessibilityPageLink() {
    const locale = phet.joist.sim.locale;
    return `https://phet.colorado.edu/${locale}/simulations/filter?a11yFeatures=accessibility&sort=alpha&view=grid`;
  }

  /**
   * Get the text to display for the link to the accessibility search page.
   * @private
   *
   * @returns {string}
   */
  getLinkText() {
    let linkContent;
    if ( phet.chipper.queryParameters.allowLinks ) {
      linkContent = StringUtils.fillIn( accessibilityIntroPatternString, {
        link: `<a href={{url}}>${accessibilityIntroLinkString}</a>`
      } );
    }
    else {
      linkContent = StringUtils.fillIn( accessibilityIntroWithoutLinksPattern, {
        link: this.getAccessibilityPageLink()
      } );
    }
    return linkContent;
  }
}

joist.register( 'GeneralPreferencesPanel', GeneralPreferencesPanel );
export default GeneralPreferencesPanel;