// Copyright 2021, University of Colorado Boulder

/**
 * Properties related to the PreferencesDialog, which will enable or disable various features in the simulation.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import joist from '../joist.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';

class PreferencesProperties {
  constructor() {

    // @public {BooleanProperty} - Whether or not the Sim Toolbar is enabled, which gives quick access to various
     // controls for the simulation or active screen.
    this.toolbarEnabledProperty = new BooleanProperty( true );
  }
}

joist.register( 'PreferencesProperties', PreferencesProperties );
export default PreferencesProperties;
