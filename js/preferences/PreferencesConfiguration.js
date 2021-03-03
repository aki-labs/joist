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
      generalOptions: {

        // {Node|null} - any Node you would like to put under the "General" tab with sim-specific controls
        simControls: null
      },

      // configuration for controls in the "Visual" tab of the PreferencesDialog
      visualOptions: {

        // {boolean} whether or not the sim supports the "interactive highlights" feature, and checkbox to enable
        // in the PreferencesDialog
        supportsInteractiveHighlights: false
      },

      // configuration for controls in the "Audio" tab of the PreferencesDialog
      audioOptions: {

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
      inputOptions: {

        // {boolean} - Whether or not to include "gesture" controls
        supportsGestureControls: false
      }
    }, options );

    assert && assert( options.generalOptions, 'generalOptions must be defined' );
    assert && assert( options.visualOptions, 'visualOptions must be defined' );
    assert && assert( options.audioOptions, 'audioOptions must be defined' );
    assert && assert( options.inputOptions, 'inputOptions must be defined' );

    if ( options.audioOptions.supportsEnhancedSound ) {
      assert && assert( options.audioOptions.supportsSound, 'supportsSound must be true to also support enhancedSound' );
    }

    // @public (read-only)
    this.generalOptions = options.generalOptions;
    this.visualOptions = options.visualOptions;
    this.audioOptions = options.audioOptions;
    this.inputOptions = options.inputOptions;
  }
}

joist.register( 'PreferencesConfiguration', PreferencesConfiguration );
export default PreferencesConfiguration;
