// Copyright 2021, University of Colorado Boulder

/**
 * Abstract class that creates alert content for the SelfVoicingToolbarItem. Buttons in that item will call these
 * functions to create content that is spoken using speech synthesis. Extend this class and implement these
 * functions. Then pass this as an entry to the PreferencesConfiguration when creating a Sim.
 *
 * @author Jesse Greenberg
 */

import joist from '../joist.js';

class VoicingToolbarAlertManager {

  /**
   * @param {Property.<Screen>} screenProperty - indicates the active screen
   */
  constructor( screenProperty ) {
    this.screenProperty = screenProperty;
  }

  /**
   * Create the alert content for the simulation overview for the "Overview" button.
   * @public
   */
  createOverviewContent() {
    const screenView = this.screenProperty.value.view;
    assert && assert( screenView, 'view needs to be inititalized for self-voicing toolbar content' );
    assert && assert( screenView.getSelfVoicingOverviewContent, 'self-voicing toolbar is enabled, implement getSelfVoicingOverviewContent on ScreenView' );
    return screenView.getSelfVoicingOverviewContent();
  }

  /**
   * Creates the alert content for the simulation details when the "Current Details"
   * button is pressed.
   * @public
   */
  createDetailsContent() {
    const screenView = this.screenProperty.value.view;
    assert && assert( screenView, 'view needs to be inititalized for self-voicing toolbar content' );
    assert && assert( screenView.getSelfVoicingDetailsContent, 'self-voicing toolbar is enabled, implement getSelfVoicingDetailsContent on ScreenView' );
    return screenView.getSelfVoicingDetailsContent();
  }

  /**
   * Creates the alert content for an interaction hint when the "Hint" button is pressed.
   * @public
   */
  createHintContent() {
    const screenView = this.screenProperty.value.view;
    assert && assert( screenView, 'view needs to be inititalized for self-voicing toolbar content' );
    assert && assert( screenView.getSelfVoicingHintContent, 'self-voicing toolbar is enabled, implement getSelfVoicingDetailsContent on ScreenView' );
    return this.screenProperty.value.view.getSelfVoicingHintContent();
  }
}

joist.register( 'VoicingToolbarAlertManager', VoicingToolbarAlertManager );
export default VoicingToolbarAlertManager;