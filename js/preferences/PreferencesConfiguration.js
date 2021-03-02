// Copyright 2021, University of Colorado Boulder

/**
 * Configures the Preferences for a simulation, signifying which features are enabled in the simulation and will
 * therefore have a corresponding entry in the PreferencesDialog to enable/disable the feature. This is passed in
 * as an option to Sim.js.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import joist from '../joist.js';
import merge from '../../../phet-core/js/merge.js';

class PreferencesConfiguration {
  constructor( options ) {
    options = merge( {

      // configuration for controls in the "General" tab of the PreferencesDialog
      generalConfiguration: {

        // {Node|null} - any Node you would like to put under the "General" tab with sim-specific controls
        simControls: null
      },

      // configuration for controls in the "Visual" tab of the PreferencesDialog
      visualConfiguration: {

        // {boolean} whether or not the sim supports the "interactive highlights" feature, and checkbox to enable
        // in the PreferencesDialog
        supportsInteractiveHighlights: false
      },

      // configuration for controls in the "Audio" tab of the PreferencesDialog
      audioConfiguration: {

        // The entry point for self-voicing, if true the PreferencesDialog will include all self-voicing options
        supportsSelfVoicing: false,

        // {SelfVoicingToolbarAlertManager} - A Constructor for the alertManager, gets constructed with the Toolbar
        // to take the simulation ScreenProperty, as self-voicing alerts in the Toolbar are dependent on active screen.
        selfVoicingToolbarAlertManager: null,

        // {boolean} - Whether or not to include checkboxes related to sound and enhanced sound. supportsEnhancedSound
        // can only be included if supportsSound is also true.
        supportsSound: true,
        supportsEnhancedSound: false
      },

      // configuration for controls in the "Input" tab of the PreferencesDialog
      inputConfiguration: {

        // {boolean} - Whether or not to include "gesture" controls
        supportsGestureControl: false
      }
    }, options );

    assert && assert( options.generalConfiguration, 'generalConfiguration must be defined' );
    assert && assert( options.visualConfiguration, 'visualConfiguration must be defined' );
    assert && assert( options.audioConfiguration, 'audioConfiguration must be defined' );
    assert && assert( options.inputConfiguration, 'inputConfiguration must be defined' );

    if ( options.audioConfiguration.supportsEnhancedSound ) {
      assert && assert( options.audioConfiguration.supportsSound, 'supportsSound must be true to also support enhancedSound' );
    }

    // @public (read-only)
    this.generalConfiguration = options.generalConfiguration;
    this.visualConfiguration = options.visualConfiguration;
    this.audioConfiguration = options.audioConfiguration;
    this.inputConfiguration = options.inputConfiguration;
  }
}

joist.register( 'PreferencesConfiguration', PreferencesConfiguration );
export default PreferencesConfiguration;
