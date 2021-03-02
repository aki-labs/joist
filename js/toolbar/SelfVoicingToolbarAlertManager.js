// Copyright 2021, University of Colorado Boulder

/**
 * Abstract class that creates alert content for the SelfVoicingToolbarItem. Buttons in that item will call these
 * functions to create content that is spoken using speech synthesis. Extend this class and implement these
 * functions. Then pass this as an entry to the PreferencesConfiguration when creating a Sim.
 *
 * @author Jesse Greenberg
 */

import joist from '../joist.js';

class SelfVoicingToolbarAlertManager {

  /**
   * @param {Property.<Screen>} screenProperty - indicates the active screen
   */
  constructor( screenProperty ) {
    this.screenProperty = screenProperty;
  }

  /**
   * Create the alert content for the simulation overview for the "Overview" button.
   * @public
   * @abstract
   */
  createOverviewContent() {
    throw new Error( 'Please implement createOverviewContent' );
  }

  /**
   * Creates the alert content for the simulation details when the "Current Details"
   * button is pressed.
   * @public
   * @abstract
   */
  createDetailsContent() {
    throw new Error( 'Please implement createDetailsContent' );
  }

  /**
   * Creates the alert content for an interaction hint when the "Hint" button is pressed.
   * @public
   * @abstract
   */
  createHintContent() {
    throw new Error( 'Please implement createHintContent' );
  }
}

joist.register( 'SelfVoicingToolbarAlertManager', SelfVoicingToolbarAlertManager );
export default SelfVoicingToolbarAlertManager;